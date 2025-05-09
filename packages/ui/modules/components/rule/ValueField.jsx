import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import {truncateString} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import last from "lodash/last";
import keys from "lodash/keys";
const {clone} = Utils.OtherUtils;
const {getFieldConfig, getFieldParts, getFieldPathParts, getWidgetForFieldOp} = Utils.ConfigUtils;
const {getFieldPathLabels} = Utils.RuleUtils;

//tip: this.props.value - right value, this.props.field - left value

export default class ValueField extends Component {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.any,
    fieldSrc: PropTypes.string,
    fieldType: PropTypes.string,
    value: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    readonly: PropTypes.bool,
    parentField: PropTypes.string,
    fieldDefinition: PropTypes.object,
    isFuncArg: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForItems = ["config", "field", "fieldSrc", "fieldType", "operator", "isFuncArg", "parentField"];
    const keysForMeta = ["config", "field", "fieldSrc", "fieldType", "operator", "value", "placeholder", "isFuncArg", "parentField"];
    const needUpdateItems = !this.items || keysForItems.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateItems) {
      this.items = this.getItems(nextProps);
    }
    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getItems({config, field, fieldType, operator, parentField, isFuncArg, fieldDefinition}) {
    // const fieldSeparator = config.settings.fieldSeparator;
    const parentFieldPath = getFieldParts(parentField, config);

    const filteredFields = this.filterFields(config, field, parentField, operator, isFuncArg, fieldDefinition, fieldType);
    const items = this.buildOptions(parentFieldPath, config, filteredFields);
    return items;
  }

  getMeta({config, field, fieldType, operator, value, placeholder: customPlaceholder, isFuncArg, parentField}) {
    const {fieldPlaceholder, fieldSeparatorDisplay} = config.settings;
    const selectedKey = value;
    const isFieldSelected = !!value;

    const leftFieldConfig = field ? getFieldConfig(config, field) : {};
    const leftFieldWidgetField = leftFieldConfig?.widgets?.field;
    const leftFieldWidgetFieldProps = leftFieldWidgetField?.widgetProps || {};
    const placeholder = isFieldSelected ? null 
      : (isFuncArg && customPlaceholder || leftFieldWidgetFieldProps.valuePlaceholder || fieldPlaceholder);
    const currField = isFieldSelected ? getFieldConfig(config, selectedKey) : null;
    const selectedOpts = currField || {};

    const selectedKeys = getFieldPathParts(selectedKey, config);
    const selectedPath = getFieldPathParts(selectedKey, config, true);
    const selectedLabel = this.getFieldLabel(currField, selectedKey, config);
    const partsLabels = getFieldPathLabels(selectedKey, config);
    let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
    if (selectedFullLabel == selectedLabel || parentField)
      selectedFullLabel = null;
    const selectedAltLabel = selectedOpts.label2 || selectedOpts.tooltip;

    return {
      placeholder,
      selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
    };
  }

  // todo: move to core
  filterFields(config, leftFieldFullkey, parentField, operator, isFuncArg, fieldDefinition, fieldType) {
    const parentFieldConfig = parentField ? getFieldConfig(config, parentField) : null;
    const parentFieldPath = getFieldParts(parentField, config);
    const fieldSeparator = config.settings.fieldSeparator;
    const leftFieldConfig = getFieldConfig(config, leftFieldFullkey);
    const _relyOnWidgetType = false; //TODO: remove this, see issue #758
    const widget = getWidgetForFieldOp(config, leftFieldFullkey, operator, "value");
    const widgetConfig = config.widgets[widget];
    const opConfig = config.operators[operator];
    let expectedType;
    if (isFuncArg) {
      expectedType = fieldDefinition?.type;
    } else if (opConfig?.valueTypes) {
      expectedType = opConfig?.valueTypes[0];
    } else if (_relyOnWidgetType && widgetConfig) {
      expectedType = widgetConfig.type;
    } else if (leftFieldConfig) {
      expectedType = leftFieldConfig.type;
    } else {
      // no field at LHS, but can use type from "memory effect"
      expectedType = fieldType;
    }
    // todo: (for select fields) use listValuesType

    // todo: flag in settings / in group config / in field config ?
    const canCompareWithAncestors = true; // todo: for spel for grA.grB.x3 we can't refer to grA.x2 , only to #root.x1  (fr JL - no refers at all!), for Mongo - possible
    const canCompareWithChilds = false;  // !!!!!!! todo for multiselect we can be able to select field inside !group (projection - ".!" for spel, "map" for JL, $map in Mongo)
    // support of canCompareWithChilds makes sense only for custom aggr. func like "COUNT"

    const sourceFields = parentField ? parentFieldConfig?.subfields : config.fields;
    const fieldsToFilter = canCompareWithAncestors ? config.fields : sourceFields;
    const fields = clone(fieldsToFilter);
    const initialPathToFilter = canCompareWithAncestors ? [] : parentFieldPath;
    
    function _filter(list, path) {
      for (let rightFieldKey in list) {
        const subfields = list[rightFieldKey].subfields;
        const subpath = (path ? path : []).concat(rightFieldKey);
        const rightFieldFullkey = subpath.join(fieldSeparator);
        const rightFieldConfig = getFieldConfig(config, rightFieldFullkey);
        const isGroup = rightFieldConfig.type === "!group";
        const isStruct = rightFieldConfig.type === "!struct";
        if (!rightFieldConfig) {
          delete list[rightFieldKey];
        } else if (isStruct || isGroup) {
          const hasInitialPath = !parentFieldPath.length ? true
            : !subpath.find((f, i) => parentFieldPath[i] === undefined || parentFieldPath[i] !== f);
          // *** situation: 
          // [grA] -> [grB] -> [grC]
          //       -> [grG]
          // [grX] -> *
          // strA -> strB
          // if we are in grB - we do include grA and grB but not grC, not grX, not grG ; do include strA, strB

          // todo: use getCommonGroupField ????
          // Support of canCompareWithAncestors (take from outer): - for JL, + for Mongo, + for SpEL (with "#root.field" inside ".?[]")
          // !!! there can be func COUNT and arg should be field of type !group
          console.log('?has=', hasInitialPath, parentFieldPath, subpath, isGroup)
          if (isGroup && !hasInitialPath) {
            console.log('!delete',parentFieldPath, {hasInitialPath, subpath, parentFieldPath})
            delete list[rightFieldKey];
          } else {
            console.log('f',parentFieldPath, subpath)
            if (_filter(subfields, subpath) == 0)
              delete list[rightFieldKey];
          }
        } else {
          // tip: LHS field can be used as arg in RHS function
          let canUse = (!expectedType || rightFieldConfig.type == expectedType)
            && (isFuncArg ? true : rightFieldFullkey != leftFieldFullkey);
          let fn = config.settings.canCompareFieldWithField;
          if (fn)
            canUse = canUse && fn(leftFieldFullkey, leftFieldConfig, rightFieldFullkey, rightFieldConfig, operator);
          if (!canUse) {
            delete list[rightFieldKey];
          }
        }
      }
      return keys(list).length;
    }

    _filter(fields, initialPathToFilter, false);

    return fields;
  }

  buildOptions(parentFieldPath, config, fields, path = null, optGroup = null) {
    // todo: even if canCompareWithAncestors == true but all fields are within parentFieldPath - don't display nesting
    // todo: if canCompareWithAncestors == true and the are fields inside parentFieldPath + outside -> divide with separator? move inside to top?
    if (!fields)
      return null;
    const canCompareWithAncestors = true;
    if (!canCompareWithAncestors && path === null) {
      path = parentFieldPath;
    }
    const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
    const prefix = path?.length ? path.join(fieldSeparator) + fieldSeparator : "";

    return keys(fields).map(fieldKey => {
      const fullFieldPath = [...(path ?? []), fieldKey];
      const field = fields[fieldKey];
      const label = this.getFieldLabel(field, fullFieldPath, config);
      const partsLabels = getFieldPathLabels(fullFieldPath, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
      // todo:
      //   " || parentFieldPath" looks like old bad hack!!!!
      // use `getFieldPathLabels(fullFieldPath, config, parentFieldPath)` instead to get partial label
      // ! same used in 4 places - 2 in this file + 2 in Field.jsx
      if (fullLabel == label || parentFieldPath)
        fullLabel = null;
      const altLabel = field.label2;
      const tooltip = field.tooltip;

      if (field.hideForCompare)
        return undefined;

      if (field.type == "!struct" || field.type == "!group") {
        return {
          key: fieldKey,
          path: prefix+fieldKey,
          label,
          fullLabel,
          altLabel,
          tooltip,
          items: this.buildOptions(parentFieldPath, config, field.subfields, fullFieldPath, {
            label,
            tooltip,
          }),
          grouplabel: optGroup?.label,
          group: optGroup,
        };
      } else {
        return {
          key: fieldKey,
          path: prefix+fieldKey,
          label,
          fullLabel,
          altLabel,
          tooltip,
          grouplabel: optGroup?.label,
          group: optGroup,
        };
      }
    }).filter(o => !!o);
  }

  // todo: same funcs are used in FuncSelect, Field  -  DRY! move to core
  getFieldLabel(fieldOpts, fieldKey, config) {
    if (!fieldKey) return null;
    let maxLabelsLength = config.settings.maxLabelsLength;
    let fieldParts = getFieldParts(fieldKey, config);
    let label = fieldOpts?.label || last(fieldParts);
    label = truncateString(label, maxLabelsLength);
    return label;
  }

  render() {
    const {config, customProps, setValue, readonly, id, groupId} = this.props;
    const {renderField} = config.settings;
    const renderProps = {
      isValueField: true,
      config,
      customProps,
      setField: setValue,
      readonly,
      items: this.items,
      id,
      groupId,
      ...this.meta
    };
    return renderField(renderProps, config.ctx);
  }

}

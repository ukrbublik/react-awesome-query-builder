import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import {truncateString} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import last from "lodash/last";
import keys from "lodash/keys";
const {clone} = Utils;
const {getFieldConfig, getFieldParts, getFieldPathParts} = Utils.ConfigUtils;
const {getFieldPathLabels, getWidgetForFieldOp} = Utils.RuleUtils;

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
    const {canCompareFieldWithField} = config.settings;
    const fieldSeparator = config.settings.fieldSeparator;
    const parentFieldPath = getFieldParts(parentField, config);
    const parentFieldConfig = parentField ? getFieldConfig(config, parentField) : null;
    const sourceFields = parentField ? parentFieldConfig?.subfields : config.fields;

    const filteredFields = this.filterFields(config, sourceFields, field, parentField, parentFieldPath, operator, canCompareFieldWithField, isFuncArg, fieldDefinition, fieldType);
    const items = this.buildOptions(parentFieldPath, config, filteredFields, parentFieldPath);
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

  filterFields(config, fields, leftFieldFullkey, parentField, parentFieldPath, operator, canCompareFieldWithField, isFuncArg, fieldDefinition, fieldType) {
    fields = clone(fields);
    const fieldSeparator = config.settings.fieldSeparator;
    const leftFieldConfig = getFieldConfig(config, leftFieldFullkey);
    const _relyOnWidgetType = false; //TODO: remove this, see issue #758
    const widget = getWidgetForFieldOp(config, leftFieldFullkey, operator, "value");
    const widgetConfig = config.widgets[widget];
    let expectedType;
    if (isFuncArg) {
      expectedType = fieldDefinition?.type;
    } else if (_relyOnWidgetType && widgetConfig) {
      expectedType = widgetConfig.type;
    } else if (leftFieldConfig) {
      expectedType = leftFieldConfig.type;
    } else {
      // no field at LHS, but can use type from "memory effect"
      expectedType = fieldType;
    }
    
    function _filter(list, path) {
      for (let rightFieldKey in list) {
        let subfields = list[rightFieldKey].subfields;
        let subpath = (path ? path : []).concat(rightFieldKey);
        let rightFieldFullkey = subpath.join(fieldSeparator);
        let rightFieldConfig = getFieldConfig(config, rightFieldFullkey);
        if (!rightFieldConfig) {
          delete list[rightFieldKey];
        } else if (rightFieldConfig.type == "!struct" || rightFieldConfig.type == "!group") {
          if (_filter(subfields, subpath) == 0)
            delete list[rightFieldKey];
        } else {
          // tip: LHS field can be used as arg in RHS function
          let canUse = (!expectedType || rightFieldConfig.type == expectedType)
            && (isFuncArg ? true : rightFieldFullkey != leftFieldFullkey);
          let fn = canCompareFieldWithField || config.settings.canCompareFieldWithField;
          if (fn)
            canUse = canUse && fn(leftFieldFullkey, leftFieldConfig, rightFieldFullkey, rightFieldConfig, operator);
          if (!canUse)
            delete list[rightFieldKey];
        }
      }
      return keys(list).length;
    }

    _filter(fields, parentFieldPath || []);

    return fields;
  }

  buildOptions(parentFieldPath, config, fields, path = null, optGroup = null) {
    if (!fields)
      return null;
    const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
    const prefix = path?.length ? path.join(fieldSeparator) + fieldSeparator : "";

    return keys(fields).map(fieldKey => {
      const fullFieldPath = [...(path ?? []), fieldKey];
      const field = fields[fieldKey];
      const label = this.getFieldLabel(field, fullFieldPath, config);
      const partsLabels = getFieldPathLabels(fullFieldPath, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
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
          })
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

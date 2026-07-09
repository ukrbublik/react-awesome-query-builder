import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import {truncateString} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import last from "lodash/last";
import keys from "lodash/keys";
const { clone } = Utils;
const {getFieldConfig, getFuncConfig, getFieldParts, getFieldPathParts, getWidgetForFieldOp} = Utils.ConfigUtils;
const {getFuncPathLabels} = Utils.RuleUtils;
const {shallowEqual} = Utils.OtherUtils;

//tip: this.props.value - right value, this.props.field - left value

export default class FuncSelect extends Component {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.any,
    fieldType: PropTypes.string,
    fieldSrc: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    value: PropTypes.string,
    setValue: PropTypes.func.isRequired,
    readonly: PropTypes.bool,
    parentFuncs: PropTypes.array,
    fieldDefinition: PropTypes.object,
    isFuncArg: PropTypes.bool,
    isLHS: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
      
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForItems = ["config", "field", "fieldType", "fieldSrc", "operator", "isFuncArg", "isLHS", "parentFuncs"];
    const keysForMeta = ["config", "field", "fieldType", "fieldSrc", "value", "isLHS"];
    const needUpdateItems = !this.items || keysForItems.map(k =>
      (k === "parentFuncs" ? !shallowEqual(nextProps[k], prevProps[k], true) : nextProps[k] !== prevProps[k])
    ).filter(ch => ch).length > 0;
    const needUpdateMeta = !this.meta || keysForMeta.map(k =>
      nextProps[k] !== prevProps[k]
    ).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
    if (needUpdateItems) {
      this.items = this.getItems(nextProps, this.meta);
    }
  }

  getItems({config, field, fieldType, isLHS, operator, parentFuncs, fieldDefinition, isFuncArg}, {lookingForFieldType}) {
    const {canUseFuncForField} = config.settings;
    const filteredFuncs = this.filterFuncs(
      config, config.funcs, field, fieldType, isLHS, operator, canUseFuncForField, parentFuncs, isFuncArg, fieldDefinition
    );
    const items = this.buildOptions(config, filteredFuncs, lookingForFieldType);
    return items;
  }

  getMeta({config, _field, fieldType, value, isLHS, isFuncArg}) {
    const {funcPlaceholder, fieldSeparatorDisplay} = config.settings;
    const selectedFuncKey = value;
    const isFuncSelected = !!value;

    // const leftFieldConfig = getFieldConfig(config, field);
    // const leftFieldWidgetField = leftFieldConfig?.widgets?.field;
    // const leftFieldWidgetFieldProps = leftFieldWidgetField && leftFieldWidgetField.widgetProps || {};
    const placeholder = !isFuncSelected ? funcPlaceholder : null;

    const currFunc = isFuncSelected ? getFuncConfig(config, selectedFuncKey) : null;
    const selectedOpts = currFunc || {};

    const selectedKeys = getFieldPathParts(selectedFuncKey, config);
    const selectedPath = getFieldPathParts(selectedFuncKey, config, true);
    const selectedLabel = this.getFuncLabel(currFunc, selectedFuncKey, config);
    const partsLabels = getFuncPathLabels(selectedFuncKey, config);
    let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
    if (selectedFullLabel == selectedLabel)
      selectedFullLabel = null;

    const isRootFuncAtLHS = isLHS && !isFuncArg;
    const lookingForFieldType = isRootFuncAtLHS && !isFuncSelected && fieldType;
    // Field source has been chnaged, no new func selected, but op & value remains
    const errorText = lookingForFieldType ? "Please select function" : null;
  
    return {
      placeholder,
      selectedKey: selectedFuncKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedFullLabel,
      errorText,
      lookingForFieldType,
    };
  }

  filterFuncs(config, funcs, leftFieldFullkey, fieldType, isLHS, operator, canUseFuncForField, parentFuncs, isFuncArg, fieldDefinition) {
    funcs = clone(funcs);
    const fieldSeparator = config.settings.fieldSeparator;
    const leftFieldConfig = getFieldConfig(config, leftFieldFullkey);
    const _relyOnWidgetType = false; //TODO: remove this, see issue #758
    let expectedType;
    let targetDefinition = leftFieldConfig;
    const widget = getWidgetForFieldOp(config, leftFieldFullkey, operator, "value");
    const widgetConfig = widget && config.widgets[widget];
    if (isFuncArg) {
      targetDefinition = fieldDefinition;
      expectedType = fieldDefinition?.type;
    } else if (_relyOnWidgetType && widgetConfig) {
      expectedType = widgetConfig.type;
    } else if (leftFieldConfig) {
      expectedType = leftFieldConfig.type;
    } else if (!isLHS) {
      // no field at LHS, but can use type from "memory effect"
      expectedType = fieldType;
    }

    function _filter(list, path) {
      for (let funcKey in list) {
        let subfields = list[funcKey].subfields;
        let subpath = (path ? path : []).concat(funcKey);
        let funcFullkey = subpath.join(fieldSeparator);
        let funcConfig = getFuncConfig(config, funcFullkey);
        if (funcConfig.type == "!struct") {
          if(_filter(subfields, subpath) == 0)
            delete list[funcKey];
        } else {
          let canUse = !expectedType || funcConfig.returnType == expectedType;
          if (targetDefinition?.funcs)
            canUse = canUse && targetDefinition.funcs.includes(funcFullkey);
          if (canUseFuncForField)
            canUse = canUse && canUseFuncForField(leftFieldFullkey, leftFieldConfig, funcFullkey, funcConfig, operator);
          // don't use func in func (can be configurable, but usually users don't need this)
          if (!funcConfig.allowSelfNesting && parentFuncs && parentFuncs.map(([func, _arg]) => func).includes(funcFullkey))
            canUse = false;
          if (!canUse)
            delete list[funcKey];
        }
      }
      return keys(list).length;
    }

    _filter(funcs, []);

    return funcs;
  }

  buildOptions(config, funcs, fieldType = undefined, path = null, optGroup = null) {
    if (!funcs)
      return null;
    const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
    const prefix = path?.length ? path.join(fieldSeparator) + fieldSeparator : "";

    const countFieldsMatchesType = (fields) => {
      return Object.keys(fields || {}).reduce((acc, fieldKey) => {
        const field = fields[fieldKey];
        if (field.type === "!struct") {
          return acc + countFieldsMatchesType(field.subfields);
        } else {
          return acc + (field.type === fieldType ? 1 : 0);
        }
      }, 0);
    };

    return keys(funcs).map(funcKey => {
      const fullFuncPath = [...(path ?? []), funcKey];
      const func = funcs[funcKey];
      const label = this.getFuncLabel(func, fullFuncPath, config);
      const partsLabels = getFuncPathLabels(fullFuncPath, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
      if (fullLabel == label)
        fullLabel = null;
      const tooltip = func.tooltip;

      if (func.type == "!struct") {
        const items = this.buildOptions(config, func.subfields, fieldType, fullFuncPath, {
          label,
          tooltip,
        });
        const hasItemsMatchesType = countFieldsMatchesType(func.subfields) > 0;
        return {
          key: funcKey,
          path: prefix+funcKey,
          label,
          fullLabel,
          tooltip,
          items,
          matchesType: hasItemsMatchesType,
        };
      } else {
        const matchesType = fieldType !== undefined ? func.returnType === fieldType : undefined;
        return {
          key: funcKey,
          path: prefix+funcKey,
          label,
          fullLabel,
          tooltip,
          grouplabel: optGroup?.label,
          group: optGroup,
          matchesType,
        };
      }
    });
  }

  getFuncLabel(funcOpts, funcKey, config) {
    if (!funcKey) return null;
    let maxLabelsLength = config.settings.maxLabelsLength;
    let funcParts = getFieldParts(funcKey, config);
    let label = funcOpts?.label || last(funcParts);
    label = truncateString(label, maxLabelsLength);
    return label;
  }

  render() {
    const {config, customProps, setValue, readonly, id, groupId} = this.props;
    const {renderFunc} = config.settings;
    const renderProps = {
      config,
      customProps,
      readonly,
      setField: setValue,
      items: this.items,
      id,
      groupId,
      ...this.meta
    };
    return renderFunc(renderProps, config.ctx);
  }

}

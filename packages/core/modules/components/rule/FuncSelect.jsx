import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {getFieldConfig, getFuncConfig} from "../../utils/configUtils";
import {
  getFieldPath, getFuncPathLabels, getFieldPathLabels, getValueSourcesForFieldOp, getWidgetForFieldOp
} from "../../utils/ruleUtils";
import {truncateString} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import last from "lodash/last";
import keys from "lodash/keys";
import clone from "clone";

//tip: this.props.value - right value, this.props.field - left value

export default class FuncSelect extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    value: PropTypes.string,
    setValue: PropTypes.func.isRequired,
    readonly: PropTypes.bool,
    parentFuncs: PropTypes.array,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
      
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForItems = ["config", "field", "operator"];
    const keysForMeta = ["config", "field", "value"];
    const needUpdateItems = !this.items || keysForItems.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
    if (needUpdateItems) {
      this.items = this.getItems(nextProps);
    }
  }

  getItems({config, field, operator, parentFuncs}) {
    const {canUseFuncForField} = config.settings;
    const filteredFuncs = this.filterFuncs(config, config.funcs, field, operator, canUseFuncForField, parentFuncs);
    const items = this.buildOptions(config, filteredFuncs);
    return items;
  }

  getMeta({config, field, value}) {
    const {funcPlaceholder, fieldSeparatorDisplay} = config.settings;
    const selectedFuncKey = value;
    const isFuncSelected = !!value;

    const leftFieldConfig = getFieldConfig(config, field);
    const leftFieldWidgetField = leftFieldConfig.widgets.field;
    const leftFieldWidgetFieldProps = leftFieldWidgetField && leftFieldWidgetField.widgetProps || {};
    const placeholder = !isFuncSelected ? funcPlaceholder : null;

    const currFunc = isFuncSelected ? getFuncConfig(config, selectedFuncKey) : null;
    const selectedOpts = currFunc || {};

    const selectedKeys = getFieldPath(selectedFuncKey, config);
    const selectedPath = getFieldPath(selectedFuncKey, config, true);
    const selectedLabel = this.getFuncLabel(currFunc, selectedFuncKey, config);
    const partsLabels = getFuncPathLabels(selectedFuncKey, config);
    let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
    if (selectedFullLabel == selectedLabel)
      selectedFullLabel = null;
    
    return {
      placeholder,
      selectedKey: selectedFuncKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedFullLabel,
    };
  }

  filterFuncs(config, funcs, leftFieldFullkey, operator, canUseFuncForField, parentFuncs) {
    funcs = clone(funcs);
    const fieldSeparator = config.settings.fieldSeparator;
    const leftFieldConfig = getFieldConfig(config, leftFieldFullkey);
    let expectedType;
    const widget = getWidgetForFieldOp(config, leftFieldFullkey, operator, "value");
    if (widget) {
      let widgetConfig = config.widgets[widget];
      let widgetType = widgetConfig.type;
      //expectedType = leftFieldConfig.type;
      expectedType = widgetType;
    } else {
      expectedType = leftFieldConfig.type;
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
          let canUse = funcConfig.returnType == expectedType;
          if (leftFieldConfig.funcs)
            canUse = canUse && leftFieldConfig.funcs.includes(funcFullkey);
          if (canUseFuncForField)
            canUse = canUse && canUseFuncForField(leftFieldFullkey, leftFieldConfig, funcFullkey, funcConfig, operator);
          // don't use func in func (can be configurable, but usually users don't need this)
          if (parentFuncs && parentFuncs.includes(funcFullkey))
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

  buildOptions(config, funcs, path = null, optGroupLabel = null) {
    if (!funcs)
      return null;
    const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
    const prefix = path ? path.join(fieldSeparator) + fieldSeparator : "";

    return keys(funcs).map(funcKey => {
      const func = funcs[funcKey];
      const label = this.getFuncLabel(func, funcKey, config);
      const partsLabels = getFuncPathLabels(funcKey, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
      if (fullLabel == label)
        fullLabel = null;
      const tooltip = func.tooltip;
      const subpath = (path ? path : []).concat(funcKey);

      if (func.type == "!struct") {
        return {
          key: funcKey,
          path: prefix+funcKey,
          label,
          fullLabel,
          tooltip,
          items: this.buildOptions(config, func.subfields, subpath, label)
        };
      } else {
        return {
          key: funcKey,
          path: prefix+funcKey,
          label,
          fullLabel,
          tooltip,
          grouplabel: optGroupLabel
        };
      }
    });
  }

  getFuncLabel(funcOpts, funcKey, config) {
    if (!funcKey) return null;
    let fieldSeparator = config.settings.fieldSeparator;
    let maxLabelsLength = config.settings.maxLabelsLength;
    let funcParts = Array.isArray(funcKey) ? funcKey : funcKey.split(fieldSeparator);
    let label = funcOpts.label || last(funcParts);
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
    return renderFunc(renderProps);
  }

}

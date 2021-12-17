import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {getFieldConfig} from "../../utils/configUtils";
import {getFieldPath, getFieldPathLabels, getWidgetForFieldOp} from "../../utils/ruleUtils";
import {truncateString} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import last from "lodash/last";
import keys from "lodash/keys";
import clone from "clone";

//tip: this.props.value - right value, this.props.field - left value

export default class ValueField extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    readonly: PropTypes.bool,
    parentField: PropTypes.string,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForItems = ["config", "field", "operator", "isFuncArg", "placeholder"];
    const keysForMeta = ["config", "field", "operator", "value", "parentField"];
    const needUpdateItems = !this.items || keysForItems.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateItems) {
      this.items = this.getItems(nextProps);
    }
    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getItems({config, field, operator, parentField, isFuncArg}) {
    const {canCompareFieldWithField} = config.settings;

    const fieldSeparator = config.settings.fieldSeparator;
    const parentFieldPath = typeof parentField == "string" ? parentField.split(fieldSeparator) : parentField;
    const parentFieldConfig = parentField ? getFieldConfig(config, parentField) : null;
    const sourceFields = parentField ? parentFieldConfig && parentFieldConfig.subfields : config.fields;

    const filteredFields = this.filterFields(config, sourceFields, field, parentField, parentFieldPath, operator, canCompareFieldWithField, isFuncArg);
    const items = this.buildOptions(parentFieldPath, config, filteredFields, parentFieldPath);
    return items;
  }

  getMeta({config, field, operator, value, placeholder: customPlaceholder, isFuncArg, parentField}) {
    const {fieldPlaceholder, fieldSeparatorDisplay} = config.settings;
    const selectedKey = value;
    const isFieldSelected = !!value;

    const leftFieldConfig = getFieldConfig(config, field);
    const leftFieldWidgetField = leftFieldConfig.widgets.field;
    const leftFieldWidgetFieldProps = leftFieldWidgetField && leftFieldWidgetField.widgetProps || {};
    const placeholder = isFieldSelected ? null 
      : (isFuncArg && customPlaceholder || leftFieldWidgetFieldProps.valuePlaceholder || fieldPlaceholder);
    const currField = isFieldSelected ? getFieldConfig(config, selectedKey) : null;
    const selectedOpts = currField || {};

    const selectedKeys = getFieldPath(selectedKey, config);
    const selectedPath = getFieldPath(selectedKey, config, true);
    const selectedLabel = this.getFieldLabel(currField, selectedKey, config);
    const partsLabels = getFieldPathLabels(selectedKey, config);
    let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
    if (selectedFullLabel == selectedLabel || parentField)
      selectedFullLabel = null;
    const selectedAltLabel = selectedOpts.label2;

    return {
      placeholder,
      selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
    };
  }

  filterFields(config, fields, leftFieldFullkey, parentField, parentFieldPath, operator, canCompareFieldWithField, isFuncArg) {
    fields = clone(fields);
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
      for (let rightFieldKey in list) {
        let subfields = list[rightFieldKey].subfields;
        let subpath = (path ? path : []).concat(rightFieldKey);
        let rightFieldFullkey = subpath.join(fieldSeparator);
        let rightFieldConfig = getFieldConfig(config, rightFieldFullkey);
        if (!rightFieldConfig) {
          delete list[rightFieldKey];
        } else if (rightFieldConfig.type == "!struct" || rightFieldConfig.type == "!group") {
          if(_filter(subfields, subpath) == 0)
            delete list[rightFieldKey];
        } else {
          // tip: LHS field can be used as arg in RHS function
          let canUse = rightFieldConfig.type == expectedType && (isFuncArg ? true : rightFieldFullkey != leftFieldFullkey);
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

  buildOptions(parentFieldPath, config, fields, path = null, optGroupLabel = null) {
    if (!fields)
      return null;
    const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
    const prefix = path ? path.join(fieldSeparator) + fieldSeparator : "";

    return keys(fields).map(fieldKey => {
      const field = fields[fieldKey];
      const label = this.getFieldLabel(field, fieldKey, config);
      const partsLabels = getFieldPathLabels(fieldKey, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
      if (fullLabel == label || parentFieldPath)
        fullLabel = null;
      const altLabel = field.label2;
      const tooltip = field.tooltip;
      const subpath = (path ? path : []).concat(fieldKey);

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
          items: this.buildOptions(parentFieldPath, config, field.subfields, subpath, label)
        };
      } else {
        return {
          key: fieldKey,
          path: prefix+fieldKey,
          label,
          fullLabel,
          altLabel,
          tooltip,
          grouplabel: optGroupLabel
        };
      }
    }).filter(o => !!o);
  }

  getFieldLabel(fieldOpts, fieldKey, config) {
    if (!fieldKey) return null;
    let fieldSeparator = config.settings.fieldSeparator;
    let maxLabelsLength = config.settings.maxLabelsLength;
    let fieldParts = Array.isArray(fieldKey) ? fieldKey : fieldKey.split(fieldSeparator);
    let label = fieldOpts.label || last(fieldParts);
    label = truncateString(label, maxLabelsLength);
    return label;
  }

  render() {
    const {config, customProps, setValue, readonly, id, groupId} = this.props;
    const {renderField} = config.settings;
    const renderProps = {
      config,
      customProps,
      setField: setValue,
      readonly,
      items: this.items,
      id,
      groupId,
      ...this.meta
    };
    return renderField(renderProps);
  }

}

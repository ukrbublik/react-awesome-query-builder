import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  getFieldConfig, getFieldPath, getFieldPathLabels, getWidgetForFieldOp
} from "../utils/configUtils";
import {truncateString, useOnPropsChanged} from "../utils/stuff";
import last from "lodash/last";
import keys from "lodash/keys";
import clone from "clone";

//tip: this.props.value - right value, this.props.field - left value

export default class ValueField extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
    readonly: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForItems = ["config", "field", "operator", "isFuncArg", "placeholder"];
    const keysForMeta = ["config", "field", "operator", "value"];
    const needUpdateItems = !this.items || keysForItems.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateItems) {
      this.items = this.getItems(nextProps);
    }
    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getItems({config, field, operator}) {
    const {canCompareFieldWithField} = config.settings;
    const filteredFields = this.filterFields(config, config.fields, field, operator, canCompareFieldWithField);
    const items = this.buildOptions(config, filteredFields);
    return items;
  }

  getMeta({config, field, operator, value, placeholder: customPlaceholder, isFuncArg}) {
    const {fieldPlaceholder, fieldSeparatorDisplay} = config.settings;
    const selectedKey = value;
    const isFieldSelected = !!value;

    const leftFieldConfig = getFieldConfig(field, config);
    const leftFieldWidgetField = leftFieldConfig.widgets.field;
    const leftFieldWidgetFieldProps = leftFieldWidgetField && leftFieldWidgetField.widgetProps || {};
    const placeholder = isFieldSelected ? null 
      : (isFuncArg && customPlaceholder || leftFieldWidgetFieldProps.valuePlaceholder || fieldPlaceholder);
    const currField = isFieldSelected ? getFieldConfig(selectedKey, config) : null;
    const selectedOpts = currField || {};

    const selectedKeys = getFieldPath(selectedKey, config);
    const selectedPath = getFieldPath(selectedKey, config, true);
    const selectedLabel = this.getFieldLabel(currField, selectedKey, config);
    const partsLabels = getFieldPathLabels(selectedKey, config);
    let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
    if (selectedFullLabel == selectedLabel)
      selectedFullLabel = null;
    const selectedAltLabel = selectedOpts.label2;

    return {
      placeholder,
      selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
    };
  }

  filterFields(config, fields, leftFieldFullkey, operator, canCompareFieldWithField) {
    fields = clone(fields);
    const fieldSeparator = config.settings.fieldSeparator;
    const leftFieldConfig = getFieldConfig(leftFieldFullkey, config);
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
        let rightFieldConfig = getFieldConfig(rightFieldFullkey, config);
        if (!rightFieldConfig) {
          delete list[rightFieldKey];
        } else if (rightFieldConfig.type == "!struct" || rightFieldConfig.type == "!group") {
          if(_filter(subfields, subpath) == 0)
            delete list[rightFieldKey];
        } else {
          let canUse = rightFieldConfig.type == expectedType && rightFieldFullkey != leftFieldFullkey;
          let fn = canCompareFieldWithField || config.settings.canCompareFieldWithField;
          if (fn)
            canUse = canUse && fn(leftFieldFullkey, leftFieldConfig, rightFieldFullkey, rightFieldConfig, operator);
          if (!canUse)
            delete list[rightFieldKey];
        }
      }
      return keys(list).length;
    }

    _filter(fields, []);

    return fields;
  }

  buildOptions(config, fields, path = null, optGroupLabel = null) {
    if (!fields)
      return null;
    const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
    const prefix = path ? path.join(fieldSeparator) + fieldSeparator : "";

    return keys(fields).map(fieldKey => {
      const field = fields[fieldKey];
      const label = this.getFieldLabel(field, fieldKey, config);
      const partsLabels = getFieldPathLabels(fieldKey, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
      if (fullLabel == label)
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
          items: this.buildOptions(config, field.subfields, subpath, label)
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
    const {config, customProps, setValue, readonly} = this.props;
    const {renderField} = config.settings;
    const renderProps = {
      config,
      customProps,
      setField: setValue,
      readonly,
      items: this.items,
      ...this.meta
    };
    return renderField(renderProps);
  }

}

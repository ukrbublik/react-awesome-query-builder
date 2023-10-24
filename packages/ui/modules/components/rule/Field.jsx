import React, { Component } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import PropTypes from "prop-types";
import {truncateString} from "../../utils/stuff";
import {useOnPropsChanged} from "../../utils/reactUtils";
import last from "lodash/last";
import keys from "lodash/keys";
const {getFieldPathLabels} = Utils.RuleUtils;
const {getFieldConfig, getFieldParts, getFieldPathParts} = Utils.ConfigUtils;


export default class Field extends Component {
  static propTypes = {
    id: PropTypes.string,
    groupId: PropTypes.string,
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.any,
    selectedFieldSrc: PropTypes.string,
    selectedFieldType: PropTypes.string,
    parentField: PropTypes.string,
    customProps: PropTypes.object,
    readonly: PropTypes.bool,
    //actions
    setField: PropTypes.func.isRequired,
    setFieldSrc: PropTypes.func,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);

    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const prevProps = this.props;
    const keysForMeta = ["selectedField", "selectedFieldSrc", "selectedFieldType", "config", "parentField"];
    const needUpdateMeta = !this.meta || keysForMeta.map(k => (nextProps[k] !== prevProps[k])).filter(ch => ch).length > 0;

    if (needUpdateMeta) {
      this.meta = this.getMeta(nextProps);
    }
  }

  getMeta({selectedField, selectedFieldType, config, parentField}) {
    const selectedKey = selectedField;
    const {maxLabelsLength, fieldSeparatorDisplay, fieldPlaceholder, fieldSeparator} = config.settings;
    const isFieldSelected = !!selectedField;
    const placeholder = !isFieldSelected ? truncateString(fieldPlaceholder, maxLabelsLength) : null;
    const currField = isFieldSelected ? getFieldConfig(config, selectedKey) : null;
    const selectedOpts = currField || {};

    const selectedKeys = getFieldPathParts(selectedKey, config);
    const selectedPath = getFieldPathParts(selectedKey, config, true);
    const selectedLabel = this.getFieldLabel(currField, selectedKey, config);
    const partsLabels = getFieldPathLabels(selectedKey, config);
    let selectedFullLabel = partsLabels ? partsLabels.join(fieldSeparatorDisplay) : null;
    if (selectedFullLabel == selectedLabel || parentField)
      selectedFullLabel = null;
    const selectedAltLabel = selectedOpts.label2;

    const parentFieldPath = getFieldParts(parentField, config);
    const parentFieldConfig = parentField ? getFieldConfig(config, parentField) : null;
    const sourceFields = parentField ? parentFieldConfig && parentFieldConfig.subfields : config.fields;
    const lookingForFieldType = !isFieldSelected && selectedFieldType;
    const items = this.buildOptions(parentFieldPath, config, sourceFields, lookingForFieldType, parentFieldPath);

    // Field source has been chnaged, no new field selected, but op & value remains
    const errorText = lookingForFieldType ? "Please select field" : null;

    return {
      placeholder, items, parentField,
      selectedKey, selectedKeys, selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
      errorText,
    };
  }

  getFieldLabel(fieldOpts, fieldKey, config) {
    if (!fieldKey) return null;
    let maxLabelsLength = config.settings.maxLabelsLength;
    let fieldParts = getFieldParts(fieldKey, config);
    let label = fieldOpts?.label || last(fieldParts);
    label = truncateString(label, maxLabelsLength);
    return label;
  }

  buildOptions(parentFieldPath, config, fields, fieldType = undefined, path = null, optGroup = null) {
    if (!fields)
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

    return keys(fields).map(fieldKey => {
      const fullFieldPath = [...(path ?? []), fieldKey];
      const field = fields[fieldKey];
      const label = this.getFieldLabel(field, fullFieldPath, config);
      const partsLabels = getFieldPathLabels(fullFieldPath, config);
      let fullLabel = partsLabels.join(fieldSeparatorDisplay);
      if (fullLabel == label || parentFieldPath?.length)
        fullLabel = null;
      const altLabel = field.label2;
      const tooltip = field.tooltip;
      const disabled = field.disabled;

      if (field.hideForSelect)
        return undefined;

      if (field.type == "!struct") {
        const items = this.buildOptions(parentFieldPath, config, field.subfields, fieldType, fullFieldPath, {
          label,
          tooltip,
        });
        const hasItemsMatchesType = countFieldsMatchesType(field.subfields) > 0;
        return {
          disabled,
          key: fieldKey,
          path: prefix+fieldKey,
          label,
          fullLabel,
          altLabel,
          tooltip,
          items,
          matchesType: hasItemsMatchesType,
        };
      } else {
        const matchesType = fieldType !== undefined ? field.type === fieldType : undefined;
        return {
          disabled,
          key: fieldKey,
          path: prefix+fieldKey,
          label,
          fullLabel,
          altLabel,
          tooltip,
          grouplabel: optGroup?.label,
          group: optGroup,
          matchesType,
        };
      }
    }).filter(o => !!o);
  }

  render() {
    const {config, customProps, setField, setFieldSrc, readonly, id, groupId} = this.props;
    const {renderField} = config.settings;
    const renderProps = {
      id,
      groupId,
      config, 
      customProps, 
      readonly,
      setField,
      setFieldSrc,
      ...this.meta
    };
    return renderField(renderProps, config.ctx);
  }

}

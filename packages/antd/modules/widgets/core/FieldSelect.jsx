import React, { PureComponent } from "react";
import { Tooltip, Select } from "antd";
import {BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth} from "../../utils/domUtils";
import PropTypes from "prop-types";
const { Option, OptGroup } = Select;

// see type FieldItemSearchableKeys
const mapFieldItemToOptionKeys = {
  key: "_value2",
  path: "value",
  label: "label",
  altLabel: "title",
  tooltip: "_tooltip",
  grouplabel: "grouplabel",
  fullLabel: "_fullLabel",
};

export default class FieldSelect extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    customProps: PropTypes.object,
    errorText: PropTypes.string,
    items: PropTypes.array.isRequired,
    placeholder: PropTypes.string,
    selectedKey: PropTypes.string,
    selectedKeys: PropTypes.array,
    selectedPath: PropTypes.array,
    selectedLabel: PropTypes.string,
    selectedAltLabel: PropTypes.string,
    selectedFullLabel: PropTypes.string,
    selectedOpts: PropTypes.object,
    readonly: PropTypes.bool,
    //actions
    setField: PropTypes.func.isRequired,
  };

  onChange = (key) => {
    this.props.setField(key);
  };

  filterOption = (input, option) => {
    const { config } = this.props;
    const keysForFilter = config.settings.fieldItemKeysForSearch
      .map(k => mapFieldItemToOptionKeys[k]);
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    const matches = valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    return matches;
  };

  render() {
    const {
      config, customProps, items, placeholder,
      selectedKey, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel, readonly, errorText,
    } = this.props;
    const {showSearch} = customProps || {};

    const selectText = selectedLabel || placeholder;
    const selectWidth = calcTextWidth(selectText);
    const isFieldSelected = !!selectedKey;
    const dropdownPlacement = config.settings.dropdownPlacement;
    const dropdownAlign = dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined;
    const width = isFieldSelected && !showSearch || !selectWidth ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;
    let tooltipText = selectedAltLabel || selectedFullLabel;
    if (tooltipText == selectedLabel)
      tooltipText = null;

    const fieldSelectItems = this.renderSelectItems(items);

    let res = (
      <Select
        dropdownAlign={dropdownAlign}
        popupMatchSelectWidth={false}
        style={{ width }}
        placeholder={placeholder}
        size={config.settings.renderSize}
        onChange={this.onChange}
        value={selectedKey || undefined}
        optionLabelProp={"label"}
        filterOption={this.filterOption}
        disabled={readonly}
        status={errorText && "error"}
        {...customProps}
      >{fieldSelectItems}</Select>
    );

    if (tooltipText && !selectedOpts.tooltip) {
      res = <Tooltip title={tooltipText}>{res}</Tooltip>;
    }

    return res;
  }

  renderSelectItems(fields, level = 0) {
    return fields.map(field => {
      const {items, key, path, label, fullLabel, altLabel, tooltip, grouplabel, disabled, matchesType} = field;
      const groupPrefix = level > 0 ? "\u00A0\u00A0".repeat(level) : "";
      const prefix = level > 1 ? "\u00A0\u00A0".repeat(level-1) : "";
      const pathKey = path || key;
      if (items) {
        const simpleItems = items.filter(it => !it.items);
        const complexItems = items.filter(it => !!it.items);
        const gr = simpleItems.length
          ? [<OptGroup
            key={pathKey}
            label={groupPrefix+label}
          >{this.renderSelectItems(simpleItems, level+1)}</OptGroup>]
          : [];
        const list = complexItems.length ? this.renderSelectItems(complexItems, level+1) : [];
        return [...gr, ...list];
      } else {
        const optionText = matchesType ? <b>{prefix+label}</b> : prefix+label;
        const option = tooltip ? <Tooltip title={tooltip}>{optionText}</Tooltip> : optionText;
        
        return <Option
          key={pathKey}
          value={pathKey}
          title={altLabel}
          grouplabel={grouplabel}
          label={label}
          disabled={disabled}
          _fullLabel={fullLabel}
          _tooltip={tooltip}
          _value2={key}
        >
          {option}
        </Option>;
      }
    }).flat(Infinity);
  }

}

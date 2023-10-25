import React, { Component } from "react";
import PropTypes from "prop-types";
import { Cascader, Tooltip } from "antd";
import {removePrefixPath} from "../../utils/stuff";
import { Utils } from "@react-awesome-query-builder/ui";
const { useOnPropsChanged } = Utils.ReactUtils;
const { getFieldParts } = Utils.ConfigUtils;

// see type FieldItemSearchableKeys
const mapFieldItemToOptionKeys = {
  key: "key",
  path: "_path",
  label: "_label",
  altLabel: "altLabel",
  tooltip: "tooltip",
  grouplabel: "grouplabel",
  fullLabel: "fullLabel",
};
const searchInPath = false; // true - search in all path, false - only in last path item

export default class FieldCascader extends Component {
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

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
    this.state = {
      open: false
    };
  }

  onPropsChanged(nextProps) {
    const { items } = nextProps;
    this.items = this.getItems(items);
  }

  getItems(items) {
    return items.map(item => {
      const {items, matchesType, label, key, path, tooltip} = item;
      let finalLabel = matchesType ? <b>{label}</b> : label;
      if (tooltip) {
        finalLabel = <Tooltip title={tooltip}>{finalLabel}</Tooltip>;
      }

      if (items) {
        return {
          ...item,
          key: key,
          _path: path,
          items: this.getItems(items),
          label: finalLabel,
          _label: label,
        };
      } else {
        return {
          ...item,
          key: key,
          _path: path,
          label: finalLabel,
          _label: label,
        };
      }
    });
  }

  setOpen = (newOpen) => {
    this.setState({
      open: newOpen
    });
  };

  onChange = (keys) => {
    const { parentField } = this.props;
    const dotNotationToPath = str => str.split(".");
    const parentPath = parentField ? dotNotationToPath(parentField) : [];
    this.props.setField([...parentPath, ...keys]);
  };

  filterOption = (input, path) => {
    const { config } = this.props;
    const keysForFilter = config.settings.fieldItemKeysForSearch
      .map(k => mapFieldItemToOptionKeys[k]);
    const filterOneOption = (option => {
      const valueForFilter = keysForFilter
        .map(k => (typeof option[k] == "string" ? option[k] : ""))
        .join("\0");
      const matches = valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      return matches;
    });
    return searchInPath ? path.some(filterOneOption) : filterOneOption(path[path.length-1]);
  };

  render() {
    const {
      config, customProps, items, placeholder, errorText,
      selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel, readonly, selectedField, parentField, 
    } = this.props;
    const { open } = this.state;
    let customProps2 = {...customProps};
    if (customProps2.showSearch) {
      customProps2.showSearch = {
        filter: this.filterOption
      };
    }

    const {fieldSeparator} = config.settings;
    const parentFieldPath = getFieldParts(parentField, config);
    const value = removePrefixPath(selectedPath, parentFieldPath);
    let res = (
      <Cascader
        open={open}
        onDropdownVisibleChange={this.setOpen}
        status={errorText && "error"}
        fieldNames={{ label: "label", value: "key", children: "items" }}
        options={this.items}
        value={value}
        onChange={this.onChange}
        allowClear={false}
        placeholder={placeholder}
        size={config.settings.renderSize}
        disabled={readonly}
        {...customProps2}
      />
    );

    let tooltipText = selectedOpts.tooltip || selectedAltLabel;
    if (tooltipText == selectedLabel)
      tooltipText = null;
    if (tooltipText) {
      res = <Tooltip title={!open ? tooltipText : null}>{res}</Tooltip>;
    }
    
    return res;
  }
}
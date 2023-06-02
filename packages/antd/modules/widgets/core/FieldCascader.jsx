import React, { Component } from "react";
import PropTypes from "prop-types";
import { Cascader, Tooltip } from "antd";
import {removePrefixPath} from "../../utils/stuff";
import { Utils } from "@react-awesome-query-builder/ui";
const { useOnPropsChanged } = Utils.ReactUtils;


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
  }

  onPropsChanged(nextProps) {
    const { items } = nextProps;
    this.items = this.getItems(items);
  }

  getItems(items) {
    return items.map(item => {
      const {items, matchesType, label} = item;

      if (items) {
        return {
          ...item,
          items: this.getItems(items),
          label: matchesType ? <b>{label}</b> : label,
        };
      } else {
        return {
          ...item,
          label: matchesType ? <b>{label}</b> : label,
        };
      }
    });
  }

  onChange = (keys) => {
    const { parentField } = this.props;
    const dotNotationToPath = str => str.split(".");
    const parentPath = parentField ? dotNotationToPath(parentField) : [];
    this.props.setField([...parentPath, ...keys]);
  };

  filterOption = (inputValue, path) => {
    const keysForFilter = ["label", "key", "altLabel"];
    return path.some(option => (
      keysForFilter.map(k => option[k]).join("\0").toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    ));
  };

  render() {
    const {
      config, customProps, items, placeholder, errorText,
      selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel, readonly, selectedField, parentField, 
    } = this.props;
    let customProps2 = {...customProps};
    if (customProps2.showSearch) {
      customProps2.showSearch = {
        filter: this.filterOption
      };
    }

    const {fieldSeparator} = config.settings;
    const parentFieldPath = parentField ? parentField.split(fieldSeparator) : [];
    const value = removePrefixPath(selectedPath, parentFieldPath);
    let res = (
      <Cascader
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
      res = <Tooltip title={tooltipText}>{res}</Tooltip>;
    }
    
    return res;
  }
}
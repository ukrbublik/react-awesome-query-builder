import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Cascader, Tooltip } from "antd";
import {removePrefixPath} from "../../../../utils/stuff";


export default class FieldCascader extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    customProps: PropTypes.object,
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

  onChange = (keys) => {
    const { parentField } = this.props;
    const dotNotationToPath = str => str.split(".");
    const parentPath = parentField ? dotNotationToPath(parentField) : [];
    this.props.setField([...parentPath, ...keys]);
  }

  filterOption = (inputValue, path) => {
    const keysForFilter = ["label", "key", "altLabel"];
    return path.some(option => (
      keysForFilter.map(k => option[k]).join("\0").toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    ));
  }

  render() {
    const {
      config, customProps, items, placeholder,
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
        fieldNames={{ label: "label", value: "key", children: "items" }}
        options={items}
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
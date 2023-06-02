import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import omit from "lodash/omit";
import { Menu, Dropdown, Tooltip, Button } from "antd";
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
import { DownOutlined } from "@ant-design/icons";


export default class FieldDropdown extends PureComponent {
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

  onChange = ({key, keyPath}) => {
    this.props.setField(key);
  };

  renderMenuItems(fields) {
    return fields.map(field => {
      const {items, key, path, label, fullLabel, altLabel, tooltip, disabled, matchesType} = field;
      const pathKey = path || key;
      const optionText = matchesType ? <b>{label}</b> : label;
      const option = tooltip ? <Tooltip title={tooltip}>{optionText}</Tooltip> : optionText;

      if (items) {
        return <SubMenu
          key={pathKey}
          title={<span>{option} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
        >
          {this.renderMenuItems(items)}
        </SubMenu>;
      } else {
        return <MenuItem
          key={pathKey}
          disabled={disabled}
        >
          {option}
        </MenuItem>;
      }
    });
  }

  renderMenuToggler(togglerLabel, tooltipText, config, readonly, errorText) {
    let toggler
          = <Button
            size={config.settings.renderSize}
            disabled={readonly}
            danger={!!errorText}
          >
            {togglerLabel} <DownOutlined />
          </Button>;

    if (tooltipText) {
      toggler 
              = <Tooltip
          placement="top"
          title={tooltipText}
        >
          {toggler}
        </Tooltip>;
    }

    return toggler;
  }

  render() {
    const {
      config, customProps, items, placeholder, errorText,
      selectedKeys, selectedLabel, selectedOpts, readonly, selectedAltLabel, selectedFullLabel,
    } = this.props;

    const fieldMenuItems = this.renderMenuItems(items);

    const fieldMenu = (
      <Menu
        //size={config.settings.renderSize}
        selectedKeys={selectedKeys}
        onClick={this.onChange}
        {...omit(customProps, ["showSearch"])}
      >{fieldMenuItems}</Menu>
    );
    const togglerLabel = selectedAltLabel || selectedLabel || placeholder;
    let tooltipText = selectedFullLabel;
    if (tooltipText == selectedLabel)
      tooltipText = null;
    const fieldToggler = this.renderMenuToggler(togglerLabel, tooltipText, config, readonly, errorText);

    return readonly ? fieldToggler : (
      <Dropdown
        overlay={fieldMenu}
        trigger={["click"]}
        placement={config.settings.dropdownPlacement}
      >
        {fieldToggler}
      </Dropdown>
    );
  }
}
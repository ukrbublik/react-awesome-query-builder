import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Menu, Dropdown, Tooltip, Button } from "antd";
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
import { DownOutlined } from "@ant-design/icons";


export default class FieldDropdown extends PureComponent {
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

  onChange = ({key, keyPath}) => {
    this.props.setField(key);
  }

  renderMenuItems(fields) {
    return fields.map(field => {
      const {items, key, path, label, fullLabel, altLabel, tooltip, disabled} = field;
      const pathKey = path || key;
      const option = tooltip ? <Tooltip title={tooltip}>{label}</Tooltip> : label;

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

  renderMenuToggler(togglerLabel, tooltipText, config, readonly) {
    let toggler
          = <Button
            size={config.settings.renderSize}
            disabled={readonly}
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
      config, customProps, items, placeholder,
      selectedKeys, selectedLabel, selectedOpts, readonly, selectedAltLabel, selectedFullLabel,
    } = this.props;

    const fieldMenuItems = this.renderMenuItems(items);

    const fieldMenu = (
      <Menu
        //size={config.settings.renderSize}
        selectedKeys={selectedKeys}
        onClick={this.onChange}
        {...customProps}
      >{fieldMenuItems}</Menu>
    );
    const togglerLabel = selectedAltLabel || selectedLabel || placeholder;
    let tooltipText = selectedFullLabel;
    if (tooltipText == selectedLabel)
      tooltipText = null;
    const fieldToggler = this.renderMenuToggler(togglerLabel, tooltipText, config, readonly);

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
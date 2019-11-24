import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import keys from 'lodash/keys';
import { Menu, Dropdown, Icon, Tooltip, Button } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;


export default class FieldDropdown extends PureComponent {
  static propTypes = {
      config: PropTypes.object.isRequired,
      customProps: PropTypes.object,
      items: PropTypes.array,
      placeholder: PropTypes.string,
      selectedKey: PropTypes.string,
      selectedKeys: PropTypes.array,
      selectedPath: PropTypes.array,
      selectedLabel: PropTypes.string,
      selectedAltLabel: PropTypes.string,
      selectedFullLabel: PropTypes.string,
      selectedOpts: PropTypes.object,
      //actions
      setField: PropTypes.func.isRequired,
  };

  onChange = ({key, keyPath}) => {
      this.props.setField(key);
  }

  renderMenuItems(fields) {
    return keys(fields).map(fieldKey => {
        const field = fields[fieldKey];
        const {items, key, path, label, fullLabel, altLabel, tooltip} = field;
        const option = tooltip ? <Tooltip title={tooltip}>{label}</Tooltip> : label;

        if (items) {
            return <SubMenu
                    key={path}
                    title={<span>{option} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
                >
                    {this.renderMenuItems(items)}
                </SubMenu>
        } else {
            return <MenuItem
                key={path}
            >
                {option}
            </MenuItem>;
        }
    });
  }

  renderMenuToggler(togglerLabel, fullLabel, config) {
      let toggler =
          <Button
              size={config.settings.renderSize}
          >
              {togglerLabel} <Icon type="down" />
          </Button>;

      if (fullLabel) {
          toggler = 
              <Tooltip
                  placement="top"
                  title={fullLabel}
              >
                  {toggler}
              </Tooltip>;
      }

      return toggler;
  }

  render() {
    const {
        config, customProps, items, placeholder,
        selectedKeys, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
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
    const fieldToggler = this.renderMenuToggler(togglerLabel, selectedFullLabel, config);

    return (
      <Dropdown
          overlay={fieldMenu}
          trigger={['click']}
          placement={config.settings.dropdownPlacement}
      >
          {fieldToggler}
      </Dropdown>
    );
}
}
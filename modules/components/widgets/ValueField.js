import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import {getFieldConfig, getFieldPath, getFieldPathLabels, calcTextWidth} from "../../utils/index";
import { Menu, Dropdown, Icon, Tooltip, Button, Select } from 'antd';
const { Option, OptGroup } = Select;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import map from 'lodash/map';
import last from 'lodash/last';
import keys from 'lodash/keys';
import clone from 'clone';

//tip: this.props.value - right value, this.props.field - left value

export default class ValueField extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired,
    renderAsDropdown: PropTypes.bool,
  };

  shouldComponentUpdate = shallowCompare;

  curFieldOpts() {
      return Object.assign({}, {label: this.props.value}, getFieldConfig(this.props.value, this.props.config) || {});
  }

  handleFieldMenuSelect({key, keyPath}) {
    this.props.setValue(key);
  }

  handleFieldSelect(key) {
    this.props.setValue(key);
  }

  //tip: empty groups is ok for antd
  filterFieldsByLeftField(fields, leftFieldKey) {
    const leftFieldConfig = getFieldConfig(leftFieldKey, this.props.config);
    function _filter(list, path) {
      for (let fieldKey in list) {
        let field = list[fieldKey];
        if (field.type == "!struct") {
          let subpath = (path ? path : []).concat(fieldKey);
          _filter(field.subfields, subpath);
        } else {
          if (field.type != leftFieldConfig.type || fieldKey == leftFieldKey) {
            delete list[fieldKey];
          }
        }
      }
    }

    fields = clone(fields);
    _filter(fields, []);
    
    return fields;
  }

  buildMenuItems(fields, path = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          if (field.type == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <SubMenu 
                  key={prefix+fieldKey} 
                  title={<span>{field.label || last(fieldKey.split(fieldSeparator))} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
              >
                  {this.buildMenuItems(field.subfields, subpath)}
              </SubMenu>
          } else {
              return <MenuItem key={prefix+fieldKey}>{field.label || last(fieldKey.split(fieldSeparator))}</MenuItem>;
          }
      });
  }

  buildSelectItems(fields, path = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          if (field.type == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <OptGroup 
                  key={prefix+fieldKey} 
                  label={field.label || last(fieldKey.split(fieldSeparator))}
              >
                  {this.buildSelectItems(field.subfields, subpath)}
              </OptGroup>
          } else {
              return <Option 
                key={prefix+fieldKey}
                value={prefix+fieldKey}
              >
                {field.label || last(fieldKey.split(fieldSeparator))}
              </Option>;
          }
      });
  }

  buildMenuToggler(label, fullLabel, customLabel) {
      var toggler = 
          <Button 
              size={this.props.config.settings.renderSize || "small"}
          >
              {customLabel ? customLabel : label} <Icon type="down" />
          </Button>;

      if (fullLabel && fullLabel != label) {
          toggler = <Tooltip
                  placement="top"
                  title={fullLabel}
              >
              {toggler}
              </Tooltip>;
      }

      return toggler;
  }

  render() {
    if (this.props.renderAsDropdown)
        return this.renderAsDropdown();
    else
        return this.renderAsSelect();
  }

  renderAsSelect() {
    let fieldOptions = this.filterFieldsByLeftField(this.props.config.fields, this.props.field);
    let placeholder = this.curFieldOpts().label || this.props.config.settings.fieldPlaceholder;
    let placeholderWidth = calcTextWidth(placeholder, '12px');
    let fieldSelectItems = this.buildSelectItems(fieldOptions);
    let fieldSelect = (
          <Select 
              dropdownMatchSelectWidth={false}
              style={{ width: this.props.value ? null : placeholderWidth + 36 }}
              ref="field" 
              placeholder={placeholder}
              size={this.props.config.settings.renderSize || "small"}
              onChange={this.handleFieldSelect.bind(this)}
              value={this.props.value || undefined}
          >{fieldSelectItems}</Select>
    );

    return fieldSelect;
  }

  renderAsDropdown() {
    let fieldOptions = this.filterFieldsByLeftField(this.props.config.fields, this.props.field);
    let selectedFieldKeys = getFieldPath(this.props.value, this.props.config);
    let selectedFieldPartsLabels = getFieldPathLabels(this.props.value, this.props.config);
    let selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(this.props.config.settings.fieldSeparatorDisplay) : null;
    let placeholder = this.curFieldOpts().label || this.props.config.settings.fieldPlaceholder;

    let fieldMenuItems = this.buildMenuItems(fieldOptions);
    let fieldMenu = (
        <Menu 
            //size={this.props.config.settings.renderSize || "small"}
            selectedKeys={selectedFieldKeys}
            onClick={this.handleFieldMenuSelect.bind(this)}
        >{fieldMenuItems}</Menu>
    );
    let fieldToggler = this.buildMenuToggler(placeholder, selectedFieldFullLabel, this.curFieldOpts().label2);

    return (
        <Dropdown 
            overlay={fieldMenu} 
            trigger={['click']}
        >
            {fieldToggler}
        </Dropdown>
    );
  }
}

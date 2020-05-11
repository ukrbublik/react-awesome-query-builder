import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/configUtils";
import {calcTextWidth, BUILT_IN_PLACEMENTS} from "../utils/stuff";
import { Menu, Dropdown, Tooltip, Button, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';
const { Option, OptGroup } = Select;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import { map, last, keys, pickBy } from 'lodash';
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default class Operator extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    selectedOperator: PropTypes.string,
    renderAsDropdown: PropTypes.bool,
    //actions
    setOperator: PropTypes.func.isRequired,
    customProps: PropTypes.object,
  };

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

  constructor(props) {
      super(props);
      this.onPropsChanged(props);
  }

  componentWillReceiveProps (props) {
      this.onPropsChanged(props);
  }

  onPropsChanged (props) {
      let fieldConfig = getFieldConfig(props.selectedField, props.config);
      this.operatorOptions = pickBy(props.config.operators, (item, key) =>
          fieldConfig && fieldConfig.operators && fieldConfig.operators.indexOf(key) !== -1
      );
  }

  curOpOpts() {
      return Object.assign({}, {label: this.props.selectedOperator}, this.operatorOptions[this.props.selectedOperator] || {});
  }

  handleOperatorMenuSelect = ({key, keyPath}) => {
      this.props.setOperator(key);
  }

  handleOperatorSelect = (key) => {
      this.props.setOperator(key);
  }

  buildMenuItems(fields) {
      if (!fields)
          return null;
      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          return <MenuItem key={fieldKey}>{field.label}</MenuItem>;
      });
  }

  buildMenuToggler(label) {
      var toggler =
          <Button
              size={this.props.config.settings.renderSize || "small"}
          >
              {label} <DownOutlined />
          </Button>;

      return toggler;
  }

  buildSelectItems(fields) {
      if (!fields)
          return null;
      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          return <Option
            key={fieldKey}
            value={fieldKey}
          >
            {field.label}
          </Option>;
      });
  }

  render() {
    if (this.props.renderAsDropdown)
        return this.renderAsDropdown();
    else
        return this.renderAsSelect();
  }

  renderAsSelect() {
    let dropdownPlacement = this.props.config.settings.dropdownPlacement;
    let selectedOpKey = this.props.selectedOperator;
    let opMenuItems = this.buildMenuItems(this.operatorOptions);
    let placeholder = this.curOpOpts().label || this.props.config.settings.operatorPlaceholder;
    let placeholderWidth = calcTextWidth(placeholder, '14px');
    let fieldSelectItems = this.buildSelectItems(this.operatorOptions);
    const fieldAddWidth = this.props.config.settings.fieldAddWidth || 48
    let opSelect = (
        <Select
            dropdownAlign={dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined}
            dropdownMatchSelectWidth={false}
            style={{ width: this.props.selectedOperator ? null : placeholderWidth + fieldAddWidth }}
            ref="field"
            placeholder={placeholder}
            size={this.props.config.settings.renderSize || "small"}
            onChange={this.handleOperatorSelect}
            value={this.props.selectedOperator || undefined}
            {...this.props.customProps}
        >{fieldSelectItems}</Select>
    );

    return opSelect;
  }

  renderAsDropdown() {
    let selectedOpKey = this.props.selectedOperator;
    let placeholder = this.curOpOpts().label || this.props.config.settings.operatorPlaceholder;
    let opMenuItems = this.buildMenuItems(this.operatorOptions);
    let opMenu = (
        <Menu
            //size={this.props.config.settings.renderSize || "small"}
            selectedKeys={[selectedOpKey]}
            onClick={this.handleOperatorMenuSelect}
            {...this.props.customProps}
        >{opMenuItems}</Menu>
    );
    let opToggler = this.buildMenuToggler(placeholder);

    
    return (
      <Dropdown
          overlay={opMenu}
          trigger={['click']}
          placement={this.props.config.settings.dropdownPlacement}
      >
          {opToggler}
      </Dropdown>
    );
  }
}

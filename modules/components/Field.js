import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import {getFieldConfig, getFieldPath, getFieldPathLabels} from "../utils/configUtils";
import {calcTextWidth, truncateString, BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT} from "../utils/stuff";
import { Menu, Dropdown, Icon, Tooltip, Button, Select } from 'antd';
const { Option, OptGroup } = Select;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import map from 'lodash/map';
import last from 'lodash/last';
import keys from 'lodash/keys';
import PureRenderMixin from 'react-addons-pure-render-mixin';


export default class Field extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    selectedField: PropTypes.string,
    renderAsDropdown: PropTypes.bool,
    customProps: PropTypes.object,
    //actions
    setField: PropTypes.func.isRequired,
  };

  constructor(props) {
      super(props);
  }

  componentWillReceiveProps (nextProps) {
    //let prevProps = this.props;
  }

  shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

  curField() {
      return this.props.selectedField ? getFieldConfig(this.props.selectedField, this.props.config) : null;
  }

  curFieldOpts() {
      return Object.assign({}, {
          label: this.props.selectedField,
        },
        this.curField() || {}
      );
  }

  handleFieldMenuSelect = ({key, keyPath}) => {
    this.props.setField(key);
  }

  handleFieldSelect = (key) => {
    this.props.setField(key);
  }

  filterOption = (input, option) => {
    const { value, groupLabel, children } = option.props;

    let isInChildren = false;
    if (typeof children === 'string') {
        isInChildren = children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    let isInValue = false;
    if (typeof value === 'string') {
        isInValue = value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    let isInGroupLabel = false;
    if (typeof groupLabel === 'string') {
        isInGroupLabel = groupLabel.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    return isInChildren || isInValue || isInGroupLabel;
  }

  getFieldDisplayLabel(field, fieldKey) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      let maxLabelsLength = this.props.config.settings.maxLabelsLength;
      let label = field.label || last(fieldKey.split(fieldSeparator));
      label = truncateString(label, maxLabelsLength);
      return label;
  }

  buildMenuItems(fields, path = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          let label = this.getFieldDisplayLabel(field, fieldKey);
          let tooltip = field.tooltip;
          let option = label;
          if (tooltip != undefined)
            option = <Tooltip title={tooltip}>{label}</Tooltip>;
          if (field.type == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <SubMenu
                  key={prefix+fieldKey}
                  title={<span>{option} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
              >
                  {this.buildMenuItems(field.subfields, subpath)}
              </SubMenu>
          } else {
              return <MenuItem key={prefix+fieldKey}>{option}</MenuItem>;
          }
      });
  }

  buildSelectItems(fields, path = null, optGroupLabel = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          let label = this.getFieldDisplayLabel(field, fieldKey);
          let tooltip = field.tooltip;
          if (field.type == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <OptGroup
                  key={prefix+fieldKey}
                  label={label}
                  title={tooltip}
              >
                  {this.buildSelectItems(field.subfields, subpath, label)}
              </OptGroup>
          } else {
              let option = label;
              if (tooltip != undefined)
                option = <Tooltip title={tooltip}>{label}</Tooltip>;
              return <Option
                key={prefix+fieldKey}
                value={prefix+fieldKey}
                grouplabel={optGroupLabel}
              >
                {option}
              </Option>;
          }
      });
  }

  buildMenuToggler(label, fullLabel, customLabel) {
      let btnLabel = customLabel ? customLabel : label;
      let maxLabelsLength = this.props.config.settings.maxLabelsLength;
      btnLabel = truncateString(btnLabel, maxLabelsLength);
      var toggler =
          <Button
              size={this.props.config.settings.renderSize}
          >
              {btnLabel} <Icon type="down" />
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
    let isFieldSelected = !!this.props.selectedField;
    let dropdownPlacement = this.props.config.settings.dropdownPlacement;
    let maxLabelsLength = this.props.config.settings.maxLabelsLength;
    let fieldOptions = this.props.config.fields;
    let selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
    let selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(this.props.config.settings.fieldSeparatorDisplay) : null;
    let placeholder = !isFieldSelected ? this.props.config.settings.fieldPlaceholder : null;
    let fieldDisplayLabel = isFieldSelected ? this.getFieldDisplayLabel(this.curField(), this.props.selectedField) : null;
    let selectText = isFieldSelected ? fieldDisplayLabel : placeholder;
    selectText = truncateString(selectText, maxLabelsLength);
    let selectWidth = calcTextWidth(selectText);
    let fullLabel = this.curFieldOpts().label2 || selectedFieldFullLabel;
    let fieldSelectItems = this.buildSelectItems(fieldOptions);
    let customProps = this.props.customProps || {};

    let fieldSelect = (
        <Select
            dropdownAlign={dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined}
            dropdownMatchSelectWidth={false}
            style={{ width: isFieldSelected && !customProps.showSearch ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT }}
            ref="field"
            placeholder={placeholder}
            size={this.props.config.settings.renderSize}
            onChange={this.handleFieldSelect}
            value={this.props.selectedField || undefined}
            filterOption={this.filterOption}
            {...customProps}
        >{fieldSelectItems}</Select>
    );

    if (fullLabel && fullLabel != this.curFieldOpts().label && !this.curFieldOpts().tooltip) {
        fieldSelect = <Tooltip title={fullLabel}>{fieldSelect}</Tooltip>;
    }

    return fieldSelect;
  }

  renderAsDropdown() {
    let fieldOptions = this.props.config.fields;
    let selectedFieldKeys = getFieldPath(this.props.selectedField, this.props.config);
    let selectedFieldPartsLabels = getFieldPathLabels(this.props.selectedField, this.props.config);
    let selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(this.props.config.settings.fieldSeparatorDisplay) : null;
    let placeholder = this.curFieldOpts().label || this.props.config.settings.fieldPlaceholder;
    let customProps = this.props.customProps || {};

    let fieldMenuItems = this.buildMenuItems(fieldOptions);
    let fieldMenu = (
        <Menu
            //size={this.props.config.settings.renderSize}
            selectedKeys={selectedFieldKeys}
            onClick={this.handleFieldMenuSelect}
            {...customProps}
        >{fieldMenuItems}</Menu>
    );
    let fieldToggler = this.buildMenuToggler(placeholder, selectedFieldFullLabel, this.curFieldOpts().label2);

    return (
      <Dropdown
          overlay={fieldMenu}
          trigger={['click']}
          placement={this.props.config.settings.dropdownPlacement}
      >
          {fieldToggler}
      </Dropdown>
    );
  }
}

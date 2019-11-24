import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import {
  getFieldConfig, getFieldPath, getFieldPathLabels, getValueSourcesForFieldOp, getWidgetForFieldOp
} from "../../utils/configUtils";
import {calcTextWidth, truncateString, BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT} from "../../utils/stuff";
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
    renderAsDropdown: PropTypes.bool,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
  };

  shouldComponentUpdate = shallowCompare;

  curFieldOpts() {
      return Object.assign({}, {label: this.props.value}, getFieldConfig(this.props.value, this.props.config) || {});
  }

  handleFieldMenuSelect = ({key, keyPath}) => {
    this.props.setValue(key);
  }

  handleFieldSelect = (key) => {
    this.props.setValue(key);
  }

  //tip: empty groups are ok for antd
  filterFields(config, fields, leftFieldFullkey, operator, canCompareFieldWithField) {
    fields = clone(fields);
    const fieldSeparator = config.settings.fieldSeparator;
    const leftFieldConfig = getFieldConfig(leftFieldFullkey, config);
    let expectedType;
    let widget = getWidgetForFieldOp(config, leftFieldFullkey, operator, 'value');
    if (widget) {
      let widgetConfig = config.widgets[widget];
      let widgetType = widgetConfig.type;
      //expectedType = leftFieldConfig.type;
      expectedType = widgetType;
    } else {
      expectedType = leftFieldConfig.type;
    }

    function _filter(list, path) {
      for (let rightFieldKey in list) {
        let subfields = list[rightFieldKey].subfields;
        let subpath = (path ? path : []).concat(rightFieldKey);
        let rightFieldFullkey = subpath.join(fieldSeparator);
        let rightFieldConfig = getFieldConfig(rightFieldFullkey, config);
        if (rightFieldConfig.type == "!struct") {
          _filter(subfields, subpath);
        } else {
          let canUse = rightFieldConfig.type == expectedType && rightFieldFullkey != leftFieldFullkey;
          let fn = canCompareFieldWithField || config.settings.canCompareFieldWithField;
          if (fn)
            canUse = canUse && fn(leftFieldFullkey, leftFieldConfig, rightFieldFullkey, rightFieldConfig);
            if (!canUse)
            delete list[rightFieldKey];
        }
      }
    }

    _filter(fields, []);

    return fields;
  }

  buildMenuItems(fields, path = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      let maxLabelsLength = this.props.config.settings.maxLabelsLength;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          let label = field.label || last(fieldKey.split(fieldSeparator));
          label = truncateString(label, maxLabelsLength);
          if (field.type == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <SubMenu
                  key={prefix+fieldKey}
                  title={<span>{label} &nbsp;&nbsp;&nbsp;&nbsp;</span>}
              >
                  {this.buildMenuItems(field.subfields, subpath)}
              </SubMenu>
          } else {
              return <MenuItem key={prefix+fieldKey}>{label}</MenuItem>;
          }
      });
  }

  buildSelectItems(fields, path = null) {
      let fieldSeparator = this.props.config.settings.fieldSeparator;
      let maxLabelsLength = this.props.config.settings.maxLabelsLength;
      if (!fields)
          return null;
      let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

      return keys(fields).map(fieldKey => {
          let field = fields[fieldKey];
          let label = field.label || last(fieldKey.split(fieldSeparator));
          label = truncateString(label, maxLabelsLength);
          if (field.type == "!struct") {
              let subpath = (path ? path : []).concat(fieldKey);
              return <OptGroup
                  key={prefix+fieldKey}
                  label={label}
              >
                  {this.buildSelectItems(field.subfields, subpath)}
              </OptGroup>
          } else {
              return <Option
                key={prefix+fieldKey}
                value={prefix+fieldKey}
              >
                {label}
              </Option>;
          }
      });
  }

  buildMenuToggler(label, fullLabel, customLabel) {
      var toggler =
          <Button
              size={this.props.config.settings.renderSize}
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

  filterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    if (this.props.renderAsDropdown)
        return this.renderAsDropdown();
    else
        return this.renderAsSelect();
  }

  renderAsSelect() {
    const {
      config, field, operator, value, customProps,
      canCompareFieldWithField
    } = this.props;
    const leftFieldConfig = getFieldConfig(field, config);
    const leftFieldWidgetField = leftFieldConfig.widgets.field;
    const leftFieldWidgetFieldProps = leftFieldWidgetField && leftFieldWidgetField.widgetProps || {};
    const dropdownPlacement = config.settings.dropdownPlacement;
    const fieldOptions = this.filterFields(config, config.fields, field, operator, canCompareFieldWithField);
    const placeholder = this.curFieldOpts().label || leftFieldWidgetFieldProps.valuePlaceholder || config.settings.fieldPlaceholder;
    const placeholderWidth = calcTextWidth(placeholder);
    const fieldSelectItems = this.buildSelectItems(fieldOptions);

    const fieldSelect = (
          <Select
              dropdownAlign={dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined}
              dropdownMatchSelectWidth={false}
              style={{ width: value ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT }}
              ref="field"
              placeholder={placeholder}
              size={config.settings.renderSize}
              onChange={this.handleFieldSelect}
              value={value || undefined}
              filterOption={this.filterOption}
              {...customProps}
          >{fieldSelectItems}</Select>
    );

    return fieldSelect;
  }

  renderAsDropdown() {
    const {
      config, field, operator, value, customProps,
      canCompareFieldWithField
    } = this.props;
    const leftFieldConfig = getFieldConfig(field, config);
    const leftFieldWidgetField = leftFieldConfig.widgets.field;
    const leftFieldWidgetFieldProps = leftFieldWidgetField && leftFieldWidgetField.widgetProps || {};
    let fieldOptions = this.filterFields(config, config.fields, field, operator, canCompareFieldWithField);
    let selectedFieldKeys = getFieldPath(value, config);
    let selectedFieldPartsLabels = getFieldPathLabels(value, config);
    let selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(config.settings.fieldSeparatorDisplay) : null;
    let placeholder = this.curFieldOpts().label || leftFieldWidgetFieldProps.valuePlaceholder || config.settings.fieldPlaceholder;

    let fieldMenuItems = this.buildMenuItems(fieldOptions);
    let fieldMenu = (
        <Menu
            //size={config.settings.renderSize}
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
            placement={config.settings.dropdownPlacement}
        >
            {fieldToggler}
        </Dropdown>
    );
  }
}

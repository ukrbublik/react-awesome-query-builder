import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import {calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT} from '../../../utils/stuff';
import { Select } from 'antd';
const Option = Select.Option;

export default class SelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string, //key in listValues
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
  };

  constructor(props) {
      super(props);
      this.onPropsChanged(props);
  }

  componentWillReceiveProps (props) {
      this.onPropsChanged(props);
  }

  onPropsChanged (props) {
    const {fieldDefinition} = props;

    let optionsMaxWidth = 0;
    map(fieldDefinition.listValues, (label, value) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(label));
    });
    this.optionsMaxWidth = optionsMaxWidth;

    this.options = map(fieldDefinition.listValues, (label, value) => {
      return (<Option key={value} value={value}>{label}</Option>);
    });
  }

  handleChange = (val) => {
    this.props.setValue(val);
  }

  filterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    const {config, placeholder, fieldDefinition, customProps, value} = this.props;
    const {renderSize} = config.settings;
    const placeholderWidth = calcTextWidth(placeholder);
    const dropdownWidth = this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const width = value ? dropdownWidth : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const _value = value != undefined ? value : undefined;

    return (
        <Select
            style={{ width }}
            key={"widget-select"}
            dropdownMatchSelectWidth={false}
            ref="val"
            placeholder={placeholder}
            size={renderSize}
            value={_value}
            onChange={this.handleChange}
            filterOption={this.filterOption}
            {...customProps}
          >{this.options}
        </Select>
    );
  }
}

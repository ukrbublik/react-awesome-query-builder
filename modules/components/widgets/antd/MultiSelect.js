import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import { Select } from 'antd';
import {calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT} from '../../../utils/stuff';
const Option = Select.Option;

export default class MultiSelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    value: PropTypes.array,
    field: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
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
    if (val && !val.length)
      val = undefined; //not allow []
    this.props.setValue(val);
  }

  filterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    const {config, placeholder, fieldDefinition, customProps, value} = this.props;
    const {renderSize} = config.settings;
    const {allowCustomValues} = fieldDefinition || {};
    const placeholderWidth = calcTextWidth(placeholder);
    const _value = value && value.length ? value : undefined;
    const width = _value ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownWidth = this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
    
    return (
        <Select
            mode={allowCustomValues ? "tags" : "multiple"}
            style={{
              minWidth: width,
              width: width,
            }}
            dropdownStyle={{
              width: dropdownWidth,
            }}
            key={"widget-multiselect"}
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

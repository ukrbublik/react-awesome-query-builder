import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import map from 'lodash/map';
import {getFieldConfig} from '../../utils/configUtils';
import {calcTextWidth} from '../../utils/stuff';
import { Select } from 'antd';
const Option = Select.Option;

export default class SelectWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string, //key in listValues
    customProps: PropTypes.object,
  };

  handleChange(val) {
    this.props.setValue(val);
  }

  render() {
    let size = this.props.config.settings.renderSize || "small";
    let placeholder = this.props.placeholder || "Select option";
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const options = map(fieldDefinition.listValues, (label, value) => {
      return (<Option key={value} value={value}>{label}</Option>);
    });
    let placeholderWidth = calcTextWidth(placeholder, '12px');
    let customProps = this.props.customProps || {};

    return (
        <Select
            style={{ width: this.props.value ? null : placeholderWidth + 36 }}
            key={"widget-select"}
            dropdownMatchSelectWidth={false}
            ref="val"
            placeholder={placeholder}
            size={size}
            value={this.props.value || undefined} //note: (bug?) null forces placeholder to hide
            onChange={this.handleChange.bind(this)}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            {...customProps}
          >{options}
        </Select>
    );
  }
}

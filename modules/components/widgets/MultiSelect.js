import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import map from 'lodash/map';
import { Select } from 'antd';
import {getFieldConfig} from '../../utils/configUtils';
import {calcTextWidth} from '../../utils/stuff';
const Option = Select.Option;
import shallowCompare from 'react-addons-shallow-compare';

export default class MultiSelectWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    value: PropTypes.array,
    field: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    customProps: PropTypes.object,
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = (val) => {
    this.props.setValue(val);
  }

  constructor(props) {
      super(props);
      this.onPropsChanged(props);
  }

  componentWillReceiveProps (props) {
      this.onPropsChanged(props);
  }

  onPropsChanged (props) {
    let placeholder = this.props.placeholder || "Select option";
    let placeholderWidth = calcTextWidth(placeholder, '14px');
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    let optionsMaxWidth = 0;
    map(fieldDefinition.listValues, (label, value) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(label, '14px'));
    });

    this.placeholder = placeholder;
    this.placeholderWidth = placeholderWidth;
    this.optionsMaxWidth = optionsMaxWidth;
  }

  render() {
    let customProps = this.props.customProps || {};
    let size = this.props.config.settings.renderSize || "small";
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const options = map(fieldDefinition.listValues, (label, value) => {
      return (<Option key={value} value={value}>{label}</Option>);
    });
    let value = this.props.value && this.props.value.length ? this.props.value : null;

    return (
        <Select
            mode={"multiple"}
            style={{
              minWidth: value ? null : this.placeholderWidth + 40,
              width: this.props.value ? null : this.placeholderWidth + 40,
            }}
            dropdownStyle={{
              width: this.optionsMaxWidth + 40,
            }}
            key={"widget-multiselect"}
            dropdownMatchSelectWidth={false}
            ref="val"
            placeholder={this.placeholder}
            size={size}
            value={value || undefined}  //note: (bug?) null forces placeholder to hide
            onChange={this.handleChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            {...customProps}
          >{options}
        </Select>
    );
  }
}

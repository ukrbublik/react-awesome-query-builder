import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Col, Row } from 'antd';
import 'antd/lib/date-picker/style';
import { getFieldConfig } from '../../utils/configUtils';
import shallowCompare from 'react-addons-shallow-compare';
const __isInternal = true; //true to optimize render

export default class SliderWidget extends Component {

  state = {
  }

  static propTypes = {
    setValue: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.number,
    customProps: PropTypes.object,
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = (val) => {
    if (val === '')
      val = undefined;
    if (__isInternal)
      this.setState({internalValue: val});
    this.props.setValue(val, __isInternal);
  }

  tipFormatter = (val) => (val != undefined ? val.toString() : undefined)

  static defaultProps = {
    min: 0,
    max: 100,
    step: 10,
  };

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const fieldSettings = fieldDefinition.fieldSettings || {};
    const customProps = this.props.customProps || {};

    let value = __isInternal ? this.state.internalValue : this.props.value;
    if (value == undefined)
      value = null;
    const min = fieldSettings.min === null ? this.defaultProps.min : fieldSettings.min;
    const max = fieldSettings.max === null ? this.defaultProps.max : fieldSettings.max;
    const step = fieldSettings.step === undefined ? this.defaultProps.step : fieldSettings.step;
    const marks = fieldSettings.marks === undefined ? this.defaultProps.marks : fieldSettings.marks;

    return (
      <Col style={{display: 'inline-flex'}}>
        <Col style={{float: 'left', marginRight: '5px'}}>
          <InputNumber
            size={this.props.config.settings.renderSize || "small"}
            ref="num"
            value={value}
            min={min}
            max={max}
            step={step}
            placeholder={this.props.placeholder}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', width: customProps.width || '300px'}}>
          <Slider
            ref="slider"
            value={value}
            tipFormatter={this.tipFormatter}
            min={min}
            max={max}
            included={false}
            step={step}
            marks={marks}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{clear: 'both'}} />
      </Col>
    );
  }
}
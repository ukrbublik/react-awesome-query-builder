import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Slider, InputNumber, Col, Row } from 'antd';
import 'antd/lib/date-picker/style';
import { getFieldConfig } from '../../utils/configUtils';
import shallowCompare from 'react-addons-shallow-compare';

export default class RangeWidget extends Component {

  state = {
  }

  static propTypes = {
    setValue: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
    placeholders: PropTypes.array,
    textSeparators: PropTypes.array,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.array,
    customProps: PropTypes.object,
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = (value) => {
    this.props.setValue(value);
  }

  handleChangeFrom = (valueFrom) => {
    let value = this.props.value || [undefined, undefined];
    value = [...value];
    value[0] = valueFrom;
    if (value[1] == undefined)
      value[1] = valueFrom;
    this.props.setValue(value);
  }
  
  handleChangeTo = (valueTo) => {
    let value = this.props.value || [undefined, undefined];
    value = [...value];
    value[1] = valueTo;
    if (value[0] == undefined)
      value[0] = valueTo;
    this.props.setValue(value);
  }

  defaultProps = {
    min: 0,
    max: 100,
    step: 10,
  };

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const fieldSettings = fieldDefinition.fieldSettings || {};
    const customProps = this.props.customProps || {};

    let value = this.props.value != undefined ? this.props.value : undefined;
    let [valueFrom, valueTo] = value || [null, null];
    const min = fieldSettings.min === null ? this.defaultProps.min : fieldSettings.min;
    const max = fieldSettings.max === null ? this.defaultProps.max : fieldSettings.max;
    const step = fieldSettings.step === undefined ? this.defaultProps.step : fieldSettings.step;
    const marks = fieldSettings.marks === undefined ? this.defaultProps.marks : fieldSettings.marks;

    if (value && (valueFrom == undefined || valueTo == undefined)) {
      // happens if we change value source - this leads to incomplete slider value, fix it:
      if (valueFrom == undefined)
        this.handleChangeTo(valueTo);
      if (valueTo == undefined)
        this.handleChangeFrom(valueFrom);
      return null;
    }

    return (
      <Col style={{display: 'inline-flex'}}>
        <Col style={{float: 'left', marginRight: '5px'}}>
          <InputNumber
            size={this.props.config.settings.renderSize || "small"}
            ref="numFrom"
            key="numFrom"
            value={valueFrom}
            min={min}
            max={max}
            step={step}
            placeholder={this.props.placeholders[0]}
            onChange={this.handleChangeFrom}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', marginRight: '5px', lineHeight: '20px'}}>
          <span>{ this.props.textSeparators[1] }</span>
        </Col>
        <Col style={{float: 'left', marginRight: '5px'}}>
          <InputNumber
            size={this.props.config.settings.renderSize || "small"}
            ref="numTo"
            key="numTo"
            value={valueTo}
            min={min}
            max={max}
            marks={marks}
            step={step}
            placeholder={this.props.placeholders[1]}
            onChange={this.handleChangeTo}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', width: customProps.width || '300px'}}>
          <Slider
            ref="slider"
            value={value}
            min={min}
            max={max}
            step={step}
            marks={marks}
            included={false}
            range={true}
            //placeholder={this.props.placeholder}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{clear: 'both'}} />
      </Col>
    );
  }
}
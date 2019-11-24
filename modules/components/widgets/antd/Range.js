import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Col } from 'antd';
import 'antd/lib/date-picker/style';

export default class RangeWidget extends PureComponent {

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
    fieldDefinition: PropTypes.object,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
  };

  state = {
  }
  
  handleChange = (value) => {
    this.props.setValue(value);
  }

  handleChangeFrom = (valueFrom) => {
    let value = this.props.value || [undefined, undefined];
    if (valueFrom == '' || valueFrom == null)
      valueFrom = value[0];
    value = [...value];
    value[0] = valueFrom;
    if (value[1] == undefined)
      value[1] = valueFrom;
    this.props.setValue(value);
  }
  
  handleChangeTo = (valueTo) => {
    let value = this.props.value || [undefined, undefined];
    if (valueTo == '' || valueTo == null)
      valueTo = value[1];
    value = [...value];
    value[1] = valueTo;
    if (value[0] == undefined)
      value[0] = valueTo;
    this.props.setValue(value);
  }

  tipFormatter = (val) => (val != undefined ? val.toString() : '')

  render() {
    const {config, placeholder, placeholders, fieldDefinition, customProps, value,  min, max, step, marks, textSeparators} = this.props;
    const {renderSize} = config.settings;
    const {fieldSettings} = fieldDefinition || {};
    const _customProps = customProps || {};
    const _value = value != undefined ? value : undefined;
    const [valueFrom, valueTo] = _value || [null, null];
    const _min = fieldSettings.min != null ? fieldSettings.min : min;
    const _max = fieldSettings.max != null ? fieldSettings.max : max;
    const _step = fieldSettings.step != null ? fieldSettings.step : step;
    const _marks = fieldSettings.marks != null ? fieldSettings.marks : marks;

    if (_value && (valueFrom == undefined || valueTo == undefined)) {
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
            size={renderSize}
            ref="numFrom"
            key="numFrom"
            value={valueFrom}
            min={_min}
            max={_max}
            step={_step}
            placeholder={placeholders[0]}
            onChange={this.handleChangeFrom}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', marginRight: '5px', lineHeight: '20px'}}>
          <span>{ textSeparators[1] }</span>
        </Col>
        <Col style={{float: 'left', marginRight: '5px'}}>
          <InputNumber
            size={renderSize}
            ref="numTo"
            key="numTo"
            value={valueTo}
            min={_min}
            max={_max}
            marks={_marks}
            step={_step}
            placeholder={placeholders[1]}
            onChange={this.handleChangeTo}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', width: _customProps.width || '300px'}}>
          <Slider
            ref="slider"
            value={_value}
            tipFormatter={this.tipFormatter}
            min={_min}
            max={_max}
            step={_step}
            marks={_marks}
            included={false}
            range={true}
            //placeholder={placeholder}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{clear: 'both'}} />
      </Col>
    );
  }
}
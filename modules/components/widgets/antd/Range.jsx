import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Col } from 'antd';

export default class RangeWidget extends PureComponent {

  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    placeholders: PropTypes.array,
    textSeparators: PropTypes.array,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.array,
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
    readonly: PropTypes.bool,
    // from fieldSettings:
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    marks: PropTypes.object,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    marks: undefined,
  };

  state = {
  }
  
  constructor(props) {
    super(props);
    this.numFrom = React.createRef();
    this.numTo = React.createRef();
    this.slider = React.createRef();
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
    const {config, placeholder, placeholders, customProps, value,  min, max, step, marks, textSeparators, readonly} = this.props;
    const {renderSize} = config.settings;
    const _customProps = customProps || {};
    const _value = value != undefined ? value : undefined;
    const [valueFrom, valueTo] = _value || [null, null];

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
            disabled={readonly}
            size={renderSize}
            ref={this.numFrom}
            key="numFrom"
            value={valueFrom}
            min={min}
            max={max}
            step={step}
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
            disabled={readonly}
            size={renderSize}
            ref={this.numTo}
            key="numTo"
            value={valueTo}
            min={min}
            max={max}
            step={step}
            placeholder={placeholders[1]}
            onChange={this.handleChangeTo}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', width: _customProps.width || '300px'}}>
          <Slider
            disabled={readonly}
            ref={this.slider}
            value={_value}
            tipFormatter={this.tipFormatter}
            min={min}
            max={max}
            step={step}
            marks={marks}
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
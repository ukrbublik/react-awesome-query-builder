import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Col } from 'antd';
import 'antd/lib/date-picker/style';
const __isInternal = true; //true to optimize render

export default class SliderWidget extends PureComponent {
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
    fieldDefinition: PropTypes.object,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
  };

  state = {
  }

  constructor(props) {
      super(props);

      this.state.internalValue = props.value;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({internalValue: nextProps.value});
  }

  handleChange = (val) => {
    if (val === '')
      val = undefined;
    if (__isInternal)
      this.setState({internalValue: val});
    this.props.setValue(val, __isInternal);
  }

  tipFormatter = (val) => (val != undefined ? val.toString() : undefined)

  render() {
    const {config, placeholder, fieldDefinition, customProps, value,  min, max, step, marks} = this.props;
    const {renderSize} = config.settings;
    const {fieldSettings} = fieldDefinition || {};
    const _customProps = customProps || {};
    
    const _min = fieldSettings.min != null ? fieldSettings.min : min;
    const _max = fieldSettings.max != null ? fieldSettings.max : max;
    const _step = fieldSettings.step != null ? fieldSettings.step : step;
    const _marks = fieldSettings.marks != null ? fieldSettings.marks : marks;

    let _value = __isInternal ? this.state.internalValue : value;
    if (_value == undefined)
      _value = null;
    const sliderValue = _value == null && min ? min : _value;
      
    return (
      <Col style={{display: 'inline-flex'}}>
        <Col style={{float: 'left', marginRight: '5px'}}>
          <InputNumber
            size={renderSize}
            ref="num"
            value={_value}
            min={_min}
            max={_max}
            step={_step}
            placeholder={placeholder}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{float: 'left', width: _customProps.width || '300px'}}>
          <Slider
            ref="slider"
            value={sliderValue}
            tipFormatter={this.tipFormatter}
            min={_min}
            max={_max}
            included={false}
            step={_step}
            marks={_marks}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{clear: 'both'}} />
      </Col>
    );
  }
}
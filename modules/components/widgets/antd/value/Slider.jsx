import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Slider, InputNumber, Col } from "antd";
import {useOnPropsChanged} from "../../../../utils/stuff";
const __isInternal = true; //true to optimize render

export default class SliderWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.number,
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
    useOnPropsChanged(this);

    this.state.internalValue = props.value;
  }

  onPropsChanged(nextProps) {
    this.setState({internalValue: nextProps.value});
  }

  handleChange = (val) => {
    if (val === "")
      val = undefined;
    if (__isInternal)
      this.setState({internalValue: val});
    this.props.setValue(val, __isInternal);
  }

  tipFormatter = (val) => (val != undefined ? val.toString() : undefined)

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    // RHL fix
    if (this.props.cacheBusterProp && __isInternal) {
      nextState.internalValue = this.state.internalValue;
    }
  }

  render() {
    const {config, placeholder, customProps, value,  min, max, step, marks, readonly, valueError} = this.props;
    const {renderSize, showErrorMessage} = config.settings;
    const _customProps = customProps || {};

    const canUseInternal = showErrorMessage ? true : !valueError;
    let _value = __isInternal && canUseInternal ? this.state.internalValue : value;
    if (_value == undefined)
      _value = null;
    const sliderValue = _value == null && min ? min : _value;
      
    return (
      <Col style={{display: "inline-flex"}}>
        <Col style={{float: "left", marginRight: "5px"}}>
          <InputNumber
            disabled={readonly}
            size={renderSize}
            value={_value}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            onChange={this.handleChange}
            {...customProps}
          />
        </Col>
        <Col style={{float: "left", width: _customProps.width || "300px"}}>
          <Slider
            disabled={readonly}
            value={sliderValue}
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
        <Col style={{clear: "both"}} />
      </Col>
    );
  }
}
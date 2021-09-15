import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Slider, InputNumber, Col } from "antd";
import {useOnPropsChanged} from "../../../../utils/reactUtils";
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
    this.props.setValue(val, undefined, __isInternal);
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
    const {renderSize, showErrorMessage, defaultSliderWidth} = config.settings;
    const {width, ...rest} = customProps || {};
    const customInputProps = rest.input || {};
    const customSliderProps = rest.slider || rest;

    const canUseInternal = showErrorMessage ? true : !valueError;
    let aValue = __isInternal && canUseInternal ? this.state.internalValue : value;
    if (aValue == undefined)
      aValue = null;
    const sliderValue = aValue == null && min ? min : aValue;
      
    return (
      <Col style={{display: "inline-flex"}}>
        <Col style={{float: "left", marginRight: "5px"}}>
          <InputNumber
            disabled={readonly}
            size={renderSize}
            value={aValue}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            onChange={this.handleChange}
            {...customInputProps}
          />
        </Col>
        <Col style={{float: "left", width: width || defaultSliderWidth}}>
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
            {...customSliderProps}
          />
        </Col>
        <Col style={{clear: "both"}} />
      </Col>
    );
  }
}
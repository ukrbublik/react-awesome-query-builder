import React, { Component } from "react";
import PropTypes from "prop-types";
import { Slider, InputNumber, Col } from "antd";
import { Utils } from "@react-awesome-query-builder/ui";
const { useOnPropsChanged, pureShouldComponentUpdate } = Utils.ReactUtils;

export default class SliderWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.any,
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
  };

  constructor(props) {
    super(props);
    this.pureShouldComponentUpdate = pureShouldComponentUpdate(this);
    useOnPropsChanged(this);

    this.state.internalValue = props.value;
  }

  onPropsChanged(nextProps) {
    this.setState({internalValue: nextProps.value});
  }

  handleChange = (val) => {
    const {internalValue} = this.state;
    const {optimizeRender} = this.props.config.settings;
    if (val === "")
      val = undefined;
    if (optimizeRender)
      this.setState({internalValue: val});
    const didEmptinessChanged = !!val !== !!internalValue;
    const canUseSetInternal = optimizeRender && !didEmptinessChanged;
    this.props.setValue(val, undefined, canUseSetInternal);
  };

  tipFormatter = (val) => (val != undefined ? val.toString() : undefined);

  shouldComponentUpdate = (nextProps, nextState) => {
    const {optimizeRender} = nextProps.config.settings;
    const should = this.pureShouldComponentUpdate(nextProps, nextState);
    if (should) {
      // RHL fix
      if (this.props.cacheBusterProp && __isInternal) {
        nextState.internalValue = this.state.internalValue;
      }
    }
    return should;
  };

  render() {
    const {config, placeholder, customProps, value,  min, max, step, marks, readonly, errorMessage} = this.props;
    const {internalValue} = this.state;
    const {renderSize, showErrorMessage, defaultSliderWidth, optimizeRender} = config.settings;
    const {width, ...rest} = customProps || {};
    const customInputProps = rest.input || {};
    const customSliderProps = rest.slider || rest;

    const canUseInternal = optimizeRender && (showErrorMessage ? true : !errorMessage);
    let aValue = canUseInternal ? internalValue : value;
    if (aValue == undefined)
      aValue = null;
    const sliderValue = aValue == null && min ? min : aValue;
      
    return (
      <Col style={{display: "inline-flex", flexWrap: "wrap"}}>
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
            tooltip={{formatter: this.tipFormatter}}
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
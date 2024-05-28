import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Slider, InputNumber, Col } from "antd";
import { Utils } from "@react-awesome-query-builder/ui";

export default class SliderWidget extends PureComponent {
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

  handleChange = (val) => {
    if (val === "")
      val = undefined;
    this.props.setValue(val);
  };

  tooltipFormatter = (val) => (val != undefined ? val.toString() : undefined);

  tooltip = {
    formatter: this.tipFormatter
  };

  render() {
    const {config, placeholder, customProps, value,  min, max, step, marks, readonly, errorMessage} = this.props;
    const {renderSize, showErrorMessage, defaultSliderWidth} = config.settings;
    const {width, ...rest} = customProps || {};
    const customInputProps = rest.input || {};
    const customSliderProps = rest.slider || rest;

    let aValue = value;
    if (aValue == undefined)
      aValue = null;
    const sliderValue = aValue == null && min ? min : aValue;
      
    return (
      <Col style={{display: "inline-flex", flexWrap: "wrap"}}>
        <Col key="col-number" style={{float: "left", marginRight: "5px"}}>
          <InputNumber
            key="input-number"
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
        <Col key="col-slider" style={{float: "left", width: width || defaultSliderWidth}}>
          <Slider
            key="input-slider"
            disabled={readonly}
            value={sliderValue}
            tooltip={this.tooltip}
            min={min}
            max={max}
            included={true}
            step={step}
            marks={marks}
            onChange={this.handleChange}
            {...customSliderProps}
          />
        </Col>
        <Col key="col-clear" style={{clear: "both"}} />
      </Col>
    );
  }
}
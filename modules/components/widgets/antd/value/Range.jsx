import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Slider, InputNumber, Col } from "antd";

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

    const [valueFrom, valueTo] = props.value || [null, null];
    if (props.value && (valueFrom == undefined || valueTo == undefined)) {
      // happens if we changed op from '==' to 'between'
      // (I know, timeout is dirty hack..)
      setTimeout(() => {
        const oneValue = valueFrom || valueTo;
        const value = [oneValue, oneValue];
        this.props.setValue(value);
      }, 1);
    }
  }

  handleChange = (value) => {
    this.props.setValue(value);
  }

  handleChangeFrom = (valueFrom) => {
    let value = this.props.value || [undefined, undefined];
    if (valueFrom === "" || valueFrom == null)
      valueFrom = undefined; //value[0];
    value = [...value];
    value[0] = valueFrom;
    // if (value[1] == undefined)
    //   value[1] = valueFrom;
    this.props.setValue(value);
  }
  
  handleChangeTo = (valueTo) => {
    let value = this.props.value || [undefined, undefined];
    if (valueTo === "" || valueTo == null)
      valueTo = undefined; //value[1];
    value = [...value];
    value[1] = valueTo;
    // if (value[0] == undefined)
    //   value[0] = valueTo;
    this.props.setValue(value);
  }

  tipFormatter = (val) => (val != undefined ? val.toString() : "")

  render() {
    const {config, placeholders, customProps, value,  min, max, step, marks, textSeparators, readonly} = this.props;
    const {renderSize, defaultSliderWidth} = config.settings;
    const {width, ...rest} = customProps || {};
    const customInputProps = rest.input || {};
    const customSliderProps = rest.slider || rest;
    const aValue = value != undefined ? value : undefined;
    const [valueFrom, valueTo] = aValue || [null, null];

    return (
      <Col style={{display: "inline-flex"}}>
        <Col style={{float: "left", marginRight: "5px"}}>
          <InputNumber
            disabled={readonly}
            size={renderSize}
            key="numFrom"
            value={valueFrom}
            min={min}
            max={max}
            step={step}
            placeholder={placeholders[0]}
            onChange={this.handleChangeFrom}
            {...customInputProps}
          />
        </Col>
        <Col style={{float: "left", marginRight: "5px", lineHeight: "20px"}}>
          <span>{ textSeparators[1] }</span>
        </Col>
        <Col style={{float: "left", marginRight: "5px"}}>
          <InputNumber
            disabled={readonly}
            size={renderSize}
            key="numTo"
            value={valueTo}
            min={min}
            max={max}
            step={step}
            placeholder={placeholders[1]}
            onChange={this.handleChangeTo}
            {...customInputProps}
          />
        </Col>
        <Col style={{float: "left", width: width || defaultSliderWidth}}>
          <Slider
            disabled={readonly}
            value={aValue}
            tipFormatter={this.tipFormatter}
            min={min}
            max={max}
            step={step}
            marks={marks}
            included={false}
            range={true}
            onChange={this.handleChange}
            {...customSliderProps}
          />
        </Col>
        <Col style={{clear: "both"}} />
      </Col>
    );
  }
}
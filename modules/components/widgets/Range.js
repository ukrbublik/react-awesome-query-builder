import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Slider, Col } from 'antd';
import 'antd/lib/date-picker/style';
import { getFieldConfig } from '../../utils/configUtils';
import shallowCompare from 'react-addons-shallow-compare';

export default class RangeWidget extends Component {

  state = {
    value: [20, 50],
    fromValue: 20,
    toValue: 50
  }

  static propTypes = {
    setValue: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.array,
    fromValue: PropTypes.number,
    toValue: PropTypes.number,
    customProps: PropTypes.object,
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = (val) => {
    if (val === '') {
      val = undefined;
    }

    PropTypes.fromValue = val[0];
    PropTypes.toValue = val[1];
    this.props.setValue(val);

    this.setState({ fromValue: val[0], toValue: val[1], value: val });
    console.log("range.handleChange from ", val[0], " and to ...", val[1], "  this.props.value", this.props.value);
  }

  defaultProps = {
    min: 0,
    max: 100,
    step: 10,
    marks: {
      0: <strong>0</strong>,
      100: <strong>100</strong>
    },
    included: true,
    // value: 1,
    fromValue: 20,
    toValue: 50
  };

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const fieldSettings = fieldDefinition.fieldSettings || {};

    let defaultValue = fieldSettings.defaultValue === null ? this.defaultProps.defaultValue : fieldSettings.defaultValue;
    const min = fieldSettings.min === null ? this.defaultProps.min : fieldSettings.min;
    const max = fieldSettings.max === null ? this.defaultProps.max : fieldSettings.max;
    const step = fieldSettings.step === undefined ? this.defaultProps.step : fieldSettings.step;
    const marks = fieldSettings.marks === undefined ? this.defaultProps.marks : fieldSettings.marks;
    this.props.setValue(this.state.value);
    console.log("Range this.props.value ....", this.props.value);

    let customProps = this.props.customProps || {};
    return (
      <Col>

        <Slider
          defaultValue={defaultValue}
          marks={marks}
          min={min}
          max={max}
          step={step}
          //ref="num"
          //value={this.props.value != undefined ? this.props.value : this.state.value}
          value={this.state.value}
          range
          width='500px'
          onChange={this.handleChange}
          {...customProps}
        />
        <view>
          From : <input type='number' readOnly value={this.state.fromValue}></input>
          To : <input type='number' readOnly value={this.state.toValue}></input></view>
      </Col>
    );
  }
}
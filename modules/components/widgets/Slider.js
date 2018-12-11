import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Slider, Col } from 'antd';
import 'antd/lib/date-picker/style';
import { getFieldConfig } from '../../utils/configUtils';
import shallowCompare from 'react-addons-shallow-compare';

export default class SliderWidget extends Component {

  state = {
    inputValue: 1,
    slectedMarkerValue: 50,
  }

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
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = (val) => {
    if (val === '')
      val = undefined;
    this.props.setValue(val);
    this.setState({ slectedMarkerValue: val });
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
    defaultValue: 50
  };

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const fieldSettings = fieldDefinition.fieldSettings || {};

    let defaultValue = fieldSettings.defaultValue === null ? this.defaultProps.defaultValue : fieldSettings.defaultValue;
    const min = fieldSettings.min === null ? this.defaultProps.min : fieldSettings.min;
    const max = fieldSettings.max === null ? this.defaultProps.max : fieldSettings.max;
    const step = fieldSettings.step === undefined ? this.defaultProps.step : fieldSettings.step;
    const marks = fieldSettings.marks === undefined ? this.defaultProps.marks : fieldSettings.marks;

    let customProps = this.props.customProps || {};
    return (
      <Col>
        <Slider
          defaultValue={defaultValue}
          marks={marks}
          min={min}
          max={max}
          included={false}
          step={step}
          //range={range}
          width='500px'
          onChange={this.handleChange}
          {...customProps}
        />
        <view><input type='text' readOnly value={this.state.slectedMarkerValue}></input></view>
      </Col>
    );
  }
}
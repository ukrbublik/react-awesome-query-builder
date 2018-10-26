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
    
    console.log('handleChange...', val);
  }

  defaultProps = {
    min: 0,
    max: 100,
    step: 10,
    marks: {
      0: <strong>0</strong>,
      100: <strong>100</strong>
    },
    included: true
  };

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const fieldSettings = fieldDefinition.fieldSettings || {};

    const min = fieldSettings.min === null ? this.defaultProps.min : fieldSettings.min;
    const max = fieldSettings.max === null ? this.defaultProps.max : fieldSettings.max;
    const step = fieldSettings.step === undefined ? this.defaultProps.step : fieldSettings.step;
    const marks = fieldSettings.marks === undefined ? this.defaultProps.marks : fieldSettings.marks;
    //console.log('min: , max:, marks ...fieldSettings...',min, max, marks, fieldSettings);
    let customProps = this.props.customProps || {};

    return (
      <Col>
        <Slider
          // defaultValue={100}
          marks={marks}
          min={min}
          max={max}
          included={false}
          step={step}
          // range = {true} 
          // defaultValue={[100, 200]}
          width='500px'
          onChange={this.handleChange}
        //markerLabel={[0, 100]}
        //maximumTrackStyle={{ backgroundColor: 'red', height: 10 }}
        //minimumTrackStyle={{ backgroundColor: 'blue', height: 10 }}
        // handleStyle={{
        //   borderColor: 'blue',
        //   height: 28,
        //   width: 28,
        //   marginLeft: -14,
        //   marginTop: -9,
        //   backgroundColor: 'black',
        // }}
        {...customProps}

        />
      </Col>
    );
  }
}

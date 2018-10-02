import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { InputNumber, Col } from 'antd';
import 'antd/lib/date-picker/style';
import {getFieldConfig} from '../../utils/configUtils';
import shallowCompare from 'react-addons-shallow-compare';

export default class NumberWidget extends Component {
  constructor( props ) {
    super( props );
    this.timer = null;
    this.setValueStorage = this.setValueStorage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      localValue:this.props.value,
      lastSetValueTime:performance.now(),
    }
    this.numRef = null;
    this.setNumberRef = element => {
      this.numRef = element;
    }
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
    minTimeOutSetValue: PropTypes.number,
  };

  // Set value at global state
  setValueStorage(value){
    this.props.setValue(value);
    Promise.resolve(1)
    .then(()=>{
      this.setState({lastSetValueTime:performance.now()})
      if(this.timer){
        clearTimeout(this.timer);
        this.timer = null;
      }
    });
  }

  shouldComponentUpdate = shallowCompare;

  handleChange(val) {
    const { minTimeOutSetValue } = this.props;
    // Set value in local state
    this.setState({
      localValue:val
    });

    if (val === '')
      val = undefined;
    const { lastSetValueTime } = this.state;
    const nowTick = performance.now();
    // If the change in value is not too fast,
    // then save it in global state.
    if(nowTick-lastSetValueTime>minTimeOutSetValue){
      this.setValueStorage(val);
    }else{
      // If changes happen too fast,
      // then save the value in the global state, with a delay,
      // so that responsiveness does not suffer
      if(!this.timer){
        this.timer = setTimeout(
          ()=>{
            const { localValue:timeOutValue } = this.state;
            this.setValueStorage(timeOutValue);
          }, 
          minTimeOutSetValue-(nowTick-lastSetValueTime)
        );
      }
    }
  }

  static defaultProps = {
      min: undefined,
      max: undefined,
      step: undefined,
    minTimeOutSetValue:1000
  };

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const fieldSettings = fieldDefinition.fieldSettings || {};
    const min = this.props.min != null ? this.props.min : fieldSettings.min;
    const max = this.props.max != null ? this.props.max : fieldSettings.max;
    const step = this.props.step != null ? this.props.step : fieldSettings.step;
    let customProps = this.props.customProps || {};

    return (
      <Col>
        <InputNumber
          key="widget-number"
          size={this.props.config.settings.renderSize || "small"}
          ref={ this.setNumberRef }
          value={this.state.localValue != undefined ? this.state.localValue : null}
          min={min}
          max={max}
          step={step}
          placeholder={this.props.placeholder}
          onChange={this.handleChange}
          {...customProps}
        />
      </Col>
    );
  }
}
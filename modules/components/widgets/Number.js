import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { InputNumber, Col } from 'antd';
import 'antd/lib/date-picker/style';

export default class NumberWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
  };

  handleChange(val) {
    this.props.setValue(val);
  }

  static defaultProps = {
      min: undefined,
      max: undefined,
      step: undefined,
  };

  render() {
    return (
      <Col>
        <InputNumber 
          size={"small"}
          ref="num" 
          value={this.props.value} 
          min={this.props.min} 
          max={this.props.max} 
          step={this.props.step} 
          onChange={this.handleChange.bind(this)} 
        />
      </Col>
    );
  }
}

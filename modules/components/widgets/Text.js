import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Input, Col } from 'antd';

export default class TextWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired
  };

  handleChange() {
    this.props.setValue(ReactDOM.findDOMNode(this.refs.text).value);
  }

  render() {
    return (
      <Col>
        <Input 
          size={this.props.config.settings.renderSize || "small"}
          ref="text" 
          type={"text"}
          value={this.props.value} 
          onChange={this.handleChange.bind(this)} 
        />
      </Col>
    );
  }
}

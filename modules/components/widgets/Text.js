import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Input, Col } from 'antd';

export default class TextWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
  };

  handleChange() {
    this.props.setValue(ReactDOM.findDOMNode(this.refs.text).value);
  }

  render() {
    return (
      <Col>
        <Input 
          key="widget-text"
          size={this.props.config.settings.renderSize || "small"}
          ref="text" 
          type={"text"}
          value={this.props.value || null} 
          placeholder={this.props.placeholder} 
          onChange={this.handleChange.bind(this)} 
        />
      </Col>
    );
  }
}

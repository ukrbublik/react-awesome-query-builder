import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {Col, Input} from "react-bootstrap";

export default class Text extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired
  };

  handleChange() {
    this.props.setValue(this.refs.text.getValue());
  }

  render() {
    return (
      <Col xs={4}>
          <label>Value</label>
          <Input autoFocus={this.props.delta === 0} type="text" ref="text" value={this.props.value} onChange={this.handleChange.bind(this)} />
      </Col>
    );
  }
}

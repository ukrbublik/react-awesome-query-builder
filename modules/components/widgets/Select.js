import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import map from 'lodash/map';
import {Col, Input} from "react-bootstrap";

export default class Select extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired
  };

  handleChange() {
//    const node = ReactDOM.findDOMNode(this.refs.select);
    this.props.setValue(this.refs.select.getValue());
  }

  render() {
    const fieldDefinition = this.props.config.fields[this.props.field];
    const options = map(fieldDefinition.options, (label, value) =>
      <option key={value} value={value}>{label}</option>
    );

    return (
        <Col xs={3}>
            <label>Value</label>
            <Input autoFocus={this.props.delta === 0} type="select" ref="select" value={this.props.value} onChange={this.handleChange.bind(this)}>{options}</Input>
        </Col>
    );
  }
}

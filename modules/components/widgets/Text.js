import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {Col, FormControl} from "react-bootstrap";

export default class Text extends Component {
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
          <label>Value</label>
          <FormControl 
            autoFocus={this.props.delta === 0} 
            type={"text"} 
            ref="text" 
            value={this.props.value} 
            onChange={this.handleChange.bind(this)} 
          />
      </Col>
    );
  }
}

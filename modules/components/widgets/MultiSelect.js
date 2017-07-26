import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import map from 'lodash/map';
import {Col} from "react-bootstrap";
import SelectPicker from "react-select-picker";

export default class Select extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired
  };

  handleChange(val) {
    console.log(1, val, this.refs.val);
    this.props.setValue(val);
  }

  render() {
    const fieldDefinition = this.props.config.fields[this.props.field];
    const options = map(fieldDefinition.options, (label, value) =>
      <option key={value} value={value}>{label}</option>
    );

    return (
        <Col>
            <label>Value</label>
            <SelectPicker 
              multiple
              ref="val" 
              className="form-control"
              title="Value"
              defaultValue={this.props.value}
              onChange={this.handleChange.bind(this)}
            >{options}</SelectPicker>
        </Col>
    );
  }
}

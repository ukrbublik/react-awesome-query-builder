import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import map from 'lodash/map';
import {Col} from "react-bootstrap";
import SelectPicker from "react-select-picker";
import {getFieldConfig} from "../../utils/index";

export default class SelectWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    delta: PropTypes.number.isRequired
  };

  handleChange(val) {
    this.props.setValue(val);
  }

  render() {
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    const options = map(fieldDefinition.options, (label, value) =>
      <option key={value} value={value}>{label}</option>
    );

    return (
        <Col>
            { this.props.config.settings.showLabels &&
                <label>{this.props.label || this.props.config.settings.valueLabel || "Value"}</label>
            }
            <SelectPicker 
              ref="val" 
              className="form-control"
              title={this.props.label || ""}
              defaultValue={this.props.value}
              onChange={this.handleChange.bind(this)}
            >{options}</SelectPicker>
        </Col>
    );
  }
}

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import { Select } from 'antd';
const Option = Select.Option;

export default class Proximity extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    setOption: PropTypes.func.isRequired
  };

  shouldComponentUpdate = shallowCompare;

  handleChange(value) {
    this.props.setOption('proximity', value);
  }

  render() {
    const selectedProximity = this.props.options.get('proximity', this.props.defaults.proximity);
    return (
      <div className="operator--PROXIMITY">
        <div className="operator--options">
          { this.props.config.settings.showLabels &&
            <label>{this.props.optionLabel || "Words between"}</label>
          }
          { !this.props.config.settings.showLabels && this.props.optionTextBefore &&
            <div className="operator--options--sep">
                <span>{this.props.optionTextBefore}</span>
            </div>
          }
          <Select 
            dropdownMatchSelectWidth={false}
            size={this.props.config.settings.renderSize || "small"}
            ref="proximity" 
            placeholder={this.props.optionPlaceholder || "Select words between"}
            value={selectedProximity != null ? ""+selectedProximity : ""} 
            onChange={this.handleChange.bind(this)}
          >
            {range(this.props.minProximity || 2, (this.props.maxProximity || 10) + 1).map((item) => (
              <Option key={""+item} value={""+item}>{item}</Option>
            ))}
          </Select>
        </div>
        <div className="operator--widgets">{this.props.children}</div>
      </div>
    );
  }
}

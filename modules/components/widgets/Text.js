import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Input, Col } from 'antd';

export default class TextWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    value: PropTypes.string,
    field: PropTypes.string.isRequired,
    customProps: PropTypes.object,
  };

  handleChange() {
    this.props.setValue(ReactDOM.findDOMNode(this.refs.text).value);
  }

  render() {
    let customProps = this.props.customProps || {};

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
          {...customProps}
        />
      </Col>
    );
  }
}

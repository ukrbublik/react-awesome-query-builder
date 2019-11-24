import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Input, Col } from 'antd';

export default class TextWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    value: PropTypes.string,
    field: PropTypes.string.isRequired,
    customProps: PropTypes.object,
  };

  handleChange = () => {
    this.props.setValue(ReactDOM.findDOMNode(this.refs.text).value);
  }

  render() {
    const {config, placeholder, customProps, value} = this.props;
    const {renderSize} = config.settings;
    const _value = value != undefined ? value : null;

    return (
      <Col>
        <Input
          key="widget-text"
          size={renderSize}
          ref="text"
          type={"text"}
          value={_value}
          placeholder={placeholder}
          onChange={this.handleChange}
          {...customProps}
        />
      </Col>
    );
  }
}

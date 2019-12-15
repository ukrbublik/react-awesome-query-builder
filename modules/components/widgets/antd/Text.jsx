import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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

  handleChange = (ev) => {
    const v = ev.target.value;
    const val = v === '' ? undefined : v; // don't allow empty value
    this.props.setValue(val);
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

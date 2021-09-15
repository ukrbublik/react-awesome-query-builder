import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Input, Col } from "antd";

export default class TextWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    value: PropTypes.string,
    field: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    customProps: PropTypes.object,
    maxLength: PropTypes.number,
  };

  handleChange = (ev) => {
    const v = ev.target.value;
    const val = v === "" ? undefined : v; // don't allow empty value
    this.props.setValue(val);
  }

  render() {
    const {config, placeholder, customProps, value, readonly, maxLength} = this.props;
    const {renderSize} = config.settings;
    const aValue = value != undefined ? value : null;

    return (
      <Col>
        <Input
          disabled={readonly}
          key="widget-text"
          size={renderSize}
          type={"text"}
          value={aValue}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={this.handleChange}
          {...customProps}
        />
      </Col>
    );
  }
}

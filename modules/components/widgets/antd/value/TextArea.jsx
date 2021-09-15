import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Input, Col } from "antd";
const { TextArea } = Input;

export default class TextAreaWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    value: PropTypes.string,
    field: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    customProps: PropTypes.object,
    maxLength: PropTypes.number,
    maxRows: PropTypes.number,
  };

  handleChange = (ev) => {
    const v = ev.target.value;
    const val = v === "" ? undefined : v; // don't allow empty value
    this.props.setValue(val);
  }

  render() {
    const {config, placeholder, customProps, value, readonly, maxLength, maxRows, fullWidth} = this.props;
    const {renderSize, defaultMaxRows} = config.settings;
    const aValue = value != undefined ? value : null;

    return (
      <Col>
        <TextArea
          autoSize={{minRows: 1, maxRows: maxRows || defaultMaxRows}}
          maxLength={maxLength}
          disabled={readonly}
          key="widget-textarea"
          size={renderSize}
          value={aValue}
          placeholder={placeholder}
          onChange={this.handleChange}
          {...customProps}
        />
      </Col>
    );
  }
}

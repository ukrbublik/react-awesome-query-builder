import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Col } from 'antd';

export default class NumberWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.number,
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
  };

  handleChange = (val) => {
    if (val === '' || val === null)
      val = undefined;
    this.props.setValue(val);
  }

  static defaultProps = {
      min: undefined,
      max: undefined,
      step: undefined,
  };

  render() {
    const {config, placeholder, fieldDefinition, customProps, value,  min, max, step} = this.props;
    const {renderSize} = config.settings;
    const {fieldSettings} = fieldDefinition || {};

    const _value = value != undefined ? value : undefined;
    const _min = fieldSettings.min != null ? fieldSettings.min : min;
    const _max = fieldSettings.max != null ? fieldSettings.max : max;
    const _step = fieldSettings.step != null ? fieldSettings.step : step;

    return (
      <Col>
        <InputNumber
          key="widget-number"
          size={renderSize}
          ref="num"
          value={_value}
          min={_min}
          max={_max}
          step={_step}
          placeholder={placeholder}
          onChange={this.handleChange}
          {...customProps}
        />
      </Col>
    );
  }
}

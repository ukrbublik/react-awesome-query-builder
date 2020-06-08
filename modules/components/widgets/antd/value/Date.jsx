import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import moment from "moment";


export default class DateWidget extends PureComponent {
    static propTypes = {
      setValue: PropTypes.func.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]) , //in valueFormat
      field: PropTypes.string.isRequired,
      config: PropTypes.object.isRequired,
      placeholder: PropTypes.string,
      placeholders: PropTypes.arrayOf(PropTypes.string),
      customProps: PropTypes.object,
      readonly: PropTypes.bool,
      // from fieldSettings:
      dateFormat: PropTypes.string,
      valueFormat: PropTypes.string,
    };

    constructor(props) {
      super(props);

      const {value, setValue} = props;
      if (!this.isValidValue(value)) {
        setValue(this.formatValue(this.getMomentValue(value)));
      }
    }

    static defaultProps = {
      dateFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
    };

    isValidSingleValue = (value) => {
      const {valueFormat} = this.props;
      let v = value ? moment(value, valueFormat) : null;
      return !v || v && v.isValid();
    };

    isValidValue = (value) => {
      const {isSpecialRange} = this.props;
      if (isSpecialRange)
        return value ? value.map(el => this.isValidSingleValue(el)).reduce((res, item) => (res && item), true) : true;
      else
        return this.isValidSingleValue(value);
    };

    getMomentSingleValue = (value) => {
      const {valueFormat} = this.props;
      let v = value ? moment(value, valueFormat) : null;
      if (v && !v.isValid())
        v = null;
      return v;
    };

    getMomentValue = (value) => {
      const {isSpecialRange} = this.props;
      if (isSpecialRange)
        return value ? value.map(el => this.getMomentSingleValue(el)) : [null, null];
      else
        return this.getMomentSingleValue(value);
    };

    formatSingleValue = (value) => {
      const {valueFormat} = this.props;
      return value && value.isValid() ? value.format(valueFormat) : undefined;
    };

    formatValue = (value) => {
      const {isSpecialRange} = this.props;
      if (isSpecialRange)
        return value ? value.map(el => this.formatSingleValue(el)) : [undefined, undefined];
      else
        return this.formatSingleValue(value);
    };

    handleChange = (value) => {
      const {setValue} = this.props;
      if (this.isValidValue(value))
        setValue(this.formatValue(value));
    };

    render() {
      const {placeholder, placeholders, customProps, value, dateFormat, config, readonly, isSpecialRange} = this.props;
      const {renderSize} = config.settings;
      const dateValue = this.getMomentValue(value);

      if (isSpecialRange) {
        return (
          <RangePicker
            disabled={readonly}
            key="widget-date"
            placeholder={placeholders}
            size={renderSize}
            format={dateFormat}
            value={dateValue}
            onChange={this.handleChange}
            {...customProps}
          />
        );
      } else {
        return (
          <DatePicker
            disabled={readonly}
            key="widget-date"
            placeholder={placeholder}
            size={renderSize}
            format={dateFormat}
            value={dateValue}
            onChange={this.handleChange}
            {...customProps}
          />
        );
      }
    }
}

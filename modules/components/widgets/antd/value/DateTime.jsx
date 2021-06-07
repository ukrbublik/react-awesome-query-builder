import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { DatePicker } from "antd";
import moment from "moment";


export default class DateTimeWidget extends PureComponent {
    static propTypes = {
      setValue: PropTypes.func.isRequired,
      value: PropTypes.string, //in valueFormat
      config: PropTypes.object.isRequired,
      field: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      customProps: PropTypes.object,
      readonly: PropTypes.bool,
      // from fieldSettings:
      timeFormat: PropTypes.string,
      dateFormat: PropTypes.string,
      valueFormat: PropTypes.string,
      use12Hours: PropTypes.bool,
    };

    constructor(props) {
      super(props);

      const {valueFormat, value, setValue} = props;
      let mValue = value ? moment(value, valueFormat) : null;
      if (mValue && !mValue.isValid()) {
        setValue(null);
      }
    }

    static defaultProps = {
      timeFormat: "HH:mm",
      dateFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      use12Hours: false,
    };

    handleChange = (aValue) => {
      const {setValue, valueFormat} = this.props;
      const value = aValue && aValue.isValid() ? aValue.format(valueFormat) : undefined;
      if (value || aValue === null)
        setValue(value);
    }

    render() {
      const {placeholder, customProps, value, valueFormat, dateFormat, timeFormat, use12Hours, config, readonly} = this.props;
      const {renderSize} = config.settings;
      const dateValue = value ? moment(value, valueFormat) : null;
      const dateTimeFrmat = dateFormat + " " + timeFormat;

      return (
        <DatePicker
          disabled={readonly}
          key="widget-datetime"
          use12Hours={use12Hours}
          showTime={{ format: timeFormat }}
          placeholder={placeholder}
          size={renderSize}
          format={dateTimeFrmat}
          value={dateValue}
          onChange={this.handleChange}
          {...customProps}
        />
      );
    }
}

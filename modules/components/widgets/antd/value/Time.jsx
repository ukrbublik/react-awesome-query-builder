import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { TimePicker } from "antd";
import moment from "moment";


export default class TimeWidget extends PureComponent {
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
      valueFormat: "HH:mm:ss",
      use12Hours: false,
    };


    handleChange = (aValue) => {
      const {setValue, valueFormat, timeFormat} = this.props;
      if (aValue && aValue.isValid() && timeFormat == "HH:mm") {
        aValue.set({second:0, millisecond:0});
      }
      const value = aValue && aValue.isValid() ? aValue.format(valueFormat) : undefined;
      if (value || aValue === null)
        setValue(value);
    }

    render() {
      const {placeholder, customProps, value, valueFormat, timeFormat, use12Hours, config, readonly} = this.props;
      const {renderSize} = config.settings;
      const timeValue = value ? moment(value, valueFormat) : null;

      return (
        <TimePicker
          disabled={readonly}
          use12Hours={use12Hours}
          key="widget-time"
          size={renderSize}
          placeholder={placeholder}
          format={timeFormat}
          value={timeValue}
          onChange={this.handleChange}
          {...customProps}
        />
      );
    }
}

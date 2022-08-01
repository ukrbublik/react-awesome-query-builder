import React from "react";
import { DatePicker } from "@fluentui/react";
import moment from 'moment';

export default (props) => {
  const {
    value,
    setValue,
    config,
    valueFormat,
    dateFormat,
    readonly,
    customProps,
    placeholder,
  } = props;

  const onChange = ( newValue) => {
    if (newValue == "") newValue = undefined;
    setValue(moment(new Date(newValue)));
  };

  return (
    <DatePicker
      disabled={readonly}
      value={value}
      onSelectDate={onChange}
      style={{ width: "auto", marginRight: "0.25rem" }}
      placeholder={placeholder}
      {...customProps}
    />
  );
};

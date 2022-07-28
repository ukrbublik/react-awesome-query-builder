import React from "react";
import { DatePicker } from "@fluentui/react";

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

  const formatSingleValue = (value) => {
    return value ? moment(value, valueFormat).format(dateFormat) : undefined;
  };

  const onChange = (e, value) => {
    if (value == "") value = undefined;
    setValue(formatSingleValue(value));
  };

  return (
    <DatePicker
      disabled={readonly}
      value={value}
      onChange={onChange}
      style={{ width: "auto", marginRight: "0.25rem" }}
      placeholder={placeholder}
      {...customProps}
    />
  );
};

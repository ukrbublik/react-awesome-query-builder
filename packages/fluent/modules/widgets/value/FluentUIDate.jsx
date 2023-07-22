import React from "react";
import { DatePicker } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;

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

  const momentValue = value ? moment(value, valueFormat) : undefined;
  const dateValue = momentValue ? momentValue.toDate() : undefined;

  const onChange = (date) => {
    // clear if invalid date
    if (date == "" || date instanceof Date && isNaN(date))
      date = undefined;
    const newValue = date ? moment(date).format(valueFormat) : undefined;
    setValue(newValue);
  };

  const formatDate = (date) => moment(date).format(dateFormat);

  const stylesDatePicker = {
    // width: "auto", 
    marginRight: "0.25rem", 
    width: "150px"
  };

  return (
    <DatePicker
      disabled={readonly}
      value={dateValue}
      onSelectDate={onChange}
      style={stylesDatePicker}
      placeholder={placeholder}
      formatDate={formatDate}
      {...customProps}
    />
  );
};

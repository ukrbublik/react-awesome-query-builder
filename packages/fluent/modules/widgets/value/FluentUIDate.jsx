import React from "react";
import { DatePicker } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { dayjs } = Utils;

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

  const dayjsValue = value ? dayjs(value, valueFormat) : undefined;
  const dateValue = dayjsValue ? dayjsValue.toDate() : undefined;

  const onChange = (date) => {
    // clear if invalid date
    if (date == "" || date instanceof Date && isNaN(date))
      date = undefined;
    const newValue = date ? dayjs(date).format(valueFormat) : undefined;
    setValue(newValue);
  };

  const formatDate = (date) => dayjs(date).format(dateFormat);

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

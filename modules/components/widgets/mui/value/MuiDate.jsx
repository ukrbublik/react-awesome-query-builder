import React from "react";
import DatePicker from "@mui/lab/DatePicker";
import FormControl from "@mui/material/FormControl";

export default (props) => {
  const {value, setValue, readonly, customProps, dateFormat, valueFormat, placeholder} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    setValue(formatSingleValue(value));
  };

  return (
    <FormControl>
      <DatePicker
        readOnly={readonly}
        disabled={readonly}
        placeholder={!readonly ? placeholder : ""}
        format={dateFormat}
        value={value || null}
        onChange={handleChange}
        {...customProps}
      />
    </FormControl>
  );
};
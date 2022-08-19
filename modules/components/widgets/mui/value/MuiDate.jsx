import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

export default (props) => {
  const {value, setValue, readonly, customProps, dateFormat, valueFormat, placeholder} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    setValue(formatSingleValue(value));
  };
  
  const renderInput = (params) => 
    <TextField 
      size="small" 
      variant="standard"
      {...params}
    />;

  return (
    <FormControl>
      <DatePicker
        readOnly={readonly}
        disabled={readonly}
        toolbarPlaceholder={!readonly ? placeholder : ""}
        inputFormat={dateFormat}
        value={value || null}
        onChange={handleChange}
        renderInput={renderInput}
        {...customProps}
      />
    </FormControl>
  );
};
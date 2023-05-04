import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
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

  const useKeyboard = window.matchMedia ?
    window.matchMedia?.("(pointer:fine)").matches || window.matchMedia?.("(pointer:none)").matches
    : props.useKeyboard;
  const Picker = typeof useKeyboard === "boolean" ? (useKeyboard ? DesktopDatePicker : MobileDatePicker) : DatePicker;

  return (
    <FormControl>
      <Picker
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
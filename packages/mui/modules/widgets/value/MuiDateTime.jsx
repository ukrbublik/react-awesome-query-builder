import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { DesktopDateTimePicker } from "@mui/x-date-pickers/DesktopDateTimePicker";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

export default (props) => {
  const {value, setValue, use12Hours, readonly, placeholder, dateFormat, timeFormat, valueFormat, customProps} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    setValue(formatSingleValue(value));
  };

  const dateTimeFormat = dateFormat + " " + timeFormat;
  
  const renderInput = (params) => 
    <TextField 
      size="small" 
      variant="standard"
      {...params}
    />;

  const useKeyboard = window.matchMedia ?
    window.matchMedia?.("(pointer:fine)").matches || window.matchMedia?.("(pointer:none)").matches
    : props.useKeyboard;
  const Picker = typeof useKeyboard === "boolean" ? (useKeyboard ? DesktopDateTimePicker : MobileDateTimePicker) : DateTimePicker;

  return (
    <FormControl>
      <Picker
        readOnly={readonly}
        disabled={readonly}
        ampm={!!use12Hours}
        toolbarPlaceholder={!readonly ? placeholder : ""}
        inputFormat={dateTimeFormat}
        value={value || null}
        onChange={handleChange}
        renderInput={renderInput}
        {...customProps}
      />
    </FormControl>
  );
};

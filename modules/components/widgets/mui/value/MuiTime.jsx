import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import moment from "moment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

export default (props) => {
  const {value, setValue, use12Hours, readonly, placeholder, timeFormat, valueFormat, customProps} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    setValue(formatSingleValue(value));
  };

  const hasSeconds = timeFormat.indexOf(":ss") != -1;
  const timeValue = value ? moment(value, timeFormat) : null;

  const renderInput = (params) => 
    <TextField 
      size="small" 
      variant="standard"
      {...params}
    />;

  return (
    <FormControl>
      <TimePicker
        readOnly={readonly}
        disabled={readonly}
        ampm={!!use12Hours}
        toolbarPlaceholder={!readonly ? placeholder : ""}
        inputFormat={timeFormat}
        value={timeValue || null}
        onChange={handleChange}
        views={hasSeconds ? ["hours", "minutes", "seconds"] : ["hours", "minutes"]}
        renderInput={renderInput}
        {...customProps}
      />
    </FormControl>
  );
};

import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;

export default (props) => {
  const {value, setValue, use12Hours, readonly, placeholder, dateFormat, timeFormat, valueFormat, customProps} = props;

  const isV6 = !!DateTimePicker?.propTypes?.format;

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

  const desktopModeMediaQuery = "@media (pointer: fine), (pointer: none)";

  const pickerProps = isV6 ? {
    format: dateTimeFormat,
    slotProps: {
      textField: {
        size: "small",
        variant: "standard"
      },
      toolbar: {
        toolbarPlaceholder: !readonly ? placeholder : "",
      },
    },
  } : {
    inputFormat: dateTimeFormat,
    renderInput,
    toolbarPlaceholder: !readonly ? placeholder : "",
  };

  const aValue = value ? (isV6 && typeof value === "string" ? moment(value, valueFormat) : value) : null;

  return (
    <FormControl>
      <DateTimePicker
        desktopModeMediaQuery={desktopModeMediaQuery}
        readOnly={readonly}
        disabled={readonly}
        ampm={!!use12Hours}
        value={aValue}
        onChange={handleChange}
        {...pickerProps}
        {...customProps}
      />
    </FormControl>
  );
};

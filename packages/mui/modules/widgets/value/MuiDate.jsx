import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;

export default (props) => {
  const {value, setValue, readonly, customProps, dateFormat, valueFormat, placeholder} = props;

  const isV6 = !!DatePicker?.propTypes?.format;

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

  const desktopModeMediaQuery = "@media (pointer: fine), (pointer: none)";

  const pickerProps = isV6 ? {
    format: dateFormat,
    slotProps: {
      textField: {
        size: 'small',
        variant: 'standard'
      },
      toolbar: {
        toolbarPlaceholder: !readonly ? placeholder : "",
      },
    },
  } : {
    inputFormat: dateFormat,
    renderInput,
    toolbarPlaceholder: !readonly ? placeholder : "",
  };

  const aValue = value ? (isV6 && typeof value === "string" ? moment(value, valueFormat) : value) : null;

  return (
    <FormControl>
      <DatePicker
        desktopModeMediaQuery={desktopModeMediaQuery}
        readOnly={readonly}
        disabled={readonly}
        value={aValue}
        onChange={handleChange}
        {...pickerProps}
        {...customProps}
      />
    </FormControl>
  );
};
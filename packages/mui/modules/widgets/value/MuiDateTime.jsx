import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import xdpPackage from "@mui/x-date-pickers/package.json"; // to determine version
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;
const xdpVersion = parseInt(xdpPackage?.version?.split(".")?.[0] ?? "0");

export default (props) => {
  const {value, setValue, use12Hours, readonly, placeholder, dateFormat, timeFormat, valueFormat, customProps, config} = props;
  const {renderSize} = config.settings;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    setValue(formatSingleValue(value));
  };

  const dateTimeFormat = dateFormat + " " + timeFormat;
  
  const renderInput = (params) => 
    <TextField 
      size={renderSize}
      variant="standard"
      {...params}
    />;

  const desktopModeMediaQuery = "@media (pointer: fine), (pointer: none)";

  const pickerProps = xdpVersion >= 6 ? {
    format: dateTimeFormat,
    slotProps: {
      textField: {
        size: renderSize,
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

  const aValue = value ? (xdpVersion >= 6 ? moment(value, valueFormat) : value) : null;

  return (
    <FormControl>
      <DateTimePicker
        desktopModeMediaQuery={desktopModeMediaQuery}
        readOnly={readonly}
        disabled={readonly}
        ampm={!!use12Hours}
        value={aValue}
        onChange={handleChange}
        size={renderSize}
        {...pickerProps}
        {...customProps}
      />
    </FormControl>
  );
};

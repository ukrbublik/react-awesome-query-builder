import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import xdpPackage from "@mui/x-date-pickers/package.json"; // to determine version
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;
const xdpVersion = xdpPackage?.version?.split(".")?.[0];

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

  const desktopModeMediaQuery = "@media (pointer: fine), (pointer: none)";

  const pickerProps = xdpVersion === "6" ? {
    format: dateFormat,
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
    inputFormat: dateFormat,
    renderInput,
    toolbarPlaceholder: !readonly ? placeholder : "",
  };

  const aValue = value ? (xdpVersion === "6" && typeof value === "string" ? moment(value, valueFormat) : value) : null;

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
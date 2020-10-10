import React from "react";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { DatePicker } from "@material-ui/pickers";

export default (props) => {
  
  const {value, setValue, valueFormat, readonly, customProps, dateFormat, placeholder} = props;

  const isValidSingleValue = (value) => {
    return !value || value && value.isValid();
  };

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
    if (isValidSingleValue(value))
      setValue(formatSingleValue(value));
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        readOnly={readonly}
        key="widget-date"
        placeholder={placeholder}
        format={dateFormat}
        value={value || null}
        onChange={handleChange}
        {...customProps}
      />
    </MuiPickersUtilsProvider>
  );
};
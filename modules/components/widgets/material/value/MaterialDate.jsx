import React from "react";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { DatePicker } from "@material-ui/pickers";

export default (props) => {
  
  const {value, setValue, readonly, customProps, dateFormat, valueFormat, placeholder} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
      setValue(formatSingleValue(value));
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        readOnly={readonly}
        placeholder={placeholder}
        format={dateFormat}
        value={value || null}
        onChange={handleChange}
        {...customProps}
      />
    </MuiPickersUtilsProvider>
  );
};
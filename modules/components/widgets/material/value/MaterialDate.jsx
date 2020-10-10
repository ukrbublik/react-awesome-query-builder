import React from "react";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { DatePicker } from "@material-ui/pickers";

export default (props) => {
  
  const {value, setValue, readonly, customProps, dateFormat, placeholder} = props;

  const handleChange = (value) => {
      setValue(value);
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
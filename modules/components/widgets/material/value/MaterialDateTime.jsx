import React from "react";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { DateTimePicker } from "@material-ui/pickers";

export default (props) => {

  const {value, setValue, use12Hours, readonly, placeholder, dateFormat, timeFormat, valueFormat, customProps} = props;

  const dateTimeFormat = dateFormat + " " + timeFormat;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
      setValue(formatSingleValue(value));
  };
  
return (
  <MuiPickersUtilsProvider utils={MomentUtils}>
     <DateTimePicker
        readOnly={readonly}
        ampm={!!use12Hours}
        placeholder={placeholder}
        format={dateTimeFormat}
        value={value || null}
        onChange={handleChange}
        {...customProps}
      />
  </MuiPickersUtilsProvider>
);
};

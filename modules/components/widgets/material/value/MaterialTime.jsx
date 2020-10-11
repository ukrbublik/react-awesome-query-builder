import React from "react";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { TimePicker } from "@material-ui/pickers";
import moment from "moment";

export default (props) => {
  const {value, setValue, use12Hours, readonly, placeholder, timeFormat, valueFormat, customProps} = props;

  const formatSingleValue = (value) => {
    return value && value.isValid() ? value.format(valueFormat) : undefined;
  };

  const handleChange = (value) => {
      setValue(formatSingleValue(value));
  };

const timeValue = value ? moment(value, timeFormat) : null;

return (
  <MuiPickersUtilsProvider utils={MomentUtils}>
     <TimePicker
        readOnly={readonly}
        ampm={!!use12Hours}
        placeholder={placeholder}
        format={timeFormat}
        value={timeValue || null}
        onChange={handleChange}
        views={["hours", "minutes", "seconds"]}
        {...customProps}
      />
  </MuiPickersUtilsProvider>
);
};

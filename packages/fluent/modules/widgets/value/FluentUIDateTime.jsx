import React, { useState } from "react";
import { DatePicker, TimePicker } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { moment } = Utils;

export default (props) => {
  const {
    value,
    setValue,
    config,
    valueFormat,
    dateFormat,
    timeFormat,
    use12Hours,
    readonly,
    customProps,
  } = props;

  const momentValue = value ? moment(value, valueFormat) : undefined;
  const dateValue = momentValue ? momentValue.toDate() : undefined;
  const [timeDate, setTimeDate] = useState(dateValue);

  const onDateChange = (date) => {
    let newValue;
    // clear if invalid date
    if (date == "" || date instanceof Date && isNaN(date))
      date = undefined;
    if (date) {
      // build new date
      let newMoment = moment(date);
      if (timeDate) { // if there is current time
        // copy current time
        const currTimeMoment = moment(timeDate);
        newMoment.set("hour", currTimeMoment.get("hour"));
        newMoment.set("minute", currTimeMoment.get("minute"));
        newMoment.set("second", currTimeMoment.get("second"));
      }
      newValue = newMoment.format(valueFormat);
    }
    if (newValue) {
      setValue(newValue);
    }
  };

  const onTimeChange = (_e, date) => {
    let newValue;
    // clear if invalid date
    if (date == "" || date instanceof Date && isNaN(date))
      date = undefined;
    setTimeDate(date); // set to state!
    const newTimeMoment = date ? moment(date) : undefined;
    if (momentValue) { // if there is current date
      // copy current date
      let newMoment = moment(momentValue);
      // set new time
      if (newTimeMoment) {
        newMoment.set("hour", newTimeMoment.get("hour"));
        newMoment.set("minute", newTimeMoment.get("minute"));
        newMoment.set("second", newTimeMoment.get("second"));
      }
      newValue = newMoment.format(valueFormat);
    }
    if (newValue) {
      setValue(newValue);
    }
  };

  const hasSeconds = valueFormat.indexOf(":ss") != -1;
  const formatDate = (date) => moment(date).format(dateFormat);

  const stylesTimePicker = {
    marginRight: "5px"
  };
  const stylesDatePicker = {
    width: "150px"
  };

  return (
    <div style={{display: "flex", flexDirection: "row"}}>
      <DatePicker 
        disabled={readonly}
        value={dateValue}
        formatDate={formatDate}
        onSelectDate={onDateChange}
        style={stylesDatePicker}
      />
      <TimePicker
        useHour12={use12Hours}
        value={timeDate}
        showSeconds={hasSeconds}
        disabled={readonly}
        onChange={onTimeChange}
        useComboBoxAsMenuWidth
        style={stylesTimePicker}
      />
    </div>
  );
};

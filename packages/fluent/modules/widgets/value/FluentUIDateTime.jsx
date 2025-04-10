import React, { useState } from "react";
import { DatePicker, TimePicker } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { dayjs } = Utils;

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

  const dayjsValue = value ? dayjs(value, valueFormat) : undefined;
  const dateValue = dayjsValue ? dayjsValue.toDate() : undefined;
  const [timeDate, setTimeDate] = useState(dateValue);

  const onDateChange = (date) => {
    let newValue;
    // clear if invalid date
    if (date == "" || date instanceof Date && isNaN(date))
      date = undefined;
    if (date) {
      // build new date
      let newDayjs = dayjs(date);
      if (timeDate) { // if there is current time
        // copy current time
        const currTimeDayjs = dayjs(timeDate);
        newDayjs = newDayjs.set("hour", currTimeDayjs.get("hour"));
        newDayjs = newDayjs.set("minute", currTimeDayjs.get("minute"));
        newDayjs = newDayjs.set("second", currTimeDayjs.get("second"));
      }
      newValue = newDayjs.format(valueFormat);
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
    const newTimeDayjs = date ? dayjs(date) : undefined;
    if (dayjsValue) { // if there is current date
      // copy current date
      let newDayjs = dayjs(dayjsValue);
      // set new time
      if (newTimeDayjs) {
        newDayjs = newDayjs.set("hour", newTimeDayjs.get("hour"));
        newDayjs = newDayjs.set("minute", newTimeDayjs.get("minute"));
        newDayjs = newDayjs.set("second", newTimeDayjs.get("second"));
      }
      newValue = newDayjs.format(valueFormat);
    }
    if (newValue) {
      setValue(newValue);
    }
  };

  const hasSeconds = valueFormat.indexOf(":ss") != -1;
  const formatDate = (date) => dayjs(date).format(dateFormat);

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

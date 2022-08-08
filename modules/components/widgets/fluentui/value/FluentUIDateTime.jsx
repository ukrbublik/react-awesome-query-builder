import React, { useState } from "react";
import moment from "moment";
import { DatePicker, TimePicker } from "@fluentui/react";

export default (props) => {
  const {
    value,
    setValue,
    config,
    valueFormat,
    use12Hours,
    readonly,
    customProps,
  } = props;

  var [time, setTime] = useState(moment(value).format('HH:mm:ss'));
  var [date, setDate] = useState(moment(value).format('YYYY-MM-DD'));

  const onDateChange = (date) => {
    if (date){
      var dateValue=moment(new Date(date)).format('YYYY-MM-DD');
      var val = moment(new Date(dateValue +' '+ time)).format(valueFormat);
      setDate(dateValue);
      setValue(val);
    }
  };

  const onTimeChange = (e, time) => {
    if (time){
      var timeValue=moment(time).format('HH:mm:ss');
      var val = moment(new Date(date+ ' '+timeValue)).format(valueFormat); 
      setTime(timeValue); 
      setValue(val);
    }
  };

  const stylesTimePicker = {
    marginRight: '5px'
  }

  const stylesDatePicker = {
    width: '150px'
  }

  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <TimePicker
        useHour12={use12Hours}
        showSeconds={true}
        disabled={readonly}
        onChange={onTimeChange}
        useComboBoxAsMenuWidth
        style={stylesTimePicker}
      />
      <DatePicker 
        disabled={readonly} 
        selectedDate={date} 
        onSelectDate={onDateChange} 
        style={stylesDatePicker}
      />
    </div>
  );
};

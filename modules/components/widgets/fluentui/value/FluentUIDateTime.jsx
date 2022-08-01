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

  const onDateChange = (e,value) => {
    if (value){
      console.log(value); 
      value = moment(new Date(value +' '+ time)).format(valueFormat);
      var dateValue=moment(value).format('YYYY-MM-DD');
      console.log(dateValue); 
      setDate(dateValue); 
      setValue(value);
    }
  };

  const onTimeChange = (e,value) => {
    if (value){
      value = moment(new Date(date+ ' '+value)).format(valueFormat);
      var timeValue=moment(value).format('HH:mm:ss');
      console.log(timeValue);
      setTime(timeValue); 
      setValue(value);
    }
  };
  // let dtValue = value;
  // if (!value)
  //   dtValue = "";
  // else
  //   dtValue = moment(value).format("YYYY-MM-DDTHH:mm");

  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <DatePicker disabled={readonly} onChange={onDateChange} />
      <TimePicker
        useHour12={use12Hours}
        showSeconds={true}
        disabled={readonly}
        onChange={onTimeChange}
      />
    </div>
  );
};

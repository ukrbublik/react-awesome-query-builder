import React from "react";
import Slider from '@material-ui/core/Slider';
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";

export default (props) => {
  const {placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;

  const muiMarks = Object.keys(marks).map(mark => ({value: mark, label: marks[mark].props.children}));

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  const {width, ...rest} =  customProps;

  return (
    <FormControl >
    <div style={{display: "inline-flex", marginLeft: "5px"}}>
    <TextField 
        type="number"
        value={value}
        placeholder={placeholder}
        InputProps={{
          readOnly: readonly,
        }}
        inputProps={{
          min: min,
          max: max,
          step: step,
        }}
        disabled={readonly}
        onChange={handleInputChange}
        onBlur={handleBlur}
        {...rest}
      />
    <div style={{marginLeft: "5px", paddingLeft:"12px", width: width || "300px"}}>
    <Slider 
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
  disabled={readonly}
  min={min}
  max={max}
  step={step}
  marks={muiMarks}
  {...rest}
  />
  </div>
  </div>
  </FormControl>
  );
};

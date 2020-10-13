import React from "react";
import Slider from '@material-ui/core/Slider';
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";

export default (props) => {
  const {placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;

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

  return (
    <FormControl >
    <div style={{display: "inline-flex"}}>
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
        fullWidth
        {...customProps}
      />
    <div style={{marginLeft: "11px", width: customProps.width || "300px"}}>
    <Slider 
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
  disabled={readonly}
  min={min}
  max={max}
  step={step}
  // marks={marks}
  {...customProps}
  />
  </div>
  </div>
  </FormControl>
  );
};

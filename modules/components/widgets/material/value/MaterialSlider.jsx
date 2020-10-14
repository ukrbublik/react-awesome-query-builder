import React from "react";
import Slider from '@material-ui/core/Slider';
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";

export default (props) => {
  const {placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;

  // marks example: { 0: "0%", 100: React.createElement('strong', null, "100%") }
  const muiMarks = marks ? Object.keys(marks).map(v => ({value: v, label: marks[v]})) : false;

  const handleSliderChange = (_e, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    setValue(val);
  };

  const handleInputBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };

  const {width, ...rest} =  customProps;
  const customInputProps = rest.input || {};
  const customSliderProps = rest.slider || rest;
  const sliderValue = typeof value === 'number' ? value : min;

  const InputCmp = (
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
      onBlur={handleInputBlur}
      {...customInputProps}
    />
  );

  const SliderCmp = (
    <Slider 
      value={sliderValue}
      onChange={handleSliderChange}
      disabled={readonly}
      min={min}
      max={max}
      step={step}
      marks={muiMarks}
      {...customSliderProps}
    />
  );

  const stylesWrapper = {
    display: "inline-flex", 
    marginLeft: "5px",
  };

  const stylesSliderWrapper = {
    marginLeft: "5px", 
    paddingLeft: "12px", 
    marginBottom: muiMarks && "-10px", 
    width: width || "300px",
  };

  return (
    <FormControl>
      <div style={stylesWrapper}>
        {InputCmp}
        <div style={stylesSliderWrapper}>
          {SliderCmp}
        </div>
      </div>
    </FormControl>
  );
};

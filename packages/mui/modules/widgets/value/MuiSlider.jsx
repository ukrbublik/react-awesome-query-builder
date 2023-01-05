import React from "react";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

export default (props) => {
  const {config, placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;
  const {defaultSliderWidth} = config.settings;

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
    // TIP: Fix if typed value out of range in input
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };


  const {width, ...rest} =  customProps || {};
  const customInputProps = rest.input || {};
  const customSliderProps = rest.slider || rest;
  
  // TIP: Can't pass undefined to MUI, cause it means uncontrolled component use.
  //      For empty value input needs "", slider needs null or 0
  const inputValue = typeof value === "number" ? value : "";
  const sliderValue = typeof value === "number" ? value : null;

  // marks example: { 0: "0%", 100: React.createElement('strong', null, "100%") }
  const muiMarks = marks ? Object.keys(marks).map(v => ({
    value: Number(v),
    label: typeof marks[v] === "object" || typeof marks[v] === "undefined" ? marks[v] : <p>{marks[v]}</p>
  })) : false;

  const InputCmp = (
    <TextField 
      variant="standard"
      type="number"
      value={inputValue}
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
      size="small"
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
      valueLabelDisplay="auto"
      size="small"
      {...customSliderProps}
    />
  );

  const stylesWrapper = {
    display: "inline-flex", 
    alignItems: "center",
    flexWrap: 'wrap'
  };

  const stylesInputWrapper = {
    marginLeft: "5px",
  };

  const stylesSliderWrapper = {
    marginLeft: "5px", 
    paddingLeft: "12px", 
    marginBottom: muiMarks && "-16px", 
    width: width || defaultSliderWidth,
  };

  return (
    <FormControl>
      <div style={stylesWrapper}>
        <div style={stylesInputWrapper}>
          {InputCmp}
        </div>
        <div style={stylesSliderWrapper}>
          {SliderCmp}
        </div>
      </div>
    </FormControl>
  );
};

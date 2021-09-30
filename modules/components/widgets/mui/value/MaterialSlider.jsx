import React from "react";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";

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
  const muiMarks = marks ? Object.keys(marks).map(v => ({value: v, label: marks[v]})) : false;


  const InputCmp = (
    <TextField 
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
      {...customSliderProps}
    />
  );

  const stylesWrapper = {
    display: "inline-flex", 
    alignItems: "center"
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

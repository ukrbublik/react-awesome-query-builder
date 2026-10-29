import React, { useCallback, useMemo } from "react";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { textFieldInputProps } from "../../utils/versions";

export default (props) => {
  const {config, placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;
  const {defaultSliderWidth, renderSize} = config.settings;

  const handleSliderChange = useCallback((_e, newValue) => {
    setValue(newValue);
  }, [setValue]);

  const handleInputChange = useCallback((e) => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    setValue(val);
  }, [setValue]);

  const handleInputBlur = useCallback((e) => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    // TIP: Fix if typed value out of range in input
    if (val < min) {
      setValue(min);
    } else if (val > max) {
      setValue(max);
    }
  }, [setValue, min, max]);


  const {width, ...rest} =  customProps || {};
  const customInputProps = rest.input || {};
  const customSliderProps = rest.slider || rest;
  
  // TIP: Can't pass undefined to MUI, cause it means uncontrolled component use.
  //      For empty value input needs "", slider needs null or 0
  const inputValue = typeof value === "number" ? value : "";
  const sliderValue = typeof value === "number" ? value : null;

  // marks example: { 0: "0%", 100: React.createElement('strong', null, "100%") }
  const muiMarks = useMemo(() => marks ? Object.keys(marks).map(v => ({
    value: Number(v),
    label: marks[v]
  })) : false, [marks]);

  const inputProps = useMemo(() => textFieldInputProps({
    readOnly: readonly,
  }, {
    min,
    max,
    step,
  }), [
    readonly, min, max, step
  ]);

  const InputCmp = (
    <TextField 
      variant="standard"
      type="number"
      value={inputValue}
      placeholder={placeholder}
      {...inputProps}
      disabled={readonly}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      size={renderSize}
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
      size={renderSize}
      {...customSliderProps}
    />
  );

  // tip: align to top (not center), so the slider rail is on the same level as the input,
  //      and mark labels (if any) are placed below without overflowing the rule
  const stylesWrapper = {
    display: "inline-flex", 
    alignItems: "flex-start",
    flexWrap: "wrap"
  };

  const stylesInputWrapper = {
    marginLeft: "5px",
  };

  // todo: css
  const stylesSliderWrapper = {
    marginLeft: "5px", 
    paddingLeft: "12px", 
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

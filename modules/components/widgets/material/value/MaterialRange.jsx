import React, { useEffect } from "react";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";

export default (props) => {
  const {config, placeholders, customProps, value, setValue, min, max, step, marks, readonly, textSeparators} = props;
  const {defaultSliderWidth} = config.settings;

  useEffect(() => {
    const [valueFrom, valueTo] = props.value || [undefined, undefined];
    if (props.value && (valueFrom == undefined || valueTo == undefined)) {
      // happens if we changed op from '==' to 'between'
      // (I know, timeout is dirty hack..)
      setTimeout(() => {
        const oneValue = valueFrom || valueTo;
        const value = [oneValue, oneValue];
        setValue(value);
      }, 1);
    }
  }, []);

  const handleSliderChange = (_e, newValues) => {
    setValue(newValues);
  };

  const handleInputChangeFrom = (e) => {
    // TIP: need to use props.value instead of value
    let valueFrom = e.target.value;
    if (valueFrom === "" || valueFrom == null)
      valueFrom = undefined;
    else
      valueFrom = Number(valueFrom);
    let value = props.value ? [...props.value] : [undefined, undefined];
    value[0] = valueFrom;
    setValue(value);
  };

  const handleInputChangeTo = (e) => {
    let valueTo = e.target.value;
    if (valueTo === "" || valueTo == null)
      valueTo = undefined;
    else
      valueTo = Number(valueTo);
    let value = props.value ? [...props.value] : [undefined, undefined];
    value[1] = valueTo;
    setValue(value);
  };

  const handleInputBlur = () => {
    // TIP: Fix if typed value out of range in inputs
    if (!value) return;
    if (value[0] < min) {
      setValue([min, value[1]]);
    } else if (value[1] > max) {
      setValue([value[0], max]);
    }
  };

  const {width, ...rest} =  customProps || {};
  const customInputProps = rest.input || {};
  const customSliderProps = rest.slider || rest;

  // marks example: { 0: "0%", 100: React.createElement('strong', null, "100%") }
  const muiMarks = marks ? Object.keys(marks).map(v => ({value: v, label: marks[v]})) : false;

  // TIP: Can't pass undefined to MUI, cause it means uncontrolled component use.
  //      For empty value input needs "", slider needs null or 0, but null will cause problems with range mode
  let sliderValue = value ? [...value] : [undefined, undefined];
  let [valueFrom, valueTo] = sliderValue;
  if (valueFrom == undefined) {
    valueFrom = "";
    sliderValue[0] = 0;
  }
  if (valueTo == undefined) {
    valueTo = "";
    sliderValue[1] = 0;
  }
  

  const FromInputCmp = (
    <TextField 
      type="number"
      value={valueFrom}
      placeholder={placeholders[0]}
      InputProps={{
        readOnly: readonly,
      }}
      inputProps={{
        min: min,
        max: max,
        step: step,
      }}
      disabled={readonly}
      onChange={handleInputChangeFrom}
      onBlur={handleInputBlur}
      {...customInputProps}
    />
  );

  const ToInputCmp = (
    <TextField 
      type="number"
      value={valueTo}
      placeholder={placeholders[1]}
      InputProps={{
        readOnly: readonly,
      }}
      inputProps={{
        min: min,
        max: max,
        step: step,
      }}
      disabled={readonly}
      onChange={handleInputChangeTo}
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
          {FromInputCmp}
        </div>
        <div className={"widget--sep"}>
          <span>{ textSeparators[1] }</span>
        </div>
        <div style={stylesInputWrapper}>
          {ToInputCmp}
        </div>
        <div style={stylesSliderWrapper}>
          {SliderCmp}
        </div>
      </div>
    </FormControl>
  );
};

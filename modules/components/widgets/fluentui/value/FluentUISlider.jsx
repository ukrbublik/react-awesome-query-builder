import React from "react";
import { Slider, TextField } from "@fluentui/react"; 

export default (props) => {
  const {config, placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;
  // const customInputProps = customProps.input || {};
  // const customSliderProps = customProps.slider || customProps;
  const {defaultSliderWidth}=config.settings;  

  const onChange = ( newValue) => {
    if (newValue === "" || newValue === null)
      newValue=undefined;
    else 
      val=Number(val); 
    setValue(newValue);
  };


  const InputCmp = (
    <TextField 
    value={value}
    placeholder={placeholder}
    disabled={readonly}
    onChange={onChange}
    /> 
  )

  const SliderCmp = (
  <Slider 
    min={min}
    max={max}
    step={step}
    value={value}
    disabled={readonly}
    marks={marks}
    onChange={onChange}
  />
  )

  return (
    <React.Fragment>
      <div>
        {InputCmp}
      </div>
      <div style={{width: defaultSliderWidth || width}}>
        {SliderCmp}
      </div> 
    </React.Fragment>
    
  );
};

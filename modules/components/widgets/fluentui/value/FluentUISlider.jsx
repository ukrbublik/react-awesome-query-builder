import React from "react";
import { Slider } from "@fluentui/react"; 

export default (props) => {
  const {config, placeholder, customProps, value, setValue, min, max, step, marks, readonly} = props;
  // const customInputProps = customProps.input || {};
  // const customSliderProps = customProps.slider || customProps;
  const {defaultSliderWidth}=config.settings;  

  const handleSliderChange = ( newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{width: defaultSliderWidth || width}}>
    <Slider 
      min={0}
      max={10}
      step={1}
      value={value}
      disabled={readonly}
      marks={marks}
      onChange={handleSliderChange}
    />
    </div> 
  );
};

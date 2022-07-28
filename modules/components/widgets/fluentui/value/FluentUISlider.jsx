import React from "react";
import { Slider, TextField } from "@fluentui/react";

export default (props) => {
  const {
    config,
    placeholder,
    customProps,
    value,
    setValue,
    min,
    max,
    step,
    marks,
    readonly,
  } = props;
  // const customInputProps = customProps.input || {};
  // const customSliderProps = customProps.slider || customProps;
  const { defaultSliderWidth } = config.settings;

  const onChange = (newValue) => {
    if (newValue === "" || newValue === null) newValue = undefined;
    else newValue = Number(newValue);
    setValue(newValue);
  };

  const InputCmp = (
    <TextField
      style={{ width: "auto" }}
      value={value}
      placeholder={placeholder}
      disabled={readonly}
      onChange={onChange}
    />
  );

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
  );

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {InputCmp}
      <div style={{ width: defaultSliderWidth || width }}>{SliderCmp}</div>
    </div>
  );
};

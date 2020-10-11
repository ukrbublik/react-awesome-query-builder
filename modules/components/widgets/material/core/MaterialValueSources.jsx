import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

export default ({config, valueSources, valueSrc, title, setValueSrc, readonly, placeholder}) => {
  const renderOptions = (valueSources) => (
    valueSources.map(([srcKey, info]) => (
      <MenuItem key={srcKey} value={srcKey}>{info.label}</MenuItem>
    ))
  );

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setValueSrc(e.target.value);
  };
  
  return (
    <FormControl>
      <Select 
        label={title}
        onChange={onChange}
        value={valueSrc}
        disabled={readonly}
      >
        {renderOptions(valueSources)}
      </Select>
    </FormControl>
  );
};

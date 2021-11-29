import React from "react";
import { Input } from "reactstrap";

export default ({config, valueSources, valueSrc, title, setValueSrc, readonly}) => {
  const renderOptions = (valueSources) => (
    valueSources.map(([srcKey, info]) => (
      <option key={srcKey} value={srcKey}>{info.label}</option>
    ))
  );
  
  return (
    <Input 
      type={"select"}
      bsSize={"sm"}
      onChange={(e) => setValueSrc(e.target.value)}
      value={valueSrc}
      disabled={readonly}
    >
      {renderOptions(valueSources)}
    </Input>
  );
};

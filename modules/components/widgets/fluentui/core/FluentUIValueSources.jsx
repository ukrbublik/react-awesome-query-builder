import { IconButton, DefaultButton } from "@fluentui/react";
import React from "react";

export default ({config, valueSources, valueSrc, title, setValueSrc, readonly}) => {
  var [checked, setChecked] = React.useState(false); 

  const renderOptions = (valueSources) => {
    var options = [];
    valueSources.map(([srcKey, info]) => (
      options.push({
        key: srcKey,
        text: info.label
      })
    ))
    return {onItemClick:onChange, items: options}; 
  }

  const onChange = (e, item) => {
    if (e.target.value === undefined)
      return;
    setValueSrc(e.target.value);
  }

  return (
    <IconButton
    menuProps={renderOptions(valueSources)}
    text="here"
    title="ValueSource"
    onChange={onChange}
    iconProps={{iconName: 'ChevronRight'}}
    onRenderMenuIcon={() => <div/>} 
    />
  );
};


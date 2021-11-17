import React from "react";
import { HighContrastSelector, Label, IContextualMenuProps, IIconProps } from '@fluentui/react';
import { IButtonStyles, IconButton, CommandButton } from '@fluentui/react/lib/Button';



export default ({ valueSources, valueSrc, title, setValueSrc, readonly}) => {


  const handleChange = (_e, item) => {
    if (!item?.key)
      return;
    setValueSrc(item?.key);
  };

  const renderOptions = (valueSources) => (
    valueSources.map(([srcKey, info]) => (
      // checked = valueSrc == srcKey || !valueSrc && srcKey == "value"
      {
        key: srcKey,
        text: info.label,
        //iconProps: { iconName: 'Mail' },
      }
    ))
  );


  const menuProps = {
    items: renderOptions(valueSources),
    onItemClick: handleChange
  };

  return (
    <CommandButton
      text={valueSrc || "value"}
      menuProps={menuProps} 
    />
  );
};

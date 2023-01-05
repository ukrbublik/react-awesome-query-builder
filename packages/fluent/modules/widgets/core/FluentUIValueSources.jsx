import { IconButton, DefaultButton } from "@fluentui/react";
import React from "react";

export default ({
  config,
  valueSources,
  valueSrc,
  title,
  setValueSrc,
  readonly,
}) => {
  const renderOptions = (valueSources) => {
    var options = [];
    valueSources.map(([srcKey, info]) =>
      options.push({
        key: srcKey,
        text: info.label,
        checked: valueSrc == srcKey || !valueSrc && srcKey == "value",
        canCheck: true
      })
    );
    return { onItemClick: onChange, items: options };
  };

  const onChange = (e, item) => {
    if (!item?.key) return;
    setValueSrc(item.key);
  };

  return (
    <IconButton
      menuProps={renderOptions(valueSources)}
      text="here"
      title="ValueSource"
      onChange={onChange}
      iconProps={{ iconName: "ChevronRight" }}
      onRenderMenuIcon={() => <div />}
    />
  );
};

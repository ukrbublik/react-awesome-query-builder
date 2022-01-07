import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";

export default ({config, valueSources, valueSrc, title, setValueSrc, readonly}) => {

  const [isOpen, setIsOpen] = useState(false);

  const stylesDropdownWrapper = {
    lineHeight: "105%",
    minHeight: "1.7rem",
    paddingBottom: "0.45rem"
  };

  const stylesDropdownMenuWrapper = {
    minWidth: "100%"
  };

  const renderOptions = (valueSources) =>
    valueSources.map(([srcKey, info]) => (
      <DropdownItem
        key={srcKey}
        onClick={(e) => setValueSrc(e.target.value)}
        value={srcKey}
      >
        {info.label}
      </DropdownItem>
    ));

  return (
    <Dropdown
      isOpen={isOpen}
      onClick={() => (!isOpen ? setIsOpen(true) : setIsOpen(false))}
      disabled={readonly}
      toggle={() => setIsOpen(!isOpen)}
    >
      <DropdownToggle
        tag={"button"}
        className={"form-select"}
        style={stylesDropdownWrapper}
        color={"transparent"}
      >
        {valueSrc ?? ""}
      </DropdownToggle>
      <DropdownMenu
        style={stylesDropdownMenuWrapper}
      >
        {renderOptions(valueSources)}
      </DropdownMenu>
    </Dropdown>
  );
};
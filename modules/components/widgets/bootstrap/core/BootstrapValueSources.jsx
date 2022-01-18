import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default ({config, valueSources, valueSrc, title, setValueSrc, readonly}) => {

  const [isOpen, setIsOpen] = useState(false);

  const stylesDropdownWrapper = {
    lineHeight: "105%",
    minHeight: "1.7rem",
    paddingBottom: "0.45rem"
  };

  const stylesDropdownMenuWrapper = {
    //minWidth: "100%"
  };

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setValueSrc(e.target.value);
  };

  const getValueSrcLabel = (valueSrc) => {
    const valueSrcInfo = valueSources
      .filter(([srcKey, _info]) => srcKey == valueSrc)
      .map(([_srcKey, info]) => info)
      .shift();
    return valueSrcInfo?.label || valueSrc;
  };

  const renderOptions = (valueSources) =>
    valueSources.map(([srcKey, info]) => (
      <DropdownItem
        key={srcKey}
        onClick={onChange}
        value={srcKey}
        active={valueSrc == srcKey}
      >
        {info.label || srcKey}
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
        tag={"span"}
        className={"btn"}
        style={stylesDropdownWrapper}
        color={"transparent"}
      >
        {/*valueSrc ? getValueSrcLabel(valueSrc) : <span>&nbsp;</span>*/}
        <FontAwesomeIcon icon={faEllipsisV} />
      </DropdownToggle>
      <DropdownMenu
        container="body"
        style={stylesDropdownMenuWrapper}
      >
        {renderOptions(valueSources)}
      </DropdownMenu>
    </Dropdown>
  );
};
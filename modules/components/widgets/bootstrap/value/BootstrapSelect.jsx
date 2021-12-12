import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { mapListValues } from "../../../../utils/stuff";

export default ({
  listValues,
  value,
  setValue,
  allowCustomValues,
  readonly,
}) => {
  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return (
        <DropdownItem
          key={value}
          onClick={(e) => setValue(e.target.value)}
          value={value}
        >
          {title}
        </DropdownItem>
      );
    });

  const hasValue = value != null;
  const [isOpen, setIsOpen] = useState(false);

  const stylesDropdownWrapper = {
    lineHeight: "105%",
    minHeight: "1.7rem",
    paddingBottom: "0.45rem"
  };

  const stylesDropdownMenuWrapper = {
    minWidth: "100%"
  };

  const toggle = () => {
    setIsOpen(!isOpen);
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onClick={() => (!isOpen ? setIsOpen(true) : setIsOpen(false))}
      disabled={readonly}
      toggle={() => toggle()}
    >
      <DropdownToggle
        tag={"button"}
        className={"form-select"}
        style={stylesDropdownWrapper}
        color={"transparent"}
        onChange={(e) => setValue(e.target.value)}
      >
        {hasValue ? value : ""}
      </DropdownToggle>
      <DropdownMenu
        style={stylesDropdownMenuWrapper}
        onChange={(e) => setValue(e.target.value)}
        value={hasValue ? value : ""}
      >
        {!hasValue && <DropdownItem disabled value={""}></DropdownItem>}
        {renderOptions()}
      </DropdownMenu>
    </Dropdown>
  );
};

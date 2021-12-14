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
        {hasValue ? value : ""}
      </DropdownToggle>
      <DropdownMenu
        style={stylesDropdownMenuWrapper}
      >
        {!hasValue && <DropdownItem disabled value={""}></DropdownItem>}
        {renderOptions()}
      </DropdownMenu>
    </Dropdown>
  );
};

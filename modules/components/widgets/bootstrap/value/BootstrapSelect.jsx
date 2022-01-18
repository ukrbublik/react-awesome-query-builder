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
  value: selectedValue,
  setValue,
  allowCustomValues,
  readonly,
  placeholder,
}) => {
  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setValue(e.target.value);
  };

  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return (
        <DropdownItem
          key={value}
          onClick={onChange}
          value={value}
          active={selectedValue == value}
        >
          {title}
        </DropdownItem>
      );
    });

  const renderValue = (selectedValue) => {
    if (!readonly && selectedValue == null)
      return placeholder;
    return getListValueTitle(selectedValue);
  };

  const getListValueTitle = (selectedValue) => 
    mapListValues(listValues, ({title, value}) => 
      (value === selectedValue ? title : null)
    )
      .filter(v => v !== null)
      .shift();

  const hasValue = selectedValue != null;
  const [isOpen, setIsOpen] = useState(false);

  const stylesDropdownWrapper = {
    lineHeight: "105%",
    minHeight: "1.7rem",
    paddingBottom: "0.45rem"
  };

  const stylesDropdownMenuWrapper = {
    //minWidth: "100%"
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
        {hasValue ? renderValue(selectedValue) : <span>&nbsp;</span>}
      </DropdownToggle>
      <DropdownMenu
        container="body"
        style={stylesDropdownMenuWrapper}
      >
        {!hasValue && <DropdownItem disabled value={""}></DropdownItem>}
        {renderOptions()}
      </DropdownMenu>
    </Dropdown>
  );
};

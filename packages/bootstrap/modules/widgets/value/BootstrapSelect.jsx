import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { Utils } from "@react-awesome-query-builder/ui";
const { mapListValues } = Utils.ListUtils;

export default ({
  listValues,
  value: selectedValue,
  setValue,
  allowCustomValues,
  readonly,
  placeholder,
  config,
}) => {
  const darkMode = config.settings.themeMode === "dark";
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
      isOpen={!readonly && isOpen}
      onClick={() => (!isOpen ? setIsOpen(true) : setIsOpen(false))}
      disabled={readonly}
      toggle={() => setIsOpen(!isOpen)}
    >
      <DropdownToggle
        tag={!darkMode ? "button" : undefined}
        caret={darkMode}
        className={"form-select"}
        style={stylesDropdownWrapper}
        color={darkMode ? "dark" : "transparent"}
        disabled={readonly}
      >
        {hasValue ? renderValue(selectedValue) : <span>&nbsp;</span>}
      </DropdownToggle>
      <DropdownMenu
        container="body"
        style={stylesDropdownMenuWrapper}
        dark={darkMode}
      >
        {!hasValue && <DropdownItem disabled value={""}></DropdownItem>}
        {renderOptions()}
      </DropdownMenu>
    </Dropdown>
  );
};

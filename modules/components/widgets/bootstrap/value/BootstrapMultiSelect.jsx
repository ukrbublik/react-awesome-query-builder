import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { mapListValues } from "../../../../utils/stuff";

export default ({listValues, value, setValue, allowCustomValues, readonly}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState(value ?? []);

    const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return (
        <DropdownItem
          key={value}
          onClick={(e) => setValue(getMultiSelectValues(e.target.value, listValues))}
          value={value}
          active={selectedValues.some(x => x === value)}
        >
          {title}
        </DropdownItem>
      );
    });

    const stylesDropdownWrapper = {
      lineHeight: "105%",
      minHeight: "1.7rem",
      paddingBottom: "0.45rem"
    };
  
    const stylesDropdownMenuWrapper = {
      minWidth: "100%"
    };

  const getMultiSelectValues = (value, options) => {

    if (!value) return selectedValues;

    let isNewSelection = !selectedValues.includes(value);
    let newSelectedValues = [];
    
    if (isNewSelection) {
      newSelectedValues = [...selectedValues, value];
      setSelectedValues(newSelectedValues);
    }
    else {
      newSelectedValues = selectedValues.filter(x => x !== value);
      setSelectedValues(newSelectedValues);
    }
    
    return newSelectedValues;
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
        {selectedValues.join(", ")}
      </DropdownToggle>
      <DropdownMenu
        style={stylesDropdownMenuWrapper}
      >
        {renderOptions()}
      </DropdownMenu>
    </Dropdown>
  );
};
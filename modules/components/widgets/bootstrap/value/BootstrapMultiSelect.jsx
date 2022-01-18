import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { mapListValues } from "../../../../utils/stuff";

export default ({listValues, value, setValue, allowCustomValues, placeholder, readonly}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(value ?? []);

  const onChange = e => {
    let value = getMultiSelectValues(e.target.value, listValues);
    if (value.length == 0)
      value = undefined;
    setValue(value);
  };

  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return (
        <DropdownItem
          key={value}
          onClick={onChange}
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
    //minWidth: "100%"
  };


  const renderValue = (selectedValues) => {
    if (!readonly && !selectedValues.length)
      return placeholder;
    const selectedTitles = mapListValues(listValues, ({title, value}) => (
      selectedValues.indexOf(value) > -1 ? title : null
    )).filter(v => v !== null);
    return selectedTitles.join(", ");
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
        {selectedValues.length ? renderValue(selectedValues) : <span>&nbsp;</span>}
      </DropdownToggle>
      <DropdownMenu
        container="body"
        style={stylesDropdownMenuWrapper}
      >
        {renderOptions()}
      </DropdownMenu>
    </Dropdown>
  );
};
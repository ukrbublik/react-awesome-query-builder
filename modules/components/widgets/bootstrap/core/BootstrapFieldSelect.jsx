import React, { useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";

export default ({ items, setField, selectedKey, readonly, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const stylesDropdownWrapper = {
    lineHeight: "105%",
    minHeight: "1.7rem",
    paddingBottom: "0.45rem",
  };

  const stylesDropdownMenuWrapper = {
    overflowY: "auto",
    maxHeight: "400px",
  };

  const renderOptions = (fields) =>
    Object.keys(fields).map((fieldKey) => {
      const field = fields[fieldKey];
      const { items, path, label, disabled } = field;
      if (items) {
        return (
          <>
            <DropdownItem
              header
              key={`${path}-header`}
              onClick={(e) => setField(e.target.value)}
              value={path}
            >
              {label}
            </DropdownItem>
            {renderOptions(items)}
            <DropdownItem key={`${label}-divider`} divider />
          </>
        );
      } else {
        return (
          <DropdownItem
            disabled={disabled}
            key={path}
            onClick={(e) => setField(e.target.value)}
            value={path}
          >
            {label}
          </DropdownItem>
        );
      }
    });

  const hasValue = selectedKey != null;

  const renderValue = (selectedValue) => {
    if (!readonly && !selectedValue) return placeholder;
    const findLabel = (fields) => {
      return fields.map((field) => {
        if (!field.items)
          return field.path === selectedValue ? field.label : null;
        return findLabel(field.items);
      });
    };
    return findLabel(items)
      .filter((v) => {
        if (Array.isArray(v)) {
          return v.some((value) => value !== null);
        } else {
          return v !== null;
        }
      })
      .pop();
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
        {hasValue ? renderValue(selectedKey) : ""}
      </DropdownToggle>
      <DropdownMenu container="body" style={stylesDropdownMenuWrapper}>
        {!hasValue && <DropdownItem disabled value={""}></DropdownItem>}
        {renderOptions(items)}
      </DropdownMenu>
    </Dropdown>
  );
};

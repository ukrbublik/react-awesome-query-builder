import React from "react";
import { Input } from "reactstrap";

export default ({ items, setField, selectedKey, readonly }) => {
  const renderOptions = (fields) =>
    Object.keys(fields).map((fieldKey) => {
      const field = fields[fieldKey];
      const { items, path, label, disabled } = field;
      if (items) {
        return (
          <optgroup disabled={disabled} key={path} label={label}>
            {renderOptions(items)}
          </optgroup>
        );
      } else {
        return (
          <option disabled={disabled} key={path} value={path}>
            {label}
          </option>
        );
      }
    });

  const hasValue = selectedKey != null;
  
  return (
    <Input
      type={"select"}
      bsSize={"sm"}
      onChange={(e) => setField(e.target.value)}
      value={hasValue ? selectedKey : ""}
      disabled={readonly}
    >
      {!hasValue && <option disabled value={""}></option>}
      {renderOptions(items)}
    </Input>
  );
};

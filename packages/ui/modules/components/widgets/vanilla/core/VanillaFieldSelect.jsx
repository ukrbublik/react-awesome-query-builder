import React from "react";

export default ({items, setField, selectedKey, readonly}) => {
  const renderOptions = (fields) => (
    fields.map(field => {
      const {items, path, label, disabled} = field;
      if (items) {
        return <optgroup disabled={disabled} key={path} label={label}>{renderOptions(items)}</optgroup>;
      } else {
        return <option disabled={disabled} key={path} value={path}>{label}</option>;
      }
    })
  );

  const onChange = e => setField(e.target.value);
  
  const hasValue = selectedKey != null;
  return (
    <select 
      onChange={onChange}
      value={hasValue ? selectedKey : ""}
      disabled={readonly}
    >
      {!hasValue && <option disabled value={""}></option>}
      {renderOptions(items)}
    </select>
  );
};

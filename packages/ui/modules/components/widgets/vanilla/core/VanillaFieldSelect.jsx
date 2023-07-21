import React from "react";

export default ({items, setField, selectedKey, readonly, errorText}) => {
  const renderOptions = (fields) => (
    fields.map(field => {
      const {items, path, label, disabled, matchesType} = field;
      if (items) {
        return <optgroup disabled={disabled} key={path} label={label}>{renderOptions(items)}</optgroup>;
      } else {
        const style = matchesType ? { fontWeight: "bold" } : {};
        return <option disabled={disabled} key={path} value={path} style={style}>{label}</option>;
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
      style={{ color: errorText ? "red" : null }}
    >
      {!hasValue && <option disabled value={""}></option>}
      {renderOptions(items)}
    </select>
  );
};

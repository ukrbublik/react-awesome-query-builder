import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import FormControl from "@material-ui/core/FormControl";

export default ({items, setField, selectedKey, readonly, placeholder}) => {
  const renderOptions = (fields, level = 0) => (
    fields.map(field => {
      const {items, path, label, disabled} = field;
      const prefix = "\u00A0\u00A0".repeat(level);
      if (items) {
        return [
          <ListSubheader disabled={disabled} key={path} disableSticky={true}>
            {prefix && <span>{prefix}</span>}
            {label}
          </ListSubheader>,
          renderOptions(items, level+1),
        ];
      } else {
        return <MenuItem disabled={disabled} key={path} value={path}>
          {prefix && <span>{prefix}</span>}
          {label}
        </MenuItem>;
      }
    })
  );

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setField(e.target.value);
  };

  const renderValue = (selectedValue) => {
    if (!readonly && !selectedValue)
      return placeholder;
    const findLabel = (fields) => {
      return fields.map(field => {
        if(!field.items) return field.path === selectedValue ? field.label : null;
        return findLabel(field.items);
      });
    };
    return findLabel(items).filter((v) => {
      if (Array.isArray(v)) {
        return v.some((value) => value !== null);
      } else {
        return v !== null;
      }
    }).pop();
  };
  
  const hasValue = selectedKey != null;
  return (
    <FormControl>
      <Select
        autoWidth
        displayEmpty
        label={placeholder}
        onChange={onChange}
        value={hasValue ? selectedKey : ""}
        disabled={readonly}
        renderValue={renderValue}
      >
        {renderOptions(items)}
      </Select>
    </FormControl>
  );
};

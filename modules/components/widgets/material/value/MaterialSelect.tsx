import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { mapListValues } from "../../../../utils/stuff";

export default ({
  listValues,
  value,
  setValue,
  allowCustomValues,
  readonly,
  placeholder,
  customProps,
}) => {
  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => (
      <MenuItem key={value} value={value}>
        {title}
      </MenuItem>
    ));

  const onChange = (e) => {
    if (e.target.value === undefined) return;
    setValue(e.target.value);
  };

  const renderValue = (selectedValue) => {
    if (!readonly && !selectedValue) return placeholder;
    return mapListValues(listValues, ({ title, value }) =>
      value === selectedValue ? title : null
    )
      .filter((v) => v !== null)
      .shift();
  };

  const hasValue = value != null;

  return (
    <FormControl>
      <Select
        autoWidth
        displayEmpty
        label={!readonly ? placeholder : ""}
        onChange={onChange}
        value={hasValue ? value : ""}
        disabled={readonly}
        readOnly={readonly}
        renderValue={renderValue}
        {...customProps}
      >
        {renderOptions()}
      </Select>
    </FormControl>
  );
};

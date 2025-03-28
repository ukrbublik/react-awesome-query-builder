import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import omit from "lodash/omit";
import { Utils } from "@react-awesome-query-builder/ui";
const { mapListValues } = Utils.ListUtils;

export default ({listValues, value, setValue, allowCustomValues, readonly, placeholder, customProps, config}) => {
  const {renderSize} = config.settings;
  const renderOptions = () =>
    mapListValues(listValues, ({title, value}) => {
      return <MenuItem key={value} value={value}>{title}</MenuItem>;
    });

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setValue(e.target.value);
  };

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
  
  const hasValue = value != null;

  return (
    <FormControl>
      <Select
        variant="standard"
        autoWidth
        displayEmpty
        placeholder={!readonly ? placeholder : ""}
        onChange={onChange}
        value={hasValue ? value : ""}
        disabled={readonly}
        readOnly={readonly}
        renderValue={renderValue}
        size={renderSize}
        {...omit(customProps, ["showSearch", "input"])}
      >
        {renderOptions()}
      </Select>
    </FormControl>
  );
};

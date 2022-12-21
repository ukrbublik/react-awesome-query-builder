import React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import omit from "lodash/omit";
import { Utils } from "@react-awesome-query-builder/ui";
const { mapListValues } = Utils.ListUtils;

export default ({listValues, value, setValue, allowCustomValues, readonly, placeholder, customProps}) => {
  const renderOptions = (selectedValues) => 
    mapListValues(listValues, ({title, value}) => {
      return (
        <MenuItem key={value} value={value}>
          <Checkbox checked={selectedValues.indexOf(value) > -1} />
          <ListItemText primary={title} />
        </MenuItem>
      );
    });

  const renderValue = (selectedValues) => {
    if (!readonly && !selectedValues.length)
      return placeholder;
    const selectedTitles = mapListValues(listValues, ({title, value}) => (
      selectedValues.indexOf(value) > -1 ? title : null
    )).filter(v => v !== null);
    return selectedTitles.join(", ");
  };

  const hasValue = value != null && value.length > 0;

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setValue(e.target.value);
  };

  return (
    <FormControl>
      <Select multiple
        variant="standard"
        autoWidth
        displayEmpty
        label={!readonly ? placeholder : ""}
        onChange={onChange}
        value={hasValue ? value : []}
        disabled={readonly}
        readOnly={readonly}
        renderValue={renderValue}
        size="small"
        {...omit(customProps, ["showSearch", "input", "showCheckboxes"])}
      >
        {renderOptions(hasValue ? value : [])}
      </Select>
    </FormControl>
  );
};

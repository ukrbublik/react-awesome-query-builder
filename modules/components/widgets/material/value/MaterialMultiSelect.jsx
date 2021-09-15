import React from "react";
import {mapListValues} from "../../../../utils/stuff";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import omit from "lodash/omit";

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
        autoWidth
        displayEmpty
        label={!readonly ? placeholder : ""}
        onChange={onChange}
        value={hasValue ? value : []}
        disabled={readonly}
        readOnly={readonly}
        renderValue={renderValue}
        {...omit(customProps, ["showSearch", "input", "showCheckboxes"])}
      >
        {renderOptions(hasValue ? value : [])}
      </Select>
    </FormControl>
  );
};

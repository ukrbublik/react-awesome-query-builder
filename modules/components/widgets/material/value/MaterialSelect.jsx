import React from "react";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {mapListValues} from "../../../../utils/stuff";
import FormControl from '@material-ui/core/FormControl';

export default ({listValues, value, setValue, allowCustomValues, readonly, placeholder}) => {
  const renderOptions = () => 
    mapListValues(listValues, ({title, value}) => {
      return <MenuItem key={value} value={value}>{title}</MenuItem>;
    });

  const onChange = e => {
    if (e.target.value === undefined)
      return;
    setValue(e.target.value);
  }
  
  const hasValue = value != null;
  return (
    <FormControl>
      <Select
        autoWidth
        displayEmpty
        label={placeholder}
        onChange={onChange}
        value={hasValue ? value : ""}
        disabled={readonly}
      >
        {!hasValue && <MenuItem disabled value={""}>{placeholder}</MenuItem>}
        {renderOptions()}
      </Select>
    </FormControl>
  );
};

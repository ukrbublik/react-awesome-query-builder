import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import omit from "lodash/omit";
const { mapListValues } = Utils.ListUtils;

export default ({listValues, value, setValue, allowCustomValues, readonly, customProps,}) => {
  const renderOptions = () => 
    mapListValues(listValues, ({title, value}) => {
      return <option key={value} value={value}>{title}</option>;
    });

  const getMultiSelectValues = (multiselect) => {
    let values = [];
    const options = multiselect.options;
    for (let i = 0 ; i < options.length ; i++) {
      const opt = options[i];
      if (opt.selected) {
        values.push(opt.value);
      }
    }
    if (!values.length)
      values = undefined; //not allow []
    return values;
  };

  const onChange = e => setValue(getMultiSelectValues(e.target));
  
  return (
    <select multiple
      onChange={onChange}
      value={value}
      disabled={readonly}
      {...omit(customProps, ["showSearch", "input", "showCheckboxes"])}
    >
      {renderOptions()}
    </select>
  );
};

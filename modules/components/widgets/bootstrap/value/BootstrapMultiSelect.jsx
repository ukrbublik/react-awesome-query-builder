import React from "react";
import { Input } from "reactstrap";
import {mapListValues} from "../../../../utils/stuff";

export default ({listValues, value, setValue, allowCustomValues, readonly}) => {
  const renderOptions = () => 
    mapListValues(listValues, ({title, value}) => {
      return <option key={value} className="dropdown-item" value={value}>{title}</option>;
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
  
  return (
    <Input
      type="select"
      bsSize={"sm"}
      onChange={(e) => setValue(getMultiSelectValues(e.target))}
      value={value}
      disabled={readonly}
      multiple
    >
      {renderOptions()}
    </Input>
  );
};

import React from "react";
import {mapListValues} from "../../../../utils/stuff";

export default ({listValues, value, setValue, allowCustomValues, readonly}) => {
  const renderOptions = () => 
    mapListValues(listValues, ({title, value}) => {
      return <option key={value} value={value}>{title}</option>;
    });

  const onChange = e => setValue(e.target.value);
  
  const hasValue = value != null;
  return (
    <select
      onChange={onChange}
      value={hasValue ? value : ""}
      disabled={readonly}
    >
      {!hasValue && <option disabled value={""}></option>}
      {renderOptions()}
    </select>
  );
};

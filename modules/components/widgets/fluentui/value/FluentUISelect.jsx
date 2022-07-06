import React from "react";
import {mapListValues} from "../../../../utils/stuff";
import omit from "lodash/omit";

export default ({listValues, value, setValue, allowCustomValues, readonly, customProps,}) => {
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
      {...omit(customProps, ["showSearch", "input"])}
    >
      {!hasValue && <option disabled value={""}></option>}
      {renderOptions()}
    </select>
  );
};

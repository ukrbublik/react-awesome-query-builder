import React from "react";
import { Input } from "reactstrap";
import {mapListValues} from "../../../../utils/stuff";

export default ({listValues, value, setValue, allowCustomValues, readonly}) => {
  const renderOptions = () => 
    mapListValues(listValues, ({title, value}) => {
      return <option key={value} value={value}>{title}</option>;
    });

  const hasValue = value != null;

  return (
    <Input
      type={"select"}
      bsSize={"sm"}
      onChange={(e) => setValue(e.target.value)}
      value={hasValue ? value : ""}
      disabled={readonly}
    >
      {!hasValue && <option disabled value={""}></option>}
      {renderOptions()}
    </Input>
  );
};

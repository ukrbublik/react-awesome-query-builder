import React from "react";

export default ({value, setValue, label, id, config}) => {
  const onChange = e => setValue(e.target.checked);
  return [
    <input key={id}  type="checkbox" id={id + "__lock"} checked={!!value} onChange={onChange} />
    ,
    <label key={id+"label"}  htmlFor={id + "__lock"}>{label || "Lock"}</label>
  ];
};

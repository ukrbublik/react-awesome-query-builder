// @ts-nocheck
import React from "react";
import uuid from "../../../../utils/uuid";

export default (props) => {
  const { value, setValue, config, labelYes, labelNo, readonly } = props;
  const onCheckboxChange = (e) => setValue(e.target.checked);
  const onRadioChange = (e) => setValue(e.target.value == "true");
  const id = uuid();
  const id2 = uuid();

  // return <>
  //     <input key={id}  type="checkbox" id={id} checked={!!value} disabled={readonly} onChange={onCheckboxChange} />
  //     <label style={{display: "inline"}} key={id+"label"}  htmlFor={id}>{value ? labelYes : labelNo}</label>
  // </>;

  return (
    <>
      <input
        key={id}
        type="radio"
        id={id}
        value
        checked={!!value}
        disabled={readonly}
        onChange={onRadioChange}
      />
      <label style={{ display: "inline" }} key={`${id}label`} htmlFor={id}>
        {labelYes}
      </label>
      <input
        key={id2}
        type="radio"
        id={id2}
        value={false}
        checked={!value}
        disabled={readonly}
        onChange={onRadioChange}
      />
      <label style={{ display: "inline" }} key={`${id2}label`} htmlFor={id2}>
        {labelNo}
      </label>
    </>
  );
};

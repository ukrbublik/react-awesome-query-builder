import React from "react";

export default (props) => {
  const {value, setValue, config, labelYes, labelNo, readonly, customProps = {}} = props;
  const customRadioYesProps = customProps.radioYes || {};
  const customRadioNoProps = customProps.radioNo || {};

  const onCheckboxChange = e => setValue(e.target.checked);
  const onRadioChange = e => setValue(e.target.value == "true");

  // return <>
  //     <input key={id}  type="checkbox" id={id} checked={!!value} disabled={readonly} onChange={onCheckboxChange} />
  //     <label style={{display: "inline"}} key={id+"label"}  htmlFor={id}>{value ? labelYes : labelNo}</label>
  // </>;

  return <>
    <input type="radio" value={true} checked={!!value} disabled={readonly} onChange={onRadioChange} { ...customRadioYesProps }/> {labelYes}
    <input type="radio" value={false} checked={!value} disabled={readonly} onChange={onRadioChange} { ...customRadioNoProps } /> {labelNo}
  </>;

};

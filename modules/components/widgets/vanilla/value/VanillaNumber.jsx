import React from 'react';

export default (props) => {
  const {value, setValue, config, readonly, min, max, step, placeholder} = props;
  const onChange = e => setValue(e.target.value);
  return (
    <input type="number"  value={value} placeholder={placeholder} disabled={readonly} min={min} max={max} step={step} onChange={onChange} />
  );
};

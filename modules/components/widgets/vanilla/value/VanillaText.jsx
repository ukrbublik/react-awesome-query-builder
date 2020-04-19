import React from 'react';

export default (props) => {
  const {value, setValue, config, readonly, placeholder} = props;
  const onChange = e => setValue(e.target.value);
  return (
    <input type="text"  value={value || ""} placeholder={placeholder}  disabled={readonly} onChange={onChange} />
  );
};

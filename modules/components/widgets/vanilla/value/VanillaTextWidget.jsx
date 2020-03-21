import React from 'react';

export default (props) => {
  const {value, setValue, config, readonly} = props;
  const onChange = e => setValue(e.target.value);
  return (
    <input type="text"  value={value || ""}  disabled={readonly} onChange={onChange} />
  );
};

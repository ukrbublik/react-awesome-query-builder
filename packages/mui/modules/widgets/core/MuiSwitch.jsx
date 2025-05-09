import React from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

export default ({value, setValue, label, checkedLabel, hideLabel, id, config, type}) => {
  const {renderSize} = config.settings;
  const onChange = e => setValue(e.target.checked);
  const onClick = () => setValue(!value);
  const postfix = type;
  const showLabel = value ? (checkedLabel || label) : label;
  const icon = value ? <LockIcon /> : <LockOpenIcon />;

  if (type == "lock") {
    if (hideLabel) {
      return <IconButton
        key={id+postfix}
        onClick={onClick}
        size={renderSize}
      >{icon}</IconButton>;
    } else {
      return <Button
        key={id+postfix}
        onClick={onClick}
        size={renderSize}
        startIcon={icon}
      >{showLabel}</Button>;
    }
  }

  return <FormControlLabel 
    control={<Switch
      checked={!!value}
      size={renderSize}
      onChange={onChange}
    />} 
    label={showLabel} 
  />;
};

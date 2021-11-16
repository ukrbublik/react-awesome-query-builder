import React from "react";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import LockIcon from "@material-ui/icons/Lock";

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
        size={"small"}
      >{icon}</IconButton>;
    } else {
      return <Button
        key={id+postfix}
        onClick={onClick}
        size={"small"}
        startIcon={icon}
      >{showLabel}</Button>;
    }
  }

  return <FormControlLabel 
    control={<Switch
      checked={!!value}
      size={"small"}
      onChange={onChange}
    />} 
    label={showLabel} 
  />;
};

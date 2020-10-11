import React from "react";
import Switch from "@material-ui/core/Switch";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export default (props) => {
  const { customProps, value, setValue, labelYes, labelNo, readonly } = props;

  const onChange = () => {
    setValue(!value);
  };

  const label = value ? labelYes || null : labelNo || null;

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={value || null}
            onChange={onChange}
            disabled={readonly}
            {...customProps}
          />
        }
        label={label}
      />
    </FormControl>
  );
};

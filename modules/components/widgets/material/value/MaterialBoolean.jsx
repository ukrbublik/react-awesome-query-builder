import React from "react";
import Switch from "@material-ui/core/Switch";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

export default (props) => {
  const { customProps, value, setValue, labelYes, labelNo, readonly } = props;

  const onChange = () => {
    setValue(!value);
  };
  
  return (
    <FormControl>
      <Typography component="div">
        <Grid component="label" container alignItems="center" spacing={0}>
          <Grid item component="span">{labelNo}</Grid>
          <Grid item component="span">
            <Switch
              checked={!!value}
              onChange={onChange}
              disabled={readonly}
              {...customProps}
            />
          </Grid>
          <Grid item component="span">{labelYes}</Grid>
        </Grid>
      </Typography>
    </FormControl>
  );
};

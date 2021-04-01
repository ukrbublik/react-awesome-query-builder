import React from "react";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreSharpIcon from "@material-ui/icons/ExpandMoreSharp";
import Popover from "@material-ui/core/Popover";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
}));

export default ({ valueSources, valueSrc, title, setValueSrc, readonly}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();


  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleOpenClose = (event) => {
    anchorEl ? handleClose() : handleOpen(event);
  };

  const handleChange = e => {
    if (e.target.value === undefined)
      return;
    setValueSrc(e.target.value);
    handleClose();
  };

  const renderOptions = (valueSources) => (
    valueSources.map(([srcKey, info]) => (
      <FormControlLabel 
        key={srcKey} 
        value={srcKey} 
        checked={valueSrc == srcKey || !valueSrc && srcKey == "value"} 
        control={<Radio />} 
        label={info.label}
      />
    ))
  );

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton size="small" onClick={toggleOpenClose}>
        <ExpandMoreSharpIcon />
      </IconButton>
    
      <Popover    
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handleClose}
        classes={{
          paper: classes.paper,
        }}
        disablePortal
      >
        <FormControl component="fieldset">
          <FormLabel component="legend">{title}</FormLabel>
          <RadioGroup value={valueSrc || "value"} onChange={handleChange}>
            {renderOptions(valueSources)}
          </RadioGroup>
        </FormControl>
      </Popover>
    </div>
  );
};

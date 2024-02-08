import React from "react";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreSharpIcon from "@material-ui/icons/ExpandMoreSharp";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Check from "@material-ui/icons/Check";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

export default ({ valueSources, valueSrc, title, setValueSrc, readonly}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleOpenClose = (event) => {
    anchorEl ? handleClose() : handleOpen(event);
  };

  const handleChange = (_e, srcKey) => {
    setValueSrc(srcKey);
    handleClose();
  };

  const renderOptions = (valueSources) => (
    valueSources.map(([srcKey, info]) => {
      const isSelected = valueSrc == srcKey || !valueSrc && srcKey == "value";
      const onClick = (e) => handleChange(e, srcKey);
      return (
        <MenuItem
          key={srcKey}
          value={srcKey}
          selected={isSelected}
          onClick={onClick}
        >
          {!isSelected && <ListItemText inset>{info.label}</ListItemText>}
          {isSelected && <><ListItemIcon><Check /></ListItemIcon>{info.label}</>}
        </MenuItem>
      );
    })
  );

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton size="small" onClick={toggleOpenClose}>
        <ExpandMoreSharpIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <FormControl component="fieldset" sx={{ p: 0 }}>
          <FormLabel component="legend" sx={{ p: 2, pt: 0, pb: 1 }}>{title}</FormLabel>
          {renderOptions(valueSources)}
        </FormControl>
      </Menu>
    </div>
  );
};

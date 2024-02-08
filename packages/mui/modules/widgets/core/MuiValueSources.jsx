import React from "react";
import IconButton from "@mui/material/IconButton";
import ExpandMoreSharpIcon from "@mui/icons-material/ExpandMoreSharp";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Check from "@mui/icons-material/Check";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

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

import React, { useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import ExpandMoreSharpIcon from "@mui/icons-material/ExpandMoreSharp";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Check from "@mui/icons-material/Check";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

const ValueSource = React.memo(({ valueSrc, srcKey, handleChange, info }) => {
  const isSelected = valueSrc == srcKey || !valueSrc && srcKey == "value";
  const onClick = useCallback(
    (e) => handleChange(e, srcKey),
    [handleChange, srcKey]
  );
  return (
    <MenuItem
      value={srcKey}
      selected={isSelected}
      onClick={onClick}
    >
      {!isSelected && <ListItemText inset>{info.label}</ListItemText>}
      {isSelected && <><ListItemIcon><Check /></ListItemIcon>{info.label}</>}
    </MenuItem>
  );
});

const ValueSources = React.memo(({ valueSources, valueSrc, title, setValueSrc, readonly}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, [setAnchorEl]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const toggleOpenClose = useCallback((event) => {
    anchorEl ? handleClose() : handleOpen(event);
  }, [handleClose, handleOpen, anchorEl]);

  const handleChange = useCallback((_e, srcKey) => {
    setValueSrc(srcKey);
    handleClose();
  }, [handleClose, setValueSrc]);

  const renderOptions = (valueSources) => (
    valueSources.map(([srcKey, info]) => {
      return <ValueSource
        key={srcKey}
        valueSrc={valueSrc}
        srcKey={srcKey}
        handleChange={handleChange}
        info={info}
      />;
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
});

export default ValueSources;

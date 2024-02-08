import React, {useCallback, useState} from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import FormControl from "@material-ui/core/FormControl";
import Tooltip from "@material-ui/core/Tooltip";

export default ({
  items, setField, selectedKey, readonly, placeholder, errorText,
  selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
}) => {
  const [open, setOpen] = useState(false);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const renderOptions = (fields, level = 0) => (
    Object.keys(fields).map(fieldKey => {
      const field = fields[fieldKey];
      const {items, path, label, disabled, matchesType, tooltip} = field;
      const prefix = "\u00A0\u00A0".repeat(level);
      let finalLabel = (
        <span>
          {prefix && <span>{prefix}</span>}
          {matchesType ? <b>{label}</b> : label}
        </span>
      );
      if (tooltip) {
        finalLabel = (
          <Tooltip title={tooltip} placement="left-start">
            {finalLabel}
          </Tooltip>
        );
      }
      if (items) {
        return [
          <ListSubheader disabled={disabled} key={path} disableSticky={true}>
            {finalLabel}
          </ListSubheader>,
          renderOptions(items, level+1),
        ];
      } else {
        res = (
          <MenuItem disabled={disabled} key={path} value={path}>
            {finalLabel}
          </MenuItem>
        );
        return res;
      }
    })
  );

  const onChange = useCallback(e => {
    if (e.target.value === undefined)
      return;
    setField(e.target.value);
  }, [setField]);

  const renderValue = useCallback((selectedValue) => {
    if (!readonly && !selectedValue)
      return placeholder;
    const findLabel = (fields) => {
      return fields.map(field => {
        if(!field.items) return field.path === selectedValue ? field.label : null;
        return findLabel(field.items);
      });
    };
    const label = findLabel(items).filter((v) => {
      if (Array.isArray(v)) {
        return v.some((value) => value !== null);
      } else {
        return v !== null;
      }
    }).pop();
    return label;
  }, [readonly, placeholder, items]);
  
  const hasValue = selectedKey != null;
  let tooltipText = selectedAltLabel || selectedFullLabel;
  if (tooltipText == selectedLabel)
    tooltipText = null;
  let res = (
    <Select
      error={!!errorText}
      variant="standard"
      autoWidth
      displayEmpty
      placeholder={placeholder}
      onChange={onChange}
      value={hasValue ? selectedKey : ""}
      disabled={readonly}
      renderValue={renderValue}
      size="small"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
    >
      {renderOptions(items)}
    </Select>
  );
  if (tooltipText) {
    res = (
      <Tooltip title={!open ? tooltipText : null}>{res}</Tooltip>
    );
  }
  res = <FormControl>{res}</FormControl>;
  return res;
};

import React from "react";
import Switch from "@mui/material/Switch";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

export default (props) => {
  const { customProps, value, setValue, labelYes, labelNo, readonly, config } = props;
  const {renderSize} = config.settings;

  const onChange = () => {
    setValue(!value);
  };

  return (
    <FormControl size={renderSize}>
      <Typography component="div">
        {/* tip: don't use Grid here - `item` prop of legacy Grid is removed in v7+ */}
        <label style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
          <span>{labelNo}</span>
          <span>
            <Switch
              checked={!!value}
              onChange={onChange}
              disabled={readonly}
              size={renderSize}
              {...customProps}
            />
          </span>
          <span>{labelYes}</span>
        </label>
      </Typography>
    </FormControl>
  );
};

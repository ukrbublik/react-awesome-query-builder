import React from "react";
import FormControl from "@mui/material/FormControl";
// import Checkbox from "@material-ui/core/Checkbox";
// import FormControlLabel from "@material-ui/core/FormControlLabel";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import styled from "@emotion/styled";

const StyledButtonGroup = styled(ButtonGroup)`
  & .MuiButtonGroup-grouped {
    padding: 2px 10px 1px 10px !important;
  }
`;

export default ({id, not, setNot, conjunctionOptions, setConjunction, disabled, readonly, config, showNot, notLabel}) => {
  //TIP: disabled=true if only 1 rule; readonly=true if immutable mode
  const conjsCount = Object.keys(conjunctionOptions).length;
  const lessThenTwo = disabled;

  const renderOptions = () => 
    Object.keys(conjunctionOptions).map(key => {
      const {id, name, label, checked} = conjunctionOptions[key];
      let postfix = setConjunction.isDummyFn ? "__dummy" : "";
      if (readonly && !checked)
        return null;
      return (
        <Button 
          key={id+postfix} 
          id={id+postfix} 
          color={checked ? "primary" : "neutral"} 
          value={key} 
          onClick={onClick.bind(null, key)} 
          disabled={readonly}
        >
          {label}
        </Button>
      );
    });
  
  const renderNot = () => {
    if (readonly && !not)
      return null;
    return (
      <Button 
        key={id}
        id={id + "__not"}
        color={not ? "secondary" : "neutral"} 
        onClick={onNotClick.bind(null, !not)} 
        disabled={readonly}
      >
        {notLabel || "NOT"}
      </Button>
    );
  };

  const onClick = value => setConjunction(value);
  const onNotClick = checked => setNot(checked);

  return (
    <FormControl>
      <StyledButtonGroup 
        disableElevation 
        variant="contained" 
        size="small"
        disabled={readonly}
      >
        {showNot && renderNot()}
        {conjsCount > 1 && !lessThenTwo && renderOptions()}
      </StyledButtonGroup>
    </FormControl>
  );
  
};

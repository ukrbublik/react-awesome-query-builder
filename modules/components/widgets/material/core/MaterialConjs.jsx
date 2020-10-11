import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";

export default ({id, not, setNot, conjunctionOptions, setConjunction, disabled, readonly, config}) => {

  const renderOptions = () => 
    Object.keys(conjunctionOptions).map(key => {
      const {id, name, label, checked} = conjunctionOptions[key];
      let postfix = setConjunction.isDummyFn ? "__dummy" : "";
      return (
        <Button 
          key={id+postfix} 
          id={id+postfix} 
          color={checked ? "primary" : "default"} 
          value={key} 
          onClick={onClick.bind(null, key)} 
          disabled={disabled}
        >
          {label}
        </Button>
      );
    });
  
  const renderNot = () => {
    return (
      <Button 
        key={id}
        id={id + "__not"}
        color={not ? "secondary" : "default"} 
        onClick={onNotClick.bind(null, !not)} 
        disabled={disabled}
      >
        {config.settings.notLabel || "NOT"}
      </Button>
    );
  };

  const onClick = value => setConjunction(value);
  const onNotClick = checked => setNot(checked);

  return (
    <FormControl>
      <ButtonGroup 
        disableElevation 
        variant="contained" 
        size="small" 
        disabled={disabled}
      >
        {config.settings.showNot && renderNot()}
        {renderOptions()}
      </ButtonGroup>
    </FormControl>
  );
  
};

import React from "react";
import FormControl from "@material-ui/core/FormControl";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";

export default ({id, not, setNot, conjunctionOptions, setConjunction, disabled, readonly, config, showNot, notLabel}) => {
  //TIP: disabled=true if only 1 rule; readonly=true if immutable mode
  const conjsCount = Object.keys(conjunctionOptions).length;
  const lessThenTwo = disabled;
  const {forceShowConj} = config.settings;
  const showConj = forceShowConj || conjsCount > 1 && !lessThenTwo;

  const renderOptions = () => 
    Object.keys(conjunctionOptions).map(key => {
      const {id, name, label, checked} = conjunctionOptions[key];
      const postfix = setConjunction.isDummyFn ? "__dummy" : "";
      if ((readonly || disabled) && !checked)
        return null;
      return (
        <Button 
          key={id+postfix} 
          id={id+postfix} 
          color={checked ? "primary" : "default"} 
          value={key} 
          onClick={onClick.bind(null, key)} 
          disabled={readonly || disabled}
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
        color={not ? "secondary" : "default"} 
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
      <ButtonGroup 
        disableElevation 
        variant="contained" 
        size="small" 
        disabled={readonly}
      >
        {showNot && renderNot()}
        {showConj && renderOptions()}
      </ButtonGroup>
    </FormControl>
  );
  
};

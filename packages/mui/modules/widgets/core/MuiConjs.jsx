import React, { useCallback } from "react";
import FormControl from "@mui/material/FormControl";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";

const Conj = React.memo(({
  conjKey, id, name, label, checked,
  setConjunction, readonly, disabled,
}) => {
  const onClick = useCallback(() => {
    setConjunction(conjKey);
  }, [conjKey, setConjunction]);
  const postfix = setConjunction.isDummyFn ? "__dummy" : "";
  if ((readonly || disabled) && !checked) {
    return null;
  }
  return (
    <Button 
      key={id+postfix} 
      id={id+postfix} 
      color={"primary"} 
      disableElevation
      variant={checked ? "contained" : "outlined"}
      sx={{
        backgroundColor: checked ? "primary.main" : "background.paper",
      }}
      value={conjKey} 
      onClick={onClick} 
      disabled={readonly || disabled}
    >
      {label}
    </Button>
  );
});

const Conjs = React.memo(({
  id, not, setNot, conjunctionOptions, setConjunction, disabled, readonly, config, showNot, notLabel
}) => {
  //TIP: disabled=true if only 1 rule; readonly=true if immutable mode
  const conjsCount = Object.keys(conjunctionOptions).length;
  const lessThenTwo = disabled;
  const {forceShowConj, renderSize} = config.settings;
  const showConj = forceShowConj || conjsCount > 1 && !lessThenTwo;

  const renderOptions = () => 
    Object.keys(conjunctionOptions).map(conjKey => {
      const { id, name, label, checked } = conjunctionOptions[conjKey];
      const conjProps = {
        conjKey, id, name, label, checked,
        setConjunction, readonly, disabled,
      };
      if (disabled && !checked) {
        return null;
      }
      return (
        <Conj key={id} {...conjProps} />
      );
    });
  
  const onNotClick = useCallback(() => {
    setNot(!not);
  }, [not, setNot]);

  const renderNot = () => {
    if (readonly && !not)
      return null;
    return (
      <Button 
        size={renderSize}
        key={id}
        id={id + "__not"}
        color={"error"} 
        disableElevation
        variant={not ? "contained" : "outlined"}
        sx={{
          backgroundColor: not ? "error.main" : "background.paper",
        }}
        onClick={onNotClick} 
        disabled={readonly}
      >
        {notLabel || "NOT"}
      </Button>
    );
  };

  return (
    <FormControl>
      <ButtonGroup 
        disableElevation 
        size={renderSize}
        disabled={readonly}
        sx={{
          marginLeft: "1px"
        }}
      >
        {showNot && renderNot()}
        {showConj && renderOptions()}
      </ButtonGroup>
    </FormControl>
  );
});

export default Conjs;

import React from "react";
import { Button, ButtonGroup } from "reactstrap";

export default ({
  id,
  not,
  setNot,
  conjunctionOptions,
  setConjunction,
  disabled,
  readonly,
  config,
  showNot,
  notLabel,
}) => {
  
  const conjsCount = Object.keys(conjunctionOptions).length;
  const lessThenTwo = disabled;
  const { forceShowConj } = config.settings;
  const showConj = forceShowConj || (conjsCount > 1 && !lessThenTwo);

  const renderOptions = () =>
    Object.keys(conjunctionOptions).map((key) => {
      const { id, name, label, checked } = conjunctionOptions[key];
      let postfix = setConjunction.isDummyFn ? "__dummy" : "";
      if ((readonly || disabled) && !checked) return null;
      return (
        <Button
          key={id + postfix}
          id={id + postfix}
          size="sm"
          color={checked ? "primary" : "secondary"}
          value={key}
          onClick={onClick.bind(null, key)}
          disabled={readonly || disabled}
        >
          {label}
        </Button>
      );
    });

  const renderNot = () => {
    if (readonly && !not) return null;
    return (
      <Button
        key={id}
        id={id + "__not"}
        size="sm"
        color={not ? "danger" : "secondary"}
        onClick={onNotClick.bind(null, !not)}
        disabled={readonly}
      >
        {notLabel || "NOT"}
      </Button>
    );
  };

  const onClick = (value) => setConjunction(value);
  const onNotClick = (checked) => setNot(checked);

  return (
    <ButtonGroup size="sm" disabled={readonly}>
      {showNot && renderNot()}
      {showConj && renderOptions()}
    </ButtonGroup>
  );
};

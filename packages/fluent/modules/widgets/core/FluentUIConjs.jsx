import React from "react";
import { DefaultButton } from "@fluentui/react";

const FluentUIConjs = (props) => {
  var id = props.id,
    not = props.not,
    setNot = props.setNot,
    conjunctionOptions = props.conjunctionOptions,
    setConjunction = props.setConjunction,
    disabled = props.disabled,
    readonly = props.readonly,
    config = props.config,
    showNot = props.showNot,
    notLabel = props.notLabel;

  var conjsCount = Object.keys(conjunctionOptions).length;
  var lessThenTwo = disabled;
  var forceShowConj = config.settings.forceShowConj;
  var showConj = forceShowConj || (conjsCount > 1 && !lessThenTwo);

  const styleNot = {
    backgroundColor: not ?  "#fed9cc" : "#ffffff"
  };

  var renderOptions = function renderOptions() {
    return Object.keys(conjunctionOptions).map(function (key) {
      var _conjunctionOptions$k = conjunctionOptions[key],
        id = _conjunctionOptions$k.id,
        name = _conjunctionOptions$k.name,
        label = _conjunctionOptions$k.label,
        checked = _conjunctionOptions$k.checked;
      var postfix = setConjunction.isDummyFn ? "__dummy" : "";
      if ((readonly || disabled) && !checked) return null;
      return (
        <DefaultButton
          toggle={setConjunction}
          checked={checked}
          key={id + postfix}
          id={id + postfix}
          value={key}
          onClick={onClick.bind(null, key)}
          disabled={readonly || disabled}
          text={label}
        />
      );
    });
  };

  var renderNot = function renderNot() {
    if (readonly && !not) return null;
    return (
      <DefaultButton
        toggle={setNot}
        checked={not}
        key={id}
        id={id + "__not"}
        onClick={onNotClick.bind(null, !not)}
        disabled={readonly}
        text={notLabel || "NOT"}
        style={styleNot}
      />
    );
  };

  var onClick = function onClick(value) {
    return setConjunction(value);
  };

  var onNotClick = function onNotClick(not) {
    return setNot(not);
  };

  return (
    <React.Fragment>
      {showNot && renderNot()}
      {showConj && renderOptions()}
    </React.Fragment>
  );
};

export default FluentUIConjs;

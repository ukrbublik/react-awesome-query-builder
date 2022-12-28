import React from "react";

export default ({id, not, setNot, conjunctionOptions, setConjunction, disabled, readonly, config, showNot, notLabel}) => {
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
      return [
        <input key={id+postfix} type="radio" id={id+postfix} name={name+postfix} checked={checked} disabled={readonly || disabled} value={key} onChange={onChange} />
        ,
        <label key={id+postfix+"label"} htmlFor={id+postfix}>{label}</label>
      ];
    });
  
  const renderNot = () => {
    const postfix = "not";
    return [
      <input key={id+postfix}  type="checkbox" id={id+postfix} checked={not} disabled={readonly} onChange={onNotChange} />
      ,
      <label key={id+postfix+"label"}  htmlFor={id+postfix}>{notLabel || "NOT"}</label>
    ];
  };

  const onChange = e => setConjunction(e.target.value);

  const onNotChange = e => setNot(e.target.checked);

  return [
    showNot && renderNot(),
    showConj && renderOptions()
  ];
  
};

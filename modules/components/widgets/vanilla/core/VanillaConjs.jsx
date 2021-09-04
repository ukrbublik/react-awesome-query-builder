import React from "react";

export default ({ id, not, setNot, conjunctionOptions, setConjunction, disabled, readonly, config, showNot, notLabel }) => {
  const conjsCount = Object.keys(conjunctionOptions).length;
  const lessThenTwo = disabled;

  const renderOptions = () =>
    Object.keys(conjunctionOptions).map(key => {
      const { id, name, label, checked } = conjunctionOptions[key];
      let postfix = setConjunction.isDummyFn ? "__dummy" : "";
      return (<div className="d-inline custom-control custom-radio mr-2" key={id + postfix}>


        <input type="radio" id={id + postfix} className="custom-control-input" name={name + postfix} checked={checked} disabled={readonly} value={key} onChange={onChange} />

        <label htmlFor={id + postfix} className="custom-control-label">{label}</label>
      </div>);
    });

  const renderNot = () => {
    return (<div className="d-inline custom-control custom-checkbox mr-2" key={id}>

      <input name="checkbox" type="checkbox" className="custom-control-input"
        id={id + "__not"} checked={not} disabled={readonly} onChange={onNotChange} />
      <label htmlFor={id + "__not"} className="custom-control-label">{notLabel || "NOT"}</label>
      {/* <input key={id} type="checkbox" id={id + "__not"} checked={not} disabled={readonly} onChange={onNotChange} /> */}

      {/* <label key={id + "label"} htmlFor={id + "__not"}>{notLabel || "NOT"}</label> */}
    </div>
    );
  };

  const onChange = e => setConjunction(e.target.value);

  const onNotChange = e => setNot(e.target.checked);

  return [
    showNot && renderNot(),
    conjsCount > 1 && !lessThenTwo && renderOptions()
  ];

};

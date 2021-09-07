import React, { useMemo } from "react";
import { Form } from '@shoutout-labs/shoutout-themes-enterprise';
import "./VanilaValueSources.scss";
export default ({ config, valueSources, valueSrc, title, setValueSrc, readonly }) => {
  // const renderOptions = (valueSources) => (
  //   valueSources.map(([srcKey, info]) => (
  //     <option key={srcKey} value={srcKey}>{info.label}</option>
  //   ))
  // );

  const options = useMemo(() => {
    return valueSources.map(([srcKey, info]) => (
      // <option key={srcKey} value={srcKey}>{info.label}</option>
      { key: srcKey, label: info.label }
    ))
  }, [valueSources])

  const onChange = e => setValueSrc(e[0] ? e[0].key : "");

  const selectedValue = useMemo(() => {
    if (valueSrc) {
      return [options.find((item) => item.key === valueSrc)];
    }
  }, [valueSrc, options])
  return (
    <Form.Select
      id="select-vsrc-typeahead"
      selected={selectedValue}
      onChange={onChange}
      disabled={readonly}
      options={options}
      size="sm"
      placeholder="Select"
      labelKey="label"
    />
  )
  // return (
  //   <select
  //     onChange={onChange}
  //     value={valueSrc}
  //     disabled={readonly}
  //   >
  //     {renderOptions(valueSources)}
  //   </select>
  // );
};

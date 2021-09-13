import React, { useCallback, useMemo } from "react";
import { Form } from "@shoutout-labs/shoutout-themes-enterprise";
export default (props) => {
  const {
    value,
    setValue,
    config,
    readonly,
    placeholder,
    maxLength,
    // listValues = [],
    // asyncListValues = [],
    fieldDefinition,
    ...rest
  } = props;

  // const [optionsList, setOptionsList] = useState([]);

  // const listValues = asyncListValues;

  const selectedValue = useMemo(() => {
    // const textValue = value || "";
    // if (listValues.length > 0) {
    //   return textValue
    //     ? [listValues.find((item) => item.value === textValue)]
    //     : [];
    // }
    return value ? [value] : [];
  }, [value]);

  const onChangeValue = useCallback(
    (e) => {
      // console.debug("on slect value:", e, e.length > 0 ? e[0].value : undefined);
      setValue(e.length > 0 ? e[0].value : undefined);
      // let val = e.target.value;
      // if (val === "") val = undefined; // don't allow empty value
      // setValue(val);
    },
    [setValue]
  );

  // const onChangeInput = (text) => {
  //   if (fieldDefinition && fieldDefinition.asyncFetch) {
  //     setOptionsList(fieldDefinition.asyncFetch(text).values);
  //   }
  // };

  // useEffect(() => {
  //   if (fieldDefinition && fieldDefinition.asyncFetch) {
  //     setOptionsList(fieldDefinition.asyncFetch("").values);
  //   }
  // }, []);

  const options = useMemo(() => {
    //This is a hack to pass the values since asyncFetch isn't functioning
    if (fieldDefinition && fieldDefinition.asyncFetch) {
      return fieldDefinition.asyncFetch("").values || [];
    }
    return [];
  }, [fieldDefinition]);
  // if (listValues.length > 0) {

  // const selectedValue = value
  //   ? [listValues.find((item) => item.value === value)]
  //   : [];
  console.debug("options list:", options);
  return (
    <Form.Select
      labelKey="title"
      id="select-typeahead"
      onChange={onChangeValue}
      selected={selectedValue}
      disabled={readonly}
      options={options}
      // onInputChange={onChangeInput}
      size="sm"
      placeholder={placeholder}
      {...rest}
    />
  );
  // }

  const onChange = (e) => {
    let val = e.target.value;
    if (val === "") val = undefined; // don't allow empty value
    setValue(val);
  };
  // const textValue = value || "";

  return (
    <Form.Control
      size="sm"
      type="text"
      value={selectedValue}
      placeholder={placeholder}
      disabled={readonly}
      onChange={onChange}
      maxLength={maxLength}
    />
    // <input
    //   type="text"
    //   value={textValue}
    //   placeholder={placeholder}
    //   disabled={readonly}
    //   onChange={onChange}
    //   maxLength={maxLength}
    // />
  );
};

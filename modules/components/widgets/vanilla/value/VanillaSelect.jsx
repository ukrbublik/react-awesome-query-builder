import React, { useMemo, useCallback } from "react";
// import { mapListValues } from "../../../../utils/stuff";
import { Form } from "@shoutout-labs/shoutout-themes-enterprise";
export default ({
  listValues=[],
  value,
  setValue,
  allowCustomValues,
  readonly,
  ...rest
}) => {
  // const renderOptions = () =>
  //   mapListValues(listValues, ({title, value}) => {
  //     return <option key={value} value={value}>{title}</option>;
  //   });

  const onChange = useCallback(
    (e) => {
      setValue(e[0] ? e[0].value : "");
    },
    [setValue]
  );

  const selectedValue = useMemo(() => {
    if (value) {
      return [
        listValues.find((item) => item.value === value) || {
          title: value,
          value,
        },
      ];
    }
    return [];
  }, [value, listValues]);

  return (
    <Form.Select
      labelKey="title"
      id="select-typeahead"
      onChange={onChange}
      selected={selectedValue}
      disabled={readonly}
      options={listValues}
      size="sm"
      placeholder="Select"
      {...rest}
    />
  );
  // <select
  //     onChange={onChange}
  //     value={hasValue ? value : ""}
  //     disabled={readonly}
  //   >
  //     {!hasValue && <option disabled value={""}></option>}
  //     {renderOptions()}
  //   </select>
};

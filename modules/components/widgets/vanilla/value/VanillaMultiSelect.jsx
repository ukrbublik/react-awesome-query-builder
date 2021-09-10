import React, { useMemo, useCallback } from "react";
// import { mapListValues } from "../../../../utils/stuff";
import { Form } from "@shoutout-labs/shoutout-themes-enterprise";

export default ({ listValues, value, setValue, allowCustomValues, readonly }) => {

  const onChange = useCallback(e => {
    setValue(e.length > 0 ? e.map((item) => item.value) : undefined);
  },
    [setValue]);

  const selectedValues = useMemo(() => {
    if (value) {
      return listValues.filter((item) => value.indexOf(item.value) > -1);
    }
    return [];
  }, [value, listValues])

  return (
    <Form.Select
      labelKey="title"
      id="select-typeahead-multi"
      onChange={onChange}
      selected={selectedValues}
      disabled={readonly}
      options={listValues}
      size="sm"
      placeholder="Select"
      multiple={true}
      clearButton={true}
    />
  )

};

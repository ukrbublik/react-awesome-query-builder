import React, { FC, memo } from "react";
import Creatable from "react-select/creatable";
import { MultiValue } from "react-select";
import { SpelConcatPart } from "react-awesome-query-builder";

interface OptionItem {
  id: string
  label: string
  properties?: any
  type?: any
  __isNew__?: boolean
}

const options: OptionItem[] = [
  {
    id: "foo",
    label: "Foo",
    properties: ["REQUIRED", "CREATE", "UPDATE"],
    type: { format: "INTEGER" },
  },
  {
    id: "bar",
    label: "Bar",
    properties: ["REQUIRED", "CREATE", "UPDATE"],
    type: { format: "INTEGER" },
  },
];


interface Iprops {
  k: string
  value?: SpelConcatPart[]
  setValue(value: SpelConcatPart[]): void
}

const MltSelector: FC<Iprops> = ({
  k,
  value,
  setValue,
}) => {
  function initMltSelectValueHandler(list: OptionItem[], val: SpelConcatPart[]) {
    if (val) {
      return val.map((item: SpelConcatPart) => {
        let res = item.type != "const" && list && list.find((obj) => obj.id === item.value);
        if (!res) {
          res = { id: item.value, label: item.value, __isNew__: true };
        }
        return res;
      });
    }
    return [];
  }

  function changeHandler(values: MultiValue<OptionItem>, actionMeta: any, setValue: (value: SpelConcatPart[]) => void): any[] {
    const res = values.map((val) => ({
      value: val.id || val.label,
      type: val.__isNew__ ? "const" : "property"
    }));
    setValue(res as SpelConcatPart[]);
    return res;
  }

  return (
    <Creatable
      menuPortalTarget={document.body}
      key={k}
      isMulti
      options={options}
      value={initMltSelectValueHandler(options, value)}
      getOptionValue={(option: OptionItem) => option.id}
      getOptionLabel={(option: OptionItem) => option.label}
      onChange={(values, actionMeta) => {
        changeHandler(values, actionMeta, setValue);
      }}
    />
  );
};

export default memo(MltSelector);

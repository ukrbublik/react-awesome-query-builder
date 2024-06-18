import React, { FC, memo, useCallback, useMemo } from "react";
import Creatable from "react-select/creatable";
import { MultiValue } from "react-select";
import { SpelConcatPart, ListItem } from "@react-awesome-query-builder/ui";

interface OptionItem {
  id: string
  label: string
  properties?: any
  type?: any
  __isNew__?: boolean
}


interface Iprops {
  k: string;
  value?: SpelConcatPart[];
  setValue(value: SpelConcatPart[]): void;
  listValues: ListItem[];
}

const MltSelector: FC<Iprops> = ({
  k,
  value,
  setValue,
  listValues,
}) => {
  const options: OptionItem[] = useMemo(() => listValues?.map(({value, title}) => ({
    id: value?.toString(),
    label: title ?? "",
    properties: ["REQUIRED", "CREATE", "UPDATE"],
    type: { format: "INTEGER" },
  })), [listValues]);

  const initMltSelectValueHandler = (list: OptionItem[], val: SpelConcatPart[]) => {
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
  };

  const onChange = useCallback((values: MultiValue<OptionItem>, actionMeta: any): any[] => {
    const res = values.map((val) => ({
      value: val.id || val.label,
      type: val.__isNew__ ? "const" : "property"
    }));
    setValue(res as SpelConcatPart[]);
    return res;
  }, [setValue]);

  const getOptionValue = useCallback((option: OptionItem) => option.id, []);
  const getOptionLabel = useCallback((option: OptionItem) => option.label, []);

  const aValue = useMemo(() => initMltSelectValueHandler(options, value!), [value]);

  return (
    <Creatable
      menuPortalTarget={document.body}
      menuPosition={"fixed"}
      key={k}
      isMulti
      options={options}
      value={aValue}
      getOptionValue={getOptionValue}
      getOptionLabel={getOptionLabel}
      onChange={onChange}
    />
  );
};

export default memo(MltSelector);

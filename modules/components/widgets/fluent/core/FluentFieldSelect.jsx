import React from "react";
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';

export default ({items, setField, selectedKey, readonly, placeholder}) => {
  const getOptions = (fields, level = 0) => (
    fields.map(field => {
      const {items, path, label, disabled} = field;
      //const prefix = "\u00A0\u00A0".repeat(level);
      if (items) {
        return [
          {
            key: path,
            text: label,
            itemType: DropdownMenuItemType.Header,
            disabled
          },
          getOptions(items, level+1)
        ];
      } else {
        return {
          key: path,
          text: label,
          disabled
        };
      }
    }).flat(Infinity)
  );

  const onChange = (_e, item) => setField(item.key);
  
  const hasValue = selectedKey != null;
  return (
    <Dropdown 
      placeholder={placeholder}
      onChange={onChange}
      selectedKey={hasValue ? selectedKey : ""}
      disabled={readonly}
      options={getOptions(items)}
    />
  );
};

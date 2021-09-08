import React, { useCallback, useMemo } from "react";
import { Form } from "@shoutout-labs/shoutout-themes-enterprise";

export default ({ items, setField, selectedKey, readonly, ...rest }) => {

  // const [selectedField, setSelectedField] = useState([]);

  // console.debug("props:", rest);

  // const renderOptions = (fields) => (
  //   Object.keys(fields).map(fieldKey => {
  //     const field = fields[fieldKey];
  //     const { items, path, label, disabled } = field;
  //     if (items) {
  //       return <optgroup disabled={disabled} key={path} label={label}>{renderOptions(items)}</optgroup>;
  //     } else {
  //       return <option disabled={disabled} key={path} value={path}>{label}</option>;
  //     }
  //   })
  // );

  const onChange = useCallback((e) => {

    setField(e[0] ? e[0].path : "");
  }, [setField])


  const options = useMemo(() => {


    return items.reduce((result, field) => {
      // const field = dataset[fieldKey];
      const { items: subItems, path, label, disabled } = field;

      if (!disabled) {
        if (subItems) {
          subItems.forEach(item => {
            if (!item.disabled) {
              result.push({ "_grp": label, path: item.path, label: item.label });
            }
          })
        } else {
          result.push({ path: path, label });
        }
      }
      // if (items) {
      //   return <optgroup disabled={disabled} key={path} label={label}>{renderOptions(items)}</optgroup>;
      // } else {
      //   result.push(<option disabled={disabled} key={path} value={path}>{label}</option>);
      // }
      return result;
    }, [])
  }, [items])



  const selectedField = useMemo(() => {
    if (selectedKey) {
      return [options.find((item) => item.path === selectedKey)];
    }
    return [];
  }, [selectedKey])

  return (
    <Form.Select
      id="select-field-typeahead"
      selected={selectedField}
      onChange={onChange}
      disabled={readonly}
      options={options}
      size="sm"
      placeholder="Select"
      groupBy="_grp"
      labelKey="label"
    />
    // <select 
    //   onChange={onChange}
    //   value={hasValue ? selectedKey : ""}
    //   disabled={readonly}
    // >
    //   {!hasValue && <option disabled value={""}></option>}
    //   {renderOptions(items)}
    // </select>
  );
};

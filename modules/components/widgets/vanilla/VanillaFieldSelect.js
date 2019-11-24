export default ({items, setField, selectedKey}) => {
  const renderOptions = (fields) => (
    Object.keys(fields).map(fieldKey => {
        const field = fields[fieldKey];
        const {items, path, label} = field;
        if (items) {
            return <optgroup label={label}>{renderOptions(items)}</optgroup>;
        } else {
            return <option value={path}>{label}</option>;
        }
    })
  );

  const onChange = e => setField(e.target.value);

  return (
    <select 
      onChange={onChange}
      value={selectedKey}
    >{renderOptions(items)}</select>
  );
};

const isObject = (v) => (typeof v == "object" && v !== null); // object or array
const listValue = (v, title) => (isObject(v) ? v : {value: v, title: (title !== undefined ? title : v)});

// convert {<value>: <title>, ..} or [value, ..] to normal [{value, title}, ..]
export const listValuesToArray = (listValuesObj) => {
  if (!isObject(listValuesObj))
    return listValuesObj;
  if (Array.isArray(listValuesObj))
    return listValuesObj.map(v => listValue(v));
  
  let listValuesArr = [];
  for (let v in listValuesObj) {
    const title = listValuesObj[v];
    listValuesArr.push(listValue(v, title));
  }
  return listValuesArr;
};

// listValues can be {<value>: <title>, ..} or [{value, title}, ..] or [value, ..]
export const getItemInListValues = (listValues, value) => {
  if (Array.isArray(listValues)) {
    const values = listValues.map(v => listValue(v));
    return values.find(v => (v.value === value)) || values.find(v => (`${v.value}` === value));
  } else {
    return listValues[value] !== undefined ? listValue(value, listValues[value]) : undefined;
  }
};

export const getTitleInListValues = (listValues, value) => {
  if (listValues == undefined)
    return value;
  const it = getItemInListValues(listValues, value);
  return it !== undefined ? it.title : value;
};

export const getValueInListValues = (listValues, value) => {
  if (listValues == undefined)
    return value;
  const it = getItemInListValues(listValues, value);
  return it !== undefined ? it.value : value;
};

export const mapListValues = (listValues, mapFn) => {
  let ret = [];
  if (Array.isArray(listValues)) {
    for (let v of listValues) {
      const lv = mapFn(listValue(v));
      if (lv != null)
        ret.push(lv);
    }
  } else {
    for (let value in listValues) {
      const lv = mapFn(listValue(value, listValues[value]));
      if (lv != null)
        ret.push(lv);
    }
  }
  return ret;
};

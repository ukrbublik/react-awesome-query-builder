import { Utils } from "@react-awesome-query-builder/ui";
const { getItemInListValues, listValuesToArray } = Utils.ListUtils;
const { isObjectOrArray } = Utils.OtherUtils;


export const defaultTreeDataMap = {id: "value", pId: "parent", rootPId: undefined};

// converts from treeData to treeDataSimpleMode format (https://ant.design/components/tree-select/)
// ! modifies value of `treeData`
const flatizeTreeData = (treeData) => {
  const tdm = defaultTreeDataMap;

  let rind;
  let len;

  const _flatize = (node, root, lev) => {
    if (node.children) {
      if (lev == 1)
        node[tdm.pId] = tdm.rootPId; //optional?
      const childrenCount = node.children.length;
      for (let c of node.children) {
        c[tdm.pId] = node[tdm.id];
        rind++;
        root.splice(rind, 0, c); //instead of just push
        len++;
        _flatize(c, root, lev + 1);
      }
      delete node.children;
      if (childrenCount == 0) {
        root.splice(rind, 1);
        rind--;
        len--;
      }
    }
  };

  if (Array.isArray(treeData)) {
    len = treeData.length;
    for (rind = 0 ; rind < len ; rind++) {
      const c = treeData[rind];
      if (!isObjectOrArray(c))
        continue;
      if (c[tdm.pId] !== undefined && c[tdm.pId] != tdm.rootPId)
        continue; //not lev 1
      _flatize(c, treeData, 1);
    }
  }
  
  return treeData;
};

const getPathInListValues = (listValues, value) => {
  const tdm = defaultTreeDataMap;
  const it = getItemInListValues(listValues, value);
  const parentId = it ? it[tdm.pId] : undefined;
  const parent = parentId ? listValues.find(v => v[tdm.id] === parentId) : undefined;
  return parent ? [parent.value, ...getPathInListValues(listValues, parent.value)] : [];
};

const getChildrenInListValues = (listValues, value) => {
  const tdm = defaultTreeDataMap;
  const it = getItemInListValues(listValues, value);
  return it ? listValues.filter(v => v[tdm.pId] === it[tdm.id]).map(v => v.value) : [];
};

// ! modifies value of `treeData`
const extendTreeData = (treeData, fieldSettings, isMulti) => {
  for (let node of treeData) {
    node.path = getPathInListValues(treeData, node.value);
    if (fieldSettings.treeSelectOnlyLeafs != false) {
      const childrenValues = getChildrenInListValues(treeData, node.value);
      if (!isMulti) {
        node.selectable = (childrenValues.length == 0);
      }
    }
  }
  return treeData;
};

export const normalizeListValues = (listValues, type, fieldSettings) => {
  const isTree = ["treeselect", "treemultiselect"].includes(type);
  const isMulti = ["multiselect", "treemultiselect"].includes(type);
  if (isTree) {
    listValues = listValuesToArray(listValues);
    listValues = flatizeTreeData(listValues);
    listValues = extendTreeData(listValues, fieldSettings, isMulti);
  }
  return listValues;
};

export const removePrefixPath = (selectedPath, parentPath) => {
  if (!selectedPath)
    return selectedPath;
  let isPrefix = true;
  for (let i = 0 ; i < parentPath.length ; i++) {
    const part = parentPath[i];
    if (selectedPath[i] !== undefined && part == selectedPath[i]) {
      //ok
    } else {
      isPrefix = false;
      break;
    }
  }
  return isPrefix ? selectedPath.slice(parentPath.length) : selectedPath;
};

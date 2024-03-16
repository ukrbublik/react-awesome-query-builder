import omit from "lodash/omit";
import Immutable from "immutable";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldSrc,
  extendConfig} from "./configUtils";
import {
  getOperatorsForField, getWidgetForFieldOp, whatRulePropertiesAreCompleted,
  selectTypes, getValueSourcesForFieldOp,
} from "../utils/ruleUtils";
import {defaultValue, getFirstDefined, deepEqual} from "../utils/stuff";
import {getItemInListValues} from "../utils/listValues";
import {defaultOperatorOptions} from "../utils/defaultUtils";
import {fixPathsInTree, getItemByPath, getFlatTree} from "../utils/treeUtils";
import {setFuncDefaultArg} from "../utils/funcUtils";
import {queryString} from "../export/queryString";
import * as constants from "../i18n/validation/constains";
import { translateValidation } from "../i18n";

export { translateValidation };

const typeOf = (v) => {
  if (typeof v == "object" && v !== null && Array.isArray(v))
    return "array";
  else
    return (typeof v);
};

const isTypeOf = (v, type) => {
  if (typeOf(v) == type)
    return true;
  if (type == "number" && !isNaN(v))
    return true; //can be casted
  return false;
};

// tip: If showErrorMessage is false, this function will always return true
export const isValidTree = (tree, config) => {
  return getTreeBadFields(tree, config).length === 0;
};

// tip: If showErrorMessage is false, this function will always return []
// tip: If LHS is func, func key will be used to put in array of bad fields (naive)
export const getTreeBadFields = (tree, config) => {
  const {showErrorMessage} = config.settings;
  let badFields = [];

  function _processNode (item, path, lev) {
    const id = item.get("id");
    const children = item.get("children1");
    const valueError = item.getIn(["properties", "valueError"]);
    const fieldError = item.getIn(["properties", "fieldError"]);
    const field = item.getIn(["properties", "field"]);
    const fieldStr = field?.get?.("func") ?? field;
    const hasValueError = valueError?.size > 0 && valueError.filter(v => v != null).size > 0
    const isBad = hasValueError || !!fieldError;
    if (isBad && showErrorMessage) {
      // for showErrorMessage=false valueError/fieldError is used to hold last error, but actual value is always valid
      badFields.push(fieldStr);
    }
    if (children) {
      children.map((child, _childId) => {
        _processNode(child, path.concat(id), lev + 1);
      });
    }
  }

  if (tree)
    _processNode(tree, [], 0);

  return Array.from(new Set(badFields));
};

export const validateTree = (tree, config, options = {}) => {
  const extendedConfig = extendConfig(config, undefined, true);
  const finalOptions = {
    ...options,
    // disbale sanitize options, just validate
    removeEmptyGroups: false,
    removeIncompleteRules: false,
    forceFix: false,
  };
  const [_t, allErrros, _s] = _validateTree(
    tree, null, extendedConfig, extendedConfig,
    finalOptions
  );
  return allErrros;
};

// @deprecated
export const checkTree = (tree, config) => {
  const extendedConfig = extendConfig(config, undefined, true);
  const options = {
    removeEmptyGroups: config.settings.removeEmptyGroupsOnLoad,
    removeIncompleteRules: config.settings.removeIncompleteRulesOnLoad,
    forceFix: false,
  };
  const [fixedTree, allErrros, isSanitized] = _validateTree(
    tree, null, extendedConfig, extendedConfig,
    options
  );
  if (isSanitized && allErrros.length) {
    console.warn("Tree check errors: ", allErrros);
  }
  return fixedTree;
};

/**
 * @param {Immutable.Map} tree
 * @param {{
*   removeEmptyGroups?: boolean,
*   removeIncompleteRules?: boolean,
*   forceFix?: boolean,
*   translateErrors?: boolean,
*   includeStringifiedItems?: boolean,
*   stringifyFixedItems?: boolean,
*   stringifyItemsUserFriendly?: boolean,
*   includeItemsPositions?: boolean,
* }} options
* @returns {[
*   Immutable.Map, 
*   {
*     path: string[],
*     errors: {
*       key: string, args?: object | null, str?: string,
*       side?: "lhs"|"rhs"|"op", delta?: number, fixed?: boolean, fixedTo?: any, fixedFrom?: any,
*     }[],
*     itemStr?: string,
*     itemPosition?: {
*       caseNo: number | null, globalNoByType: number, indexPath: number[], globalLeafNo?: number, globalGroupNo?: number,
*       isDeleted: boolean, index: number, type: "rule"|"group"|"rule_group"
*     },
*     itemPositionStr?: string,
*   }[],
*   boolean
* ]}
*/
export const sanitizeTree = (tree, config, options = {}) => {
  const extendedConfig = extendConfig(config, undefined, true);
  const finalOptions = {
    // defaults
    removeEmptyGroups: true,
    removeIncompleteRules: true,
    forceFix: false,
    ...options,
  };
  const [fixedTree, allErrros, isSanitized] = _validateTree(
    tree, null, extendedConfig, extendedConfig,
    finalOptions
  );
  if (isSanitized && allErrros.length) {
    console.warn("Tree sanitize errors: ", allErrros);
  }
  return fixedTree;
};

// tip: Should be used only internally in createValidationMemo()
export const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules) => {
  if (removeEmptyGroups === undefined) {
    removeEmptyGroups = newConfig.settings.removeEmptyGroupsOnLoad;
  }
  if (removeIncompleteRules === undefined) {
    removeIncompleteRules = newConfig.settings.removeIncompleteRulesOnLoad;
  }
  const options = {
    // sanitize options
    removeEmptyGroups,
    removeIncompleteRules,
    forceFix: false,
  };
  let [fixedTree, allErrros, isSanitized] = _validateTree(
    newTree, _oldTree, newConfig, oldConfig,
    options
  );
  if (isSanitized && allErrros.length) {
    console.warn("Tree validation errors: ", allErrros);
  }
  fixedTree = fixPathsInTree(fixedTree);
  return fixedTree;
};

/**
 * @param {Immutable.Map} tree
 * @param {{
 *   removeEmptyGroups?: boolean,
 *   removeIncompleteRules?: boolean,
 *   forceFix?: boolean,
 *   translateErrors?: boolean,
 *   includeStringifiedItems?: boolean,
 *   stringifyFixedItems?: boolean,
 *   stringifyItemsUserFriendly?: boolean,
 *   includeItemsPositions?: boolean,
 * }} options
 * @returns {[
 *   Immutable.Map, 
 *   {
 *     path: string[],
 *     errors: {
 *       key: string, args?: object | null, str?: string,
 *       side?: "lhs"|"rhs"|"op", delta?: number, fixed?: boolean, fixedTo?: any, fixedFrom?: any,
 *     }[],
 *     itemStr?: string,
 *     itemPosition?: {
 *       caseNo: number | null, globalNoByType: number, indexPath: number[], globalLeafNo?: number, globalGroupNo?: number,
 *       isDeleted: boolean, index: number, type: "rule"|"group"|"rule_group"
 *     },
 *     itemPositionStr?: string,
 *   }[],
 *   boolean
 * ]}
 */
export const _validateTree = (
  tree, _oldTree, config, oldConfig, options
) => {
  if (!tree) {
    return [tree, [], false];
  }
  const {
    // sanitize options
    removeEmptyGroups,
    removeIncompleteRules,
    forceFix,
    // translation options
    translateErrors = true,
    includeStringifiedItems = true,
    stringifyFixedItems = false,
    stringifyItemsUserFriendly = true,
    includeItemsPositions = true,
  } = options || {};
  const c = {
    config, oldConfig, removeEmptyGroups, removeIncompleteRules, forceFix,
  };
  const meta = {
    errors: {},
  };
  const fixedTree = validateItem(tree, [], null, meta, c);
  let flatItems, oldFlatItems;
  const isSanitized = meta.sanitized;
  const errorsArr = [];
  if (includeItemsPositions) {
    flatItems = getFlatTree(fixedTree).items;
  }
  for (const id in meta.errors) {
    let { path, errors } = meta.errors[id];
    if (translateErrors) {
      errors = errors.map(e => {
        return {
          ...e,
          str: translateValidation(e),
        };
      });
    }
    let errorItem = { path, errors };
    if (includeStringifiedItems) {
      const item = getItemByPath(stringifyFixedItems ? fixedTree : tree, path);
      const isRoot = path.length === 1;
      if (!isRoot) {
        const isDebugMode = true;
        const isForDisplay = stringifyItemsUserFriendly;
        const itemStr = queryString(item, config, isForDisplay, isDebugMode);
        errorItem.itemStr = itemStr;
      }
    }
    if (includeItemsPositions) {
      let flatItem = flatItems[id];
      const isDeleted = !flatItem;
      if (isDeleted) {
        // get positions from old tree
        if (!oldFlatItems) {
          oldFlatItems = getFlatTree(tree).items;
        }
        flatItem = oldFlatItems[id];
      }
      if (flatItem) {
        // build position object
        const itemPosition = {
          ...flatItem.position,
          index: flatItem.index,
          type: flatItem.type,
          isDeleted,
        };
        errorItem.itemPosition = itemPosition;
        // build position string
        const trKey = !flatItem.index
          ? constants.ITEM_POSITION_ROOT
          : constants.ITEM_POSITION+"__"+flatItem.type+(isDeleted ? "__deleted" : "");
        const trArgs = {
          ...itemPosition
        };
        if (stringifyItemsUserFriendly) {
          // convert indexes from 0-based to 1-based (user friendly)
          for (const k of ["caseNo", "globalLeafNo", "globalGroupNo", "globalNoByType"]) {
            if (trArgs[k] != undefined) {
              trArgs[k] = trArgs[k] + 1;
            }
          }
          trArgs.indexPath = itemPosition.indexPath?.map(ind => ind+1);
        }
        errorItem.itemPositionStr = translateValidation(trKey, trArgs);
        if (flatItem.index) { // don't extend for root
          if (flatItem.caseId) {
            errorItem.itemPositionStr = translateValidation(constants.ITEM_POSITION_IN_CASE, {
              ...trArgs,
              str: errorItem.itemPositionStr
            });
          }
          errorItem.itemPositionStr = translateValidation(constants.ITEM_POSITION_WITH_INDEX_PATH, {
            ...trArgs,
            str: errorItem.itemPositionStr
          });
        }
      }
    }
    errorsArr.push(errorItem);
  }
  return [fixedTree, errorsArr, isSanitized];
};

function addError(meta, item, path, err) {
  const id = item.get("id");
  if (!meta.errors[id]) {
    meta.errors[id] = {
      path: [...path, id],
      errors: [],
    };
  }
  meta.errors[id].errors.push(err);
}

function validateItem (item, path, itemId, meta, c) {
  const type = item.get("type");

  if ((type === "group" || type === "rule_group" || type == "case_group" || type == "switch_group")) {
    return validateGroup(item, path, itemId, meta, c);
  } else if (type === "rule") {
    return validateRule(item, path, itemId, meta, c);
  } else {
    return item;
  }
}

function validateGroup (item, path, itemId, meta, c) {
  const {removeEmptyGroups, config} = c;
  let id = item.get("id");
  let children = item.get("children1");
  const isRoot = !path.length;
  const oldChildren = children;
  const type = item.get("type");
  const properties = item.get("properties");
  const field = properties?.get("field");
  const mode = properties?.get("mode");
  const operator = properties?.get?.("operator");
  const isGroupExt = type === "rule_group" && mode === "array";
  const isCase = type === "case_group";
  const cardinality = operator ? config.operators[operator]?.cardinality ?? 1 : undefined;
  // tip: for group operators some/none/all children ARE required, for group operator count children are NOT required
  // tip: default case should contain only value
  const childrenAreRequired = isCase ? false : (isGroupExt ? cardinality == 0 : true);

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  if (isGroupExt) {
    item = validateRule(item, path, itemId, meta, c);
  }

  //validate children
  let submeta = {
    errors: {}
  };
  children = children
    ?.map( (currentChild, childId) => validateItem(currentChild, path.concat(id), childId, submeta, c) );
  const nonEmptyChildren = children?.filter((currentChild) => (currentChild != undefined));
  if (removeEmptyGroups)
    children = nonEmptyChildren;
  let sanitized = submeta.sanitized || (oldChildren?.size != children?.size);
  const isEmptyChildren = !nonEmptyChildren?.size;
  if (isEmptyChildren && childrenAreRequired) {
    addError(meta, item, path, {
      key: isRoot
        ? constants.EMPTY_QUERY
        : isCase
          ? constants.EMPTY_CASE
          : isGroupExt
            ? constants.EMPTY_RULE_GROUP
            : constants.EMPTY_GROUP,
      args: { field },
      fixed: removeEmptyGroups && !isRoot,
    });
    if (removeEmptyGroups && !isRoot) {
      item = undefined;
    }
  }

  if (sanitized)
    meta.sanitized = true;
  if (sanitized && item)
    item = item.set("children1", children);

  meta.errors = {
    ...meta.errors,
    ...(submeta?.errors || {}),
  };
  return item;
}

/**
 * @param {Immutable.Map} item
 * @returns {Immutable.Map}
 */
function validateRule (item, path, itemId, meta, c) {
  const {removeIncompleteRules, forceFix, config, oldConfig} = c;
  const {showErrorMessage} = config.settings;
  const canFix = !showErrorMessage || forceFix;
  const origItem = item;
  let id = item.get("id");
  let properties = item.get("properties");
  let field = properties.get("field") || null;
  let fieldSrc = properties.get("fieldSrc") || null;
  let operator = properties.get("operator") || null;
  let operatorOptions = properties.get("operatorOptions");
  let valueSrc = properties.get("valueSrc");
  let value = properties.get("value");
  let valueError = properties.get("valueError");
  let fieldError = properties.get("fieldError");

  const serializeRule = () => {
    return {
      field: field?.toJS?.() || field,
      fieldSrc,
      operator,
      operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
      valueSrc: valueSrc ? valueSrc.toJS() : null,
      value: value ? value.toJS() : null,
      valueError: valueError ? valueError.toJS() : null,
      fieldError: fieldError ? fieldError : null,
    };
  };

  const oldSerialized = serializeRule();
  //const _wasValid = field && operator && value && !value.includes(undefined);

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate field
  const fieldDefinition = field ? getFieldConfig(config, field) : null;
  if (field && !fieldDefinition) {
    addError(meta, item, path, {
      key: constants.NO_CONFIG_FOR_FIELD,
      args: { field },
      side: "lhs",
      fixed: removeIncompleteRules,
    });
    field = null;
  }
  if (field == null) {
    properties = [
      "operator", "operatorOptions", "valueSrc", "value", "valueError", "fieldError", "field"
    ].reduce((map, key) => map.delete(key), properties);
    operator = null;
  }
  if (!fieldSrc) {
    fieldSrc = getFieldSrc(field);
    properties = properties.set("fieldSrc", fieldSrc);
  }

  //validate operator
  // Backward compatibility: obsolete operator range_between
  if (operator === "range_between" || operator === "range_not_between") {
    operator = operator === "range_between" ? "between" : "not_between";
    // addError(meta, item, path, {
    //   type: "fix",
    //   key: constants.FIXED_OPERATOR,
    //   args: { from: properties.get("operator"), to: operator, field }
    // });
    properties = properties.set("operator", operator);
  }
  const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
  if (operator && !operatorDefinition) {
    addError(meta, item, path, {
      key: constants.NO_CONFIG_FOR_OPERATOR,
      args: { operator },
      side: "op",
      fixed: removeIncompleteRules,
    });
    operator = null;
  }
  const availOps = field ? getOperatorsForField(config, field) : [];
  if (field) {
    if (!availOps?.length) {
      addError(meta, item, path, {
        key: constants.UNSUPPORTED_FIELD_TYPE,
        args: { field },
        side: "lhs",
        fixed: removeIncompleteRules,
      });
      operator = null;
    } else if (operator && availOps.indexOf(operator) == -1) {
      if (operator === "is_empty" || operator === "is_not_empty") {
        // Backward compatibility: is_empty #494
        operator = operator === "is_empty" ? "is_null" : "is_not_null";
        // addError(meta, item, path, {
        //   type: "fix",
        //   key: constants.FIXED_OPERATOR,
        //   args: { from: properties.get("operator"), to: operator, field }
        // });
        properties = properties.set("operator", operator);
      } else {
        addError(meta, item, path, {
          key: constants.UNSUPPORTED_OPERATOR_FOR_FIELD,
          args: { operator, field },
          side: "lhs",
          fixed: removeIncompleteRules,
        });
        operator = null;
      }
    }
  }
  if (operator == null) {
    // do not unset operator ?
    properties = [
      "operatorOptions", "valueSrc", "value", "valueError"
    ].reduce((map, key) => map.delete(key), properties);
  }

  //validate operator options
  operatorOptions = properties.get("operatorOptions");
  //const _operatorCardinality = operator ? defaultValue(operatorDefinition.cardinality, 1) : null;
  if (!operator || operatorOptions && !operatorDefinition.options) {
    operatorOptions = null;
    properties = properties.delete("operatorOptions");
  } else if (operator && !operatorOptions && operatorDefinition.options) {
    operatorOptions = defaultOperatorOptions(config, operator, field);
    properties = properties.set("operatorOptions", operatorOptions);
  }

  //validate values
  valueSrc = properties.get("valueSrc");
  value = properties.get("value");
  const isEndValue = true;
  let {
    newValue, newValueSrc, newValueError, validationErrors, newFieldError, fixedField,
  } = getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, canFix, isEndValue);
  value = newValue;
  valueSrc = newValueSrc;
  valueError = newValueError;
  fieldError = newFieldError;
  field = fixedField;
  properties = properties.set("field", field);
  properties = properties.set("value", value);
  properties = properties.set("valueSrc", valueSrc);
  if (showErrorMessage) {
    properties = properties
      .set("valueError", valueError)
      .set("fieldError", fieldError);
  } else {
    properties = properties
      .delete("valueError")
      .delete("fieldError");
  }

  const newSerialized = serializeRule();
  const hasBeenSanitized = !deepEqual(oldSerialized, newSerialized);
  const compl = whatRulePropertiesAreCompleted(properties.toObject(), config);
  const isCompleted = compl.score >= 3;
  if (hasBeenSanitized)
    meta.sanitized = true;
  if (isCompleted && hasBeenSanitized) {
    item = item.set("properties", properties);
  }
  if (!isCompleted) {
    let incError = { key: constants.INCOMPLETE_RULE, args: {} };
    if (!compl.parts.field) {
      incError.key = constants.INCOMPLETE_LHS;
      incError.side = "lhs";
    } else if(!compl.parts.value) {
      incError.key = constants.INCOMPLETE_RHS;
      incError.side = "rhs";
      if (
        newSerialized.valueSrc?.[0] && newSerialized.valueSrc?.[0] != oldSerialized.valueSrc?.[0]
        && newSerialized.value?.[0] != undefined 
      ) {
        // eg. operator `starts_with` supports only valueSrc "value"
        incError.key = constants.INVALID_VALUE_SRC;
        incError.args = {
          valueSrcs: newSerialized.valueSrc
        };
      }
    }
    incError.fixed = removeIncompleteRules;
    addError(meta, item, path, incError);
    if (removeIncompleteRules) {
      item = undefined;
    }
  }
  validationErrors?.map(e =>
    addError(meta, origItem, path, e)
  );

  return item;
}


/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @return {array} [fixedValue, allErrors] - if `allErrors` is empty and `canFix` == true, `fixedValue` can differ from value if was fixed.
 *  `allErrors` is an array of {key, args, fixed}. If `args` === null, `key` should not be translated
 */
export const validateValue = (
  config, leftField, field, operator, value, valueType, valueSrc, asyncListValues,
  canFix = false, isEndValue = false, canDropArgs = false
) => {
  let allErrors = [];
  let fixedValue = value;

  if (value != null) {
    if (valueSrc === "field") {
      [fixedValue, allErrors] = validateFieldValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue);
    } else if (valueSrc === "func") {
      [fixedValue, allErrors] = validateFuncValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue, canDropArgs);
    } else if (valueSrc === "value" || !valueSrc) {
      [fixedValue, allErrors] = validateNormalValue(field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue);
    }

    let shouldCallValidateFn = !allErrors?.length;
    if (allErrors?.length && fixedValue !== value) {
      // eg. if value was > max, and fixed to max, but max value can not satisfy validateValue() in config
      shouldCallValidateFn = true;
    }
    if (shouldCallValidateFn && field) {
      //const _fieldConfig = getFieldConfig(config, field);
      const w = getWidgetForFieldOp(config, field, operator, valueSrc);
      const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
      const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, w, valueSrc), ["factory"]);
      const rightFieldDefinition = (valueSrc == "field" ? getFieldConfig(config, value) : null);
      const fieldSettings = fieldWidgetDefinition; // widget definition merged with fieldSettings

      const fn = fieldWidgetDefinition.validateValue;
      if (typeof fn == "function") {
        const args = [
          fixedValue, 
          fieldSettings,
          operator,
          operatorDefinition
        ];
        if (valueSrc == "field")
          args.push(rightFieldDefinition);
        const validResult = fn.call(config.ctx, ...args);
        if (typeof validResult === "object" && validResult !== null && !Array.isArray(validResult)) {
          if (validResult.error?.key) {
            allErrors.push(validResult.error);
          } else {
            // Note: `null` means it's not translated string!
            allErrors.push({key: validResult.error, args: null});
          }
          if (validResult.fixedValue !== undefined && canFix) {
            allErrors[allErrors.length-1].fixed = true;
            allErrors[allErrors.length-1].fixedFrom = fixedValue;
            allErrors[allErrors.length-1].fixedTo = validResult.fixedValue;
            fixedValue = validResult.fixedValue;
          }
        } else if (typeof validResult === "boolean") {
          if (validResult == false) {
            allErrors.push({key: constants.INVALID_VALUE, args: {}});
          }
        } else if (typeof validResult === "string") {
          allErrors.push({key: validResult, args: null});
        }
      }
    }
  }
  
  return [fixedValue, allErrors];
};

const validateValueInList = (value, listValues, canFix, isEndValue, removeInvalidMultiSelectValuesOnLoad) => {
  const values = Immutable.List.isList(value) ? value.toJS() : (value instanceof Array ? [...value] : undefined);
  let fixedValue = value;
  let allErrors = [];
  if (values) {
    const [goodValues, badValues] = values.reduce(([goodVals, badVals], val) => {
      const vv = getItemInListValues(listValues, val);
      if (vv == undefined) {
        return [goodVals, [...badVals, val]];
      } else {
        return [[...goodVals, vv.value], badVals];
      }
    }, [[], []]);
    const needFix = badValues.length > 0;
    // always remove bad values at tree validation as user can't unselect them (except AntDesign widget)
    canFix = canFix || removeInvalidMultiSelectValuesOnLoad === true;
    fixedValue = canFix && needFix ? goodValues : value;
    if (badValues.length) {
      const fixed = canFix && needFix;
      allErrors.push({
        key: constants.BAD_MULTISELECT_VALUES,
        args: { badValues, count: badValues.length },
        fixed,
        fixedFrom: fixed ? values : undefined,
        fixedTo: fixed ? fixedValue : undefined,
      });
    }
    return [fixedValue, allErrors];
  } else {
    const vv = getItemInListValues(listValues, value);
    if (vv == undefined) {
      fixedValue = canFix ? null : value;
      allErrors.push({
        key: constants.BAD_SELECT_VALUE,
        args: { value },
        fixed: canFix,
        fixedFrom: canFix ? value : undefined,
        fixedTo: canFix ? fixedValue : undefined,
      });
    } else {
      fixedValue = vv.value;
    }
    return [fixedValue, allErrors];
  }
};

/**
* 
*/
const validateNormalValue = (field, value, valueSrc, valueType, asyncListValues, config, operator = null, canFix = false, isEndValue = false) => {
  let allErrors = [];
  let fixedValue = value;
  if (field) {
    const fieldConfig = getFieldConfig(config, field);
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const wConfig = config.widgets[w];
    const wType = wConfig?.type;
    const jsType = wConfig?.jsType;
    const fieldSettings = fieldConfig.fieldSettings;
    const listValues = fieldSettings?.treeValues || fieldSettings?.listValues;
    const isAsyncListValues = !!fieldSettings?.asyncFetch;
    // todo: for select/multiselect value can be string or number
    const canSkipCheck = listValues || isAsyncListValues;

    if (valueType && wType && valueType != wType) {
      allErrors.push({
        key: constants.INCORRECT_VALUE_TYPE,
        args: { wType, valueType }
      });
      return [value, allErrors];
    }
    if (jsType && !isTypeOf(value, jsType) && !canSkipCheck) {
      allErrors.push({
        key: constants.INCORRECT_VALUE_JS_TYPE,
        args: { jsType, valueTypeof: typeof value }
      });
      return [value, allErrors];
    }

    if (fieldSettings) {
      const realListValues = asyncListValues || listValues;
      if (realListValues && !fieldSettings.allowCustomValues) {
        [fixedValue, allErrors] = validateValueInList(
          value, realListValues, canFix, isEndValue, config.settings.removeInvalidMultiSelectValuesOnLoad
        );
      }
      if (fieldSettings.min != null && value < fieldSettings.min) {
        fixedValue = canFix ? fieldSettings.min : value;
        allErrors.push({
          key: constants.VALUE_MIN_CONSTRAINT_FAIL,
          args: { value, fieldSettings },
          fixed: canFix,
          fixedFrom: canFix ? value : undefined,
          fixedTo: canFix ? fixedValue : undefined,
        });
      }
      if (fieldSettings.max != null && value > fieldSettings.max) {
        fixedValue = canFix ? fieldSettings.max : value;
        allErrors.push({
          key: constants.VALUE_MAX_CONSTRAINT_FAIL,
          args: { value, fieldSettings },
          fixed: canFix,
          fixedFrom: canFix ? value : undefined,
          fixedTo: canFix ? fixedValue : undefined,
        });
      }
    }
  }

  return [fixedValue, allErrors];
};


/**
* 
*/
const validateFieldValue = (leftField, field, value, _valueSrc, valueType, asyncListValues, config, operator = null, canFix = false, isEndValue = false) => {
  const allErrors = [];
  const {fieldSeparator} = config.settings;
  const isFuncArg = typeof field == "object" && field?._isFuncArg;
  const leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  const rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  const rightFieldDefinition = getFieldConfig(config, value);
  if (!rightFieldDefinition) {
    allErrors.push({
      key: constants.NO_CONFIG_FOR_FIELD_VALUE,
      args: { field: value }
    });
    return [value, allErrors];
  }
  if (leftField && rightFieldStr == leftFieldStr && !isFuncArg) {
    allErrors.push({
      key: constants.CANT_COMPARE_FIELD_WITH_ITSELF,
      args: { field: leftField }
    });
    return [value, allErrors];
  }
  if (valueType && valueType != rightFieldDefinition.type) {
    allErrors.push({
      key: constants.INCORRECT_FIELD_TYPE,
      args: { field: value, type: rightFieldDefinition.type, expected: valueType }
    });
    return [value, allErrors];
  }
  return [value];
};

/**
* 
*/
const validateFuncValue = (
  leftField, field, value, _valueSrc, valueType, asyncListValues, config, operator = null,
  canFix = false, isEndValue = false, canDropArgs = false
) => {
  let fixedValue = value;
  const allErrors = [];

  if (!value) {
    // empty value
    return [value];
  }
  const funcKey = value.get?.("func");
  if (!funcKey) {
    // it's not a function value
    return [value];
  }
  const fieldDef = getFieldConfig(config, field);
  if (fieldDef?.funcs && !fieldDef.funcs.includes(funcKey)) {
    allErrors.push({
      key: constants.UNSUPPORTED_FUNCTION_FOR_FIELD,
      args: { funcKey, field }
    });
    return [value, allErrors];
  }
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig) {
    allErrors.push({
      key: constants.NO_CONFIG_FOR_FUNCTION,
      args: { funcKey }
    });
    return [value, allErrors];
  }
  if (valueType && funcConfig.returnType != valueType) {
    allErrors.push({
      key: constants.INCORRECT_FUNCTION_RETURN_TYPE,
      args: { funcKey, returnType: funcConfig.returnType, valueType }
    });
    return [value, allErrors];
  }
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const args = fixedValue.get("args");
    const argVal = args ? args.get(argKey) : undefined;
    const argDef = getFieldConfig(config, argConfig);
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    if (argValue !== undefined) {
      const [fixedArgVal, argErrors] = validateValue(
        config, leftField, argDef, operator, argValue, argConfig.type, argValueSrc, asyncListValues, canFix, isEndValue, canDropArgs,
      );
      const willFix = canFix && fixedArgVal !== argValue;
      const hasError = argErrors?.length > 0;
      //tip: reset to default ONLY if isEndValue==true
      const canDrop = canFix && hasError && !willFix && (isEndValue || canDropArgs);
      if (willFix) {
        fixedValue = fixedValue.setIn(["args", argKey, "value"], fixedArgVal);
      }
      if (canDrop) {
        // reset to default
        fixedValue = fixedValue.deleteIn(["args", argKey]);
        fixedValue = setFuncDefaultArg(config, fixedValue, funcConfig, argKey);
      }
      if (hasError) {
        const argValidationError = translateValidation(argErrors[0]);
        const fixed = willFix || canDrop;
        allErrors.push({
          key: constants.INVALID_FUNC_ARG_VALUE,
          args: {
            funcKey, argKey,
            argValidationError,
            i18n: argErrors[0]
          },
          fixed,
          fixedFrom: fixed ? argValue : undefined,
          fixedTo: willFix ? fixedArgVal : undefined,
        });
      }
    } else if (!argConfig.isOptional && isEndValue) {
      const canDrop = canFix && argConfig.defaultValue !== undefined && (isEndValue || canDropArgs);
      allErrors.push({
        key: constants.REQUIRED_FUNCTION_ARG,
        args: { funcKey, argKey },
        fixed: canDrop,
      });
      if (canDrop) {
        // set default
        fixedValue = fixedValue.deleteIn(["args", argKey]);
        fixedValue = setFuncDefaultArg(config, fixedValue, funcConfig, argKey);
      }
    }
  }

  return [fixedValue, allErrors];
};

/**
* 
*/
export const validateRange = (config, field, operator, values, valueSrcs) => {
  const operatorConfig = getOperatorConfig(config, operator, field);
  const operatorCardinality = operator ? defaultValue(operatorConfig.cardinality, 1) : null;
  const valueSrcsArr = (valueSrcs.toJS ? valueSrcs.toJS() : valueSrcs);
  const valuesArr = (values.toJS ? values.toJS() : values);
  const areValueSrcsPureValues = valueSrcsArr.filter(vs => vs == "value" || vs == null).length == operatorCardinality;
  let rangeError;
  if (operatorConfig?.validateValues && areValueSrcsPureValues) {
    const valueSrc = valueSrcsArr[0];
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDefinition = getFieldWidgetConfig(config, field, operator, w, valueSrc);
    const jsValues = fieldWidgetDefinition?.toJS
      ? valuesArr.map(v => {
        let jsVal = fieldWidgetDefinition.toJS.call(config.ctx, v, fieldWidgetDefinition);
        if (jsVal instanceof Date) {
          jsVal = jsVal.getTime();
        }
        return jsVal;
      })
      : valuesArr;
    const validResult = operatorConfig.validateValues(jsValues);
    if (typeof validResult === "boolean") {
      if (validResult == false) {
        rangeError = {
          key: constants.INVALID_RANGE,
          args: {
            jsValues,
            values: valuesArr,
          }
        };
      }
    }
  }
  return rangeError;
};



/**
 * @param {Immutable.Map} current
 * @param {string} changedProp
 * @param {boolean} canFix (default: false) true - eg. set value to max if it > max or revert or drop
 * @param {boolean} isEndValue (default: false) true - if value is in process of editing by user
 * @param {boolean} canDropArgs (default: false)
 * @return {{canReuseValue, newValue, newValueSrc, newValueType, fixedField, operatorCardinality,  newValueError, newFieldError, validationErrors}}
 */
export const getNewValueForFieldOp = function (
  config, oldConfig = null, current, newField, newOperator, changedProp = null,
  canFix = false, isEndValue = false, canDropArgs = false
) {
  if (!oldConfig)
    oldConfig = config;
  const {
    keepInputOnChangeFieldSrc, convertableWidgets, clearValueOnChangeField, clearValueOnChangeOp,
  } = config.settings;
  const currentField = current.get("field");
  const currentFieldType = current.get("fieldType");
  const currentFieldSrc = current.get("fieldSrc");
  const currentOperator = current.get("operator");
  const currentValue = current.get("value");
  const currentValueSrc = current.get("valueSrc", new Immutable.List());
  const currentValueType = current.get("valueType", new Immutable.List());
  const asyncListValues = current.get("asyncListValues");


  //const isValidatingTree = (changedProp === null);

  const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator);
  const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
  const currentOperatorCardinality = currentOperator ? defaultValue(currentOperatorConfig.cardinality, 1) : null;
  const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
  const currentFieldConfig = getFieldConfig(oldConfig, currentField);
  const newFieldConfig = getFieldConfig(config, newField);
  const isOkWithoutField = !currentField && currentFieldType && keepInputOnChangeFieldSrc;
  const currentType = currentFieldConfig?.type || currentFieldType;
  const newType = newFieldConfig?.type || !newField && isOkWithoutField && currentType;
  const currentListValuesType = currentFieldConfig?.listValuesType;
  const newListValuesType = newFieldConfig?.listValuesType;
  const currentFieldSimpleValue = currentField?.get?.("func") || currentField;
  const newFieldSimpleValue = newField?.get?.("func") || newField;
  const hasFieldChanged = newFieldSimpleValue != currentFieldSimpleValue;

  let valueFixes = [];
  let valueErrors = Array.from({length: operatorCardinality}, () => null);
  let validationErrors = [];
  let newFieldError;
  let rangeValidationError;

  let canReuseValue = (currentField || isOkWithoutField) && currentOperator && newOperator && currentValue != undefined;
  if (
    !(currentType && newType && currentType == newType)
    || changedProp === "field" && hasFieldChanged && clearValueOnChangeField
    || changedProp === "operator" && clearValueOnChangeOp
  ) {
    canReuseValue = false;
  }
  if (hasFieldChanged && selectTypes.includes(newType)) {
    if (newListValuesType && newListValuesType === currentListValuesType) {
      // ok
    } else {
      // different fields of select types has different listValues
      canReuseValue = false;
    }
  }

  // validate func LHS
  if (currentFieldSrc === "func" && newField) {
    const [fixedField, fieldErrors] = validateValue(
      config, null, null, newOperator, newField, newType, currentFieldSrc, asyncListValues, canFix, isEndValue, canDropArgs
    );
    const isValid = !fieldErrors?.length;
    const willFix = fixedField !== newField;
    const willRevert = !isValid && !willFix && canFix && newField !== currentField;
    if (willFix) {
      newField = fixedField;
    } else if (willRevert) {
      newField = currentField;
    }
    if (!isValid) {
      const showError = !isValid && !willFix;
      if (showError) {
        newFieldError = translateValidation(fieldErrors[0]);
      }
      // tip: even if we don't show errors, but revert LHS, put the reason of revert
      fieldErrors?.map(e => validationErrors.push({
        side: "lhs",
        ...e,
        fixed: e.fixed || willFix || willRevert,
      }));
    }
  }

  // compare old & new widgets
  for (let i = 0 ; i < operatorCardinality ; i++) {
    const vs = currentValueSrc.get(i) || null;
    const currentWidget = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
    const newWidget = getWidgetForFieldOp(config, newField, newOperator, vs);
    // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value
    const currentValueWidget = vs == "value" ? currentWidget : getWidgetForFieldOp(oldConfig, currentField, currentOperator, "value");
    const newValueWidget = vs == "value" ? newWidget : getWidgetForFieldOp(config, newField, newOperator, "value");

    const canReuseWidget = newValueWidget == currentValueWidget
      || (convertableWidgets[currentValueWidget] || []).includes(newValueWidget)
      || !currentValueWidget && isOkWithoutField;
    if (!canReuseWidget) {
      canReuseValue = false;
    }
  }

  if (currentOperator != newOperator && [currentOperator, newOperator].includes("proximity"))
    canReuseValue = false;

  const firstValueSrc = currentValueSrc.first();
  const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, firstValueSrc);
  let valueSources = getValueSourcesForFieldOp(config, newField, newOperator, null);
  if (!newField && isOkWithoutField) {
    valueSources = Object.keys(config.settings.valueSourcesInfo);
  }

  // changed operator from '==' to 'between'
  let canExtendValueToRange = canReuseValue && changedProp === "operator"
    && currentOperatorCardinality === 1 && operatorCardinality === 2;

  if (canReuseValue) {
    for (let i = 0 ; i < operatorCardinality ; i++) {
      let v = currentValue.get(i);
      let vType = currentValueType.get(i) || null;
      let vSrc = currentValueSrc.get(i) || null;
      let isValidSrc = (valueSources.find(v => v == vSrc) != null);
      if (!isValidSrc && i > 0 && vSrc == null)
        isValidSrc = true; // make exception for range widgets (when changing op from '==' to 'between')
      if (canExtendValueToRange && i === 1) {
        v = valueFixes[0] ?? currentValue.get(0);
        valueFixes[i] = v;
        vType = currentValueType.get(0) || null;
        vSrc = currentValueSrc.get(0) || null;
      }
      const [fixedValue, allErrors] = validateValue(
        config, newField, newField, newOperator, v, vType, vSrc, asyncListValues, canFix, isEndValue, canDropArgs
      );
      const isValid = !allErrors?.length;
      // Allow bad value with error message
      // But not on field change - in that case just drop bad value that can't be reused
      // ? Maybe we should also drop bad value on op change?
      // For bad multiselect value we have both error message + fixed value.
      //  If we show error message, it will gone on next tree validation
      const willFix = fixedValue !== v;
      const willDrop = !isValidSrc || !isValid && (hasFieldChanged || !willFix && canFix);
      if (!isValid) {
        // tip: even if we don't show errors, but drop bad values, put the reason of removal
        allErrors?.map(e => validationErrors.push({
          side: "rhs",
          delta: i,
          ...e,
          fixed: e.fixed || willFix || willDrop,
        }));
      }
      if (willDrop) {
        canReuseValue = false;
        canExtendValueToRange = false;
        // revert changes
        valueFixes = [];
        valueErrors = Array.from({length: operatorCardinality}, () => null);
        break;
      }
      const showError = !isValid && !willFix;
      if (showError) {
        valueErrors[i] = translateValidation(allErrors[0]);
      }
      if (willFix) {
        valueFixes[i] = fixedValue;
      }
      if (canExtendValueToRange && i === 0 && !isValid && !willFix) {
        // don't extend bad value to range
        canExtendValueToRange = false;
      }
    }
  }

  // reuse value OR get defaultValue (for cardinality 1 - it means default range values is not supported yet, todo)
  let newValue = null, newValueSrc = null, newValueType = null, newValueError = null;
  newValue = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
    let v = undefined;
    if (canReuseValue) {
      if (canExtendValueToRange && i === 1) {
        v = valueFixes[i];
      } else if (i < currentValue.size) {
        v = currentValue.get(i);
        if (valueFixes[i] !== undefined) {
          v = valueFixes[i];
        }
      }
    } else if (operatorCardinality == 1) {
      v = getFirstDefined([
        newFieldConfig?.defaultValue,
        newFieldConfig?.fieldSettings?.defaultValue,
        firstWidgetConfig?.defaultValue
      ]);
    }
    return v;
  }));

  newValueSrc = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
    let vs = null;
    if (canReuseValue) {
      if (canExtendValueToRange && i === 1)
        vs = currentValueSrc.get(0);
      else if (i < currentValueSrc.size)
        vs = currentValueSrc.get(i);
    } else if (valueSources.length == 1) {
      vs = valueSources[0];
    } else if (valueSources.length > 1) {
      vs = valueSources[0];
    }
    return vs;
  }));

  // Validate range
  const rangeErrorObj = validateRange(config, newField, newOperator, newValue, newValueSrc);
  if (rangeErrorObj) {
    // last element in `valueError` list is for range validation error
    rangeValidationError = translateValidation(rangeErrorObj);
    const willFix = canFix && operatorCardinality >= 2;
    const badValue = newValue;
    if (willFix) {
      valueFixes[1] = newValue.get(0);
      newValue = newValue.set(1, valueFixes[1]);
      valueErrors[1] = valueErrors[0];
    }
    const showError = !willFix;
    if (showError) {
      valueErrors.push(rangeValidationError);
    }
    validationErrors.push({
      side: "rhs",
      delta: -1,
      ...rangeErrorObj,
      fixed: willFix,
      fixedFrom: willFix ? [badValue.get(0), badValue.get(1)] : undefined,
      fixedTo: willFix ? [newValue.get(0), newValue.get(1)] : undefined
    });
  }

  newValueError = new Immutable.List(valueErrors);

  newValueType = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
    let vt = null;
    if (canReuseValue) {
      if (canExtendValueToRange && i === 1) {
        vt = currentValueType.get(0);
      } else if (i < currentValueType.size) {
        vt = currentValueType.get(i);
      }
    } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
      vt = firstWidgetConfig.type;
    } else if (operatorCardinality == 1 && newFieldConfig && newFieldConfig.type !== undefined) {
      vt = newFieldConfig.type == "!group" ? "number" : newFieldConfig.type;
    }
    return vt;
  }));

  return {
    canReuseValue, newValue, newValueSrc, newValueType, operatorCardinality, fixedField: newField,
    newValueError, newFieldError, validationErrors,
  };
};

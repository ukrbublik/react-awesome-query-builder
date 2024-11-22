import omit from "lodash/omit";
import Immutable from "immutable";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldSrc, getWidgetForFieldOp,
  getOperatorsForField,
} from "./configUtils";
import {extendConfig} from "./configExtend";
import {
  whatRulePropertiesAreCompleted, setFuncDefaultArg,
} from "./ruleUtils";
import { getNewValueForFieldOp } from "./getNewValueForFieldOp";
import {getOpCardinality, deepEqual, isTypeOf, typeOf} from "./stuff";
import {getItemInListValues} from "./listValues";
import {defaultOperatorOptions} from "./defaultUtils";
import {fixPathsInTree, getItemByPath, getFlatTree} from "./treeUtils";
import {queryString} from "../export/queryString";
import * as constants from "../i18n/validation/constains";
import { translateValidation } from "../i18n";

export { translateValidation };

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
    const hasValueError = valueError?.size > 0 && valueError.filter(v => v != null).size > 0;
    const isBad = hasValueError || !!fieldError;
    if (isBad && showErrorMessage) {
      // for showErrorMessage=false valueError/fieldError is used to hold last error, but actual value is always valid
      badFields.push(fieldStr);
    }
    if (children) {
      children.map((child, _childId) => {
        if (child) {
          _processNode(child, path.concat(id), lev + 1);
        }
      });
    }
  }

  if (tree)
    _processNode(tree, [], 0);

  return Array.from(new Set(badFields));
};

// @deprecated
export const checkTree = (tree, config) => {
  const extendedConfig = extendConfig(config, undefined, true);
  const options = {
    removeEmptyGroups: config.settings.removeEmptyGroupsOnLoad,
    removeIncompleteRules: config.settings.removeIncompleteRulesOnLoad,
    removeEmptyRules: config.settings.removeEmptyRulesOnLoad,
    forceFix: false,
  };
  const {fixedTree, allErrors, isSanitized} = _validateTree(
    tree, null, extendedConfig, extendedConfig,
    options
  );
  if (isSanitized && allErrors.length) {
    console.warn("Tree check errors: ", allErrors);
  }
  return fixedTree;
};

/**
 * @param {Immutable.Map} tree
 * @param {SanitizeOptions} options
 * @returns {ValidationItemErrors[]}
*/
export const validateTree = (tree, config, options = {}) => {
  const extendedConfig = extendConfig(config, undefined, true);
  const finalOptions = {
    ...options,
    // disbale sanitize options, just validate
    removeEmptyGroups: false,
    removeEmptyRules: false,
    removeIncompleteRules: false,
    forceFix: false,
  };
  const {allErrors} = _validateTree(
    tree, null, extendedConfig, extendedConfig,
    finalOptions
  );
  return allErrors;
};

/**
 * @param {Immutable.Map} tree
 * @param {SanitizeOptions} options
 * @returns {{
 *   fixedTree: Immutable.Map, 
 *   fixedErrors: ValidationItemErrors[],
 *   nonFixedErrors: ValidationItemErrors[],
 *   allErrors: ValidationItemErrors[],
 * }}
 */
export const sanitizeTree = (tree, config, options = {}) => {
  const extendedConfig = extendConfig(config, undefined, true);
  const finalOptions = {
    // defaults
    removeEmptyGroups: true,
    removeEmptyRules: true,
    removeIncompleteRules: true,
    forceFix: false,
    ...options,
  };
  const {fixedTree, fixedErrors, nonFixedErrors, allErrors} = _validateTree(
    tree, null, extendedConfig, extendedConfig,
    finalOptions
  );
  return {fixedTree, fixedErrors, nonFixedErrors, allErrors};
};

// tip: Should be used only internally in createValidationMemo()
export const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeEmptyRules, removeIncompleteRules) => {
  if (removeEmptyGroups === undefined) {
    removeEmptyGroups = newConfig.settings.removeEmptyGroupsOnLoad;
  }
  if (removeEmptyRules === undefined) {
    removeEmptyRules = newConfig.settings.removeEmptyRulesOnLoad;
  }
  if (removeIncompleteRules === undefined) {
    removeIncompleteRules = newConfig.settings.removeIncompleteRulesOnLoad;
  }
  const options = {
    // sanitize options
    removeEmptyGroups,
    removeEmptyRules,
    removeIncompleteRules,
    forceFix: false,
  };
  let {fixedTree, allErrors, fixedErrors, nonFixedErrors, isSanitized} = _validateTree(
    newTree, _oldTree, newConfig, oldConfig,
    options
  );
  if (isSanitized && fixedErrors.length) {
    console.warn("Fixed tree errors: ", fixedErrors);
  }
  // if (nonFixedErrors.length) {
  //   console.info("Tree validation errors: ", nonFixedErrors);
  // }
  fixedTree = fixPathsInTree(fixedTree);
  return fixedTree;
};


/**
 * @param {Immutable.Map} tree
 * @param {SanitizeOptions} options
 * @typedef {{
 *   removeEmptyGroups?: boolean,
 *   removeEmptyRules?: boolean,
 *   removeIncompleteRules?: boolean,
 *   forceFix?: boolean,
 *   translateErrors?: boolean,
 *   includeStringifiedItems?: boolean,
 *   stringifyFixedItems?: boolean,
 *   stringifyItemsUserFriendly?: boolean,
 *   includeItemsPositions?: boolean,
 * }} SanitizeOptions
 * @typedef {{
 *   path: string[],
 *   errors: {
 *     key: string, args?: object | null, str?: string,
 *     side?: "lhs"|"rhs"|"op", delta?: number, fixed?: boolean, fixedTo?: any, fixedFrom?: any,
 *   }[],
 *   itemStr?: string,
 *   itemPosition?: {
 *     caseNo: number | null, globalNoByType: number, indexPath: number[], globalLeafNo?: number, globalGroupNo?: number,
 *     isDeleted: boolean, index: number, type: "rule"|"group"|"rule_group"
 *   },
 *   itemPositionStr?: string,
 * }} ValidationItemErrors
 * @returns {{
 *   fixedTree: Immutable.Map, 
 *   allErrors: ValidationItemErrors[],
 *   fixedErrors: ValidationItemErrors[],
 *   nonFixedErrors: ValidationItemErrors[],
 *   isSanitized: boolean
 * }}
 */
export const _validateTree = (
  tree, _oldTree, config, oldConfig, options
) => {
  if (!tree) {
    return {
      fixedTree: tree,
      allErrors: [],
      fixedErrors: [],
      nonFixedErrors: [],
      isSanitized: false,
    };
  }

  const {
    // sanitize options
    removeEmptyGroups,
    removeEmptyRules,
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
    config, oldConfig, removeEmptyGroups, removeEmptyRules, removeIncompleteRules, forceFix,
  };
  const meta = {
    errors: {},
  };
  const fixedTree = validateItem(tree, [], null, meta, c);
  const isSanitized = meta.sanitized;

  // build allErrors
  const allErrors = [];
  let flatItems, oldFlatItems;
  if (includeItemsPositions) {
    flatItems = getFlatTree(fixedTree, config).items;
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
      if (!isRoot && item.get("type") !== "group") {
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
          oldFlatItems = getFlatTree(tree, config).items;
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
          if (flatItem.caseId && flatItem.type !== "case_group") {
            errorItem.itemPositionStr = translateValidation(constants.ITEM_POSITION_IN_CASE, {
              ...trArgs,
              str: errorItem.itemPositionStr
            });
          }
          if (flatItem.type !== "case_group") {
            errorItem.itemPositionStr = translateValidation(constants.ITEM_POSITION_WITH_INDEX_PATH, {
              ...trArgs,
              str: errorItem.itemPositionStr
            });
          }
        }
      }
    }
    allErrors.push(errorItem);
  }

  // split allErrors to fixedErrors and nonFixedErrors
  let fixedErrors = [];
  let nonFixedErrors = [];
  for (const itemErrors of allErrors) {
    const fixedItemErrors = itemErrors.errors.filter(e => !!e.fixed);
    let nonFixedItemErrors = itemErrors.errors.filter(e => !e.fixed && e.key !== "EMPTY_QUERY");
    if (fixedItemErrors.length) {
      fixedErrors.push({
        ...itemErrors,
        errors: fixedItemErrors,
      });
    }
    if (nonFixedItemErrors.length) {
      nonFixedErrors.push({
        ...itemErrors,
        errors: nonFixedItemErrors,
      });
    }
  }

  return {
    fixedTree, allErrors, fixedErrors, nonFixedErrors, isSanitized
  };
};

function _addError(meta, item, path, err) {
  const id = item.get("id");
  if (!meta.errors[id]) {
    meta.errors[id] = {
      path: [...path, id],
      errors: [],
    };
  }
  meta.errors[id].errors.push(err);
}

function _setErrorsAsFixed(meta, item) {
  const id = item.get("id");
  if (meta.errors[id]) {
    meta.errors[id].errors.map(e => {
      e.fixed = true;
    });
  }
}

function validateItem (item, path, itemId, meta, c) {
  const type = item?.get("type");

  if ((type === "group" || type === "rule_group" || type == "case_group" || type == "switch_group")) {
    return validateGroup(item, path, itemId, meta, c);
  } else if (type === "rule") {
    return validateRule(item, path, itemId, meta, c);
  } else {
    return item;
  }
}

function validateGroup (item, path, itemId, meta, c) {
  const {removeEmptyGroups, removeIncompleteRules, forceFix, config} = c;
  const {showErrorMessage} = config.settings;
  const canFix = !showErrorMessage || forceFix;
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
  const isDefaultCase = isCase && children == undefined;
  const cardinality = operator ? config.operators[operator]?.cardinality ?? 1 : undefined;
  // tip: for group operators some/none/all children ARE required, for group operator count children are NOT required
  // tip: default case should contain only value
  const childrenAreRequired = isCase ? !isDefaultCase : (isGroupExt ? cardinality == 0 : removeEmptyGroups);
  const canHaveValue = isGroupExt || isCase;

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  if (canHaveValue) {
    item = validateRule(item, path, itemId, meta, c);
  }

  //validate children
  let submeta = {
    errors: {}
  };
  children = children
    ?.map( (currentChild, childId) => validateItem(currentChild, path.concat(id), childId, submeta, c) );
  const nonEmptyChildren = children?.filter((currentChild) => (currentChild != undefined));
  if (removeEmptyGroups) {
    children = nonEmptyChildren;
  }
  let sanitized = submeta.sanitized || (oldChildren?.size != children?.size);
  const isEmptyChildren = !nonEmptyChildren?.size;
  let canDrop = removeEmptyGroups && !isRoot;
  if (isGroupExt && field) {
    // to remove rule-group like "SOME cars" (with SOME/ALL/NONE, but without filters), we need to rely on removeIncompleteRules
    canDrop = removeIncompleteRules;
  }
  if (isEmptyChildren && childrenAreRequired) {
    _addError(meta, item, path, {
      key: isRoot
        ? constants.EMPTY_QUERY
        : isCase
          ? constants.EMPTY_CASE
          : isGroupExt
            ? constants.EMPTY_RULE_GROUP
            : constants.EMPTY_GROUP,
      args: { field },
      fixed: canDrop,
    });
    if (canDrop) {
      _setErrorsAsFixed(meta, item);
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
  const {removeIncompleteRules, removeEmptyRules, forceFix, config, oldConfig} = c;
  const {showErrorMessage} = config.settings;
  const canFix = !showErrorMessage || forceFix;
  const origItem = item;
  let id = item.get("id");
  const type = item.get("type");
  const isCase = type === "case_group";
  let properties = item.get("properties");
  if (!properties) {
    if (isCase) {
      properties = new Immutable.Map();
    } else {
      const err = {
        key: constants.INCOMPLETE_RULE,
        args: {},
        fixed: removeIncompleteRules || removeEmptyRules
      };
      _addError(meta, item, path, err);
      return undefined;
    }
  }
  let field = properties.get("field") || null;
  if (isCase) {
    field = "!case_value";
  }
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
    _addError(meta, item, path, {
      key: constants.NO_CONFIG_FOR_FIELD,
      args: { field },
      side: "lhs",
      fixed: removeIncompleteRules || removeEmptyRules,
    });
    field = null;
  }
  if (field == null && !isCase) {
    properties = [
      "operator", "operatorOptions", "valueSrc", "value", "valueError", "fieldError", "field"
    ].reduce((map, key) => map.delete(key), properties);
    operator = null;
  }
  if (!fieldSrc && field && !isCase) {
    fieldSrc = getFieldSrc(field);
    properties = properties.set("fieldSrc", fieldSrc);
  }

  //validate operator
  // Backward compatibility: obsolete operator range_between
  if (operator === "range_between" || operator === "range_not_between") {
    operator = operator === "range_between" ? "between" : "not_between";
    // _addError(meta, item, path, {
    //   type: "fix",
    //   key: constants.FIXED_OPERATOR,
    //   args: { from: properties.get("operator"), to: operator, field }
    // });
    properties = properties.set("operator", operator);
  }
  const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
  if (operator && !operatorDefinition) {
    _addError(meta, item, path, {
      key: constants.NO_CONFIG_FOR_OPERATOR,
      args: { operator },
      side: "op",
      fixed: removeIncompleteRules || removeEmptyRules,
    });
    operator = null;
  }
  const availOps = field ? getOperatorsForField(config, field) : [];
  if (field && !isCase) {
    if (!availOps?.length) {
      _addError(meta, item, path, {
        key: constants.UNSUPPORTED_FIELD_TYPE,
        args: { field },
        side: "lhs",
        fixed: removeIncompleteRules || removeEmptyRules,
      });
      operator = null;
    } else if (operator && availOps.indexOf(operator) == -1) {
      if (operator === "is_empty" || operator === "is_not_empty") {
        // Backward compatibility: is_empty #494
        operator = operator === "is_empty" ? "is_null" : "is_not_null";
        // _addError(meta, item, path, {
        //   type: "fix",
        //   key: constants.FIXED_OPERATOR,
        //   args: { from: properties.get("operator"), to: operator, field }
        // });
        properties = properties.set("operator", operator);
      } else {
        _addError(meta, item, path, {
          key: constants.UNSUPPORTED_OPERATOR_FOR_FIELD,
          args: { operator, field },
          side: "lhs",
          fixed: removeIncompleteRules || removeEmptyRules,
        });
        operator = null;
      }
    }
  }
  if (operator == null && !isCase) {
    // do not unset operator ?
    properties = [
      "operatorOptions", "valueSrc", "value", "valueError"
    ].reduce((map, key) => map.delete(key), properties);
  }

  //validate operator options
  operatorOptions = properties.get("operatorOptions");
  //const _operatorCardinality = operator ? getOpCardinality(operatorDefinition) : null;
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
  } = getNewValueForFieldOp(
    { validateValue, validateRange },
    config, oldConfig, properties, field, operator, null, canFix, isEndValue
  );
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
  const isCompleted = isCase ? compl.parts.value : compl.score >= 3;
  if (hasBeenSanitized) {
    meta.sanitized = true;
    item = item.set("properties", properties);
  }
  validationErrors?.map(e =>
    _addError(meta, item, path, e)
  );
  if (!isCompleted) {
    if (isCase) {
      // todo
    } else {
      let shoudlRemoveRule = !compl.score ? removeEmptyRules : removeIncompleteRules;
      // if (shoudlRemoveRule && showErrorMessage) {
      //   // try to be not so rude about removing incomplete rule with functions
      //   const complLite = whatRulePropertiesAreCompleted(properties.toObject(), config, true);
      //   const isCompletedLite = complLite.score >= 3;
      //   if (isCompletedLite) {
      //     shoudlRemoveRule = false;
      //   }
      // }
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
      incError.fixed = shoudlRemoveRule;
      _addError(meta, item, path, incError);
      if (shoudlRemoveRule) {
        _setErrorsAsFixed(meta, item);
        item = undefined;
      }
    }
  }

  return item;
}


/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @return {array} [fixedValue, allErrors] - if `allErrors` is empty and `canFix` == true, `fixedValue` can differ from value if was fixed.
 *  `allErrors` is an array of {key, args, fixed, fixedFrom, fixedTo}
 *  If `args` === null, `key` should not be translated
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

    let fixedAllErrors = !allErrors?.find(e => !e.fixed);
    const shouldCallValidateFn = !!field
      // `validateValue` should not be available for valueSrc === "func" or "field"
      && !["field", "func"].includes(valueSrc)
      // eg. if value was > max, and fixed to max, but max value can not satisfy validateValue() in config
      && (!allErrors?.length || fixedAllErrors);
    if (shouldCallValidateFn) {
      //todo: why not just take fieldSettings from fieldConfig, why need to use getFieldWidgetConfig() ??
      // const fieldConfig = getFieldConfig(config, field);
      // const fieldSettings = fieldConfig?.fieldSettings;
      const w = getWidgetForFieldOp(config, field, operator, valueSrc);
      const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
      const fieldWidgetDefinition = getFieldWidgetConfig(config, field, operator, w, valueSrc, { forExport: true });
      const rightFieldDefinition = (valueSrc === "field" ? getFieldConfig(config, value) : null);
      const fieldSettings = fieldWidgetDefinition; // widget definition merged with fieldSettings

      const fn = fieldWidgetDefinition.validateValue;
      if (typeof fn === "function") {
        const args = [
          fixedValue, 
          fieldSettings,
          operator,
          operatorDefinition
        ];
        if (valueSrc === "field")
          args.push(rightFieldDefinition);
        const validResult = fn.call(config.ctx, ...args);
        if (typeof validResult === "object" && validResult !== null && !Array.isArray(validResult)) {
          let newError;
          if (validResult.error?.key) {
            newError = {...validResult.error};
          } else {
            // Note: `null` means it's not translated string!
            newError = {key: validResult.error, args: null};
          }
          if (validResult.fixedValue !== undefined && canFix) {
            newError.fixed = true;
            newError.fixedFrom = fixedValue;
            newError.fixedTo = validResult.fixedValue;
            fixedValue = validResult.fixedValue;
          }
          allErrors.push(newError);
        } else if (typeof validResult === "boolean") {
          if (validResult == false) {
            allErrors.push({key: constants.INVALID_VALUE, args: {}});
          }
        } else if (typeof validResult === "string") {
          allErrors.push({key: validResult, args: null});
        }
      }
    }

    // if can't fix value, use defaultValue
    fixedAllErrors = !allErrors?.find(e => !e.fixed);
    if (allErrors?.length && !fixedAllErrors && canFix) {
      const fieldConfig = getFieldConfig(config, field);
      const fieldSettings = fieldConfig?.fieldSettings;
      const defaultValue = fieldSettings?.defaultValue;
      if (defaultValue !== undefined) {
        const lastError = allErrors[allErrors.length - 1];
        lastError.fixed = true;
        lastError.fixedFrom = fixedValue;
        lastError.fixedTo = defaultValue;
        fixedValue = defaultValue;
        // mark all errors as fixed
        allErrors.map(e => {
          e.fixed = true;
        });
      }
    }
  }
  
  return [fixedValue, allErrors];
};

/**
 * 
 */
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
    const fieldSettings = fieldConfig?.fieldSettings;
    const listValues = fieldSettings?.treeValues || fieldSettings?.listValues;
    const isAsyncListValues = !!fieldSettings?.asyncFetch;
    // todo: for select/multiselect value can be string or number
    const canSkipTypeCheck = listValues || isAsyncListValues;

    // validate type
    if (valueType && wType && valueType != wType) {
      allErrors.push({
        key: constants.INCORRECT_VALUE_TYPE,
        args: { wType, valueType }
      });
      return [value, allErrors];
    }
    if (jsType && !isTypeOf(value, jsType) && !canSkipTypeCheck) {
      allErrors.push({
        key: constants.INCORRECT_VALUE_JS_TYPE,
        args: { jsType, valueTypeof: typeOf(value) }
      });
      return [value, allErrors];
    }

    if (fieldSettings) {
      // validate against list of values
      const realListValues = asyncListValues || listValues;
      // tip: "case_value" is deprecated, don't apply validation based on listValues
      if (realListValues && !fieldSettings.allowCustomValues && w !== "case_value") {
        [fixedValue, allErrors] = validateValueInList(
          value, realListValues, canFix, isEndValue, config.settings.removeInvalidMultiSelectValuesOnLoad
        );
      }
      // validate length
      if (fieldSettings.maxLength > 0 && value != null && String(value).length > fieldSettings.maxLength) {
        fixedValue = canFix ? String(value).substring(0, fieldSettings.maxLength) : value;
        allErrors.push({
          key: constants.VALUE_LENGTH_CONSTRAINT_FAIL,
          args: { value, length: String(value).length, fieldSettings },
          fixed: canFix,
          fixedFrom: canFix ? value : undefined,
          fixedTo: canFix ? fixedValue : undefined,
        });
      }
      // validate min/max
      const minMaxContext = fieldSettings.min != undefined && fieldSettings.max != undefined ? constants._CONTEXT_MIN_MAX : undefined;
      if (fieldSettings.min != null && value < fieldSettings.min) {
        fixedValue = canFix ? fieldSettings.min : value;
        allErrors.push({
          key: constants.VALUE_MIN_CONSTRAINT_FAIL,
          args: { value, fieldSettings, context: minMaxContext },
          fixed: canFix,
          fixedFrom: canFix ? value : undefined,
          fixedTo: canFix ? fixedValue : undefined,
        });
      }
      if (fieldSettings.max != null && value > fieldSettings.max) {
        fixedValue = canFix ? fieldSettings.max : value;
        allErrors.push({
          key: constants.VALUE_MAX_CONSTRAINT_FAIL,
          args: { value, fieldSettings, context: minMaxContext },
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
  const {fieldSeparator, canCompareFieldWithField} = config.settings;
  const isFuncArg = typeof field == "object" && field?._isFuncArg;
  const leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  const leftFieldConfig = getFieldConfig(config, leftField);
  const rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  const rightFieldConfig = getFieldConfig(config, value);
  if (!rightFieldConfig) {
    allErrors.push({
      key: constants.NO_CONFIG_FOR_FIELD_VALUE,
      args: { field: rightFieldStr }
    });
    return [value, allErrors];
  }
  if (leftField && rightFieldStr === leftFieldStr && !isFuncArg) {
    allErrors.push({
      key: constants.CANT_COMPARE_FIELD_WITH_ITSELF,
      args: { field: leftFieldStr }
    });
    return [value, allErrors];
  }
  if (valueType && valueType != rightFieldConfig.type) {
    allErrors.push({
      key: constants.INCORRECT_FIELD_TYPE,
      args: { field: rightFieldStr, type: rightFieldConfig.type, expected: valueType }
    });
    return [value, allErrors];
  }
  if (leftField && !isFuncArg && canCompareFieldWithField) {
    const canUse = canCompareFieldWithField(
      leftFieldStr, leftFieldConfig, rightFieldStr, rightFieldConfig, operator
    );
    if (!canUse) {
      allErrors.push({
        key: constants.CANT_COMPARE_FIELD_WITH_FIELD,
        args: { leftField: leftFieldStr, rightField: rightFieldStr }
      });
      return [value, allErrors];
    }
  }
  return [value];
};

/**
 * @param {bool} canDropArgs true only if user sets new func key
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
  const funcName = funcConfig.label ?? funcKey;
  if (valueType && funcConfig.returnType != valueType) {
    allErrors.push({
      key: constants.INCORRECT_FUNCTION_RETURN_TYPE,
      args: { funcKey, funcName, returnType: funcConfig.returnType, valueType }
    });
    return [value, allErrors];
  }
  //tip: Exception for canDropArgs (true only if changing func) - can fix/drop args to fit new func validations
  canFix = canFix || canDropArgs;
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const args = fixedValue.get("args");
    const argVal = args ? args.get(argKey) : undefined;
    const argDef = getFieldConfig(config, argConfig);
    const argName = argDef?.label ?? argKey;
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    if (argValue !== undefined) {
      const [fixedArgVal, argErrors] = validateValue(
        config, leftField, argDef, operator, argValue, argConfig.type, argValueSrc, asyncListValues, canFix, isEndValue, canDropArgs,
      );
      const isValid = !argErrors?.length;
      const willFix = canFix && fixedArgVal !== argValue;
      //const willFixAllErrors = !isValid && willFix && !allErrors?.find(e => !e.fixed);
      //tip: reset to default ONLY if isEndValue==true
      const canDropOrReset = canFix && !isValid && !willFix && (isEndValue || canDropArgs);
      if (willFix) {
        fixedValue = fixedValue.setIn(["args", argKey, "value"], fixedArgVal);
      }
      if (canDropOrReset) {
        // reset to default
        fixedValue = fixedValue.deleteIn(["args", argKey]);
        fixedValue = setFuncDefaultArg(config, fixedValue, funcConfig, argKey);
      }
      if (!isValid) {
        const firstError = argErrors.find(e => !e.fixed && !e.ignore) ?? argErrors.find(e => !e.fixed) ?? argErrors[0];
        const fixed = willFix || canDropOrReset;
        const ignore = argErrors.filter(e => !e.ignore).length === 0;
        if (firstError) {
          const argValidationError = translateValidation(firstError);
          allErrors.push({
            key: constants.INVALID_FUNC_ARG_VALUE,
            args: {
              funcKey, funcName, argKey, argName, argValidationError,
              // more meta
              argErrors,
            },
            ignore,
            fixed,
            fixedFrom: fixed ? argValue : undefined,
            fixedTo: fixed ? (willFix ? fixedArgVal : argConfig.defaultValue) : undefined,
          });
        }
      }
    } else if (!argConfig.isOptional && (isEndValue || canDropArgs)) {
      const canReset = canFix && argConfig.defaultValue !== undefined && (isEndValue || canDropArgs);
      const canAddError = isEndValue;
      //tip: Exception for canDropArgs (true only if changing func) - don't show error about required args
      if (canAddError) {
        allErrors.push({
          key: constants.REQUIRED_FUNCTION_ARG,
          args: { funcKey, funcName, argKey, argName },
          fixed: canReset,
          fixedTo: canReset ? argConfig.defaultValue : undefined,
          ignore: !canReset, // tip: don't show error message in UI about missing arg after validation API call
        });
      }
      if (canReset) {
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
  const operatorCardinality = operator ? getOpCardinality(operatorConfig) : null;
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


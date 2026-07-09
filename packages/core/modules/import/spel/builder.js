import * as Utils from "../../utils";

const { isObject, uuid } = Utils.OtherUtils;
const { defaultConjunction, defaultGroupConjunction } = Utils.DefaultUtils;
const { getFieldConfig, getWidgetForFieldOp } = Utils.ConfigUtils;


// export const wrapInDefaultConjRuleGroup = (rule, parentField, parentFieldConfig, config, conj) => {
//   if (!rule) return undefined;
//   return {
//     type: "rule_group",
//     id: uuid(),
//     children1: { [rule.id]: rule },
//     properties: {
//       conjunction: conj || defaultGroupConjunction(config, parentFieldConfig),
//       not: false,
//       field: parentField,
//     }
//   };
// };

export const wrapInDefaultConj = (rule, config, not = false) => {
  return {
    type: "group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: defaultConjunction(config),
      not: not || false
    }
  };
};

export const buildCase = (convCond, convVal, conv, config, meta, spel = null) => {
  const valProperties = buildCaseValProperties(config, meta, conv, convVal, spel);

  let caseI;
  if (convCond) {
    caseI = convCond;
    if (caseI.type) {
      if (caseI.type != "group" && caseI.type != "case_group") {
        caseI = wrapInDefaultConj(caseI, config);
      }
      caseI.type = "case_group";
    } else {
      meta.errors.push(`Unexpected case: ${JSON.stringify(caseI)}`);
      caseI = undefined;
    }
  } else {
    caseI = {
      id: uuid(),
      type: "case_group",
      properties: {}
    };
  }

  if (caseI) {
    caseI.properties = {
      ...caseI.properties,
      ...valProperties
    };
  }

  return caseI;
};


export const buildSimpleSwitch = (convVal, conv, config, meta) => {
  let children1 = {};
  const caseI = buildCase(null, convVal, conv, config, meta);
  if (caseI) {
    children1[caseI.id] = caseI;
  }
  let res = {
    type: "switch_group",
    id: uuid(),
    children1,
    properties: {}
  };
  return res;
};

export const buildRuleGroup = ({groupFilter, groupFieldValue}, opKey, convertedArgs, config, meta) => {
  if (groupFieldValue.valueSrc != "field")
    throw `Bad groupFieldValue: ${JSON.stringify(groupFieldValue)}`;
  const groupField = groupFieldValue.value;
  let groupOpRule = buildRule(config, meta, groupField, opKey, convertedArgs);
  if (!groupOpRule)
    return undefined;
  const fieldConfig = getFieldConfig(config, groupField);
  const mode = fieldConfig?.mode;
  let res;

  if (groupFilter?.type === "group") {
    res = {
      ...(groupFilter || {}),
      type: "rule_group",
      properties: {
        ...groupOpRule.properties,
        ...(groupFilter?.properties || {}),
        mode
      }
    };
  } else if (groupFilter) {
    // rule_group in rule_group
    res = {
      ...(groupOpRule || {}),
      type: "rule_group",
      children1: [ groupFilter ],
      properties: {
        ...groupOpRule.properties,
        mode
      }
    };
  } else {
    res = {
      ...(groupOpRule || {}),
      type: "rule_group",
      properties: {
        ...groupOpRule.properties,
        mode
      }
    };
  }

  if (!res.id)
    res.id = uuid();
  return res;
};



export const buildCaseValProperties = (config, meta, conv, convVal, spel = null) => {
  let valProperties = {};
  let widget;
  let widgetConfig;
  const caseValueFieldConfig = getFieldConfig(config, "!case_value");
  if (convVal?.valueType === "case_value") {
    /**
     * @deprecated
     */
    widget = "case_value";
  } else {
    widget = caseValueFieldConfig?.mainWidget;
    widgetConfig = config.widgets[widget];
    if (convVal && convVal.valueSrc === "value") {
      convVal.valueType = widgetConfig?.type || caseValueFieldConfig?.type || convVal.valueType;
    }
  }
  const widgetDef = config.widgets[widget];
  if (widget === "case_value") {
    /**
     * @deprecated
     */
    const importCaseValue = widgetDef?.spelImportValue;
    if (importCaseValue) {
      const [normVal, normErrors] = importCaseValue.call(config.ctx, convVal);
      normErrors.map(e => meta.errors.push(e));
      if (normVal != undefined) {
        valProperties = {
          value: [normVal],
          valueSrc: ["value"],
          valueType: [widgetDef?.type ?? "case_value"],
          field: "!case_value",
        };
      }
    }
  } else if (convVal != undefined && convVal?.value != undefined) {
    valProperties = {
      value: [convVal.value],
      valueSrc: [convVal.valueSrc],
      valueType: [convVal.valueType],
      field: "!case_value",
    };
  }
  return valProperties;
};

export const buildRule = (config, meta, field, opKey, convertedArgs, spel) => {
  if (convertedArgs.filter(v => v === undefined).length) {
    return undefined;
  }
  let fieldSrc = field?.func ? "func" : "field";
  if (isObject(field) && field.valueSrc) {
    // if comed from convertFuncToOp()
    fieldSrc = field.valueSrc;
    field = field.value;
  }
  const fieldConfig = getFieldConfig(config, field);
  if (!fieldConfig) {
    meta.errors.push(`No config for field ${field}`);
    return undefined;
  }

  const parentFieldConfig = getFieldConfig(config, spel?._groupField);
  const isRuleGroup = fieldConfig.type == "!group";
  const isGroupArray = isRuleGroup && fieldConfig.mode == "array";
  const isInRuleGroup = parentFieldConfig?.type == "!group";

  let opConfig = config.operators[opKey];
  const reversedOpConfig = config.operators[opConfig?.reversedOp];
  const opNeedsReverse = spel?.not && ["between"].includes(opKey);
  const opCanReverse = !!reversedOpConfig;
  const canRev = opCanReverse && (
    !!config.settings.reverseOperatorsForNot
    || opNeedsReverse
    || !isRuleGroup && isInRuleGroup // 2+ rules in rule-group should be flat. see inits.with_not_and_in_some in test
  );
  const needRev = spel?.not && canRev || opNeedsReverse;
  if (needRev) {
    // todo: should be already handled at convertOp ?  or there are special cases to handle here, like rule-group ?
    opKey = opConfig.reversedOp;
    opConfig = config.operators[opKey];
    spel.not = !spel.not;
  }
  const needWrapWithNot = !!spel?.not;

  const widget = getWidgetForFieldOp(config, field, opKey);
  const widgetConfig = config.widgets[widget || fieldConfig.mainWidget];
  const asyncListValuesArr = convertedArgs.map(v => v.asyncListValues).filter(v => v != undefined);
  const asyncListValues = asyncListValuesArr.length ? asyncListValuesArr[0] : undefined;

  let res = {
    type: "rule",
    id: uuid(),
    properties: {
      field,
      fieldSrc,
      operator: opKey,
      value: convertedArgs.map(v => v.value),
      valueSrc: convertedArgs.map(v => v.valueSrc),
      valueType: convertedArgs.map(v => {
        if (v.valueSrc == "value") {
          return widgetConfig?.type || fieldConfig?.type || v.valueType;
        }
        return v.valueType;
      }),
      ...(asyncListValues ? {asyncListValues} : {}),
    }
  };

  if (needWrapWithNot) {
    res = wrapInDefaultConj(res, config, spel.not);
    // spel.not = !spel.not; // why I added this line?
  }

  return res;
};

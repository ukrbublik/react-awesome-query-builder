export const settings = {
  reverseOperatorsForNot: false,
  canShortMongoQuery: true,
  formatField: (field, parts, label2, fieldDefinition, config, isForDisplay) => {
    if (isForDisplay)
      return label2;
    else
      return field;
  },
  caseValueField: {
    type: "case_value",
  },
  fieldSources: ["field"],
  keepInputOnChangeFieldSrc: true,
  fieldItemKeysForSearch: ["label", "path", "altLabel", "grouplabel"],
  listKeysForSearch: ["title", "value"],
  valueSourcesInfo: {
    value: {},
  },
  fieldSeparator: ".",
  fieldSeparatorDisplay: ".",
  canReorder: true,
  canRegroup: true,
  canDeleteLocked: false,
  canLeaveEmptyGroup: true,
  shouldCreateEmptyGroup: false,
  exportPreserveGroups: false,
  removeEmptyGroupsOnLoad: true,
  removeEmptyRulesOnLoad: true,
  removeIncompleteRulesOnLoad: false,
  removeInvalidMultiSelectValuesOnLoad: true,
  showErrorMessage: false,
  setOpOnChangeField: ["keep", "default"], // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'
  groupOperators: ["some", "all", "none"],

  defaultConjunction: "AND",
  // todo: deprecated, remove this in favour of defaultConjunction
  defaultGroupConjunction: "AND",

  // localization
  locale: {
    moment: "en",
  },
  valueLabel: "Value",
  valuePlaceholder: "Value",
  fieldLabel: "Field",
  operatorLabel: "Operator",
  funcLabel: "Function",
  fieldPlaceholder: "Select field",
  funcPlaceholder: "Select function",
  operatorPlaceholder: "Select operator",
  lockLabel: "Lock",
  lockedLabel: "Locked",
  deleteLabel: "Delete",
  addGroupLabel: "Add group",
  addCaseLabel: "Add condition",
  addDefaultCaseLabel: "Add default condition",
  defaultCaseLabel: "Default:",
  addRuleLabel: "Add rule",
  addSubRuleLabel: "Add sub rule",
  addSubGroupLabel: "Add sub group",
  delGroupLabel: "Delete",
  notLabel: "Not",
  fieldSourcesPopupTitle: "Select source",
  valueSourcesPopupTitle: "Select value source",
  removeRuleConfirmOptions: null,
  removeGroupConfirmOptions: null,

};

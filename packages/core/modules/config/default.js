

export const settings = {
  formatField: (field, parts, label2, fieldDefinition, config, isForDisplay) => {
    if (isForDisplay)
      return label2;
    else
      return field;
  },


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
  canShortMongoQuery: true,
  removeEmptyGroupsOnLoad: true,
  removeIncompleteRulesOnLoad: true,
  removeInvalidMultiSelectValuesOnLoad: true,
  setOpOnChangeField: ["keep", "default"], // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'
  groupOperators: ["some", "all", "none"],

  convertableWidgets: {
    "number": ["slider", "rangeslider"],
    "slider": ["number", "rangeslider"],
    "rangeslider": ["number", "slider"],
    "text": ["textarea"],
    "textarea": ["text"]
  },
  defaultGroupConjunction: "AND",
  jsonLogic: {
    groupVarKey: "var",
    altVarKey: "var",
    lockedOp: "locked"
  },

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
  deleteLabel: null,
  addGroupLabel: "Add group",
  addCaseLabel: "Add condition",
  addDefaultCaseLabel: "Add default condition",
  defaultCaseLabel: "Default:",
  addRuleLabel: "Add rule",
  addSubRuleLabel: "Add sub rule",
  delGroupLabel: "",
  notLabel: "Not",
  valueSourcesPopupTitle: "Select value source",
  removeRuleConfirmOptions: null,
  removeGroupConfirmOptions: null,

};

import React from "react";
import {
  BasicFuncs, Widgets, Fields, Config, Settings, Funcs,
} from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import { getCaseValueWidgetConfig } from "./spel_concat";
import InputAdornment from "@mui/material/InputAdornment";

export default (): Config => {
  const InitialConfig = MuiConfig;

  const widgets: Widgets = {
    ...InitialConfig.widgets,
    case_value: getCaseValueWidgetConfig(InitialConfig),
  };

  const fields: Fields = {
    text: {
      label: "Text",
      type: "text",
      valueSources: ["value", "field"],
      excludeOperators: ["proximity"]
    },
    qty: {
      label: "Qty",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 0,
        max: 1000,
      },
      preferWidgets: ["number"]
    },
    discount: {
      label: "Discount",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 0,
        max: 100,
        step: 5,
      },
      preferWidgets: ["slider", "rangeslider"],
      widgets: {
        slider: {
          widgetProps: {
            customProps: {
              input: {
                InputProps: {
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }
              }
            }
          }
        }
      }
    },
    price: {
      label: "Price",
      type: "number",
      preferWidgets: ["price"],
      valueSources: ["value"],
      isSpelVariable: true,
      fieldSettings: {
        min: 10,
        max: 100
      },
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "blue", title: "Blue" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" }
        ]
      }
    },
    is_promotion: {
      label: "Promotoion",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"],
      mainWidgetProps: {
        hideOperator: true,
        operatorInlineLabel: "is",
      }
    },
  };

  const settings: Settings = {
    ...InitialConfig.settings,
    caseValueField: {
      // type: "case_value", // >> Uncomment to see deprecated using of SpelConcatPart ("./spel_concat.tsx")
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [{
          value: "Hot",
          title: "Hot"
        }, {
          value: "In stock",
          title: "In stock"
        }, {
          value: "other",
          title: "other"
        }],
      },
      mainWidgetProps: {
        valueLabel: "Then",
        valuePlaceholder: "Then",
      },
    },
    maxNumberOfCases: 5,
    canRegroupCases: true,
    maxNesting: 3,
    canLeaveEmptyCase: false,
    showErrorMessage: true,
  };

  const funcs: Funcs = {
    LOWER: BasicFuncs.LOWER,
    UPPER: BasicFuncs.UPPER,
    LINEAR_REGRESSION: BasicFuncs.LINEAR_REGRESSION,
  };

  const config: Config = {
    ...InitialConfig,
    funcs,
    widgets,
    fields,
    settings
  };

  return config;
};



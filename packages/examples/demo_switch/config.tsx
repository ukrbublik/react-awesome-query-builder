import React from "react";
import {
  Utils as QbUtils, 
  Widgets, CaseValueWidget, Fields, Config, Settings, SpelConcatPart, WidgetProps
} from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import ReactSelect from "./select";

/**
 * @deprecated
 */
const jsonLogicFormatConcat = (parts: SpelConcatPart[]) => {
  if (parts && Array.isArray(parts) && parts.length) {
    return parts
      .map(part => part?.value ?? part)
      .filter(r => r != undefined);
  } else {
    return undefined;
  }
};

/**
 * @deprecated
 */
const jsonLogicImportConcat = (val: any): SpelConcatPart[] => {
  if (val == undefined)
    return undefined;
  const errors: string[] = [];
  const parts = Array.isArray(val) ? val : [val];
  const res = parts.filter(v => v != undefined).map(v => {
    return {
      type: "property", 
      value: val as string
    } as SpelConcatPart;
  });
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  return res;
};

export default (): Config => {
  const InitialConfig = MuiConfig;

  /**
   * @deprecated
   */
  const caseValueWidgetConfig: CaseValueWidget = {
    ...InitialConfig.widgets.case_value,
    spelFormatValue: QbUtils.ExportUtils.spelFormatConcat,
    spelImportValue: QbUtils.ExportUtils.spelImportConcat,
    jsonLogic: jsonLogicFormatConcat,
    jsonLogicImport: jsonLogicImportConcat,
    factory: ({value, setValue, id}: WidgetProps) => 
      <ReactSelect 
        value={value as SpelConcatPart[]}
        setValue={setValue}
        k={id!}
      />
  };

  const widgets: Widgets = {
    ...InitialConfig.widgets,
    case_value: caseValueWidgetConfig
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
      fieldSettings: {
        min: 0
      },
      valueSources: ["value", "field"],
      preferWidgets: ["number"]
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 10,
        max: 100
      },
      preferWidgets: ["slider", "rangeslider"],
      isSpelVariable: true
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
      label: "Promo?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"]
    }
  };

  const settings: Settings = {
    ...InitialConfig.settings,
    caseValueField: {
      // type: "case_value", // >> Encomment to see using of SpelConcatPart
      type: "select",
      mainWidgetProps: {
        valueLabel: "Then",
        valuePlaceholder: "Then",
      },
      fieldSettings: {
        listValues: ["Ukraine", "USA", "other"],
        // todo: support validateValue for caseValueField
      }
    },
    maxNumberOfCases: 3,
    canRegroupCases: true,
    maxNesting: 3,
    canLeaveEmptyCase: false,
  };

  const config: Config = {
    ...InitialConfig,
    widgets,
    fields,
    settings
  };

  return config;
};



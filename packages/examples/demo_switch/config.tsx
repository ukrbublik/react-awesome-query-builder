import React from "react";
import {
  Utils as QbUtils, 
  Widgets, Fields, Config, Settings, SpelConcatPart, WidgetProps
} from "@react-awesome-query-builder/ui";
import { MaterialConfig } from "@react-awesome-query-builder/material";
import ReactSelect from "./select";

export default (): Config => {
  const InitialConfig = MaterialConfig;

  const widgets: Widgets = {
    ...InitialConfig.widgets,
    case_value: {
      ...InitialConfig.widgets.case_value,
      spelFormatValue: QbUtils.ExportUtils.spelFormatConcat,
      spelImportValue: QbUtils.ExportUtils.spelImportConcat,
      factory: ({value, setValue, id}: WidgetProps) => 
        <ReactSelect 
          value={value as SpelConcatPart[]}
          setValue={setValue}
          k={id!}
        />
    }
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



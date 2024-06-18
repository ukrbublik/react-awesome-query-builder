import React from "react";
import {
  Utils as QbUtils, BasicConfig, CaseValueWidget, SpelConcatPart, WidgetProps, SelectFieldSettings, ListItem,
} from "@react-awesome-query-builder/ui";
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

/**
 * @deprecated
 */
export const getCaseValueWidgetConfig = (config: BasicConfig): CaseValueWidget => ({
  ...config.widgets.case_value,
  spelFormatValue: QbUtils.ExportUtils.spelFormatConcat,
  spelImportValue: QbUtils.ExportUtils.spelImportConcat,
  jsonLogic: jsonLogicFormatConcat,
  jsonLogicImport: jsonLogicImportConcat,
  factory: ({value, setValue, id, fieldDefinition}: WidgetProps) => 
    <ReactSelect 
      value={value as SpelConcatPart[]}
      setValue={setValue}
      listValues={(fieldDefinition.fieldSettings as SelectFieldSettings)?.listValues as ListItem[]}
      k={id!}
    />
});

import React from "react";
import {
  Utils as QbUtils, BasicConfig, CaseValueWidget, SpelConcatPart, WidgetProps, SelectFieldSettings, ListItem,
} from "@react-awesome-query-builder/ui";
import ReactSelect from "./select";

/**
 * @deprecated
 */
export const getCaseValueWidgetConfig = (config: BasicConfig): CaseValueWidget => ({
  ...config.widgets.case_value,
  spelFormatValue: QbUtils.SpelUtils.spelFormatConcat,
  spelImportValue: QbUtils.SpelUtils.spelImportConcat,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  jsonLogic: (QbUtils.JsonLogicUtils as any).jsonLogicFormatConcat,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  jsonLogicImport: (QbUtils.JsonLogicUtils as any).jsonLogicImportConcat,
  factory: ({value, setValue, id, fieldDefinition}: WidgetProps) => 
    <ReactSelect 
      value={value as SpelConcatPart[]}
      setValue={setValue}
      listValues={(fieldDefinition.fieldSettings as SelectFieldSettings)?.listValues as ListItem[]}
      k={id!}
    />
});

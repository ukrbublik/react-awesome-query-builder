import { ElementType } from "react";
import {
  FieldProps, ConjsProps, SwitchProps, ButtonProps, ButtonGroupProps, ProviderProps, ValueSourcesProps, ConfirmFunc,
  BooleanWidgetProps, TextWidgetProps, DateTimeWidgetProps, SelectWidgetProps, NumberWidgetProps, RangeSliderWidgetProps, PriceWidgetProps
} from "@react-awesome-query-builder/ui";
import type { Theme } from "@mui/material/styles";
import { ConfirmOptions } from "material-ui-confirm";

export interface MuiWidgets {
  // material core widgets
  MuiFieldSelect: ElementType<FieldProps>,
  MuiFieldAutocomplete: ElementType<FieldProps>,
  MuiConjs: ElementType<ConjsProps>,
  MuiSwitch: ElementType<SwitchProps>,
  MuiButton: ElementType<ButtonProps>,
  MuiButtonGroup: ElementType<ButtonGroupProps>,
  MuiProvider: ElementType<ProviderProps>,
  MuiValueSources: ElementType<ValueSourcesProps>,
  MuiConfirm: ConfirmFunc,
  MuiUseConfirm: () => (options?: ConfirmOptions) => Promise<void>,

  // material core widgets
  MuiBooleanWidget: ElementType<BooleanWidgetProps>,
  MuiTextWidget: ElementType<TextWidgetProps>,
  MuiTextAreaWidget: ElementType<TextWidgetProps>,
  MuiDateWidget: ElementType<DateTimeWidgetProps>,
  MuiTimeWidget: ElementType<DateTimeWidgetProps>,
  MuiDateTimeWidget: ElementType<DateTimeWidgetProps>,
  MuiMultiSelectWidget: ElementType<SelectWidgetProps>,
  MuiSelectWidget: ElementType<SelectWidgetProps>,
  MuiNumberWidget: ElementType<NumberWidgetProps>,
  MuiPriceWidget: ElementType<PriceWidgetProps>;
  MuiSliderWidget: ElementType<NumberWidgetProps>,
  MuiRangeWidget: ElementType<RangeSliderWidgetProps>,
  MuiAutocompleteWidget: ElementType<SelectWidgetProps>,

  themeToCssVars: (theme: Theme) => Record<string, string>,
}
export declare const MuiWidgets: MuiWidgets;
export default MuiWidgets;

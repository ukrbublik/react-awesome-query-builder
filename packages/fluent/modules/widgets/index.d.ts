import { ElementType } from "react";
import {
  FieldProps, ConjsProps, SwitchProps, ButtonProps, ButtonGroupProps, ProviderProps, ValueSourcesProps, ConfirmFunc,
  BooleanWidgetProps, TextWidgetProps, DateTimeWidgetProps, SelectWidgetProps, NumberWidgetProps, RangeSliderWidgetProps
} from "@react-awesome-query-builder/ui";

export interface FluentUIWidgets {
  // core widgets
  FluentUIFieldSelect: ElementType<FieldProps>,
  FluentUIConjs: ElementType<ConjsProps>,
  FluentUIButton: ElementType<ButtonProps>,
  FluentUIButtonGroup: ElementType<ButtonGroupProps>,
  FluentUIProvider: ElementType<ProviderProps>,
  FluentUIValueSources: ElementType<ValueSourcesProps>,
  FluentUIConfirm: ConfirmFunc,

  // core widgets
  FluentUIBooleanWidget: ElementType<BooleanWidgetProps>,
  FluentUITextWidget: ElementType<TextWidgetProps>,
  FluentUITextAreaWidget: ElementType<TextWidgetProps>,
  FluentUIDateWidget: ElementType<DateTimeWidgetProps>,
  FluentUITimeWidget: ElementType<DateTimeWidgetProps>,
  FluentUIDateTimeWidget: ElementType<DateTimeWidgetProps>,
  FluentUIMultiSelectWidget: ElementType<SelectWidgetProps>,
  FluentUISelectWidget: ElementType<SelectWidgetProps>,
  FluentUINumberWidget: ElementType<NumberWidgetProps>,
  FluentUIPriceWidget: ElementType<NumberWidgetProps>;
  FluentUISliderWidget: ElementType<NumberWidgetProps>,
}
export declare const FluentUIWidgets: FluentUIWidgets;
export default FluentUIWidgets;

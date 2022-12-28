import { ElementType } from "react";
import {
  FieldProps, ConjsProps, ButtonProps, ButtonGroupProps, ProviderProps, ValueSourcesProps, ConfirmFunc,
  BooleanWidgetProps, TextWidgetProps, DateTimeWidgetProps, SelectWidgetProps, NumberWidgetProps
} from "@react-awesome-query-builder/ui";

export interface BootstrapWidgets {
  // bootstrap core widgets
  BootstrapFieldSelect: ElementType<FieldProps>,
  BootstrapConjs: ElementType<ConjsProps>,
  BootstrapButton: ElementType<ButtonProps>,
  BootstrapButtonGroup: ElementType<ButtonGroupProps>,
  BootstrapProvider: ElementType<ProviderProps>,
  BootstrapValueSources: ElementType<ValueSourcesProps>,
  BootstrapConfirm: ConfirmFunc,

  // bootstrap value widgets
  BootstrapBooleanWidget: ElementType<BooleanWidgetProps>,
  BootstrapTextWidget: ElementType<TextWidgetProps>,
  BootstrapTextAreaWidget: ElementType<TextWidgetProps>,
  BootstrapDateWidget: ElementType<DateTimeWidgetProps>,
  BootstrapTimeWidget: ElementType<DateTimeWidgetProps>,
  BootstrapDateTimeWidget: ElementType<DateTimeWidgetProps>,
  BootstrapMultiSelectWidget: ElementType<SelectWidgetProps>,
  BootstrapSelectWidget: ElementType<SelectWidgetProps>,
  BootstrapNumberWidget: ElementType<NumberWidgetProps>,
  BootstrapSliderWidget: ElementType<NumberWidgetProps>,
}

declare const BootstrapWidgets: BootstrapWidgets;
export default BootstrapWidgets;

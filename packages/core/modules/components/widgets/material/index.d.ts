import { ElementType } from "react";
import {
  FieldProps, ConjsProps, SwitchProps, ButtonProps, ButtonGroupProps, ProviderProps, ValueSourcesProps, ConfirmFunc,
  BooleanWidgetProps, TextWidgetProps, DateTimeWidgetProps, SelectWidgetProps, NumberWidgetProps, RangeSliderWidgetProps
} from "../../..";

export interface MaterialWidgets {
  // material core widgets
  MaterialFieldSelect: ElementType<FieldProps>,
  MaterialFieldAutocomplete: ElementType<FieldProps>,
  MaterialConjs: ElementType<ConjsProps>,
  MaterialSwitch: ElementType<SwitchProps>,
  MaterialButton: ElementType<ButtonProps>,
  MaterialButtonGroup: ElementType<ButtonGroupProps>,
  MaterialProvider: ElementType<ProviderProps>,
  MaterialValueSources: ElementType<ValueSourcesProps>,
  MaterialConfirm: ConfirmFunc,
  MaterialUseConfirm: () => Function,

  // material core widgets
  MaterialBooleanWidget: ElementType<BooleanWidgetProps>,
  MaterialTextWidget: ElementType<TextWidgetProps>,
  MaterialTextAreaWidget: ElementType<TextWidgetProps>,
  MaterialDateWidget: ElementType<DateTimeWidgetProps>,
  MaterialTimeWidget: ElementType<DateTimeWidgetProps>,
  MaterialDateTimeWidget: ElementType<DateTimeWidgetProps>,
  MaterialMultiSelectWidget: ElementType<SelectWidgetProps>,
  MaterialSelectWidget: ElementType<SelectWidgetProps>,
  MaterialNumberWidget: ElementType<NumberWidgetProps>,
  MaterialSliderWidget: ElementType<NumberWidgetProps>,
  MaterialRangeWidget: ElementType<RangeSliderWidgetProps>,
  MaterialAutocompleteWidget: ElementType<SelectWidgetProps>,
}

declare const MaterialWidgets: MaterialWidgets;
export default MaterialWidgets;

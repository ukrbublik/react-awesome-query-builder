import { ElementType } from "react";
import {
  FieldProps, ConjsProps, SwitchProps, ButtonProps, ButtonGroupProps, ProviderProps, ValueSourcesProps, ConfirmFunc,
  BooleanWidgetProps, TextWidgetProps, DateTimeWidgetProps, SelectWidgetProps, NumberWidgetProps, RangeSliderWidgetProps, PriceWidgetProps
} from "@react-awesome-query-builder/ui";
import { ConfirmOptions } from "material-ui-confirm";

export interface MaterialWidgets {
  // material core widgets
  MaterialFieldSelect: ElementType<FieldProps>;
  MaterialFieldAutocomplete: ElementType<FieldProps>;
  MaterialConjs: ElementType<ConjsProps>;
  MaterialSwitch: ElementType<SwitchProps>;
  MaterialButton: ElementType<ButtonProps>;
  MaterialButtonGroup: ElementType<ButtonGroupProps>;
  MaterialProvider: ElementType<ProviderProps>;
  MaterialValueSources: ElementType<ValueSourcesProps>;
  MaterialConfirm: ConfirmFunc;
  MaterialUseConfirm: () => (options?: ConfirmOptions) => Promise<void>;

  // material core widgets
  MaterialBooleanWidget: ElementType<BooleanWidgetProps>;
  MaterialTextWidget: ElementType<TextWidgetProps>;
  MaterialTextAreaWidget: ElementType<TextWidgetProps>;
  MaterialDateWidget: ElementType<DateTimeWidgetProps>;
  MaterialTimeWidget: ElementType<DateTimeWidgetProps>;
  MaterialDateTimeWidget: ElementType<DateTimeWidgetProps>;
  MaterialMultiSelectWidget: ElementType<SelectWidgetProps>;
  MaterialSelectWidget: ElementType<SelectWidgetProps>;
  MaterialNumberWidget: ElementType<NumberWidgetProps>;
  MaterialPriceWidget: ElementType<PriceWidgetProps>;
  MaterialSliderWidget: ElementType<NumberWidgetProps>;
  MaterialRangeWidget: ElementType<RangeSliderWidgetProps>;
  MaterialAutocompleteWidget: ElementType<SelectWidgetProps>;
}

export declare const MaterialWidgets: MaterialWidgets;
export default MaterialWidgets;

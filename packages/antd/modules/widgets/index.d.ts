import { ElementType } from "react";
import {
  FieldProps, ConjsProps, SwitchProps, ButtonProps, ButtonGroupProps, ProviderProps, ValueSourcesProps, ConfirmFunc,
  BooleanWidgetProps, TextWidgetProps, DateTimeWidgetProps, SelectWidgetProps, NumberWidgetProps, PriceWidgetProps, RangeSliderWidgetProps, TreeSelectWidgetProps
} from "@react-awesome-query-builder/ui";

export interface AntdWidgets {
  // antd core widgets
  FieldSelect: ElementType<FieldProps>,
  FieldDropdown: ElementType<FieldProps>,
  FieldCascader: ElementType<FieldProps>,
  FieldTreeSelect: ElementType<FieldProps>,
  Button: ElementType<ButtonProps>,
  ButtonGroup: ElementType<ButtonGroupProps>,
  Conjs: ElementType<ConjsProps>,
  Switch: ElementType<SwitchProps>,
  Provider: ElementType<ProviderProps>,
  ValueSources: ElementType<ValueSourcesProps>,
  confirm: ConfirmFunc,

  // antd value widgets
  TextWidget: ElementType<TextWidgetProps>,
  TextAreaWidget: ElementType<TextWidgetProps>,
  NumberWidget: ElementType<NumberWidgetProps>,
  PriceWidget: ElementType<PriceWidgetProps>,
  SliderWidget: ElementType<NumberWidgetProps>,
  RangeWidget: ElementType<RangeSliderWidgetProps>,
  SelectWidget: ElementType<SelectWidgetProps>,
  AutocompleteWidget: ElementType<SelectWidgetProps>,
  MultiSelectWidget: ElementType<SelectWidgetProps>,
  TreeSelectWidget: ElementType<TreeSelectWidgetProps>,
  DateWidget: ElementType<DateTimeWidgetProps>,
  TimeWidget: ElementType<DateTimeWidgetProps>,
  DateTimeWidget: ElementType<DateTimeWidgetProps>,
  BooleanWidget: ElementType<BooleanWidgetProps>,
}

export declare const AntdWidgets: AntdWidgets;
export default AntdWidgets;

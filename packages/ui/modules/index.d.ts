/* eslint-disable no-extra-semi */

import {ElementType, ReactElement, Factory} from "react";
import {
  Config, Conjunctions, Operators, Widgets, Types, Fields, Funcs, Settings as CoreSettings, CoreConfig,
  InputAction,
  ImmutableTree,
  Actions,
  ActionMeta,
  ItemType,
  ItemProperties,
  ValueSource,
  TypedValueSourceMap,
  ConjsProps, FieldProps,
  WidgetProps, TextWidgetProps, DateTimeWidgetProps, BooleanWidgetProps, NumberWidgetProps, SelectWidgetProps, 
  TreeSelectWidgetProps, RangeSliderWidgetProps, CaseValueWidgetProps, ConfigContext, FactoryWithContext,
  RenderedReactElement, SerializedFunction,
  Utils as CoreUtils
} from "@react-awesome-query-builder/core";

// re-export
export * from "@react-awesome-query-builder/core";

////////////////
// common
/////////////////


type AnyObject = object;
type TypedMap<T> = {
  [key: string]: T;
}


////////////////
// Query, Builder
/////////////////

export type Dispatch = (action: InputAction) => void;

export interface BuilderProps {
  tree: ImmutableTree,
  config: Config,
  actions: Actions,
  dispatch: Dispatch,
}

export interface ItemBuilderProps {
  config: Config;
  actions: Actions;
  properties: TypedMap<any>;
  type: ItemType;
  itemComponent: Factory<ItemProperties>;
}

export interface QueryProps {
  conjunctions: Conjunctions;
  operators: Operators;
  widgets: Widgets;
  types: Types;
  settings: Settings;
  fields: Fields;
  funcs?: Funcs;
  value: ImmutableTree;
  onChange(immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta): void;
  renderBuilder(props: BuilderProps): ReactElement;
}

export type Builder = ElementType<BuilderProps>;
export type Query = ElementType<QueryProps>;


/////////////////
// Props for render* in RenderSettings
/////////////////

export interface ButtonProps {
  type: "addRule" | "addGroup" | "delRule" | "delGroup"  | "addRuleGroup" | "delRuleGroup", 
  onClick(): void, 
  label: string,
  config?: Config,
  readonly?: boolean,
}

export interface SwitchProps {
  value: boolean,
  setValue(newValue?: boolean): void,
  label: string,
  checkedLabel?: string,
  hideLabel?: boolean,
  config?: Config,
}

export interface ButtonGroupProps {
  children: ReactElement,
  config?: Config,
}

export interface ProviderProps {
  children: ReactElement,
  config?: Config,
}

export type ValueSourceItem = {
  label: string, 
}
type ValueSourcesItems = TypedValueSourceMap<ValueSourceItem>;

export interface ValueSourcesProps {
  config?: Config,
  valueSources: ValueSourcesItems, 
  valueSrc?: ValueSource, 
  setValueSrc(valueSrc: string): void, 
  readonly?: boolean,
  title: string,
}

export interface ConfirmModalProps {
  onOk(): void, 
  okText: string, 
  cancelText?: string, 
  title: string,
}

export interface RuleErrorProps {
  error: string,
}


/////////////////
// Settings
/////////////////


type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";


export interface RenderSettings {
  renderField?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderOperator?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderFunc?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderConjs?: FactoryWithContext<ConjsProps> | SerializedFunction,
  renderButton?: FactoryWithContext<ButtonProps> | SerializedFunction,
  renderButtonGroup?: FactoryWithContext<ButtonGroupProps> | SerializedFunction,
  renderSwitch?: FactoryWithContext<SwitchProps> | SerializedFunction,
  renderProvider?: FactoryWithContext<ProviderProps> | SerializedFunction,
  renderValueSources?: FactoryWithContext<ValueSourcesProps> | SerializedFunction,
  renderConfirm?: ConfirmFunc | SerializedFunction,
  useConfirm?: (() => Function) | SerializedFunction,
  renderSize?: AntdSize,
  renderItem?: FactoryWithContext<ItemBuilderProps> | SerializedFunction,
  dropdownPlacement?: AntdPosition,
  groupActionsPosition?: AntdPosition,
  showLabels?: boolean,
  maxLabelsLength?: number,
  customFieldSelectProps?: AnyObject,
  renderBeforeWidget?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderAfterWidget?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderBeforeActions?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderAfterActions?: FactoryWithContext<FieldProps> | SerializedFunction,
  renderRuleError?: FactoryWithContext<RuleErrorProps> | SerializedFunction,
  renderSwitchPrefix?: RenderedReactElement | SerializedFunction,
  defaultSliderWidth?: string,
  defaultSelectWidth?: string,
  defaultSearchWidth?: string,
  defaultMaxRows?: number,
}

export interface Settings extends CoreSettings, RenderSettings {
}

/////////////////
// Config
/////////////////

export interface BasicConfig extends CoreConfig {
  settings: Settings,
}


/////////////////
// ReadyWidgets
/////////////////

export type ConfirmFunc = (opts: ConfirmModalProps) => void;

interface VanillaWidgets {
  // core
  VanillaFieldSelect: ElementType<FieldProps>,
  VanillaConjs: ElementType<ConjsProps>,
  VanillaSwitch: ElementType<SwitchProps>,
  VanillaButton: ElementType<ButtonProps>,
  VanillaButtonGroup: ElementType<ButtonGroupProps>,
  VanillaProvider: ElementType<ProviderProps>,
  VanillaValueSources: ElementType<ValueSourcesProps>,
  vanillaConfirm: ConfirmFunc,

  // value
  VanillaBooleanWidget: ElementType<BooleanWidgetProps>,
  VanillaTextWidget: ElementType<TextWidgetProps>,
  VanillaTextAreaWidget: ElementType<TextWidgetProps>,
  VanillaDateWidget: ElementType<DateTimeWidgetProps>,
  VanillaTimeWidget: ElementType<DateTimeWidgetProps>,
  VanillaDateTimeWidget: ElementType<DateTimeWidgetProps>,
  VanillaMultiSelectWidget: ElementType<SelectWidgetProps>,
  VanillaSelectWidget: ElementType<SelectWidgetProps>,
  VanillaNumberWidget: ElementType<NumberWidgetProps>,
  VanillaSliderWidget: ElementType<NumberWidgetProps>,
  
  // common
  ValueFieldWidget: ElementType<WidgetProps>,
  FuncWidget: ElementType<WidgetProps>,
}

/////////////////
// extend Utils
/////////////////

export interface Utils extends CoreUtils {
  // ReactUtils: {
  //   useOnPropsChanged(obj: ReactElement): void;
  // },
}

export declare const Utils: Utils;

/////////////////

export declare const Query: Query;
export declare const Builder: Builder;
export declare const BasicConfig: BasicConfig;
export declare const VanillaWidgets: VanillaWidgets;

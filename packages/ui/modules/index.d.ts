/* eslint-disable no-extra-semi */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import {ElementType, ReactElement, Factory} from "react";
import {
  Conjunctions, Types, Fields, Funcs, CoreConfig, RuleValue, RuleValueI, 
  SimpleValue, OperatorOptionsI, FieldValueI, FieldSource, AsyncListValues,
  InputAction,
  ImmutableTree,
  Actions,
  ActionMeta,
  ItemType,
  ItemProperties,
  ValueSource,
  ConfigContext, FactoryWithContext, RenderedReactElement, SerializableType,
  ConjsProps,

  ImmutableList, ImmutableMap, ImmutableOMap,
  ImmutablePath,
  ImmutableItemProperties,

  // to extend
  Config as CoreConfigType,
  Settings as CoreSettings,
  Utils as CoreUtils,
  // to override <C>
  OperatorProximity as _OperatorProximity,
  Operator as _Operator,
  Operators as _Operators,
  FieldProps as _FieldProps,
  Widget as _Widget,
  Widgets as _Widgets,
  BaseWidget as _BaseWidget,
  RangeableWidget as _RangeableWidget,
  TypedWidget as _TypedWidget,
  TextWidget as _TextWidget,
  NumberWidget as _NumberWidget,
  RangeSliderWidget as _RangeSliderWidget,
  DateTimeWidget as _DateTimeWidget,
  TreeSelectWidget as _TreeSelectWidget,
  TreeMultiSelectWidget as _TreeMultiSelectWidget,
  SelectWidget as _SelectWidget,
  MultiSelectWidget as _MultiSelectWidget,
  BooleanWidget as _BooleanWidget,
  FieldWidget as _FieldWidget,
  FuncWidget as _FuncWidget,
  CaseValueWidget as _CaseValueWidget,
  ProximityProps as _ProximityProps,
  ProximityOptions as _ProximityOptions,
  WidgetProps as _WidgetProps,
  TextWidgetProps as _TextWidgetProps,
  DateTimeWidgetProps as _DateTimeWidgetProps,
  BooleanWidgetProps as _BooleanWidgetProps,
  NumberWidgetProps as _NumberWidgetProps,
  RangeSliderWidgetProps as _RangeSliderWidgetProps,
  SelectWidgetProps as _SelectWidgetProps,
  MultiSelectWidgetProps as _MultiSelectWidgetProps,
  TreeSelectWidgetProps as _TreeSelectWidgetProps,
  TreeMultiSelectWidgetProps as _TreeMultiSelectWidgetProps,
  CaseValueWidgetProps as _CaseValueWidgetProps,
  CoreOperators as _CoreOperators,
  CoreWidgets as _CoreWidgets,
  ConfigMixin as _ConfigMixin,
  ConfigMixinExt as _ConfigMixinExt,
  ImmutableItem,
} from "@react-awesome-query-builder/core";

// re-export
export * from "@react-awesome-query-builder/core";

/////////////////
// override <C> in types
/////////////////

export type OperatorProximity<C = Config> = _OperatorProximity<C>;
export type Operator<C = Config> = _Operator<C>;
export type Operators<C = Config> = _Operators<C>;
export type FieldProps<C = Config> = _FieldProps<C>;
export type Widget<C = Config> = _Widget<C>;
export type Widgets<C = Config> = _Widgets<C>;
export type BaseWidget<C = Config> = _BaseWidget<C>;
export type RangeableWidget<C = Config> = _RangeableWidget<C>;
export type TypedWidget<C = Config> = _TypedWidget<C>;
export type TextWidget<C = Config> = _TextWidget<C>;
export type NumberWidget<C = Config> = _NumberWidget<C>;
export type RangeSliderWidget<C = Config> = _RangeSliderWidget<C>;
export type DateTimeWidget<C = Config> = _DateTimeWidget<C>;
export type TreeSelectWidget<C = Config> = _TreeSelectWidget<C>;
export type TreeMultiSelectWidget<C = Config> = _TreeMultiSelectWidget<C>;
export type SelectWidget<C = Config> = _SelectWidget<C>;
export type MultiSelectWidget<C = Config> = _MultiSelectWidget<C>;
export type BooleanWidget<C = Config> = _BooleanWidget<C>;
export type FieldWidget<C = Config> = _FieldWidget<C>;
export type FuncWidget<C = Config> = _FuncWidget<C>;
/**
 * @deprecated
 */
export type CaseValueWidget<C = Config> = _CaseValueWidget<C>;
export type ProximityProps<C = Config> = _ProximityProps<C>;
export type ProximityOptions<C = Config> = _ProximityOptions<C>;
export type WidgetProps<C = Config> = _WidgetProps<C>;
export type TextWidgetProps<C = Config> = _TextWidgetProps<C>;
export type DateTimeWidgetProps<C = Config> = _DateTimeWidgetProps<C>;
export type BooleanWidgetProps<C = Config> = _BooleanWidgetProps<C>;
export type NumberWidgetProps<C = Config> = _NumberWidgetProps<C>;
export type RangeSliderWidgetProps<C = Config> = _RangeSliderWidgetProps<C>;
export type SelectWidgetProps<C = Config> = _SelectWidgetProps<C>;
export type MultiSelectWidgetProps<C = Config> = _MultiSelectWidgetProps<C>;
export type TreeSelectWidgetProps<C = Config> = _TreeSelectWidgetProps<C>;
export type TreeMultiSelectWidgetProps<C = Config> = _TreeMultiSelectWidgetProps<C>;
/**
 * @deprecated
 */
export type CaseValueWidgetProps<C = Config> = _CaseValueWidgetProps<C>;
export type CoreOperators<C = Config> = _CoreOperators<C>;
export type CoreWidgets<C = Config> = _CoreWidgets<C>;
export type ConfigMixin<C extends Config = Config> = _ConfigMixin<C>;
export type ConfigMixinExt<C extends Config = Config> = _ConfigMixinExt<C>;

/////////////////
// extend config
/////////////////

export interface Config extends CoreConfigType {
  settings: Settings;
  operators: Operators;
  widgets: Widgets;
}

export interface BasicConfig extends CoreConfig {
  settings: Settings;
  operators: CoreOperators<Config>;
  widgets: CoreWidgets<Config>;
}


////////////////
// common
/////////////////


type AnyObject = Record<string, unknown>;
type TypedMap<T> = {
  [key: string]: T;
}
type Empty = null | undefined;


////////////////
// Query, Builder
/////////////////

export type Dispatch = (action: InputAction) => void;

export interface BuilderProps {
  tree: ImmutableTree;
  config: Config;
  actions: Actions;
  dispatch: Dispatch;
}

export interface ItemProps {
  config: Config;
  actions: Actions;
  properties: ImmutableItemProperties;
  type: ItemType;
  id: string;
  groupId?: string;
  parentField?: string;
  path: ImmutablePath;
  children1?: ImmutableOMap<string, ImmutableItem>;
  // additional:
  totalRulesCnt?: number;
  reordableNodesCnt?: number;
  parentReordableNodesCnt?: number;
  onDragStart?: Function;
  isParentLocked?: boolean;
  isDraggingTempo?: boolean;
}
export interface ItemBuilderProps extends ItemProps {
  itemComponent: Factory<ItemProps>;
}

export type OnChange = (immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta, actions?: Actions) => void;
export type OnInit = (immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta, actions?: Actions) => void;

export interface QueryProps {
  conjunctions: Conjunctions;
  operators: Operators;
  widgets: Widgets;
  types: Types;
  settings: Settings;
  fields: Fields;
  funcs?: Funcs;
  ctx: ConfigContext;
  value: ImmutableTree;
  onChange: OnChange;
  onInit?: OnInit;
  renderBuilder(props: BuilderProps): ReactElement;
}

export type Builder = ElementType<BuilderProps>;
export type Query = ElementType<QueryProps>;


/////////////////
// Props for render* in RenderSettings
/////////////////

type ButtonIconType = "addRule" | "addGroup" | "delRule" | "delGroup" | "addSubRuleSimple" | "addSubRule" | "addSubGroup" | "delRuleGroup";
type IconType = ButtonIconType | "drag";

export interface ButtonProps {
  type: ButtonIconType;
  renderIcon?: FactoryWithContext<IconProps>;
  onClick(): void;
  label: string;
  config?: Config;
  readonly?: boolean;
}

export interface IconProps {
  type: IconType;
  config?: Config;
  readonly?: boolean;
}

export interface SwitchProps {
  value: boolean;
  setValue(newValue?: boolean): void;
  label: string;
  checkedLabel?: string;
  hideLabel?: boolean;
  config?: Config;
}

export interface ButtonGroupProps {
  children: ReactElement;
  config?: Config;
}

export interface ProviderProps {
  children: ReactElement;
  config?: Config;
}

export type ValueSourceItem = {
  label: string;
}
type ValueSourcesItems = Array<[ValueSource, ValueSourceItem]>;

export interface ValueSourcesProps {
  config?: Config;
  valueSources: ValueSourcesItems;
  valueSrc?: ValueSource;
  setValueSrc(valueSrc: string): void;
  readonly?: boolean;
  title: string;
}

export interface ConfirmModalProps {
  onOk(): void;
  okText: string;
  cancelText?: string;
  title: string;
  okType?: string;
}

export interface RuleErrorProps {
  error: string;
}

export interface RuleProps {
  config: Config;
  id: string; // id of rule
  groupId: string | Empty; // id of parent group
  parentField: string | Empty; //from RuleGroup
  selectedField: FieldValueI | Empty;
  selectedFieldSrc: FieldSource | Empty;
  selectedFieldType: string | Empty;
  fieldError: string | Empty;
  selectedOperator: string | Empty;
  operatorOptions: OperatorOptionsI | Empty;
  value: ImmutableList<RuleValueI>; //depends on widget
  valueError: ImmutableList<string | Empty>;
  valueSrc: ImmutableList<ValueSource>;
  valueType: ImmutableList<string>;
  asyncListValues: AsyncListValues | Empty;

  isDraggingMe: boolean | Empty;
  isDraggingTempo: boolean | Empty;
  isLocked: boolean | Empty;
  isTrueLocked: boolean | Empty;
  reordableNodesCnt: number | Empty;
  totalRulesCnt: number | Empty;
  parentReordableNodesCnt: number | Empty;
  onDragStart: Function | Empty;
  handleDraggerMouseDown: Function | Empty;
  removeSelf: Function | Empty;
  confirmFn: Function | Empty;

  //actions
  setField(field: FieldValueI): undefined;
  setFieldSrc(fieldSrc: FieldSource): undefined;
  setFuncValue(delta: number, parentFuncs: Array<[string, string]>, argKey: string | null, value: SimpleValue, type: string | "!valueSrc"): undefined;
  setOperator(operator: string): undefined;
  setOperatorOption(name: string, value: SimpleValue): undefined;
  setLock(lock: boolean): undefined;
  setValue(delta: number, value: RuleValueI, valueType: string, asyncListValues?: AsyncListValues): undefined;
  setValueSrc(delta: number, valueSrc: ValueSource): undefined;
}

/////////////////
// Settings
/////////////////


type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";


export interface RenderSettings {
  renderField?: SerializableType<FactoryWithContext<FieldProps>>;
  renderOperator?: SerializableType<FactoryWithContext<FieldProps>>;
  renderFunc?: SerializableType<FactoryWithContext<FieldProps>>;
  renderConjs?: SerializableType<FactoryWithContext<ConjsProps>>;
  renderButton?: SerializableType<FactoryWithContext<ButtonProps>>;
  renderIcon?: SerializableType<FactoryWithContext<IconProps>>;
  renderButtonGroup?: SerializableType<FactoryWithContext<ButtonGroupProps>>;
  renderSwitch?: SerializableType<FactoryWithContext<SwitchProps>>;
  renderProvider?: SerializableType<FactoryWithContext<ProviderProps>>;
  renderValueSources?: SerializableType<FactoryWithContext<ValueSourcesProps>>;
  renderFieldSources?: SerializableType<FactoryWithContext<ValueSourcesProps>>;
  renderConfirm?: SerializableType<ConfirmFunc>;
  useConfirm?: SerializableType<(() => Function)>;
  renderSize?: AntdSize;
  renderItem?: SerializableType<FactoryWithContext<ItemBuilderProps>>;
  dropdownPlacement?: AntdPosition;
  groupActionsPosition?: AntdPosition;
  showLabels?: boolean;
  maxLabelsLength?: number;
  customFieldSelectProps?: AnyObject;
  customOperatorSelectProps?: AnyObject;
  renderBeforeWidget?: SerializableType<FactoryWithContext<RuleProps>>;
  renderAfterWidget?: SerializableType<FactoryWithContext<RuleProps>>;
  renderBeforeActions?: SerializableType<FactoryWithContext<RuleProps>>;
  renderAfterActions?: SerializableType<FactoryWithContext<RuleProps>>;
  renderBeforeCaseValue?: SerializableType<FactoryWithContext<RuleProps>>;
  renderAfterCaseValue?: SerializableType<FactoryWithContext<RuleProps>>;
  renderRuleError?: SerializableType<FactoryWithContext<RuleErrorProps>>;
  renderSwitchPrefix?: SerializableType<RenderedReactElement>;
  defaultSliderWidth?: string;
  defaultSelectWidth?: string;
  defaultSearchWidth?: string;
  defaultMaxRows?: number;
}

export interface Settings extends CoreSettings, RenderSettings {
}

/////////////////
// ReadyWidgets
/////////////////

export type ConfirmFunc = (opts: ConfirmModalProps) => void;

interface VanillaWidgets {
  // core
  VanillaFieldSelect: ElementType<FieldProps>;
  VanillaConjs: ElementType<ConjsProps>;
  VanillaSwitch: ElementType<SwitchProps>;
  VanillaButton: ElementType<ButtonProps>;
  VanillaButtonGroup: ElementType<ButtonGroupProps>;
  VanillaProvider: ElementType<ProviderProps>;
  VanillaValueSources: ElementType<ValueSourcesProps>;
  vanillaConfirm: ConfirmFunc;

  // value
  VanillaBooleanWidget: ElementType<BooleanWidgetProps>;
  VanillaTextWidget: ElementType<TextWidgetProps>;
  VanillaTextAreaWidget: ElementType<TextWidgetProps>;
  VanillaDateWidget: ElementType<DateTimeWidgetProps>;
  VanillaTimeWidget: ElementType<DateTimeWidgetProps>;
  VanillaDateTimeWidget: ElementType<DateTimeWidgetProps>;
  VanillaMultiSelectWidget: ElementType<SelectWidgetProps>;
  VanillaSelectWidget: ElementType<SelectWidgetProps>;
  VanillaNumberWidget: ElementType<NumberWidgetProps>;
  VanillaSliderWidget: ElementType<NumberWidgetProps>;
  
  // common
  ValueFieldWidget: ElementType<WidgetProps>;
  FuncWidget: ElementType<WidgetProps>;
}

/////////////////
// extend Utils
/////////////////

export interface Utils extends CoreUtils {
  // ReactUtils: {
  //   useOnPropsChanged(obj: ReactElement): void;
  // }
}

export declare const Utils: Utils;


//////////////////

export declare const Query: Query;
export declare const Builder: Builder;
export declare const BasicConfig: BasicConfig;
export declare const VanillaWidgets: VanillaWidgets;


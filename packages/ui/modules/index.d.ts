/* eslint-disable no-extra-semi */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import {ElementType, ReactElement, Factory} from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
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
  ConfigContext, FactoryWithContext, FnWithContextAndProps, FactoryFnWithoutPropsWithContext, RenderedReactElement, SerializableType,
  ConjsProps,
  AsyncFetchListValuesFn,
  ListOptionUi,
  ListValues,
  ListItem,

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
  PriceWidgetProps as _PriceWidgetProps,
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
// Ignore "Multiple exports of name 'Utils'"
// eslint-disable-next-line import/export
export * from "@react-awesome-query-builder/core";

import chroma from "chroma-js";

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
export type PriceWidgetProps<C = Config> = _PriceWidgetProps<C>;
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

type DragStartFn = (nodeId: string, dom: HTMLDivElement, e: MouseEvent) => void;

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
  onDragStart?: DragStartFn;
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
  config: Config;
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
  config: Config;
}

export interface ButtonGroupProps {
  children: ReactElement;
  config: Config;
}

export interface ProviderProps {
  children: ReactElement;
  config: Config;
}

export type ValueSourceItem = {
  label: string;
}
type ValueSourcesItems = Array<[ValueSource, ValueSourceItem]>;

export interface ValueSourcesProps {
  config: Config;
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
  title: string | null;
  okType?: string;
  confirmFn?: ConfirmFunc;
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
  onDragStart: DragStartFn | Empty;
  handleDraggerMouseDown: (e: MouseEvent) => void | Empty;
  removeSelf: () => void | Empty;
  confirmFn: ConfirmFunc | Empty; // prop from <WithConfirmFn>

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


export type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
export type RenderSize = "small" | "large" | "medium";
export type ThemeMode = "light" | "dark";

//todo: override for each packages with real typed object
export interface MuiPaletteColorOverride {
  mode?: ThemeMode;
  main: string;
  // light?: string;
  // dark?: string;
  // contrastText?: string;
}
export interface MuiPaletteOverride {
  mode?: ThemeMode;
  primary?: MuiPaletteColorOverride;
  // secondary?: MuiPaletteColorOverride;
  // error?: MuiPaletteColorOverride;
  // warning?: MuiPaletteColorOverride;
  // info?: MuiPaletteColorOverride;
  // success?: MuiPaletteColorOverride;
  background?: {
    default?: string;
    paper?: string;
  };
  text?: {
    primary: string;
    secondary: string;
    disabled: string;
  }
}
export interface MuiTypographyOverride {
  fontFamily?: React.CSSProperties["fontFamily"];
  fontSize?: number;
}
export interface MuiThemeOverride {
  palette?: MuiPaletteOverride;
  typography?: MuiTypographyOverride;
}
export type MaterialThemeOverride = MuiThemeOverride;
export type AntdThemeOverride = Record<string, any>; // todo: override for antd
export type FluentThemeOverride = Record<string, any>; // todo: override for fluent

export interface DesignTokens {
  // todo: complete
  // todo: remove prefixed "--"
  "--main-background"?: string;
}
export interface DesignSettings {
  useThickLeftBorderOnHoverItem?: boolean;
  useShadowOnHoverItem?: boolean;
  generateDesignTokensFromThemeLibrary?: boolean;
  generateDesignTokens?: {
    // todo: override with correct typings in dedicated packages
    material?: (theme: /*Theme*/ Record<string, any>, config: Config) => DesignTokens;
    mui?: (theme: /*Theme*/ Record<string, any>, config: Config) => DesignTokens;
    antd?: (token: /*GlobalToken*/ Record<string, any>, config: Config) => DesignTokens;
    fluent?: (theme: /*Theme*/ Record<string, any>, config: Config) => DesignTokens;
    bootstrap?: (_ununsed: any, config: Config) => DesignTokens;
  }
}

export interface ThemeSettings {
  theme?: {
    // todo: use correct typings in dedicated packages
    material?: MaterialThemeOverride;
    mui?: MuiThemeOverride;
    antd?: AntdThemeOverride;
    fluent?: FluentThemeOverride;
  };
  designSettings?: DesignSettings;
  designTokens?: {
    light?: DesignTokens;
    dark?: DesignTokens;
  };
  renderSize?: RenderSize;
  themeMode?: ThemeMode;
  compactMode?: boolean;
  dropdownPlacement?: AntdPosition;
  groupActionsPosition?: AntdPosition;
  defaultSliderWidth?: string;
  defaultSelectWidth?: string;
  defaultSearchWidth?: string;
  defaultMaxRows?: number;
  showLabels?: boolean;
  maxLabelsLength?: number;
}

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
  renderConfirm?: SerializableType<FnWithContextAndProps<ConfirmModalProps, void>>;
  useConfirm?: SerializableType<FactoryFnWithoutPropsWithContext<ConfirmFunc>>;
  renderItem?: SerializableType<FactoryWithContext<ItemBuilderProps>>;
  renderBeforeWidget?: SerializableType<FactoryWithContext<RuleProps>>;
  renderAfterWidget?: SerializableType<FactoryWithContext<RuleProps>>;
  renderBeforeActions?: SerializableType<FactoryWithContext<RuleProps>>;
  renderAfterActions?: SerializableType<FactoryWithContext<RuleProps>>;
  renderBeforeCaseValue?: SerializableType<FactoryWithContext<RuleProps>>;
  renderAfterCaseValue?: SerializableType<FactoryWithContext<RuleProps>>;
  renderRuleError?: SerializableType<FactoryWithContext<RuleErrorProps>>;
  renderSwitchPrefix?: SerializableType<RenderedReactElement>;

  customFieldSelectProps?: AnyObject;
  customOperatorSelectProps?: AnyObject;
}

export interface Settings extends CoreSettings, RenderSettings, ThemeSettings {
}

/////////////////
// ReadyWidgets
/////////////////

export type ConfirmFunc = (props: ConfirmModalProps) => void;

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
  VanillaPriceWidget: ElementType<PriceWidgetProps>;
  VanillaSliderWidget: ElementType<NumberWidgetProps>;
  
  // common
  ValueFieldWidget: ElementType<WidgetProps>;
  FuncWidget: ElementType<WidgetProps>;
}

/////////////////
// extend Utils
/////////////////

export interface ColorUtils {
  chroma: typeof chroma;
  setOpacityForHex(hex: string, alpha: number): string;
  generateCssVarsForLevels(isDark: boolean, cssVar: string, baseColor: string, baseDarkColor?: string, lightRatio?: number, darkRatio?: number, maxLevel?: number, minLevel?: number): Record<string, string>;
  isDarkColor(color: string): boolean;
}
export interface NumberFormat {
  getNumberFormatProps: (props: Record<string, any>, excludePropsNames?: string[]) => Record<string, any>;
  NumericFormat: typeof NumericFormat;
  numericFormatter: (val: number, numericFormatProps: NumericFormatProps) => string;
  numericParser: (str: string, numericFormatProps: NumericFormatProps, lastStrValue?: string, lastNumValue?: number) => number | undefined;
}
export interface Utils extends CoreUtils {
  NumberFormat: NumberFormat;
  ColorUtils: ColorUtils;
  // ReactUtils: {
  //   useOnPropsChanged(obj: ReactElement): void;
  // }
}

// Ignore "Multiple exports of name 'Utils'"
// eslint-disable-next-line import/export
export declare const Utils: Utils;

//////////////////


type AutocompleteChangeReason = "selectOption" | "removeOption" | "clear" | null;
type AutocompleteInputChangeReason = "selectOption" | "removeOption" | "clear" | "blur" | "input" | "reset" | "my-reset" | null;
export interface UseListValuesAutocompleteProps {
  asyncFetch: AsyncFetchListValuesFn;
  useLoadMore?: boolean;
  useAsyncSearch?: boolean;
  forceAsyncSearch?: boolean;
  fetchSelectedValuesOnInit?: boolean;
  asyncListValues?: ListValues; // selectedAsyncListValues
  listValues: ListValues; // staticListValues
  allowCustomValues?: boolean;
  value?: string | number | string[] | number[]; // selectedValue (array for multiple=true)
  setValue: (value: string | number | string[] | number[]) => void;
  placeholder?: string;
  config: Config;
}
export interface UseListValuesAutocompleteOptions {
  multiple: boolean;
  debounceTimeout?: number;
  uif?: "antd" | "material" | "mui";
  isFieldAutocomplete?: boolean;
  dontFixOptionsOrder?: boolean;
}
export interface UseListValuesAutocompleteReturn {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (
    // tip: null for mui
    e: React.SyntheticEvent<HTMLInputElement> | null, 
    // tip: string or string[] for mui
    val: Empty | string | number | ListOptionUi | Array<string | number | ListOptionUi>,
    // tip: ListOptionUi or ListOptionUi[] for mui, AutocompleteChangeReason for antd
    option: AutocompleteChangeReason | ListOptionUi | ListOptionUi[],
  ) => Promise<void>;
  onInputChange: (
    e: React.SyntheticEvent<HTMLInputElement> | null,
    newInputValue: string,
    eventType: AutocompleteInputChangeReason,
  ) => Promise<void>;
  inputValue: string;
  options: ListOptionUi[];
  isInitialLoading: boolean;
  isLoading: boolean;
  aPlaceholder: string;
  extendOptions: (options: ListOptionUi[]) => ListOptionUi[];
  getOptionSelected: (option: ListOptionUi, selectedValueOrOption: ListItem | null) => boolean;
  getOptionDisabled: (valueOrOption: ListItem) => boolean;
  getOptionIsCustom: (option: ListItem) => boolean;
  getOptionLabel: (option: ListItem | null) => string | null;
  selectedListValue: ListItem | null;
}

export interface Hooks {
  useListValuesAutocomplete: (props: UseListValuesAutocompleteProps, options: UseListValuesAutocompleteOptions) => UseListValuesAutocompleteReturn;
}

export declare const Query: Query;
export declare const Builder: Builder;
export declare const BasicConfig: BasicConfig;
export declare const VanillaWidgets: VanillaWidgets;
export declare const Hooks: Hooks;


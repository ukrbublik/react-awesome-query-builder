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
// CssVars
/////////////////

export interface CssVarsBorderColors {
  "--rule-border-color"?: string;
  "--group-border-color"?: string;
  "--rulegroup-border-color"?: string;
  "--rulegroupext-border-color"?: string;
  "--switch-border-color"?: string;
  "--case-border-color"?: string;
  // with error
  "--rule-with-error-border-color"?: string;
  "--group-with-error-border-color"?: string;
  /*
   * Border color of placeholder for item that it's being dragged
   */
  "--placeholder-border-color"?: string;
  /*
   * Border color for locked item
   */
  "--locked-border-color"?: string;
  /*
   * [Advanced] Border color for group inside rule-group
   */
  "--group-in-rulegroupext-border-color"?: string;
}
export interface CssVarsBgColors {
  // background for .query-builder
  "--main-background"?: string;
  "--rule-background"?: string;
  "--group-background"?: string;
  "--rulegroup-background"?: string;
  "--rulegroupext-background"?: string;
  "--switch-background"?: string;
  "--case-background"?: string;
}
export interface CssVarsTreelineColors {
  "--treeline-color"?: string;
  "--treeline-rulegroup-color"?: string;
  "--treeline-rulegroupext-color"?: string;
  "--treeline-switch-color"?: string;
  "--treeline-disabled-color"?: string;
}
export interface CssVarsOtherColors {
  "--rule-error-color"?: string;
  "--custom-select-option-color"?: string;
}
export interface CssVarsBorderWidths {
  // example: "1px"
  "--rule-border-width"?: string;
  "--group-border-width"?: string;
  "--rulegroup-border-width"?: string;
  "--rulegroupext-border-width"?: string;
  "--switch-border-width"?: string;
  "--case-border-width"?: string;
}
export interface CssVarsBorderWidthsOnHover {
  "--rule-border-left-width-hover"?: string;
  "--group-border-left-width-hover"?: string;
  "--rulegroup-border-left-width-hover"?: string;
  "--rulegroupext-border-left-width-hover"?: string;
}
export interface CssVarsShadowOnHover {
  "--rule-shadow-hover"?: string;
  "--group-shadow-hover"?: string;
  "--rulegroup-shadow-hover"?: string;
  "--rulegroupext-shadow-hover"?: string;
}
export interface CssVarsRadiuses {
  // example: "5px"
  "--item-radius"?: string;
  "--conjunctions-radius"?: string;
  "--treeline-radius"?: string;
}
export interface CssVarsTreeline {
  // example: "2px"
  "--treeline-thick"?: string;
  "--treeline-switch-thick"?: string;
  "--treeline-rulegroup-thick"?: string;
  "--treeline-rulegroupext-thick"?: string;
}
export interface CssVarsOffsets {
  // example: "20px"
  "--treeline-offset-from-conjs"?: string;
  "--treeline-offset-from-switch"?: string;
  "--item-offset"?: string;
  "--item-offset-left"?: string;
  "--rulegroup-offset"?: string;
  "--rulegroup-offset-left"?: string;
  "--rule-padding"?: string;
  "--rule-parts-distance"?: string;
  "--seps-offset-bottom"?: string;
  "--drag-offset-right"?: string;
  "--group-actions-offset-left"?: string;
  "--group-drag-offset-left"?: string;
  "--rule-group-actions-offset-left"?: string;
  "--main-margin"?: string; // margin for .query-builder
}
export interface CssVarsFonts {
  // Default: "'Helvetica Neue', Helvetica, Arial, sans-serif"
  "--main-font-family"?: string;
  // Default: "14px"
  "--main-font-size"?: string;
  // Default: "initial"
  "--main-text-color"?: string;
}

// For advanced usage, not including in CssVars for now
export interface CssVarsColorsForNesting {
  "--rule-in-rulegroup-background"?: string;
  "--rulegroup-in-rulegroup-background"?: string;
  "--rulegroupext-in-rulegroup-background"?: string;
  "--rule-in-rulegroup-border-color"?: string;
  "--rulegroup-in-rulegroup-border-color"?: string;
  "--rulegroupext-in-rulegroup-border-color"?: string;
  "--rule-in-rulegroupext-background"?: string;
  "--group-in-rulegroupext-background"?: string;
  "--rulegroupext-in-rulegroupext-background"?: string;
  "--rulegroup-in-rulegroupext-background"?: string;
  "--rule-in-rulegroupext-border-color"?: string;
  "--group-in-rulegroupext-border-color"?: string; // defined in CssVarsBorderColors
  "--rulegroupext-in-rulegroupext-border-color"?: string;
  "--rulegroup-in-rulegroupext-border-color"?: string;
}

export interface CssVarsColors extends CssVarsBgColors, CssVarsBorderColors, CssVarsTreelineColors, CssVarsOtherColors {}
export interface CssVarsSizes extends CssVarsBorderWidths, CssVarsRadiuses, CssVarsTreeline, CssVarsOffsets {}
export interface CssVarsExtra extends CssVarsBorderWidthsOnHover, CssVarsShadowOnHover {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CssVars extends CssVarsColors, CssVarsSizes, CssVarsFonts, CssVarsExtra {}

export interface DesignSettings {
  canInheritThemeFromOuterProvider?: boolean;
  useThickLeftBorderOnHoverItem?: boolean;
  useShadowOnHoverItem?: boolean;
  generateCssVarsFromThemeLibrary?: boolean;
  generateCssVars?: {
    // todo: override with correct typings in dedicated packages
    material?: (theme: /*Theme*/ Record<string, any>, config: Config) => CssVars;
    mui?: (theme: /*Theme*/ Record<string, any>, config: Config) => CssVars;
    antd?: (token: /*GlobalToken*/ Record<string, any>, config: Config) => CssVars;
    fluent?: (theme: /*Theme*/ Record<string, any>, config: Config) => CssVars;
    bootstrap?: (_ununsed: any, config: Config) => CssVars;
  }
}

/////////////////
// Settings
/////////////////

export type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
export type RenderSize = "small" | "large" | "medium";
export type ThemeMode = "light" | "dark";

export interface ThemeSettings {
  theme?: {
    material?: Record<string, any>; // ThemeOptions from "@material-ui/core/styles"
    mui?: Record<string, any>; // ThemeOptions from "@mui/material/styles";
    antd?: Record<string, any>; // ConfigProviderProps["theme"] from "antd"
    fluent?: Record<string, any>; // PartialTheme from "@fluentui/react";
  };
  designSettings?: DesignSettings;
  cssVars?: {
    light?: CssVars;
    dark?: CssVars;
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
  isDarkColor(color?: string): boolean;
  isColor(color: any): boolean;
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


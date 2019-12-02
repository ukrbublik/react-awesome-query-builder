
import {List as ImmutableList, Map as ImmutableMap} from 'immutable';
import {ElementType, ReactElement, Factory} from 'react';


////////////////
// common
/////////////////

type MongoValue = any;
type RuleValue = Boolean | Number | String | Date | Array<String> | any;

type Optional<T> = {
  [P in keyof T]?: T[P];
}
type TypedMap<T> = {
  [key: string]: T;
};
type Empty = null | undefined;

type ValueSource = "value" | "field";

type JsonGroup = {
  type: "group",
  id?: String,
  children1?: {[id: string]: JsonGroup|JsonRule},
  properties?: {
    conjunction: String,
    not?: Boolean,
  }
};
type JsonRule = {
  type: "rule",
  properties: {
    field: String | Empty,
    operator: String | Empty,
    value: Array<any>,
    valueSrc: Array<ValueSource>,
    valueType: Array<String>,
    operatorOptions?: {}
  }
};
export type JsonTree = JsonGroup;

export type ImmutableTree = ImmutableMap<String, String|Object>;


////////////////
// Query, Builder, Utils, Config
/////////////////

export interface Utils {
  queryBuilderFormat(tree: ImmutableTree, config: Config): Object;
  queryString(tree: ImmutableTree, config: Config, isForDisplay?: Boolean): String;
  sqlFormat(tree: ImmutableTree, config: Config): String;
  mongodbFormat(tree: ImmutableTree, config: Config): Object;
  getTree(tree: ImmutableTree): JsonTree;
  loadTree(tree: JsonTree): ImmutableTree;
  checkTree(tree: ImmutableTree, config: Config): ImmutableTree;
  uuid(): String;
};

export interface BuilderProps {
  tree: ImmutableTree,
  config: Config,
  actions: {[key: string]: Function},
};

export interface QueryProps {
  conjunctions: Conjunctions;
  operators: Operators;
  widgets: Widgets;
  types: Types;
  settings: Settings;
  fields: Fields;
  value: ImmutableTree;
  onChange(immutableTree: ImmutableTree, config: Config): void;
  renderBuilder(props: BuilderProps): ReactElement;
};

export type Builder = ElementType<BuilderProps>;
export type Query = ElementType<QueryProps>;

export interface Config {
  conjunctions: Conjunctions,
  operators: Operators,
  widgets: Widgets,
  types: Types,
  settings: Settings,
  fields: Fields,
};


/////////////////
// Widgets, WidgetProps
/////////////////

type FormatValue =         (val: RuleValue, fieldDef: Field, wgtDef: Widget, isForDisplay: Boolean, op: String, opDef: Operator, rightFieldDef?: Field) => string;
type SqlFormatValue =      (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: String, opDef: Operator, rightFieldDef?: Field) => String;
type MongoFormatValue =    (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: String, opDef: Operator) => MongoValue;
type ValidateValue =       (val: RuleValue, fieldDef: Field) => Boolean;

interface BaseWidgetSettings {
  customProps?: {},
};
interface DateWidgetSettings extends BaseWidgetSettings {
  timeFormat?: String,
  dateFormat?: String,
  valueFormat?: String,
  use12Hours?: Boolean,
};
interface BooleanWidgetSettings extends BaseWidgetSettings {
  labelYes?: ReactElement | String,
  labelNo?: ReactElement | String,
  defaultValue?: Boolean,
};
export type WidgetSettings = DateWidgetSettings | BooleanWidgetSettings | BaseWidgetSettings;

interface BaseWidgetProps {
  value: any,
  setValue(val: any): void,
  placeholder: String,
  field: String,
  operator: String,
  fieldDefinition: Field,
  config: Config,
  delta: Number,
};
interface RangeWidgetProps extends BaseWidgetProps {
  placeholders: Array<String>,
  textSeparators: Array<String>,
};
export type WidgetProps = (BaseWidgetProps | RangeWidgetProps) & FieldSettings & WidgetSettings;

export interface BaseWidget extends BaseWidgetSettings {
  type: String,
  factory: Factory<WidgetProps>,
  valueSrc?: ValueSource,
  valuePlaceholder?: String,
  valueLabel?: String,
  validateValue?: ValidateValue,
  formatValue: FormatValue,
  sqlFormatValue: SqlFormatValue,
  mongoFormatValue?: MongoFormatValue,
};
export interface RangeWidget extends BaseWidget {
  singleWidget?: String,
  valueLabels?: Array<String | {label: String, placeholder: String}>,
};
export interface FieldWidget extends BaseWidgetSettings {
  valueSrc: "field",
  valuePlaceholder?: String,
  valueLabel?: String,
  validateValue?: ValidateValue,
  formatValue: FormatValue, // with rightFieldDef
  sqlFormatValue: SqlFormatValue, // with rightFieldDef
};
export type DateWidget = BaseWidget & DateWidgetSettings;
export type BooleanWidget = BaseWidget & BooleanWidgetSettings;

export type Widget = FieldWidget | RangeWidget | DateWidget | BooleanWidget | BaseWidget;
export type Widgets = TypedMap<Widget>;


/////////////////
// Conjunctions
/////////////////

type FormatConj = (children: ImmutableList<String>, conj: String, not: Boolean, isForDisplay?: Boolean) => String;
type SqlFormatConj = (children: ImmutableList<String>, conj: String, not: Boolean) => String;

export interface Conjunction {
  label: String,
  formatConj: FormatConj,
  sqlFormatConj: SqlFormatConj,
  mongoConj: String,
  reversedConj?: String,
};
export type Conjunctions = TypedMap<Conjunction>;


/////////////////
// Operators
/////////////////

type FormatOperator = (field: String, op: String, vals: any, valueSrc?: ValueSource, valueType?: String, opDef?: Operator, operatorOptions?: {}, isForDisplay?: Boolean) => String;
type MongoFormatOperator = (field: string, op: String, vals: any, valueSrc?: ValueSource, valueType?: String, opDef?: Operator, operatorOptions?: {}) => Object;
type SqlFormatOperator = (field: String, op: String, vals: any, valueSrc?: ValueSource, valueType?: String, opDef?: Operator, operatorOptions?: {}) => String;

interface ProximityConfig {
  optionLabel: String,
  optionTextBefore: String,
  optionPlaceholder: String,
  minProximity: Number,
  maxProximity: Number,
  defaults: {
      proximity: Number,
  },
  customProps?: {},
};
export interface ProximityProps extends ProximityConfig {
  options: ImmutableMap<String, any>,
  setOption: (key: String, value: any) => void,
  config: Config,
};
export interface ProximityOptions extends ProximityConfig {
  factory: Factory<ProximityProps>,
};

interface BaseOperator {
  label: String,
  reversedOp: String,
  isUnary?: Boolean,
  cardinality?: Number,
  formatOp?: FormatOperator,
  labelForFormat?: String,
  mongoFormatOp?: MongoFormatOperator,
  sqlOp?: String,
  sqlFormatOp?: SqlFormatOperator,
};
interface UnaryOperator extends BaseOperator {
  isUnary: true,
};
interface BinaryOperator extends BaseOperator {
  isUnary?: false,
};
interface Operator2 extends BaseOperator {
  //cardinality: 2
  textSeparators: Array<String>,
  valueLabels: Array<String | {label: String, placeholder: String}>,
  isSpecialRange?: Boolean,
};
interface OperatorProximity extends Operator2 {
  options: ProximityOptions,
};
export type Operator = UnaryOperator | BinaryOperator | Operator2 | OperatorProximity;
export type Operators = TypedMap<Operator>;



/////////////////
// Types
/////////////////

interface WidgetConfigForType {
  widgetProps?: Optional<Widget>,
  opProps?: Optional<Operator>,
  operators?: Array<String>,
};

interface Type {
  valueSources?: Array<ValueSource>,
  defaultOperator?: String,
  widgets: TypedMap<WidgetConfigForType>,
};
export type Types = TypedMap<Type>;


/////////////////
// Fields
/////////////////

type FieldType = String | "!struct";

interface BasicFieldSettings {
}
interface NumberFieldSettings extends BasicFieldSettings {
  min?: Number,
  max?: Number,
  step?: Number,
  marks?: {[mark: number]: ReactElement | String}
};
export type FieldSettings = NumberFieldSettings | BasicFieldSettings;

interface BaseField {
  type: FieldType,
  label?: String,
  tooltip?: String,
};
interface SimpleField extends BaseField {
  type: String,
  label2?: String,
  operators?: Array<String>,
  defaultOperator?: String,
  excludeOperators?: Array<String>,
  preferWidgets?: Array<String>,
  valueSources?: Array<ValueSource>,
  tableName?: String,
  fieldSettings?: FieldSettings,
  widgets?: TypedMap<WidgetConfigForType>,
  mainWidgetProps?: Optional<Widget>,
};
interface FieldGroup extends BaseField {
  type: "!struct",
  subfields: Fields,
};
interface FieldWithValues extends SimpleField {
  listValues?: TypedMap<String>,
  allowCustomValues?: Boolean,
};

export type Field = FieldWithValues | SimpleField;
type FieldOrGroup = FieldGroup | Field;
export type Fields = TypedMap<FieldOrGroup>;


/////////////////
// FieldProps
/////////////////

export type FieldItem = {
  items?: FieldItems, 
  key: String, 
  path?: String, 
  label: String, 
  fullLabel?: String, 
  altLabel?: String, 
  tooltip?: String
};
type FieldItems = TypedMap<FieldItem>;

export interface FieldProps {
  items: FieldItems,
  setField(path: String): void,
  selectedKey: String | Empty,
  selectedKeys?: Array<String> | Empty,
  selectedPath?: Array<String> | Empty,
  selectedLabel?: String | Empty,
  selectedAltLabel?: String | Empty,
  selectedFullLabel?: String | Empty,
  config?: Config,
  customProps?: {},
  placeholder?: String,
  selectedOpts?: {tooltip?: String},
}


/////////////////
// Settings
/////////////////

type ValueSourcesInfo = {[vs in ValueSource]: {label: String, widget?: String}};
type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";
type ChangeFieldStrategy = "default" | "keep" | "first" | "none";
type FormatReverse = (q: String, op: String, reversedOp: String, operatorDefinition: Operator, revOperatorDefinition: Operator, isForDisplay: Boolean) => String;
type FormatField = (field: String, parts: Array<String>, label2: String, fieldDefinition: Field, config: Config, isForDisplay: Boolean) => String;
type CanCompareFieldWithField = (leftField: String, leftFieldConfig: Field, rightField: String, rightFieldConfig: Field) => Boolean;

export interface LocaleSettings {
  locale?: {
    short: String,
    full: String,
    antd: Object,
  },
  valueLabel?: String,
  valuePlaceholder?: String,
  fieldLabel?: String,
  operatorLabel?: String,
  fieldPlaceholder?: String,
  operatorPlaceholder?: String,
  deleteLabel?: String,
  addGroupLabel?: String,
  addRuleLabel?: String,
  delGroupLabel?: String,
  notLabel?: String,
  valueSourcesPopupTitle?: String,
  removeRuleConfirmOptions?: {
      title?: String,
      okText?: String,
      okType?: String,
  },
  removeGroupConfirmOptions?: {
    title?: String,
    okText?: String,
    okType?: String,
  },
};

export interface RenderSettings {
  renderField?: Factory<FieldProps>;
  renderOperator?: Factory<FieldProps>;
  renderConjsAsRadios?: Boolean,
  renderSize?: AntdSize,
  dropdownPlacement?: AntdPosition,
  groupActionsPosition?: AntdPosition,
  showLabels?: Boolean,
  hideConjForOne?: Boolean,
  maxLabelsLength?: Number,
  customFieldSelectProps?: {},
};

export interface BehaviourSettings {
  canCompareFieldWithField?: CanCompareFieldWithField,
  canReorder?: Boolean,
  canRegroup?: Boolean,
  showNot?: Boolean,
  maxNesting?: Number,
  setOpOnChangeField: Array<ChangeFieldStrategy>,
  clearValueOnChangeField?: Boolean,
  clearValueOnChangeOp?: Boolean,
  canLeaveEmptyGroup?: Boolean,
  immutableGroupsMode?: Boolean,
};

export interface FormatSettings {
  fieldSeparatorDisplay?: String,
  formatReverse?: FormatReverse,
  formatField?: FormatField,
};

export interface MainSettings {
  valueSourcesInfo?: ValueSourcesInfo,
  fieldSeparator?: String,
}

export type Settings = LocaleSettings & RenderSettings & BehaviourSettings & FormatSettings & MainSettings;


/////////////////
// BasicConfig
/////////////////

export interface BasicConfig extends Config {
  conjunctions: {
    AND: Conjunction,
    OR: Conjunction,
  },
  operators: {
    equal: BinaryOperator,
    not_equal: BinaryOperator,
    less: BinaryOperator,
    less_or_equal: BinaryOperator,
    greater: BinaryOperator,
    greater_or_equal: BinaryOperator,
    like: BinaryOperator,
    not_like: BinaryOperator,
    between: Operator2,
    not_between: Operator2,
    range_between: Operator2,
    range_not_between: Operator2,
    is_empty: UnaryOperator,
    is_not_empty: UnaryOperator,
    select_equals: BinaryOperator,
    select_not_equals: BinaryOperator,
    select_any_in: BinaryOperator,
    select_not_any_in: BinaryOperator,
    multiselect_equals: BinaryOperator,
    multiselect_not_equals: BinaryOperator,
    proximity: OperatorProximity,
  },
  widgets: {
    text: BaseWidget,
    number: BaseWidget,
    slider: BaseWidget,
    rangeslider: RangeWidget,
    select: BaseWidget,
    multiselect: BaseWidget,
    date: DateWidget,
    time: DateWidget,
    datetime: DateWidget,
    boolean: BooleanWidget,
    field: FieldWidget,
  },
  types: {
    text: Type,
    number: Type,
    date: Type,
    time: Type,
    datetime: Type,
    select: Type,
    multiselect: Type,
    boolean: Type,
  },
  settings: Settings,
};


/////////////////
// ReadyWidgets
/////////////////

interface ReadyWidgets {
  FieldSelect: ElementType<FieldProps>,
  FieldDropdown: ElementType<FieldProps>,
  FieldCascader: ElementType<FieldProps>,
  VanillaFieldSelect: ElementType<FieldProps>,

  ValueFieldWidget: ElementType<WidgetProps>,

  TextWidget: ElementType<WidgetProps>,
  NumberWidget: ElementType<WidgetProps>,
  SliderWidget: ElementType<WidgetProps>,
  RangeWidget: ElementType<WidgetProps>,
  SelectWidget: ElementType<WidgetProps>,
  MultiSelectWidget: ElementType<WidgetProps>,
  DateWidget: ElementType<WidgetProps>,
  BooleanWidget: ElementType<WidgetProps>,
  TimeWidget: ElementType<WidgetProps>,
  DateTimeWidget: ElementType<WidgetProps>,
};


/////////////////

export const Utils: Utils;
export const Query: Query;
export const Builder: Builder;
export const BasicConfig: BasicConfig;
export const Widgets: ReadyWidgets;

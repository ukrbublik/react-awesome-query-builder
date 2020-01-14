
import {List as ImmutableList, Map as ImmutableMap} from 'immutable';
import {ElementType, ReactElement, Factory} from 'react';


////////////////
// common
/////////////////

type MongoValue = any;

type JsonLogicResult = {
  logic?: JsonLogicTree,
  data?: Object,
  errors?: Array<string>
};
type JsonLogicTree = Object;
type JsonLogicValue = any;
type JsonLogicField = { "var": String };

type RuleValue = Boolean | Number | String | Date | Array<String> | any;

type Optional<T> = {
  [P in keyof T]?: T[P];
}
type TypedMap<T> = {
  [key: string]: T;
};
type Empty = null | undefined;

type ValueSource = "value" | "field" | "func" | "const";

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
    value: Array<RuleValue>,
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
  // export
  jsonLogicFormat(tree: ImmutableTree, config: Config): JsonLogicResult;
  queryBuilderFormat(tree: ImmutableTree, config: Config): Object;
  queryString(tree: ImmutableTree, config: Config, isForDisplay?: Boolean): String;
  sqlFormat(tree: ImmutableTree, config: Config): String;
  mongodbFormat(tree: ImmutableTree, config: Config): Object;
  // load, save
  getTree(tree: ImmutableTree): JsonTree;
  loadTree(jsonTree: JsonTree): ImmutableTree;
  checkTree(tree: ImmutableTree, config: Config): ImmutableTree;
  // import
  loadFromJsonLogic(logicTree: JsonLogicTree, config: Config): ImmutableTree;
  // other
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
  funcs?: Fincs;
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
  funcs?: Funcs,
};


/////////////////
// Widgets, WidgetProps
/////////////////

type FormatValue =         (val: RuleValue, fieldDef: Field, wgtDef: Widget, isForDisplay: Boolean, op: String, opDef: Operator, rightFieldDef?: Field) => string;
type SqlFormatValue =      (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: String, opDef: Operator, rightFieldDef?: Field) => String;
type MongoFormatValue =    (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: String, opDef: Operator) => MongoValue;
type ValidateValue =       (val: RuleValue, fieldDef: Field) => Boolean;

interface BaseWidgetProps {
  value: RuleValue,
  setValue(val: RuleValue): void,
  placeholder: String,
  field: String,
  operator: String,
  fieldDefinition: Field,
  config: Config,
  delta?: Number,
  customProps?: {},
};
interface RangeWidgetProps extends BaseWidgetProps {
  placeholders: Array<String>,
  textSeparators: Array<String>,
};
export type WidgetProps = (BaseWidgetProps | RangeWidgetProps) & FieldSettings;

export type TextWidgetProps = BaseWidgetProps & BasicFieldSettings;
export type DateTimeWidgetProps = BaseWidgetProps & DateTimeFieldSettings;
export type BooleanWidgetProps = BaseWidgetProps & BooleanFieldSettings;
export type NumberWidgetProps = BaseWidgetProps & NumberFieldSettings;
export type SelectWidgetProps = BaseWidgetProps & SelectFieldSettings;
export type TreeSelectWidgetProps = BaseWidgetProps & TreeSelectFieldSettings;
export type RangeSliderWidgetProps = RangeWidgetProps & NumberFieldSettings;

export interface BaseWidget {
  customProps?: {},
  type: String,
  jsType?: String,
  factory: Factory<WidgetProps>,
  valueSrc?: ValueSource,
  valuePlaceholder?: String,
  valueLabel?: String,
  validateValue?: ValidateValue,
  formatValue: FormatValue,
  sqlFormatValue: SqlFormatValue,
  mongoFormatValue?: MongoFormatValue,
};
export interface RangeableWidget extends BaseWidget {
  singleWidget?: String,
  valueLabels?: Array<String | {label: String, placeholder: String}>,
};
export interface FieldWidget {
  customProps?: {},
  valueSrc: "field",
  valuePlaceholder?: String,
  valueLabel?: String,
  validateValue?: ValidateValue,
  formatValue: FormatValue, // with rightFieldDef
  sqlFormatValue: SqlFormatValue, // with rightFieldDef
};

export type TextWidget = BaseWidget & BasicFieldSettings;
export type DateTimeWidget = RangeableWidget & DateTimeFieldSettings;
export type BooleanWidget = BaseWidget & BooleanFieldSettings;
export type NumberWidget = RangeableWidget & NumberFieldSettings;
export type SelectWidget = BaseWidget & SelectFieldSettings;
export type TreeSelectWidget = BaseWidget & TreeSelectFieldSettings;

export type Widget = FieldWidget |  TextWidget | DateTimeWidget | BooleanWidget | NumberWidget | SelectWidget | TreeSelectWidget  | RangeableWidget | BaseWidget;
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

type FormatOperator = (field: String, op: String, vals: String | Array<String>, valueSrc?: ValueSource, valueType?: String, opDef?: Operator, operatorOptions?: {}, isForDisplay?: Boolean) => String;
type MongoFormatOperator = (field: string, op: String, vals: MongoValue | Array<MongoValue>, useExpr?: Boolean, valueSrc?: ValueSource, valueType?: String, opDef?: Operator, operatorOptions?: {}) => Object;
type SqlFormatOperator = (field: String, op: String, vals: String | Array<String>, valueSrc?: ValueSource, valueType?: String, opDef?: Operator, operatorOptions?: {}) => String;
type JsonLogicFormatOperator = (field: JsonLogicField, op: String, vals: JsonLogicValue | Array<JsonLogicValue>, opDef?: Operator, operatorOptions?: {}) => JsonLogicTree;

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
  cardinality?: Number,
  formatOp?: FormatOperator,
  labelForFormat?: String,
  mongoFormatOp?: MongoFormatOperator,
  sqlOp?: String,
  sqlFormatOp?: SqlFormatOperator,
  jsonLogic?: String | JsonLogicFormatOperator,
  _jsonLogicIsRevArgs?: Boolean,
  valueSources?: Array<ValueSource>,
};
interface UnaryOperator extends BaseOperator {
  //cardinality: 0,
};
interface BinaryOperator extends BaseOperator {
  //cardinality: 1,
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

interface ListItem {
  value: any,
  title?: String,
};
interface TreeItem extends ListItem {
  children?: Array<TreeItem>,
  parent?: any,
  disabled?: Boolean,
  selectable?: Boolean,
  disableCheckbox?: Boolean,
  checkable?: Boolean,
};
type TreeData = Array<TreeItem>;
type ListValues = TypedMap<String> | Array<ListItem> | Array<String>;

interface BasicFieldSettings {
}
interface NumberFieldSettings extends BasicFieldSettings {
  min?: Number,
  max?: Number,
  step?: Number,
  marks?: {[mark: number]: ReactElement | String}
};
interface DateTimeFieldSettings extends BasicFieldSettings {
  timeFormat?: String,
  dateFormat?: String,
  valueFormat?: String,
  use12Hours?: Boolean,
};
interface SelectFieldSettings extends BasicFieldSettings {
  listValues?: ListValues,
  allowCustomValues?: Boolean,
}
interface TreeSelectFieldSettings extends BasicFieldSettings {
  listValues?: TreeData,
  treeExpandAll?: Boolean,
  treeSelectOnlyLeafs?:  Boolean,
}
interface BooleanFieldSettings extends BasicFieldSettings {
  labelYes?: ReactElement | String,
  labelNo?: ReactElement | String,
};
export type FieldSettings = NumberFieldSettings | DateTimeFieldSettings | SelectFieldSettings | TreeSelectFieldSettings | BooleanFieldSettings | BasicFieldSettings;

interface BaseField {
  type: FieldType,
  label?: String,
  tooltip?: String,
};
interface ValueField extends BaseField {
  type: String,
  preferWidgets?: Array<String>,
  valueSources?: Array<ValueSource>,
  funcs?: Array<String>,
  tableName?: String,
  fieldSettings?: FieldSettings,
  defaultValue?: RuleValue,
  widgets?: TypedMap<WidgetConfigForType>,
  mainWidgetProps?: Optional<Widget>,
  hideForSelect?: Boolean,
  hideForCompare?: Boolean,
  //obsolete - moved to FieldSettings
  listValues?: ListValues,
  allowCustomValues?: Boolean,
};
interface SimpleField extends ValueField {
  label2?: String,
  operators?: Array<String>,
  defaultOperator?: String,
  excludeOperators?: Array<String>,
};
interface FieldGroup extends BaseField {
  type: "!struct",
  subfields: Fields,
};

export type Field = SimpleField;
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

type ValueSourcesInfo = {[vs in ValueSource]?: {label: String, widget?: String}};
type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";
type ChangeFieldStrategy = "default" | "keep" | "first" | "none";
type FormatReverse = (q: String, op: String, reversedOp: String, operatorDefinition: Operator, revOperatorDefinition: Operator, isForDisplay: Boolean) => String;
type FormatField = (field: String, parts: Array<String>, label2: String, fieldDefinition: Field, config: Config, isForDisplay: Boolean) => String;
type CanCompareFieldWithField = (leftField: String, leftFieldConfig: Field, rightField: String, rightFieldConfig: Field, op: String) => Boolean;

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
  funcPlaceholder?: String,
  funcLabel?: String,
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
  renderFunc?: Factory<FieldProps>;
  renderConjsAsRadios?: Boolean,
  renderSize?: AntdSize,
  dropdownPlacement?: AntdPosition,
  groupActionsPosition?: AntdPosition,
  showLabels?: Boolean,
  hideConjForOne?: Boolean,
  maxLabelsLength?: Number,
  customFieldSelectProps?: {},
  renderBeforeWidget?:Factory<FieldProps>;
  renderAfterWidget?:Factory<FieldProps>;
  renderBeforeActions?:Factory<FieldProps>;
  renderAfterActions?:Factory<FieldProps>;
};

export interface BehaviourSettings {
  valueSourcesInfo?: ValueSourcesInfo,
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

export interface OtherSettings {
  fieldSeparator?: String,
  fieldSeparatorDisplay?: String,
  formatReverse?: FormatReverse,
  formatField?: FormatField,
};

export type Settings = LocaleSettings & RenderSettings & BehaviourSettings & OtherSettings;


/////////////////
// Funcs
/////////////////

type SqlFormatFunc = (formattedArgs: { [key: string]: string }) => String;
type FormatFunc = (formattedArgs: { [key: string]: string }, isForDisplay: Boolean) => String;
type MongoFormatFunc = (formattedArgs: { [key: string]: MongoValue }) => MongoValue;
type JsonLogicFormatFunc = (formattedArgs: { [key: string]: JsonLogicValue }) => JsonLogicTree;

interface FuncGroup {
  type?: "!struct",
  label?: String,
  subfields: TypedMap<Func>,
}

export interface Func {
  returnType: String,
  args: TypedMap<FuncArg>,
  label?: String,
  sqlFunc?: String,
  mongoFunc?: String,
  mongoArgsAsObject?: Boolean,
  jsonLogic?: String | JsonLogicFormatFunc,
  jsonLogicIsMethod?: Boolean,
  formatFunc?: FormatFunc,
  sqlFormatFunc?: SqlFormatFunc,
  mongoFormatFunc?: MongoFormatFunc,
  renderBrackets?: Array<ReactElement | String>,
  renderSeps?: Array<ReactElement | String>,
};
export interface FuncArg extends ValueField {
  isOptional?: Boolean,
};
export type Funcs = TypedMap<Func | FuncGroup>;


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
    text: TextWidget,
    number: NumberWidget,
    slider: NumberWidget,
    rangeslider: NumberWidget,
    select: SelectWidget,
    multiselect: SelectWidget,
    treeselect: TreeSelectWidget,
    treemultiselect: TreeSelectWidget,
    date: DateTimeWidget,
    time: DateTimeWidget,
    datetime: DateTimeWidget,
    boolean: BooleanWidget,
    field: FieldWidget,
    func: FieldWidget,
  },
  types: {
    text: Type,
    number: Type,
    date: Type,
    time: Type,
    datetime: Type,
    select: Type,
    multiselect: Type,
    treeselect: Type,
    treemultiselect: Type,
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

  FuncWidget: ElementType<WidgetProps>,

  TextWidget: ElementType<TextWidgetProps>,
  NumberWidget: ElementType<NumberWidgetProps>,
  SliderWidget: ElementType<NumberWidgetProps>,
  RangeWidget: ElementType<RangeSliderWidgetProps>,
  SelectWidget: ElementType<SelectWidgetProps>,
  MultiSelectWidget: ElementType<SelectWidgetProps>,
  TreeSelectWidget: ElementType<TreeSelectWidgetProps>,
  DateWidget: ElementType<DateTimeWidgetProps>,
  TimeWidget: ElementType<DateTimeWidgetProps>,
  DateTimeWidget: ElementType<DateTimeWidgetProps>,
  BooleanWidget: ElementType<BooleanWidgetProps>,
};


/////////////////

export const Utils: Utils;
export const Query: Query;
export const Builder: Builder;
export const BasicConfig: BasicConfig;
export const Widgets: ReadyWidgets;

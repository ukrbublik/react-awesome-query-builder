/* eslint-disable no-extra-semi */

import {List as ImmutableList, Map as ImmutableMap, OrderedMap as ImmutableOMap} from "immutable";
import {ElementType, ReactElement, Factory} from "react";


////////////////
// common
/////////////////

type AnyObject = object;
type Empty = null | undefined;

type IdPath = Array<string> | ImmutableList<string>;

type Optional<T> = {
  [P in keyof T]?: T[P];
}

type TypedMap<T> = {
  [key: string]: T;
}

// You can not use a union for types on a key, but can define overloaded accessors of different types.
// Key can be a string OR number
type TypedKeyMap<K extends string|number, T> = {
  [key: string]: T;
  [key: number]: T;
}

// for export/import

type MongoValue = any;
type ElasticSearchQueryType = string;

type JsonLogicResult = {
  logic?: JsonLogicTree,
  data?: Object,
  errors?: Array<string>
}
type JsonLogicTree = Object;
type JsonLogicValue = any;
type JsonLogicField = { "var": string };

////////////////
// query value
/////////////////

type RuleValue = boolean | number | string | Date | Array<string> | any;

type ValueSource = "value" | "field" | "func" | "const";
type RuleGroupMode = "struct" | "some" | "array";
type ItemType = "group" | "rule_group" | "rule";
type ItemProperties = RuleProperties | RuleGroupExtProperties | RuleGroupProperties | GroupProperties;

type TypedValueSourceMap<T> = {
  [key in ValueSource]: T;
}

interface BasicItemProperties {
  isLocked?: boolean,
}

interface RuleProperties extends BasicItemProperties {
  field: string | Empty,
  operator: string | Empty,
  value: Array<RuleValue>,
  valueSrc?: Array<ValueSource>,
  valueType?: Array<string>,
  valueError?: Array<string>,
  operatorOptions?: AnyObject,
}

interface RuleGroupExtProperties extends RuleProperties {
  mode: RuleGroupMode,
}

interface RuleGroupProperties extends BasicItemProperties {
  field: string | Empty,
  mode?: RuleGroupMode,
}

interface GroupProperties extends BasicItemProperties {
  conjunction: string,
  not?: boolean,
}

type JsonAnyRule = JsonRule|JsonRuleGroup|JsonRuleGroupExt;
type JsonItem = JsonGroup|JsonAnyRule;
type JsonGroup = {
  type: "group",
  id?: string,
  // tip: if got array, it will be converted to immutable ordered map in `_addChildren1`
  children1?: {[id: string]: JsonItem} | [JsonItem],
  properties?: GroupProperties
}
type JsonRuleGroup = {
  type: "rule_group",
  id?: string,
  children1?: {[id: string]: JsonRule} | [JsonRule],
  properties?: RuleGroupProperties
}
type JsonRuleGroupExt = {
  type: "rule_group",
  id?: string,
  children1?: {[id: string]: JsonRule} | [JsonRule],
  properties?: RuleGroupExtProperties
}
type JsonRule = {
  type: "rule",
  properties: RuleProperties,
}
export type JsonTree = JsonGroup;

export type ImmutableTree = ImmutableOMap<string, any>;


////////////////
// Query, Builder, Utils, Config
/////////////////

export interface Utils {
  // export
  jsonLogicFormat(tree: ImmutableTree, config: Config): JsonLogicResult;
  queryBuilderFormat(tree: ImmutableTree, config: Config): Object | undefined;
  queryString(tree: ImmutableTree, config: Config, isForDisplay?: boolean): string | undefined;
  sqlFormat(tree: ImmutableTree, config: Config): string | undefined;
  mongodbFormat(tree: ImmutableTree, config: Config): Object | undefined;
  elasticSearchFormat(tree: ImmutableTree, config: Config): Object | undefined;
  // load, save
  getTree(tree: ImmutableTree, light?: boolean): JsonTree;
  loadTree(jsonTree: JsonTree): ImmutableTree;
  checkTree(tree: ImmutableTree, config: Config): ImmutableTree;
  isValidTree(tree: ImmutableTree): boolean;
  // import
  loadFromJsonLogic(logicTree: JsonLogicTree | undefined, config: Config): ImmutableTree;
  isJsonLogic(value: any): boolean;
  // other
  uuid(): string;
  simulateAsyncFetch(all: AsyncFetchListValues, pageSize?: number, delay?: number): AsyncFetchListValuesFn;
  // config utils
  ConfigUtils: {
    getFieldConfig(config: Config, field: string): Field | null;
    getFuncConfig(config: Config, func: string): Func | null;
    getFuncArgConfig(config: Config, func: string, arg: string): FuncArg | null;
    getOperatorConfig(config: Config, operator: string, field?: string): Operator | null;
    getFieldWidgetConfig(config: Config, field: string, operator: string, widget?: string, valueStr?: ValueSource): Widget | null;
  }
}

export interface BuilderProps {
  tree: ImmutableTree,
  config: Config,
  actions: Actions,
  dispatch: Dispatch,
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

export interface Config {
  conjunctions: Conjunctions,
  operators: Operators,
  widgets: Widgets,
  types: Types,
  settings: Settings,
  fields: Fields,
  funcs?: Funcs,
}

/////////////////
// Actions
/////////////////

type Placement = "after" | "before" | "append" | "prepend";
type ActionType = string | "ADD_RULE" | "REMOVE_RULE" | "ADD_GROUP" | "REMOVE_GROUP" | "SET_NOT" | "SET_LOCK" | "SET_CONJUNCTION" | "SET_FIELD" | "SET_OPERATOR" | "SET_VALUE" | "SET_VALUE_SRC" | "SET_OPERATOR_OPTION" | "MOVE_ITEM";
interface BaseAction {
  type: ActionType,

  id?: string, // for ADD_RULE, ADD_GROUP - id of new item
  path?: IdPath, // for all except MOVE_ITEM (for ADD_RULE/ADD_GROUP it's parent path)

  conjunction?: string,
  not?: boolean,
  lock?: boolean,
  field?: string,
  operator?: string,
  delta?: number, // for SET_VALUE
  value?: RuleValue,
  valueType?: string,
  srcKey?: ValueSource,
  name?: string, // for SET_OPERATOR_OPTION
  fromPath?: IdPath, // for MOVE_ITEM
  toPath?: IdPath, // for MOVE_ITEM
  placement?: Placement, // for MOVE_ITEM
  properties?: TypedMap<any>, // for ADD_RULE, ADD_GROUP
}
export interface InputAction extends BaseAction {
  config: Config,
}
export interface ActionMeta extends BaseAction {
  affectedField?: string, // gets field name from `path` (or `field` for first SET_FIELD)
}

export type Dispatch = (action: InputAction) => void;

export interface Actions {
  // tip: children will be converted to immutable ordered map in `_addChildren1`
  addRule(path: IdPath, properties?: ItemProperties, type?: ItemType, children?: Array<JsonAnyRule>): undefined;
  removeRule(path: IdPath): undefined;
  addGroup(path: IdPath, properties?: ItemProperties, children?: Array<JsonItem>): undefined;
  removeGroup(path: IdPath): undefined;
  setNot(path: IdPath, not: boolean): undefined;
  setLock(path: IdPath, lock: boolean): undefined;
  setConjunction(path: IdPath, conjunction: string): undefined;
  setField(path: IdPath, field: string): undefined;
  setOperator(path: IdPath, operator: string): undefined;
  setValue(path: IdPath, delta: number, value: RuleValue, valueType: string): undefined;
  setValueSrc(path: IdPath, delta: number, valueSrc: ValueSource): undefined;
  setOperatorOption(path: IdPath, name: string, value: RuleValue): undefined;
  moveItem(fromPath: IdPath, toPath: IdPath, placement: Placement): undefined;
  setTree(tree: ImmutableTree): undefined;
}


/////////////////
// Widgets, WidgetProps
/////////////////

type FormatValue =          (val: RuleValue, fieldDef: Field, wgtDef: Widget, isForDisplay: boolean, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type SqlFormatValue =       (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type MongoFormatValue =     (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator) => MongoValue;
type JsonLogicFormatValue = (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator) => JsonLogicValue;
type ValidateValue =        (val: RuleValue, fieldSettings: FieldSettings) => boolean | string | null;
type ElasticSearchFormatValue = (queryType: ElasticSearchQueryType, val: RuleValue, op: string, field: string, config: Config) => AnyObject | null;

interface BaseWidgetProps {
  value: RuleValue,
  setValue(val: RuleValue, asyncListValues?: Array<any>): void,
  placeholder: string,
  field: string,
  parentField?: string,
  operator: string,
  fieldDefinition: Field,
  config: Config,
  delta?: number,
  customProps?: AnyObject,
  readonly?: boolean,
  id?: string, // id of rule
  groupId?: string, // id of parent group
}
interface RangeWidgetProps extends BaseWidgetProps {
  placeholders: Array<string>,
  textSeparators: Array<string>,
}
export type WidgetProps = (BaseWidgetProps | RangeWidgetProps) & FieldSettings;

export type TextWidgetProps = BaseWidgetProps & TextFieldSettings;
export type DateTimeWidgetProps = BaseWidgetProps & DateTimeFieldSettings;
export type BooleanWidgetProps = BaseWidgetProps & BooleanFieldSettings;
export type NumberWidgetProps = BaseWidgetProps & NumberFieldSettings;
export type SelectWidgetProps = BaseWidgetProps & SelectFieldSettings;
export type TreeSelectWidgetProps = BaseWidgetProps & TreeSelectFieldSettings;
export type RangeSliderWidgetProps = RangeWidgetProps & NumberFieldSettings;

export interface BaseWidget {
  customProps?: AnyObject;
  type: string;
  jsType?: string;
  factory: Factory<WidgetProps>;
  valueSrc?: ValueSource;
  valuePlaceholder?: string;
  valueLabel?: string;
  fullWidth?: boolean;
  formatValue: FormatValue;
  sqlFormatValue: SqlFormatValue;
  mongoFormatValue?: MongoFormatValue;
  elasticSearchFormatValue?: ElasticSearchFormatValue;
  hideOperator?: boolean;
  jsonLogic?: JsonLogicFormatValue;
  //obsolete:
  validateValue?: ValidateValue;
}
export interface RangeableWidget extends BaseWidget {
  singleWidget?: string,
  valueLabels?: Array<string | {label: string, placeholder: string}>,
}
export interface FieldWidget {
  customProps?: AnyObject,
  valueSrc: "field",
  valuePlaceholder?: string,
  valueLabel?: string,
  formatValue: FormatValue, // with rightFieldDef
  sqlFormatValue: SqlFormatValue, // with rightFieldDef
  //obsolete:
  validateValue?: ValidateValue,
}

export type TextWidget = BaseWidget & TextFieldSettings;
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

type FormatConj = (children: ImmutableList<string>, conj: string, not: boolean, isForDisplay?: boolean) => string;
type SqlFormatConj = (children: ImmutableList<string>, conj: string, not: boolean) => string;

export interface Conjunction {
  label: string,
  formatConj: FormatConj,
  sqlFormatConj: SqlFormatConj,
  mongoConj: string,
  reversedConj?: string,
}
export type Conjunctions = TypedMap<Conjunction>;

export interface ConjunctionOption {
  id: string,
  key: string,
  label: string,
  checked: boolean,
}

export interface ConjsProps {
  id: string, 
  readonly?: boolean,
  disabled?: boolean,
  selectedConjunction?: string,
  setConjunction(conj: string): void,
  conjunctionOptions?: TypedMap<ConjunctionOption>,
  config?: Config,
  not: boolean,
  setNot(not: boolean): void,
  showNot?: boolean,
  notLabel?: string,
}


/////////////////
// Rule, Group
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
// Operators
/////////////////

type FormatOperator = (field: string, op: string, vals: string | Array<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, isForDisplay?: boolean) => string;
type MongoFormatOperator = (field: string, op: string, vals: MongoValue | Array<MongoValue>, useExpr?: boolean, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, fieldDef?: Field) => Object;
type SqlFormatOperator = (field: string, op: string, vals: string | Array<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, fieldDef?: Field) => string;
type JsonLogicFormatOperator = (field: JsonLogicField, op: string, vals: JsonLogicValue | Array<JsonLogicValue>, opDef?: Operator, operatorOptions?: AnyObject, fieldDef?: Field) => JsonLogicTree;
type ElasticSearchFormatQueryType = (valueType: string) => ElasticSearchQueryType;

interface ProximityConfig {
  optionLabel: string,
  optionTextBefore: string,
  optionPlaceholder: string,
  minProximity: number,
  maxProximity: number,
  defaults: {
      proximity: number,
  },
  customProps?: AnyObject,
}
export interface ProximityProps extends ProximityConfig {
  options: ImmutableMap<string, any>,
  setOption: (key: string, value: any) => void,
  config: Config,
}
export interface ProximityOptions extends ProximityConfig {
  factory: Factory<ProximityProps>,
}

interface BaseOperator {
  label: string,
  reversedOp?: string,
  isNotOp?: boolean,
  cardinality?: number,
  formatOp?: FormatOperator,
  labelForFormat?: string,
  mongoFormatOp?: MongoFormatOperator,
  sqlOp?: string,
  sqlFormatOp?: SqlFormatOperator,
  jsonLogic?: string | JsonLogicFormatOperator,
  _jsonLogicIsRevArgs?: boolean,
  elasticSearchQueryType?: ElasticSearchQueryType | ElasticSearchFormatQueryType,
  valueSources?: Array<ValueSource>,
}
interface UnaryOperator extends BaseOperator {
  //cardinality: 0,
}
interface BinaryOperator extends BaseOperator {
  //cardinality: 1,
}
interface Operator2 extends BaseOperator {
  //cardinality: 2
  textSeparators: Array<string>,
  valueLabels: Array<string | {label: string, placeholder: string}>,
  isSpecialRange?: boolean,
}
interface OperatorProximity extends Operator2 {
  options: ProximityOptions,
}
export type Operator = UnaryOperator | BinaryOperator | Operator2 | OperatorProximity;
export type Operators = TypedMap<Operator>;



/////////////////
// Types
/////////////////

interface WidgetConfigForType {
  widgetProps?: Optional<Widget>,
  opProps?: Optional<Operator>,
  operators?: Array<string>,
}

interface Type {
  valueSources?: Array<ValueSource>,
  defaultOperator?: string,
  widgets: TypedMap<WidgetConfigForType>,
}
export type Types = TypedMap<Type>;


/////////////////
// Fields
/////////////////

type FieldType = string | "!struct" | "!group";

interface ListItem {
  value: any,
  title?: string,
}
interface TreeItem extends ListItem {
  children?: Array<TreeItem>,
  parent?: any,
  disabled?: boolean,
  selectable?: boolean,
  disableCheckbox?: boolean,
  checkable?: boolean,
}
type TreeData = Array<TreeItem>;
type ListValues = TypedMap<string> | TypedKeyMap<string | number, string> | Array<ListItem> | Array<string | number>;

type AsyncFetchListValues = ListValues;
interface AsyncFetchListValuesResult {
  values: AsyncFetchListValues,
  hasMore?: boolean,
}
type AsyncFetchListValuesFn = (search: string | null, offset: number) => Promise<AsyncFetchListValuesResult>;


export interface BasicFieldSettings {
  validateValue?: ValidateValue,
}
export interface TextFieldSettings extends BasicFieldSettings {
  maxLength?: number,
  maxRows?: number,
}
export interface NumberFieldSettings extends BasicFieldSettings {
  min?: number,
  max?: number,
  step?: number,
  marks?: {[mark: number]: ReactElement | string}
}
export interface DateTimeFieldSettings extends BasicFieldSettings {
  timeFormat?: string,
  dateFormat?: string,
  valueFormat?: string,
  use12Hours?: boolean,
  useKeyboard?: boolean,
}
export interface SelectFieldSettings extends BasicFieldSettings {
  listValues?: ListValues,
  allowCustomValues?: boolean,
  showSearch?: boolean,
  showCheckboxes?: boolean,
  asyncFetch?: AsyncFetchListValuesFn,
  useLoadMore?: boolean,
  useAsyncSearch?: boolean,
  forceAsyncSearch?: boolean,
}
export interface TreeSelectFieldSettings extends BasicFieldSettings {
  listValues?: TreeData,
  treeExpandAll?: boolean,
  treeSelectOnlyLeafs?: boolean,
}
export interface BooleanFieldSettings extends BasicFieldSettings {
  labelYes?: ReactElement | string,
  labelNo?: ReactElement | string,
}
export type FieldSettings = NumberFieldSettings | DateTimeFieldSettings | SelectFieldSettings | TreeSelectFieldSettings | BooleanFieldSettings | TextFieldSettings | BasicFieldSettings;

interface BaseField {
  type: FieldType,
  label?: string,
  tooltip?: string,
}
interface ValueField extends BaseField {
  type: string,
  preferWidgets?: Array<string>,
  valueSources?: Array<ValueSource>,
  funcs?: Array<string>,
  tableName?: string, // legacy: PR #18, PR #20
  fieldName?: string,
  jsonLogicVar?: string,
  fieldSettings?: FieldSettings,
  defaultValue?: RuleValue,
  widgets?: TypedMap<WidgetConfigForType>,
  mainWidgetProps?: Optional<Widget>,
  hideForSelect?: boolean,
  hideForCompare?: boolean,
  //obsolete - moved to FieldSettings
  listValues?: ListValues,
  allowCustomValues?: boolean,
}
interface SimpleField extends ValueField {
  label2?: string,
  operators?: Array<string>,
  defaultOperator?: string,
  excludeOperators?: Array<string>,
}
interface FieldStruct extends BaseField {
  type: "!struct",
  subfields: Fields,
}
interface FieldGroup extends BaseField {
  type: "!group",
  subfields: Fields,
  mode: RuleGroupMode,
}
interface FieldGroupExt extends BaseField {
  type: "!group",
  subfields: Fields,
  mode: "array",
  operators?: Array<string>,
  defaultOperator?: string,
  initialEmptyWhere?: boolean,
  showNot?: boolean,
  conjunctions?: Array<string>,
}

export type Field = SimpleField;
type FieldOrGroup = FieldStruct | FieldGroup | FieldGroupExt | Field;
export type Fields = TypedMap<FieldOrGroup>;


/////////////////
// FieldProps
/////////////////

export type FieldItem = {
  items?: FieldItems, 
  key: string, 
  path?: string, // field path with separator
  label: string, 
  fullLabel?: string, 
  altLabel?: string, 
  tooltip?: string,
  disabled?: boolean,
}
type FieldItems = FieldItem[];

export interface FieldProps {
  items: FieldItems,
  setField(fieldPath: string): void,
  selectedKey: string | Empty,
  selectedKeys?: Array<string> | Empty,
  selectedPath?: Array<string> | Empty,
  selectedLabel?: string | Empty,
  selectedAltLabel?: string | Empty,
  selectedFullLabel?: string | Empty,
  config?: Config,
  customProps?: AnyObject,
  placeholder?: string,
  selectedOpts?: {tooltip?: string},
  readonly?: boolean,
  id?: string, // id of rule
  groupId?: string, // id of parent group
}

/////////////////
// Settings
/////////////////

type ValueSourcesInfo = {[vs in ValueSource]?: {label: string, widget?: string}}
type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";
type ChangeFieldStrategy = "default" | "keep" | "first" | "none";
type FormatReverse = (q: string, op: string, reversedOp: string, operatorDefinition: Operator, revOperatorDefinition: Operator, isForDisplay: boolean) => string;
type SqlFormatReverse = (q: string, op: string, reversedOp: string, operatorDefinition: Operator, revOperatorDefinition: Operator) => string;
type FormatField = (field: string, parts: Array<string>, label2: string, fieldDefinition: Field, config: Config, isForDisplay: boolean) => string;
type CanCompareFieldWithField = (leftField: string, leftFieldConfig: Field, rightField: string, rightFieldConfig: Field, op: string) => boolean;
type FormatAggr = (whereStr: string, aggrField: string, operator: string, value: string | Array<string>, valueSrc: ValueSource, valueType: string, opDef: Operator, operatorOptions: AnyObject, isForDisplay: boolean, aggrFieldDef: Field) => string;

export interface LocaleSettings {
  locale?: {
    moment?: string,
    antd?: Object,
    material?: Object,
  },
  theme?: {
    material?: Object,
  },
  valueLabel?: string,
  valuePlaceholder?: string,
  fieldLabel?: string,
  operatorLabel?: string,
  fieldPlaceholder?: string,
  funcPlaceholder?: string,
  funcLabel?: string,
  operatorPlaceholder?: string,
  lockLabel?: string,
  lockedLabel?: string,
  deleteLabel?: string,
  addGroupLabel?: string,
  addRuleLabel?: string,
  addSubRuleLabel?: string,
  delGroupLabel?: string,
  notLabel?: string,
  valueSourcesPopupTitle?: string,
  removeRuleConfirmOptions?: {
    title?: string,
    okText?: string,
    okType?: string,
    cancelText?: string,
  },
  removeGroupConfirmOptions?: {
    title?: string,
    okText?: string,
    okType?: string,
    cancelText?: string,
  },
}

export interface RenderSettings {
  renderField?: Factory<FieldProps>,
  renderOperator?: Factory<FieldProps>,
  renderFunc?: Factory<FieldProps>,
  renderConjs?: Factory<ConjsProps>,
  renderButton?: Factory<ButtonProps>,
  renderButtonGroup?: Factory<ButtonGroupProps>,
  renderSwitch?: Factory<SwitchProps>,
  renderProvider?: Factory<ProviderProps>,
  renderValueSources?: Factory<ValueSourcesProps>,
  renderConfirm?: ConfirmFunc,
  useConfirm?: () => Function,
  renderSize?: AntdSize,
  dropdownPlacement?: AntdPosition,
  groupActionsPosition?: AntdPosition,
  showLabels?: boolean,
  maxLabelsLength?: number,
  customFieldSelectProps?: AnyObject,
  renderBeforeWidget?: Factory<FieldProps>,
  renderAfterWidget?: Factory<FieldProps>,
  renderBeforeActions?: Factory<FieldProps>,
  renderAfterActions?: Factory<FieldProps>,
  renderRuleError?: Factory<RuleErrorProps>,
  defaultSliderWidth?: string,
  defaultSelectWidth?: string,
  defaultSearchWidth?: string,
  defaultMaxRows?: number,
}

export interface BehaviourSettings {
  valueSourcesInfo?: ValueSourcesInfo,
  canCompareFieldWithField?: CanCompareFieldWithField,
  canReorder?: boolean,
  canRegroup?: boolean,
  showNot?: boolean,
  showLock?: boolean,
  canDeleteLocked?: boolean,
  maxNesting?: number,
  setOpOnChangeField: Array<ChangeFieldStrategy>,
  clearValueOnChangeField?: boolean,
  clearValueOnChangeOp?: boolean,
  canLeaveEmptyGroup?: boolean,
  shouldCreateEmptyGroup?: boolean,
  forceShowConj?: boolean,
  immutableGroupsMode?: boolean,
  immutableFieldsMode?: boolean,
  immutableOpsMode?: boolean,
  immutableValuesMode?: boolean,
  maxNumberOfRules?: Number,
  showErrorMessage?: boolean,
  canShortMongoQuery?: boolean,
  convertableWidgets?: TypedMap<Array<string>>,
}

export interface OtherSettings {
  fieldSeparator?: string,
  fieldSeparatorDisplay?: string,
  formatReverse?: FormatReverse,
  sqlFormatReverse?: SqlFormatReverse,
  formatField?: FormatField,
  formarAggr?: FormatAggr,
}

export type Settings = LocaleSettings & RenderSettings & BehaviourSettings & OtherSettings;


/////////////////
// Funcs
/////////////////

type SqlFormatFunc = (formattedArgs: TypedMap<string>) => string;
type FormatFunc = (formattedArgs: TypedMap<string>, isForDisplay: boolean) => string;
type MongoFormatFunc = (formattedArgs: TypedMap<MongoValue>) => MongoValue;
type JsonLogicFormatFunc = (formattedArgs: TypedMap<JsonLogicValue>) => JsonLogicTree;
type JsonLogicImportFunc = (val: JsonLogicValue) => Array<RuleValue>;

interface FuncGroup {
  type?: "!struct",
  label?: string,
  subfields: TypedMap<Func>,
}

export interface Func {
  returnType: string,
  args: TypedMap<FuncArg>,
  label?: string,
  sqlFunc?: string,
  mongoFunc?: string,
  mongoArgsAsObject?: boolean,
  jsonLogic?: string | JsonLogicFormatFunc,
  // Deprecated!
  // Calling methods on objects was remvoed in JsonLogic 2.x
  // https://github.com/jwadhams/json-logic-js/issues/86
  jsonLogicIsMethod?: boolean,
  jsonLogicImport?: JsonLogicImportFunc,
  formatFunc?: FormatFunc,
  sqlFormatFunc?: SqlFormatFunc,
  mongoFormatFunc?: MongoFormatFunc,
  renderBrackets?: Array<ReactElement | string>,
  renderSeps?: Array<ReactElement | string>,
}
export interface FuncArg extends ValueField {
  isOptional?: boolean,
  showPrefix?: boolean,
}
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
    starts_with: BinaryOperator,
    ends_with: BinaryOperator,
    between: Operator2,
    not_between: Operator2,
    is_null: UnaryOperator,
    is_not_null: UnaryOperator,
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
    textarea: TextWidget,
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
}


/////////////////
// ReadyWidgets
/////////////////

type ConfirmFunc = (opts: ConfirmModalProps) => void;

interface VanillaWidgets {
  // vanilla core widgets
  VanillaFieldSelect: ElementType<FieldProps>,
  VanillaConjs: ElementType<ConjsProps>,
  VanillaSwitch: ElementType<SwitchProps>,
  VanillaButton: ElementType<ButtonProps>,
  VanillaButtonGroup: ElementType<ButtonGroupProps>,
  VanillaProvider: ElementType<ProviderProps>,
  VanillaValueSources: ElementType<ValueSourcesProps>,
  vanillaConfirm: ConfirmFunc,

  // vanilla core widgets
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
}

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
  SliderWidget: ElementType<NumberWidgetProps>,
  RangeWidget: ElementType<RangeSliderWidgetProps>,
  SelectWidget: ElementType<SelectWidgetProps>,
  MultiSelectWidget: ElementType<SelectWidgetProps>,
  TreeSelectWidget: ElementType<TreeSelectWidgetProps>,
  DateWidget: ElementType<DateTimeWidgetProps>,
  TimeWidget: ElementType<DateTimeWidgetProps>,
  DateTimeWidget: ElementType<DateTimeWidgetProps>,
  BooleanWidget: ElementType<BooleanWidgetProps>,
}

interface ReadyWidgets extends VanillaWidgets {
  ValueFieldWidget: ElementType<WidgetProps>,
  FuncWidget: ElementType<WidgetProps>,
}

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

/////////////////

export const Utils: Utils;
export const Query: Query;
export const Builder: Builder;
export const BasicConfig: BasicConfig;
export const BasicFuncs: Funcs;
export const Widgets: ReadyWidgets;

/* eslint-disable no-extra-semi */

import {List as ImmutableList, Map as ImmutableMap, OrderedMap as ImmutableOMap} from "immutable";
import {ElementType, ReactElement, Factory} from "react";
import type { Moment as MomentType } from "moment";

export type Moment = MomentType;

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

export type ValueSource = "value" | "field" | "func" | "const";
export type RuleGroupMode = "struct" | "some" | "array";
export type ItemType = "group" | "rule_group" | "rule";
export type ItemProperties = RuleProperties | RuleGroupExtProperties | RuleGroupProperties | GroupProperties;

export type TypedValueSourceMap<T> = {
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

interface SwitchGroupProperties extends BasicItemProperties {

}

interface CaseGroupProperties extends BasicItemProperties {

}

type JsonAnyRule = JsonRule|JsonRuleGroup|JsonRuleGroupExt;
type JsonItem = JsonGroup|JsonAnyRule;
type JsonSwitchGroup = {
  type: "switch_group",
  id?: string,
  children1?: {[id: string]: JsonCaseGroup} | JsonCaseGroup[],
  properties?: SwitchGroupProperties
};
type JsonCaseGroup = {
  type: "case_group",
  id?: string,
  children1?: {[id: string]: JsonGroup} | JsonGroup[],
  properties?: CaseGroupProperties
};
type JsonGroup = {
  type: "group",
  id?: string,
  // tip: if got array, it will be converted to immutable ordered map in `_addChildren1`
  children1?: {[id: string]: JsonItem} | JsonItem[],
  properties?: GroupProperties
}
type JsonRuleGroup = {
  type: "rule_group",
  id?: string,
  children1?: {[id: string]: JsonRule} | JsonRule[],
  properties?: RuleGroupProperties
}
type JsonRuleGroupExt = {
  type: "rule_group",
  id?: string,
  children1?: {[id: string]: JsonRule} | JsonRule[],
  properties?: RuleGroupExtProperties
}
type JsonRule = {
  type: "rule",
  id?: string,
  properties: RuleProperties,
}
export type JsonTree = JsonGroup|JsonSwitchGroup;

export type ImmutableTree = ImmutableOMap<string, any>;


////////////////
// Utils
/////////////////

export interface SpelConcatPart {
  value: string;
  type: "property" | "variable" | "const";
}
type SpelConcatParts = SpelConcatPart[];
interface SpelConcatCaseValue {
  valueType: "case_value";
  value: SpelConcatNormalValue[];
}
interface SpelConcatNormalValue {
  value: string;
  valueType: string;
  valueSrc: "value" | "field";
  isVariable?: boolean;
}
type SpelConcatValue = SpelConcatNormalValue | SpelConcatCaseValue;

export interface Utils {
  // export
  jsonLogicFormat(tree: ImmutableTree, config: Config): JsonLogicResult;
  // @deprecated
  queryBuilderFormat(tree: ImmutableTree, config: Config): Object | undefined;
  queryString(tree: ImmutableTree, config: Config, isForDisplay?: boolean): string | undefined;
  sqlFormat(tree: ImmutableTree, config: Config): string | undefined;
  _sqlFormat(tree: ImmutableTree, config: Config): [string | undefined, Array<string>];
  spelFormat(tree: ImmutableTree, config: Config): string | undefined;
  _spelFormat(tree: ImmutableTree, config: Config): [string | undefined, Array<string>];
  mongodbFormat(tree: ImmutableTree, config: Config): Object | undefined;
  _mongodbFormat(tree: ImmutableTree, config: Config): [Object | undefined, Array<string>];
  elasticSearchFormat(tree: ImmutableTree, config: Config): Object | undefined;
  // load, save
  getTree(tree: ImmutableTree, light?: boolean, children1AsArray?: boolean): JsonTree;
  loadTree(jsonTree: JsonTree): ImmutableTree;
  checkTree(tree: ImmutableTree, config: Config): ImmutableTree;
  isValidTree(tree: ImmutableTree): boolean;
  getSwitchValues(tree: ImmutableTree): Array<SpelConcatParts | null>;
  // import
  loadFromJsonLogic(logicTree: JsonLogicTree | undefined, config: Config): ImmutableTree | undefined;
  _loadFromJsonLogic(logicTree: JsonLogicTree | undefined, config: Config): [ImmutableTree | undefined, Array<string>];
  loadFromSpel(spelStr: string, config: Config): [ImmutableTree | undefined, Array<string>];
  isJsonLogic(value: any): boolean;
  // other
  uuid(): string;

  Autocomplete: {
    simulateAsyncFetch(all: AsyncFetchListValues, pageSize?: number, delay?: number): AsyncFetchListValuesFn;
  };
  ConfigUtils: {
    extendConfig(config: Config): Config;
    getFieldConfig(config: Config, field: string): Field | null;
    getFuncConfig(config: Config, func: string): Func | null;
    getFuncArgConfig(config: Config, func: string, arg: string): FuncArg | null;
    getOperatorConfig(config: Config, operator: string, field?: string): Operator | null;
    getFieldWidgetConfig(config: Config, field: string, operator: string, widget?: string, valueStr?: ValueSource): Widget | null;
  };
  ExportUtils: {
    spelEscape(val: any): string;
    spelFormatConcat(parts: SpelConcatParts): string;
    spelImportConcat(val: SpelConcatValue): [SpelConcatParts | undefined, Array<string>],
  },
  ListUtils: {
    getTitleInListValues(listValues: ListValues, val: any): string;
  }
}


/////////////////
// Config
/////////////////

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
type ActionType = string | "ADD_RULE" | "REMOVE_RULE" | "ADD_GROUP" | "ADD_CASE_GROUP" | "REMOVE_GROUP" | "SET_NOT" | "SET_LOCK" | "SET_CONJUNCTION" | "SET_FIELD" | "SET_OPERATOR" | "SET_VALUE" | "SET_VALUE_SRC" | "SET_OPERATOR_OPTION" | "MOVE_ITEM";
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

interface TreeState {
  tree: ImmutableTree,
  __lastAction?: ActionMeta,
}
type TreeReducer = (state?: TreeState, action?: InputAction) => TreeState;
type TreeStore = (config: Config, tree?: ImmutableTree) => TreeReducer;

export interface TreeActions {
  tree: {
    setTree(config: Config, tree: ImmutableTree): InputAction,
    addRule(config: Config, path: IdPath, properties?: ItemProperties, type?: ItemType, children?: Array<JsonAnyRule>): InputAction,
    removeRule(config: Config, path: IdPath): InputAction,
    addDefaultCaseGroup(config: Config, path: IdPath, properties?: ItemProperties, children?: Array<JsonAnyRule>): InputAction,
    addCaseGroup(config: Config, path: IdPath, properties?: ItemProperties, children?: Array<JsonAnyRule>): InputAction,
    addGroup(config: Config, path: IdPath, properties?: ItemProperties, children?: Array<JsonItem>): InputAction,
    removeGroup(config: Config, path: IdPath): InputAction;
    moveItem(config: Config, fromPath: IdPath, toPath: IdPath, placement: Placement): InputAction;
  },
  group: {
    setConjunction(config: Config, path: IdPath, conjunction: string): InputAction;
    setNot(config: Config, path: IdPath, not: boolean): InputAction;
    setLock(config: Config, path: IdPath, lock: boolean): InputAction;
  },
  rule: {
    setField(config: Config, path: IdPath, field: string): InputAction;
    setOperator(config: Config, path: IdPath, operator: string): InputAction;
    setValue(config: Config, path: IdPath, delta: number, value: RuleValue, valueType: string): InputAction;
    setValueSrc(config: Config, path: IdPath, delta: number, valueSrc: ValueSource): InputAction;
    setOperatorOption(config: Config, path: IdPath, name: string, value: RuleValue): InputAction;
  },
}


/////////////////
// WidgetProps
// @ui
/////////////////

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
export type CaseValueWidgetProps = BaseWidgetProps & CaseValueFieldSettings;

/////////////////
// FieldProps
// @ui
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
// Widgets
/////////////////

type SpelImportValue = (val: any) => [any, string[]];

type FormatValue =          (val: RuleValue, fieldDef: Field, wgtDef: Widget, isForDisplay: boolean, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type SqlFormatValue =       (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type SpelFormatValue =      (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type MongoFormatValue =     (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator) => MongoValue;
type JsonLogicFormatValue = (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator) => JsonLogicValue;
type ValidateValue =        (val: RuleValue, fieldSettings: FieldSettings, op: string, opDef: Operator, rightFieldDef?: Field) => boolean | string | null;
type ElasticSearchFormatValue = (queryType: ElasticSearchQueryType, val: RuleValue, op: string, field: string, config: Config) => AnyObject | null;


export interface BaseWidget {
  type: string;
  jsType?: string;
  valueSrc?: ValueSource;
  valuePlaceholder?: string;
  valueLabel?: string;
  fullWidth?: boolean;
  formatValue?: FormatValue;
  sqlFormatValue?: SqlFormatValue;
  spelFormatValue?: SpelFormatValue;
  spelImportValue?: SpelImportValue;
  mongoFormatValue?: MongoFormatValue;
  elasticSearchFormatValue?: ElasticSearchFormatValue;
  hideOperator?: boolean;
  jsonLogic?: JsonLogicFormatValue;
  //obsolete:
  validateValue?: ValidateValue;
  //@ui
  factory: Factory<WidgetProps>;
  customProps?: AnyObject;
}
export interface RangeableWidget extends BaseWidget {
  singleWidget?: string,
  valueLabels?: Array<string | {label: string, placeholder: string}>,
}
export interface FieldWidget {
  valueSrc: "field",
  valuePlaceholder?: string,
  valueLabel?: string,
  formatValue: FormatValue, // with rightFieldDef
  sqlFormatValue?: SqlFormatValue, // with rightFieldDef
  spelFormatValue?: SpelFormatValue, // with rightFieldDef
  //obsolete:
  validateValue?: ValidateValue,
  //@ui
  customProps?: AnyObject,
}

export type TextWidget = BaseWidget & TextFieldSettings;
export type DateTimeWidget = RangeableWidget & DateTimeFieldSettings;
export type BooleanWidget = BaseWidget & BooleanFieldSettings;
export type NumberWidget = RangeableWidget & NumberFieldSettings;
export type SelectWidget = BaseWidget & SelectFieldSettings;
export type TreeSelectWidget = BaseWidget & TreeSelectFieldSettings;
export type CaseValueWidget = BaseWidget & CaseValueFieldSettings;

export type Widget = FieldWidget |  TextWidget | DateTimeWidget | BooleanWidget | NumberWidget | SelectWidget | TreeSelectWidget  | RangeableWidget | BaseWidget;
export type Widgets = TypedMap<Widget>;


/////////////////
// Conjunctions
/////////////////

type FormatConj = (children: ImmutableList<string>, conj: string, not: boolean, isForDisplay?: boolean) => string;
type SqlFormatConj = (children: ImmutableList<string>, conj: string, not: boolean) => string;
type SpelFormatConj = (children: ImmutableList<string>, conj: string, not: boolean, omitBrackets?: boolean) => string;

export interface Conjunction {
  label: string,
  formatConj: FormatConj,
  sqlFormatConj: SqlFormatConj,
  spelFormatConj: SpelFormatConj,
  mongoConj: string,
  jsonLogicConj?: string,
  sqlConj?: string,
  spelConj?: string,
  spelConjs?: string[],
  reversedConj?: string,
}
export type Conjunctions = TypedMap<Conjunction>;

/////////////////
// ConjsProps
// @ui
/////////////////

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
// Operators
/////////////////

type FormatOperator = (field: string, op: string, vals: string | ImmutableList<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, isForDisplay?: boolean, fieldDef?: Field) => string;
type MongoFormatOperator = (field: string, op: string, vals: MongoValue | Array<MongoValue>, useExpr?: boolean, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, fieldDef?: Field) => Object;
type SqlFormatOperator = (field: string, op: string, vals: string | ImmutableList<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, fieldDef?: Field) => string;
type SpelFormatOperator = (field: string, op: string, vals: string | Array<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: AnyObject, fieldDef?: Field) => string;
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
  spelOp?: string,
  spelOps?: string[],
  spelFormatOp?: SpelFormatOperator,
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
  mainWidget?: string,
  excludeOperators?: Array<string>,
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
  path?: Array<string>
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
export interface CaseValueFieldSettings extends BasicFieldSettings {
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
  isSpelVariable?: boolean,
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
  isSpelMap?: boolean,
}
interface FieldGroup extends BaseField {
  type: "!group",
  subfields: Fields,
  mode: RuleGroupMode,
  isSpelArray?: boolean,
  isSpelItemMap?: boolean,
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
  isSpelArray?: boolean,
  isSpelItemMap?: boolean,
}

export type Field = SimpleField;
type FieldOrGroup = FieldStruct | FieldGroup | FieldGroupExt | Field;
export type Fields = TypedMap<FieldOrGroup>;



/////////////////
// Settings
/////////////////

type SpelFieldMeta = {
  key: string,
  parent: "map" | "class" | "[class]" | "[map]" | null,
  isSpelVariable?: boolean,
};
type ValueSourcesInfo = {[vs in ValueSource]?: {label: string, widget?: string}};
type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";
type ChangeFieldStrategy = "default" | "keep" | "first" | "none";
type FormatReverse = (q: string, op: string, reversedOp: string, operatorDefinition: Operator, revOperatorDefinition: Operator, isForDisplay: boolean) => string;
type SqlFormatReverse = (q: string) => string;
type SpelFormatReverse = (q: string) => string;
type FormatField = (field: string, parts: Array<string>, label2: string, fieldDefinition: Field, config: Config, isForDisplay: boolean) => string;
type FormatSpelField = (field: string, parentField: string | null, parts: Array<string>, partsExt: Array<SpelFieldMeta>, fieldDefinition: Field, config: Config) => string;
type CanCompareFieldWithField = (leftField: string, leftFieldConfig: Field, rightField: string, rightFieldConfig: Field, op: string) => boolean;
type FormatAggr = (whereStr: string, aggrField: string, operator: string, value: string | ImmutableList<string>, valueSrc: ValueSource, valueType: string, opDef: Operator, operatorOptions: AnyObject, isForDisplay: boolean, aggrFieldDef: Field) => string;

export interface LocaleSettings {
  locale?: {
    moment?: string,
    antd?: Object,
    material?: Object,
    mui?: Object,
  },
  theme?: {
    material?: Object,
    mui?: Object,
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
  addCaseLabel?: string,
  addDefaultCaseLabel?: string,
  defaultCaseLabel?: string,
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


export interface BehaviourSettings {
  valueSourcesInfo?: ValueSourcesInfo,
  canCompareFieldWithField?: CanCompareFieldWithField,
  canReorder?: boolean,
  canRegroup?: boolean,
  canRegroupCases?: boolean,
  showNot?: boolean,
  showLock?: boolean,
  canDeleteLocked?: boolean,
  maxNesting?: number,
  setOpOnChangeField: Array<ChangeFieldStrategy>,
  clearValueOnChangeField?: boolean,
  clearValueOnChangeOp?: boolean,
  canLeaveEmptyGroup?: boolean,
  canLeaveEmptyCase?: boolean,
  shouldCreateEmptyGroup?: boolean,
  forceShowConj?: boolean,
  immutableGroupsMode?: boolean,
  immutableFieldsMode?: boolean,
  immutableOpsMode?: boolean,
  immutableValuesMode?: boolean,
  maxNumberOfRules?: Number,
  maxNumberOfCases?: Number,
  showErrorMessage?: boolean,
  canShortMongoQuery?: boolean,
  convertableWidgets?: TypedMap<Array<string>>,
  removeEmptyGroupsOnLoad?: boolean,
  removeIncompleteRulesOnLoad?: boolean,
  removeInvalidMultiSelectValuesOnLoad?: boolean,
  groupOperators?: Array<string>,
}

export interface OtherSettings {
  fieldSeparator?: string,
  fieldSeparatorDisplay?: string,
  formatReverse?: FormatReverse,
  sqlFormatReverse?: SqlFormatReverse,
  spelFormatReverse?: SpelFormatReverse,
  formatField?: FormatField,
  formatSpelField?: FormatSpelField,
  formarAggr?: FormatAggr,
}

export interface Settings extends LocaleSettings, BehaviourSettings, OtherSettings {
}


/////////////////
// Funcs
/////////////////

type SqlFormatFunc = (formattedArgs: TypedMap<string>) => string;
type FormatFunc = (formattedArgs: TypedMap<string>, isForDisplay: boolean) => string;
type MongoFormatFunc = (formattedArgs: TypedMap<MongoValue>) => MongoValue;
type JsonLogicFormatFunc = (formattedArgs: TypedMap<JsonLogicValue>) => JsonLogicTree;
type JsonLogicImportFunc = (val: JsonLogicValue) => Array<RuleValue>;
type SpelFormatFunc = (formattedArgs: TypedMap<string>) => string;

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
  spelFunc?: string,
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
  spelFormatFunc?: SpelFormatFunc,
  allowSelfNesting?: boolean,
}
export interface FuncArg extends ValueField {
  isOptional?: boolean,
  showPrefix?: boolean,
}
export type Funcs = TypedMap<Func | FuncGroup>;


/////////////////
// CoreConfig
/////////////////

export interface CoreConfig extends Config {
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
    multiselect_contains: BinaryOperator,
    multiselect_not_contains: BinaryOperator,
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
    case_value: CaseValueWidget,
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
    case_value: Type,
  },
  settings: Settings,
}



/////////////////

export declare const Utils: Utils;
export declare const CoreConfig: CoreConfig;
export declare const BasicFuncs: Funcs;
export declare const TreeStore: TreeStore;
export declare const TreeActions: TreeActions;


/* eslint-disable no-extra-semi */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import {List as ImmList, Map as ImmMap, OrderedMap as ImmOMap} from "immutable";
import {ElementType, ReactElement, Factory} from "react";
import type { Moment as MomentType } from "moment";
import type { i18n } from "i18next";

export type Moment = MomentType;
export type ImmutableList<T> = ImmList<T>;
export type ImmutableMap<K, V> = ImmMap<K, V>;
export type ImmutableOMap<K, V> = ImmOMap<K, V>;
export type AnyImmutable = ImmutableList<any> | ImmutableMap<string, any> | ImmutableOMap<string, any>;

////////////////
// common
/////////////////

type ReactKey = string | number;
interface ReactAttributes {
  key?: ReactKey | null | undefined;
}

export type FactoryWithContext<P> = (props: ReactAttributes & P, ctx?: ConfigContext) => ReactElement<P>;
export type RenderedReactElement = ReactElement | string;
export type SerializedFunction = JsonLogicFunction | string;

type AnyObject = Record<string, unknown>;
type Empty = null | undefined;

type ImmutablePath = ImmutableList<string>;
type IdPath = Array<string> | ImmutablePath; // should be used in actions only

type Optional<T> = {
  [P in keyof T]?: T[P];
}

type OptionalBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type TypedMap<T> = Record<string, T>;

// You can not use a union for types on a key, but can define overloaded accessors of different types.
// Key can be a string OR number
type TypedKeyMap<K extends string|number, T> = {
  [key: string]: T;
  [key: number]: T;
}

interface ObjectToImmOMap<P> extends ImmutableOMap<keyof P, any> {
  get<K extends keyof P>(name: K): P[K];
  get(name: string): any;
}

export type AsyncListValues = Array<any>;

// for export/import

type MongoValue = any;
type ElasticSearchQueryType = string;

type JsonLogicResult = {
  logic?: JsonLogicTree;
  data?: Object;
  errors?: Array<string>;
}
type JsonLogicFunction = Object;
type JsonLogicTree = Object;
type JsonLogicValue = any;
type JsonLogicField = { "var": string };
interface SpelRawValue {
  type: string;
  children?: SpelRawValue[];
  val?: RuleValue;
  methodName?: string;
  args?: SpelRawValue[];
  obj?: SpelRawValue[];
  isVar?: boolean;
  cls: string[];
}

export type ConfigContext = {
  utils: TypedMap<any>;
  W: TypedMap<ElementType<any>>;
  O: TypedMap<ElementType<any>>;
  components?: TypedMap<ElementType<any>>;
  [key: string]: any;
};

export type FlatItemPosition = {
  caseNo: number | null;
  globalNoByType: number;
  indexPath: number[];
  globalLeafNo?: number;
  globalGroupNo?: number;
};
export type FlatItem = {
  node: ImmutableItem;
  index: number; // index in `flat`
  id: string;
  path: string[];
  type: ItemType;
  parent: string | null;
  parentType: ItemType | null;
  children: string[] | null;
  caseId: string | null;
  caseNo: number | null;
  prev: string | null;
  next: string | null;
  lev: number; // depth level
  isLeaf: boolean; // is atomic rule OR rule inside rule_group
  isAtomicRule: boolean; // is atomic (rule or rule_group, but not rules inside rule_group)
  isLocked: boolean;
  // vertical
  height: number; // visible height
  _height: number; // real height (incl. collapsed)
  top: number | null; // null if inside collapsed
  bottom: number | null; // null if inside collapsed
  // object with numbers indicating # of item in tree
  position?: FlatItemPosition;
  // for any group
  depth?: number; // children of rule_group are not counted, collapsed are not counted
  // for case only
  isDefaultCase?: boolean;
  atomicRulesCountInCase?: number;
  // unused
  _top: number;
  collapsed: boolean;
  /**
   * @deprecated use isLeaf instead
   */
  leaf: boolean;
};
export type FlatTree = {
  items: TypedMap<FlatItem>;
  flat: string[]; // ids of all items in top-to-bottom order
  cases: string[]; // ids of cases
};

////////////////
// query value
/////////////////

// tip: Date is stored as string
export type SimpleValue = boolean | number | string | Array<string> | undefined | null;
type AnyValue = any;
export type RuleValue = SimpleValue | FuncValue | AnyValue;
// tip: multiselect value is stored as Array<string>, not ImmutableList<string>
export type RuleValueI = SimpleValue | FuncValueI | AnyValue;
export type FieldPath = string;
export interface FuncArgValue<V = unknown> {
  value: V;
  valueSrc?: ValueSource;
}
export type FuncArgValueI = ObjectToImmOMap<FuncArgValue<RuleValueI>>;
export interface FuncValue {
  func: string;
  args: TypedMap<FuncArgValue<RuleValue>>;
}
export type FuncValueI = ObjectToImmOMap<{
  func: string;
  args: ImmutableOMap<string, FuncArgValueI>;
}>;
export type FieldValue = FieldPath | FuncValue;
export type FieldValueI = FieldPath | FuncValueI;

export type ValueSource = "value" | "field" | "func" | "const";
export type FieldSource = "field" | "func";
export type RuleGroupMode = "struct" | "some" | "array";
export type ItemType = "group" | "rule_group" | "rule" | "case_group" | "switch_group";
// note: these preperties types are used for actions
export type AnyRuleProperties = RuleProperties | RuleGroupExtProperties | RuleGroupProperties;
export type AnyGroupProperties = GroupProperties | SwitchGroupProperties | CaseGroupProperties;
export type ItemProperties = AnyRuleProperties | GroupProperties;

export type TypedValueSourceMap<T> = {
  [key in ValueSource]: T;
}

interface ExtraActionProperties {
  // note: id can pre-generated for actions addRule, addGroup
  id?: string;
}

interface BasicItemProperties {
  isLocked?: boolean;
}

export type OperatorOptions = Record<string, SimpleValue>;
export type OperatorOptionsI = ImmMap<string, SimpleValue>;

export interface RuleProperties extends BasicItemProperties {
  field: FieldValue | Empty;
  fieldSrc?: FieldSource;
  fieldType?: string;
  fieldError?: string | Empty;
  operator: string | Empty;
  value: Array<RuleValue>;
  valueSrc?: Array<ValueSource>;
  valueType?: Array<string>;
  valueError?: Array<string | Empty>;
  operatorOptions?: OperatorOptions | Empty;
}

export interface RuleGroupExtProperties extends RuleProperties {
  field: FieldPath | Empty; // tip: field can be only string, not func
  mode: RuleGroupMode;
  conjunction?: string;
  not?: boolean;
}

export interface RuleGroupProperties extends BasicItemProperties {
  field: FieldPath | Empty; // tip: field can be only string, not func
  mode?: RuleGroupMode;
}

export interface GroupProperties extends BasicItemProperties {
  conjunction: string;
  not?: boolean;
}

export interface SwitchGroupProperties extends BasicItemProperties {
 // todo: any properties here?
}

export interface CaseGroupProperties extends BasicItemProperties {
  value?: Array<RuleValue>;
  valueSrc?: Array<ValueSource>;
  valueType?: Array<string>;
  valueError?: Array<string | Empty>;
  field?: string; // todo: only "!case_value" ?
}

//////

interface _RulePropertiesI extends Omit<RuleProperties, "field" | "value" | "valueSrc" | "valueType" | "valueError" | "operatorOptions"> {
  field: FieldValueI | Empty;
  value: ImmutableList<RuleValueI>;
  valueSrc?: ImmutableList<ValueSource>;
  valueType?: ImmutableList<string>;
  valueError?: ImmutableList<string | Empty>;
  operatorOptions?: OperatorOptionsI;
}

interface _CaseGroupPropertiesI extends Omit<CaseGroupProperties, "field" | "value" | "valueSrc" | "valueType" | "valueError"> {
  field?: string | Empty; // todo: only "!case_value" ?
  value?: ImmutableList<RuleValueI>;
  valueSrc?: ImmutableList<ValueSource>;
  valueType?: ImmutableList<string>;
  valueError?: ImmutableList<string | Empty>;
}

// correct unions
interface _RuleGroupExtPropertiesI extends Pick<RuleGroupExtProperties, "field" | "mode" | "conjunction" | "not">, Omit<_RulePropertiesI, "field"> {}
interface _AnyRulePropertiesI extends Optional<_RulePropertiesI>, Optional<Pick<_RuleGroupExtPropertiesI, "mode" | "conjunction" | "not">> {}
interface _ItemPropertiesI extends _AnyRulePropertiesI, Optional<Pick<GroupProperties, "conjunction" | "not">> {}
interface _ItemOrCasePropertiesI extends Omit<_ItemPropertiesI, "field">, Optional<_CaseGroupPropertiesI> {}
interface _GroupOrSwitchPropertiesI extends Optional<GroupProperties>, Optional<SwitchGroupProperties> {}

export interface BasicItemPropertiesI<P = BasicItemProperties> extends ObjectToImmOMap<P> {}
export interface ImmutableRuleProperties<P = _RulePropertiesI> extends BasicItemPropertiesI<P> {}
export interface ImmutableRuleGroupProperties<P = RuleGroupProperties> extends BasicItemPropertiesI<P> {}
export interface ImmutableRuleGroupExtProperties<P = _RuleGroupExtPropertiesI> extends ImmutableRuleProperties<P> {}
export interface ImmutableGroupProperties<P = GroupProperties> extends BasicItemPropertiesI<P> {}
export interface ImmutableSwitchGroupProperties<P = SwitchGroupProperties> extends BasicItemPropertiesI<P> {}
export interface ImmutableCaseGroupProperties<P = CaseGroupProperties> extends BasicItemPropertiesI<P> {}
// correct unions
export interface ImmutableAnyRuleProperties<P = _AnyRulePropertiesI> extends BasicItemPropertiesI<P> {}
export interface ImmutableItemProperties<P = _ItemPropertiesI> extends BasicItemPropertiesI<P> {}
export interface ImmutableItemOrCaseProperties<P = _ItemOrCasePropertiesI> extends BasicItemPropertiesI<P> {}
export interface ImmutableGroupOrSwitchProperties<P = _GroupOrSwitchPropertiesI> extends BasicItemPropertiesI<P> {}


//////

export interface JsonBasicItem {
  type: ItemType;
  id?: string;
}
export interface JsonRule extends Omit<JsonBasicItem, "type"> {
  type: "rule";
  properties: RuleProperties;
}

// OldJson.. are types with `children1` as object instead of array (discouraged)
// `children1` as object can be used for import or export with children1AsArray = false
export interface OldJsonSwitchGroup extends JsonBasicItem {
  type: "switch_group";
  children1?: {[id: string]: OldJsonCaseGroup} | OldJsonCaseGroup[];
  properties?: SwitchGroupProperties;
}
export interface OldJsonCaseGroup extends JsonBasicItem {
  type: "case_group";
  children1?: {[id: string]: OldJsonItem} | OldJsonItem[];
  properties?: CaseGroupProperties;
}
export interface OldJsonGroup extends JsonBasicItem {
  type: "group";
  children1?: {[id: string]: OldJsonItem} | OldJsonItem[];
  properties?: GroupProperties;
}
export interface OldJsonRuleGroup extends JsonBasicItem {
  type: "rule_group";
  children1?: {[id: string]: JsonRule} | JsonRule[];
  properties?: RuleGroupProperties;
}
export interface OldJsonRuleGroupExt extends JsonBasicItem {
  type: "rule_group";
  children1?: {[id: string]: JsonRule} | JsonRule[];
  properties?: RuleGroupExtProperties;
}
export type OldJsonAnyRule = JsonRule|OldJsonRuleGroup|OldJsonRuleGroupExt;
export type OldJsonItem = OldJsonGroup|OldJsonAnyRule;
export type OldJsonTree = OldJsonGroup|OldJsonSwitchGroup;

// Json.. (in comparison with OldJson..) are types with `children1` as array (default)
// Used as default for export with children1AsArray = true
export interface JsonSwitchGroup extends OldJsonSwitchGroup {
  children1?: JsonCaseGroup[];
}
export interface JsonCaseGroup extends OldJsonCaseGroup {
  children1?: JsonItem[];
}
export interface JsonGroup extends OldJsonGroup {
  children1?: JsonItem[];
}
export interface JsonRuleGroup extends OldJsonRuleGroup {
  children1?: JsonRule[];
}
export interface JsonRuleGroupExt extends OldJsonRuleGroupExt {
  children1?: JsonRule[];
}
export type JsonAnyRule = JsonRule|JsonRuleGroup|JsonRuleGroupExt;
export type JsonItem = JsonGroup|JsonAnyRule;
export type JsonTree = JsonGroup|JsonSwitchGroup;


////

interface _BasicItemI {
  type: ItemType;
  id: string;
}
interface _RuleI extends _BasicItemI {
  type: "rule";
  properties: ImmutableRuleProperties;
}
interface _GroupI extends _BasicItemI {
  type: "group";
  children1?: ImmOMap<string, ImmutableItem>;
  properties: ImmutableGroupProperties;
}
interface _RuleGroupI extends _BasicItemI {
  type: "rule_group";
  children1?: ImmOMap<string, ImmutableRule>;
  properties: ImmutableRuleGroupProperties;
}
interface _RuleGroupExtI extends _BasicItemI {
  type: "rule_group";
  children1?: ImmOMap<string, ImmutableRule>;
  properties: ImmutableRuleGroupExtProperties;
}
interface _SwitchGroupI extends _BasicItemI {
  type: "switch_group";
  children1?: ImmOMap<string, ImmutableCaseGroup>;
  properties: ImmutableSwitchGroupProperties;
}
interface _CaseGroupI extends _BasicItemI {
  type: "case_group";
  children1?: ImmOMap<string, ImmutableGroup>;
  properties: ImmutableCaseGroupProperties;
}
// Fix unions manially:
type _OmitI<T> = Omit<T, "type" | "properties" | "children1">;
// type _AnyRuleI = _RuleI | _RuleGroupI | _RuleGroupExtI;
interface _AnyRuleI extends _OmitI<_RuleI> {
  type: "rule" | "rule_group";
  properties: ImmutableAnyRuleProperties;
  children1?: ImmOMap<string, ImmutableRule>;
}
// type _ItemI = _GroupI | _AnyRuleI;
interface _ItemI extends _OmitI<_GroupI>, _OmitI<_AnyRuleI> {
  type: "rule" | "rule_group" | "group";
  properties: ImmutableItemProperties;
  children1?: ImmOMap<string, ImmutableItem>;
}
// type _ItemOrCaseI = _ItemI | _CaseGroupI;
interface _ItemOrCaseI extends _OmitI<_ItemI>, _OmitI<_CaseGroupI> {
  type: "rule" | "rule_group" | "group" | "case_group";
  properties: ImmutableItemOrCaseProperties;
  children1?: ImmOMap<string, ImmutableItem>;
}
// type _TreeI = _GroupI | _SwitchGroupI;
interface _TreeI extends _OmitI<_GroupI>, _OmitI<_SwitchGroupI> {
  type: "group" | "switch_group";
  children1?: ImmOMap<string, ImmutableBasicItem<_ItemOrCaseI>>;
  properties: ImmutableGroupOrSwitchProperties;
}
export interface ImmutableBasicItem<P = _BasicItemI> extends ObjectToImmOMap<P> {}
export interface ImmutableRule<P = _RuleI> extends ImmutableBasicItem<P> {}
export interface ImmutableGroup<P = _GroupI> extends ImmutableBasicItem<P> {}
export interface ImmutableRuleGroup<P = _RuleGroupI> extends ImmutableBasicItem<P> {}
export interface ImmutableRuleGroupExt<P = _RuleGroupExtI> extends ImmutableBasicItem<P> {}
export interface ImmutableSwitchGroup<P = _SwitchGroupI> extends ImmutableBasicItem<P> {}
export interface ImmutableCaseGroup<P = _CaseGroupI> extends ImmutableBasicItem<P> {}
export interface ImmutableAnyRule<P = _AnyRuleI> extends ImmutableBasicItem<P> {}
export interface ImmutableItem<P = _ItemI> extends ImmutableBasicItem<P> {}
export interface ImmutableTree<P = _TreeI> extends ImmutableBasicItem<P> {}

////////////////
// Utils
/////////////////

/**
 * @deprecated
 */
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

export interface Translatable {
  key: string;
  args?: null | Record<string, any>;
}
export interface ValidationError extends Translatable {
  // translated message
  str?: string;
  side?: "lhs" | "rhs" | "op";
  delta?: number; // 0, 1, -1 for range, undefined for "lhs"
  fixed?: boolean;
  fixedFrom?: any;
  fixedTo?: any;
}
export interface ValidationItemErrors {
  path: Array<string>;
  errors: ValidationError[];
  itemStr?: string;
  itemPosition?: FlatItemPosition & Pick<FlatItem, "type" | "index"> & {
    isDeleted: boolean;
  };
  itemPositionStr?: string;
}
export type ValidationErrors = ValidationItemErrors[];
export interface SanitizeResult {
  fixedTree: ImmutableTree;
  fixedErrors: ValidationErrors;
  nonFixedErrors: ValidationErrors;
  allErrors: ValidationErrors;
}
export interface SanitizeOptions extends ValidationTranslateOptions {
  removeEmptyGroups?: boolean; // default: true
  removeEmptyRules?: boolean; // default: true
  removeIncompleteRules?: boolean; // default: true
  forceFix?: boolean; // default: false
}
export interface ValidationTranslateOptions {
  translateErrors?: boolean; // default: true
  includeItemsPositions?: boolean; // default: true
  includeStringifiedItems?: boolean; // default: true
  stringifyItemsUserFriendly?: boolean; // default: true
  stringifyFixedItems?: boolean; // default: false (stringify item with error)
}
export interface ValidationOptions extends ValidationTranslateOptions {
}

interface Validation {
  sanitizeTree(tree: ImmutableTree, config: Config, options?: SanitizeOptions): SanitizeResult;
  validateTree(tree: ImmutableTree, config: Config, options?: ValidationOptions): ValidationErrors;

  isValidTree(tree: ImmutableTree, config: Config): boolean;
  getTreeBadFields(tree: ImmutableTree, config: Config): Array<FieldPath>;

  translateValidation(tr: Translatable): string;
  translateValidation(key: Translatable["key"], args?: Translatable["args"]): string;
}

interface Import {
  // tree
  getTree(tree: ImmutableTree, light?: boolean, children1AsArray?: boolean): JsonTree;
  getTree(tree: ImmutableTree, light: boolean, children1AsArray: false): OldJsonTree;
  loadTree(jsonTree: JsonTree): ImmutableTree;
  loadTree(jsonTree: OldJsonTree): ImmutableTree;
  /**
   * @deprecated Use Utils.sanitizeTree() instead
   */
  checkTree(tree: ImmutableTree, config: Config): ImmutableTree;
  /**
   * @deprecated Use Utils.Validation.isValidTree()
   */
  isValidTree(tree: ImmutableTree, config: Config): boolean;
  isImmutableTree(tree: any): boolean;
  isTree(tree: any): boolean; // is JsonTree ?
  isJsonLogic(value: any): boolean;
  jsToImmutable(value: any): AnyImmutable;
  // jsonlogic
  loadFromJsonLogic(logicTree: JsonLogicTree | undefined, config: Config): ImmutableTree | undefined;
  _loadFromJsonLogic(logicTree: JsonLogicTree | undefined, config: Config): [ImmutableTree | undefined, Array<string>];
  // spel
  loadFromSpel(spelStr: string, config: Config): [ImmutableTree | undefined, Array<string>];
}
interface Export {
  jsonLogicFormat(tree: ImmutableTree, config: Config): JsonLogicResult;
  /**
   * @deprecated
   */
  queryBuilderFormat(tree: ImmutableTree, config: Config): Object | undefined;
  queryString(tree: ImmutableTree, config: Config, isForDisplay?: boolean, isDebugMode?: boolean): string | undefined;
  sqlFormat(tree: ImmutableTree, config: Config): string | undefined;
  _sqlFormat(tree: ImmutableTree, config: Config): [string | undefined, Array<string>];
  spelFormat(tree: ImmutableTree, config: Config): string | undefined;
  _spelFormat(tree: ImmutableTree, config: Config): [string | undefined, Array<string>];
  mongodbFormat(tree: ImmutableTree, config: Config): Object | undefined;
  _mongodbFormat(tree: ImmutableTree, config: Config): [Object | undefined, Array<string>];
  elasticSearchFormat(tree: ImmutableTree, config: Config, syntax?: "ES_6_SYNTAX" | "ES_7_SYNTAX"): Object | undefined;
}
interface Autocomplete {
  simulateAsyncFetch(all: ListValues, pageSize?: number, delay?: number): AsyncFetchListValuesFn;
  getListValue(value: string | number, listValues: ListValues): ListItem; // get by value
  // internal
  mergeListValues(oldValues: ListItems, newValues: ListItems, toStart?: boolean): ListItems;
  listValueToOption(listItem: ListItem): ListOptionUi;
}
interface ConfigUtils {
  compressConfig(config: Config, baseConfig: Config): ZipConfig;
  decompressConfig(zipConfig: ZipConfig, baseConfig: Config, ctx?: ConfigContext): Config;
  compileConfig(config: Config): Config;
  extendConfig(config: Config): Config;
  getFieldConfig(config: Config, field: FieldValue | FieldValueI): Field | Func | null;
  getFuncConfig(config: Config, func: string): Func | null;
  getFuncArgConfig(config: Config, func: string, arg: string): FuncArg | null;
  getOperatorConfig(config: Config, operator: string, field?: FieldValue | FieldValueI): Operator | null;
  getFieldWidgetConfig(config: Config, field: FieldValue | FieldValueI, operator: string, widget?: string, valueStr?: ValueSource): Widget | null;
  isJSX(jsx: any): boolean;
  isDirtyJSX(jsx: any): boolean;
  cleanJSX(jsx: any): Object;
  applyJsonLogic(logic: any, data?: any): any;
}
interface ExportUtils {
  wrapWithBrackets(val: string): string;
  spelEscape(val: any): string;
  /**
   * @deprecated
   */
  spelFormatConcat(parts: SpelConcatParts): string;
  /**
   * @deprecated
   */
  spelImportConcat(val: SpelConcatValue): [SpelConcatParts | undefined, Array<string>];
}
interface ListUtils {
  getTitleInListValues(listValues: ListValues, value: string | number): string;
  getListValue(value: string | number, listValues: ListValues): ListItem; // get by value
  searchListValue(search: string, listValues: ListValues): ListItem; // search by value and title
  listValuesToArray(listValues: ListValues): ListItems; // normalize
  toListValue(value: string | number | ListItem, title?: string): ListItem; // create
  makeCustomListValue(value: string | number): ListItem; // create
}
interface TreeUtils {
  jsToImmutable(value: any): AnyImmutable;
  immutableToJs(imm: AnyImmutable): any;
  isImmutable(value: any): boolean;
  toImmutableList(path: string[]): ImmutablePath;
  getItemByPath(tree: ImmutableTree, path: IdPath): ImmutableItem | undefined;
  expandTreePath(path: ImmutablePath, ...suffix: string[]): ImmutablePath;
  expandTreeSubpath(path: ImmutablePath, ...suffix: string[]): ImmutablePath;
  fixEmptyGroupsInTree(tree: ImmutableTree): ImmutableTree;
  fixPathsInTree(tree: ImmutableTree): ImmutableTree;
  getFlatTree(tree: ImmutableTree): FlatTree;
  getTotalReordableNodesCountInTree(tree: ImmutableTree): number;
  getTotalRulesCountInTree(tree: ImmutableTree): number;
  /**
   * @deprecated
   */
  getTreeBadFields(tree: ImmutableTree, config: Config): Array<FieldPath>;
  isEmptyTree(tree: ImmutableTree): boolean;
  // case mode
  getSwitchValues(tree: ImmutableTree): Array<any | null>;
}
interface OtherUtils {
  uuid(): string;
  deepFreeze(obj: any): any;
  deepEqual(a: any, b: any): boolean;
  shallowEqual(a: any, b: any, deep?: boolean): boolean;
  mergeArraysSmart(a: string[], b: string[]): string[];
  isJsonCompatible(tpl: object, target: object, bag: Record<string, any>): boolean; // mutates bag
  isJsonLogic(value: any): boolean;
  isJSX(jsx: any): boolean;
  isDirtyJSX(jsx: any): boolean;
  cleanJSX(jsx: any): Object;
  escapeRegExp(str: string): string;
  //applyToJS(imm: any): any; // same as immutableToJs
  isImmutable(value: any): boolean;
  toImmutableList(path: string[]): ImmutablePath;
}

export interface Utils extends Omit<Import, "isValidTree">, Export,
  Pick<Validation, "sanitizeTree" | "validateTree" | "isValidTree">,
  Pick<ConfigUtils, "compressConfig" | "decompressConfig">,
  Pick<OtherUtils, "uuid">,
  Pick<TreeUtils, "getSwitchValues">
{
  Import: Import;
  Export: Export;
  Autocomplete: Autocomplete;
  Validation: Validation;
  ConfigUtils: ConfigUtils;
  ExportUtils: ExportUtils;
  ListUtils: ListUtils;
  TreeUtils: TreeUtils;
  OtherUtils: OtherUtils;
  // libs
  i18n: i18n;
  moment: Moment;
}


/////////////////
// Config
/////////////////

export interface Config {
  conjunctions: Conjunctions;
  operators: Operators;
  widgets: Widgets;
  types: Types;
  settings: Settings;
  fields: Fields;
  funcs?: Funcs;
  ctx: ConfigContext;
}

export type ZipConfig = Omit<Config, "ctx">;

export interface ConfigMixin<C = Config, S = Settings> {
  conjunctions?: Record<string, Partial<Conjunction>>;
  operators?: Record<string, Partial<Operator<C>>>;
  widgets?: Record<string, Partial<Widget<C>>>;
  types?: Record<string, Partial<Type>>;
  settings?: Partial<S>;
  fields?: Record<string, Partial<FieldOrGroup>>;
  funcs?: Record<string, Partial<FuncOrGroup>>;
  ctx?: Partial<ConfigContext>;
}

/////////////////
// Actions
/////////////////

type Placement = "after" | "before" | "append" | "prepend";
type ActionType = string | "ADD_RULE" | "REMOVE_RULE" | "ADD_GROUP" | "ADD_CASE_GROUP" | "REMOVE_GROUP" | "SET_NOT" | "SET_LOCK" | "SET_CONJUNCTION" | "SET_FIELD" | "SET_FIELD_SRC" | "SET_OPERATOR" | "SET_VALUE" | "SET_VALUE_SRC" | "SET_OPERATOR_OPTION" | "MOVE_ITEM";
interface BaseAction {
  type: ActionType;

  id?: string; // for ADD_RULE, ADD_GROUP - id of new item
  path?: string[]; // for all except MOVE_ITEM (for ADD_RULE/ADD_GROUP it's parent path)

  conjunction?: string;
  not?: boolean;
  lock?: boolean;
  field?: string;
  operator?: string;
  delta?: number; // for SET_VALUE
  value?: SimpleValue;
  valueType?: string;
  srcKey?: ValueSource;
  name?: string; // for SET_OPERATOR_OPTION
  fromPath?: string[]; // for MOVE_ITEM
  toPath?: string[]; // for MOVE_ITEM
  placement?: Placement; // for MOVE_ITEM
  properties?: TypedMap<any>; // for ADD_RULE, ADD_GROUP
}
export interface InputAction extends BaseAction {
  config: Config;
}
export interface ActionMeta extends BaseAction {
  affectedField?: string; // gets field name from `path` (or `field` for first SET_FIELD)
}

export interface Actions {
  // tip: children will be converted to immutable ordered map in `_addChildren1`
  addRule(path: IdPath, properties?: AnyRuleProperties & ExtraActionProperties, type?: ItemType, children?: Array<JsonAnyRule>): undefined;
  removeRule(path: IdPath): undefined;
  addGroup(path: IdPath, properties?: AnyGroupProperties & ExtraActionProperties, children?: Array<JsonItem>): undefined;
  removeGroup(path: IdPath): undefined;
  setNot(path: IdPath, not: boolean): undefined;
  setLock(path: IdPath, lock: boolean): undefined;
  setConjunction(path: IdPath, conjunction: string): undefined;
  setField(path: IdPath, field: FieldValueI): undefined; // todo: try to support FieldValue - apply jsToImmutable() just like for `defaultField`
  setFieldSrc(path: IdPath, fieldSrc: FieldSource): undefined;
  setOperator(path: IdPath, operator: string): undefined;
  setValue(path: IdPath, delta: number, value: RuleValueI, valueType: string): undefined; // todo: try to support RuleValue
  setFuncValue(path: IdPath, delta: number, parentFuncs: string[], argKey: string | null, value: SimpleValue, valueType: string | "!valueSrc"): undefined;
  setValueSrc(path: IdPath, delta: number, valueSrc: ValueSource): undefined;
  setOperatorOption(path: IdPath, name: string, value: SimpleValue): undefined;
  moveItem(fromPath: IdPath, toPath: IdPath, placement: Placement): undefined;
  setTree(tree: ImmutableTree): undefined;
}

interface TreeState {
  tree: ImmutableTree;
  __lastAction?: ActionMeta;
}
type TreeReducer = (state?: TreeState, action?: InputAction) => TreeState;
type TreeStore = (config: Config, tree?: ImmutableTree) => TreeReducer;

export interface TreeActions {
  tree: {
    setTree(config: Config, tree: ImmutableTree): InputAction;
    addRule(config: Config, path: IdPath, properties?: AnyRuleProperties, type?: ItemType, children?: Array<JsonAnyRule>): InputAction;
    removeRule(config: Config, path: IdPath): InputAction;
    addDefaultCaseGroup(config: Config, path: IdPath, properties?: CaseGroupProperties, children?: Array<JsonAnyRule>): InputAction;
    addCaseGroup(config: Config, path: IdPath, properties?: CaseGroupProperties, children?: Array<JsonAnyRule>): InputAction;
    addGroup(config: Config, path: IdPath, properties?: GroupProperties, children?: Array<JsonItem>): InputAction;
    removeGroup(config: Config, path: IdPath): InputAction;
    moveItem(config: Config, fromPath: IdPath, toPath: IdPath, placement: Placement): InputAction;
  };
  group: {
    setConjunction(config: Config, path: IdPath, conjunction: string): InputAction;
    setNot(config: Config, path: IdPath, not: boolean): InputAction;
    setLock(config: Config, path: IdPath, lock: boolean): InputAction;
  };
  rule: {
    setField(config: Config, path: IdPath, field: FieldValueI): InputAction; // todo: try to support FieldValue
    setFieldSrc(config: Config, path: IdPath, fieldSrc: FieldSource): InputAction;
    setOperator(config: Config, path: IdPath, operator: string): InputAction;
    setValue(config: Config, path: IdPath, delta: number, value: RuleValueI, valueType: string): InputAction; // todo: try to support RuleValue
    setValueSrc(config: Config, path: IdPath, delta: number, valueSrc: ValueSource): InputAction;
    setOperatorOption(config: Config, path: IdPath, name: string, value: SimpleValue): InputAction;
    setFuncValue(config: Config, path: IdPath, delta: number, parentFuncs: string[], argKey: string | null, value: SimpleValue, valueType: string | "!valueSrc"): InputAction;
  };
}



/////////////////
// WidgetProps
// @ui
/////////////////

interface AbstractWidgetProps<C = Config> {
  placeholder: string;
  label?: string;
  field: FieldValueI;
  fieldDefinition: Field;
  fieldSrc: FieldSource;
  fieldType?: string;
  fieldError?: string | Empty;
  parentField?: string;
  parentFuncs?: Array<[string, string]> | Empty; // array of [funcKey, argKey]
  operator: string;
  config: C;
  delta?: number;
  customProps?: AnyObject;
  readonly?: boolean;
  id?: string; // id of rule
  groupId?: string; // id of parent group
  widgetId?: string; // unique id of widget
  isLHS?: boolean;
  isSpecialRange?: boolean;
  isFuncArg?: boolean;
  // tip: setFuncValue prop exists, but is internal
}
interface BaseWidgetProps<C = Config, V = RuleValue> extends AbstractWidgetProps<C> {
  value: V | Empty;
  setValue(val: V | Empty, asyncListValues?: AsyncListValues): void;
  valueError?: string | Empty;
  errorMessage?: string | Empty; // fieldError or valueError
}
interface RangeWidgetProps<C = Config, V = RuleValue> extends AbstractWidgetProps<C> {
  value: Array<V | Empty>;
  setValue(val: Array<V | Empty>, asyncListValues?: AsyncListValues): void;
  placeholders: Array<string>;
  textSeparators: Array<string>;
  valueError?: Array<string | Empty>;
  errorMessage?: Array<string | Empty>; // same as valueError
}
// BaseWidgetProps | RangeWidgetProps
interface RangeableWidgetProps<C = Config, V = RuleValue> extends AbstractWidgetProps<C> {
  value: V | Empty | Array<V | Empty>;
  setValue(val: V | Empty | Array<V | Empty>, asyncListValues?: AsyncListValues): void;
  placeholders?: Array<string>;
  textSeparators?: Array<string>;
  valueError?: string | Empty | Array<string | Empty>;
  errorMessage?: string | Empty | Array<string | Empty>; // fieldError or valueError
}

export type WidgetProps<C = Config> = RangeableWidgetProps<C> & FieldSettings;

export type TextWidgetProps<C = Config> = BaseWidgetProps<C, string> & TextFieldSettings;
export type DateTimeWidgetProps<C = Config> = RangeableWidgetProps<C, string> & DateTimeFieldSettings;
export type BooleanWidgetProps<C = Config> = BaseWidgetProps<C, boolean> & BooleanFieldSettings;
export type NumberWidgetProps<C = Config> = RangeableWidgetProps<C, number> & NumberFieldSettings;
export type RangeSliderWidgetProps<C = Config> = RangeableWidgetProps<C, number> & NumberFieldSettings;
export type SelectWidgetProps<C = Config> = BaseWidgetProps<C, string | number> & SelectFieldSettings;
export type MultiSelectWidgetProps<C = Config> = BaseWidgetProps<C, string[] | number[]> & MultiSelectFieldSettings;
export type TreeSelectWidgetProps<C = Config> = BaseWidgetProps<C, string | number> & TreeSelectFieldSettings;
export type TreeMultiSelectWidgetProps<C = Config> = BaseWidgetProps<C, string[] | number[]> & TreeMultiSelectFieldSettings;
/**
 * @deprecated
 */
export type CaseValueWidgetProps<C = Config> = BaseWidgetProps<C> & CaseValueFieldSettings;


/////////////////
// FieldProps
// @ui
/////////////////

type FieldItemSearchableKey = "key" | "path" | "label" | "altLabel" | "tooltip" | "grouplabel";

export type FieldItem = {
  items?: FieldItems;
  key: string;
  path?: string; // field path with separator
  label: string;
  fullLabel?: string;
  altLabel?: string; // label2
  tooltip?: string;
  disabled?: boolean;
  grouplabel?: string;
  matchesType?: boolean;
}
type FieldItems = FieldItem[];

export interface FieldProps<C = Config> {
  items: FieldItems;
  selectedFieldSrc?: FieldSource;
  setField(field: FieldPath): void;
  errorText?: string;
  selectedKey: string | Empty;
  selectedKeys?: Array<string> | Empty;
  selectedPath?: Array<string> | Empty;
  selectedLabel?: string | Empty;
  selectedAltLabel?: string | Empty;
  selectedFullLabel?: string | Empty;
  config?: C;
  customProps?: AnyObject;
  placeholder?: string;
  selectedOpts?: {tooltip?: string};
  readonly?: boolean;
  id?: string; // id of rule
  groupId?: string; // id of parent group
}

/////////////////
// Widgets
/////////////////

type SpelImportValue = (val: any, wgtDef?: Widget, args?: TypedMap<any>) => [any, string[] | string | undefined];
type JsonLogicImportValue = (val: any, wgtDef?: Widget, args?: TypedMap<any>) => any | undefined; // can throw

type FormatValue =                  (val: RuleValue, fieldDef: Field, wgtDef: Widget, isForDisplay: boolean, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type SqlFormatValue =               (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type SpelFormatValue =              (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator, rightFieldDef?: Field) => string;
type MongoFormatValue =             (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator) => MongoValue;
type JsonLogicFormatValue =         (val: RuleValue, fieldDef: Field, wgtDef: Widget, op: string, opDef: Operator) => JsonLogicValue;
export type ValidateValue<V = RuleValue> = (val: V, fieldSettings: FieldSettings, op: string, opDef: Operator, rightFieldDef?: Field) => boolean | string | { error: string | {key: string, args?: Object}, fixedValue?: V } | null;
type ElasticSearchFormatValue =     (queryType: ElasticSearchQueryType, val: RuleValue, op: string, field: FieldPath, config: Config) => AnyObject | null;


export interface BaseWidget<C = Config, WP = WidgetProps<C>> {
  type: string;
  // Used for validation. Can be one of JS types (typeof) or "array"
  jsType?: string;
  valueSrc?: ValueSource;
  valuePlaceholder?: string;
  valueLabel?: string;
  fullWidth?: boolean;
  formatValue?: FormatValue | SerializedFunction;
  sqlFormatValue?: SqlFormatValue | SerializedFunction;
  spelFormatValue?: SpelFormatValue | SerializedFunction;
  spelImportFuncs?: Array<string | object>;
  spelImportValue?: SpelImportValue | SerializedFunction;
  mongoFormatValue?: MongoFormatValue | SerializedFunction;
  elasticSearchFormatValue?: ElasticSearchFormatValue | SerializedFunction;
  hideOperator?: boolean;
  operatorInlineLabel?: string;
  jsonLogic?: JsonLogicFormatValue | SerializedFunction;
  jsonLogicImport?: JsonLogicImportValue | SerializedFunction;
  //obsolete:
  validateValue?: ValidateValue | SerializedFunction;
  //@ui
  factory: FactoryWithContext<WP> | SerializedFunction;
  customProps?: AnyObject;
}
export interface RangeableWidget<C = Config, WP = WidgetProps<C>> extends BaseWidget<C, WP> {
  singleWidget?: string;
  valueLabels?: Array<string | {label: string, placeholder: string}>;
}
interface BaseFieldWidget<C = Config, WP = WidgetProps<C>> {
  valuePlaceholder?: string;
  valueLabel?: string;
  formatValue: FormatValue | SerializedFunction; // with rightFieldDef
  sqlFormatValue?: SqlFormatValue | SerializedFunction; // with rightFieldDef
  spelFormatValue?: SpelFormatValue | SerializedFunction; // with rightFieldDef
  //obsolete:
  validateValue?: ValidateValue | SerializedFunction;
  //@ui
  customProps?: AnyObject;
  factory?: FactoryWithContext<WP>;
}
export interface FieldWidget<C = Config, WP = WidgetProps<C>> extends BaseFieldWidget<C, WP> {
  valueSrc: "field";
}
export interface FuncWidget<C = Config, WP = WidgetProps<C>> extends BaseFieldWidget<C, WP> {
  valueSrc: "func";
}

export type TextWidget<C = Config, WP = TextWidgetProps<C>> = BaseWidget<C, WP> & TextFieldSettings;
export type DateTimeWidget<C = Config, WP = DateTimeWidgetProps<C>> = RangeableWidget<C, WP> & DateTimeFieldSettings;
export type BooleanWidget<C = Config, WP = BooleanWidgetProps<C>> = BaseWidget<C, WP> & BooleanFieldSettings;
export type NumberWidget<C = Config, WP = NumberWidgetProps<C>> = RangeableWidget<C, WP> & NumberFieldSettings;
export type RangeSliderWidget<C = Config, WP = RangeSliderWidgetProps<C>> = RangeableWidget<C, WP> & NumberFieldSettings;
export type SelectWidget<C = Config, WP = SelectWidgetProps<C>> = BaseWidget<C, WP> & SelectFieldSettings;
export type MultiSelectWidget<C = Config, WP = MultiSelectWidgetProps<C>> = BaseWidget<C, WP> & MultiSelectFieldSettings;
export type TreeSelectWidget<C = Config, WP = TreeSelectWidgetProps<C>> = BaseWidget<C, WP> & TreeSelectFieldSettings;
export type TreeMultiSelectWidget<C = Config, WP = TreeMultiSelectWidgetProps<C>> = BaseWidget<C, WP> & TreeMultiSelectFieldSettings;
/**
 * @deprecated
 */
export type CaseValueWidget<C = Config, WP = CaseValueWidgetProps<C>> = BaseWidget<C, WP> & CaseValueFieldSettings;

// tip: use generic WidgetProps here, TS can't determine correct factory
export type TypedWidget<C = Config> = 
  TextWidget<C, WidgetProps<C>>
  | DateTimeWidget<C, WidgetProps<C>>
  | BooleanWidget<C, WidgetProps<C>>
  | NumberWidget<C, WidgetProps<C>>
  | RangeSliderWidget<C, WidgetProps<C>>
  | SelectWidget<C, WidgetProps<C>>
  | MultiSelectWidget<C, WidgetProps<C>>
  | TreeSelectWidget<C, WidgetProps<C>>
  | TreeMultiSelectWidget<C, WidgetProps<C>>
  | CaseValueWidget<C, WidgetProps<C>>;

export type Widget<C = Config> = 
  FieldWidget<C>
  | FuncWidget<C>
  | TypedWidget<C>
  | RangeableWidget<C>
  | BaseWidget<C>;
export type Widgets<C = Config> = TypedMap<Widget<C>>;


/////////////////
// Conjunctions
/////////////////

type FormatConj = (children: ImmutableList<string>, conj: string, not: boolean, isForDisplay?: boolean) => string;
type SqlFormatConj = (children: ImmutableList<string>, conj: string, not: boolean) => string;
type SpelFormatConj = (children: ImmutableList<string>, conj: string, not: boolean, omitBrackets?: boolean) => string;

export interface Conjunction {
  label: string;
  formatConj: FormatConj | SerializedFunction;
  sqlFormatConj: SqlFormatConj | SerializedFunction;
  spelFormatConj: SpelFormatConj | SerializedFunction;
  mongoConj: string;
  jsonLogicConj?: string;
  sqlConj?: string;
  spelConj?: string;
  spelConjs?: string[];
  reversedConj?: string;
}
export type Conjunctions = TypedMap<Conjunction>;

/////////////////
// ConjsProps
// @ui
/////////////////

export interface ConjunctionOption {
  id: string;
  key: string;
  label: string;
  checked: boolean;
}

export interface ConjsProps {
  id: string;
  readonly?: boolean;
  disabled?: boolean;
  selectedConjunction?: string;
  setConjunction(conj: string): void;
  conjunctionOptions?: TypedMap<ConjunctionOption>;
  config?: Config;
  not: boolean;
  setNot(not: boolean): void;
  showNot?: boolean;
  notLabel?: string;
}


/////////////////
// Operators
/////////////////

type FormatOperator = (field: FieldPath, op: string, vals: string | ImmutableList<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: OperatorOptionsI, isForDisplay?: boolean, fieldDef?: Field) => string;
type MongoFormatOperator = (field: FieldPath, op: string, vals: MongoValue | Array<MongoValue>, useExpr?: boolean, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: OperatorOptionsI, fieldDef?: Field) => Object;
type SqlFormatOperator = (field: FieldPath, op: string, vals: string | ImmutableList<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: OperatorOptionsI, fieldDef?: Field) => string;
type SpelFormatOperator = (field: FieldPath, op: string, vals: string | Array<string>, valueSrc?: ValueSource, valueType?: string, opDef?: Operator, operatorOptions?: OperatorOptionsI, fieldDef?: Field) => string;
type JsonLogicFormatOperator = (field: JsonLogicField, op: string, vals: JsonLogicValue | Array<JsonLogicValue>, opDef?: Operator, operatorOptions?: OperatorOptionsI, fieldDef?: Field) => JsonLogicTree;
type ElasticSearchFormatQueryType = (valueType: string) => ElasticSearchQueryType;

interface ProximityConfig {
  optionLabel: string;
  optionTextBefore: string;
  optionPlaceholder: string;
  minProximity: number;
  maxProximity: number;
  defaults: {
    proximity: number;
  };
  customProps?: AnyObject;
}
export interface ProximityProps<C = Config> extends ProximityConfig {
  options: ImmutableMap<string, any>;
  setOption: (key: string, value: any) => void;
  config: C;
}
export interface ProximityOptions<C = Config, PP = ProximityProps<C>> extends ProximityConfig {
  //@ui
  factory: FactoryWithContext<PP> | SerializedFunction;
}

export interface BaseOperator {
  label: string;
  reversedOp?: string;
  isNotOp?: boolean;
  cardinality?: number;
  formatOp?: FormatOperator | SerializedFunction;
  labelForFormat?: string;
  mongoFormatOp?: MongoFormatOperator | SerializedFunction;
  sqlOp?: string;
  sqlFormatOp?: SqlFormatOperator | SerializedFunction;
  spelOp?: string;
  spelOps?: string[];
  spelFormatOp?: SpelFormatOperator | SerializedFunction;
  jsonLogic?: string | JsonLogicFormatOperator | JsonLogicFunction;
  _jsonLogicIsRevArgs?: boolean;
  elasticSearchQueryType?: ElasticSearchQueryType | ElasticSearchFormatQueryType | JsonLogicFunction;
  valueSources?: Array<ValueSource>;
  valueTypes?: Array<string>;
}
export interface UnaryOperator extends BaseOperator {
  //cardinality: 0;
}
export interface BinaryOperator extends BaseOperator {
  //cardinality: 1;
}
export interface Operator2 extends BaseOperator {
  //cardinality: 2;
  textSeparators: Array<RenderedReactElement>;
  valueLabels: Array<string | {label: string, placeholder: string}>;
  isSpecialRange?: boolean;
}
export interface OperatorProximity<C = Config> extends Operator2 {
  options: ProximityOptions<C, ProximityProps<C>>;
}
export type Operator<C = Config> = UnaryOperator | BinaryOperator | Operator2 | OperatorProximity<C>;
export type Operators<C = Config> = TypedMap<Operator<C>>;



/////////////////
// Types
/////////////////

interface WidgetConfigForType {
  widgetProps?: Optional<Widget>;
  opProps?: Optional<Operator>;
  operators?: Array<string>;
  defaultOperator?: string;
  valueLabel?: string;
  valuePlaceholder?: string;
}

interface Type {
  valueSources?: Array<ValueSource>;
  defaultOperator?: string;
  widgets: TypedMap<WidgetConfigForType>;
  mainWidget?: string;
  excludeOperators?: Array<string>;
  mainWidgetProps?: Optional<Widget>;
}

export type Types = TypedMap<Type>;


/////////////////
// Fields
/////////////////


export interface ListItem {
  value: string | number;
  title?: string;
  disabled?: boolean;
  isCustom?: boolean;
  isHidden?: boolean;
  groupTitle?: string;
  renderTitle?: string; // internal for MUI
}
type ListItemSearchableKey = "title" | "value" | "groupTitle";
export interface ListOptionUi extends ListItem {
  specialValue?: string;
}
export type ListItems = Array<ListItem>;
export interface TreeItem extends ListItem {
  children?: Array<TreeItem>;
  parent?: any;
  disabled?: boolean;
  selectable?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  path?: Array<string>;
}
export type TreeData = Array<TreeItem>;
export type ListValues = TypedMap<string> | TypedKeyMap<string | number, string> | Array<ListItem> | Array<string | number>;

export interface AsyncFetchListValuesResult {
  values: ListItems;
  hasMore?: boolean;
}
export type AsyncFetchListValuesFn = (search: string | null, offset: number) => Promise<AsyncFetchListValuesResult>;


export interface BasicFieldSettings<V = RuleValue> {
  validateValue?: ValidateValue<V> | SerializedFunction;
}
export interface TextFieldSettings<V = string> extends BasicFieldSettings<V> {
  maxLength?: number;
  maxRows?: number;
}
export interface NumberFieldSettings<V = number> extends BasicFieldSettings<V> {
  min?: number;
  max?: number;
  step?: number;
  marks?: {[mark: number]: RenderedReactElement};
}
export interface DateTimeFieldSettings<V = string> extends BasicFieldSettings<V> {
  timeFormat?: string;
  dateFormat?: string;
  valueFormat?: string;
  use12Hours?: boolean;
  useKeyboard?: boolean; // obsolete
}
export interface SelectFieldSettings<V = string | number> extends BasicFieldSettings<V> {
  listValues?: ListValues;
  allowCustomValues?: boolean;
  showSearch?: boolean;
  showCheckboxes?: boolean;
  asyncFetch?: AsyncFetchListValuesFn | SerializedFunction;
  useLoadMore?: boolean;
  useAsyncSearch?: boolean;
  forceAsyncSearch?: boolean;
}
export interface MultiSelectFieldSettings<V = string[] | number[]> extends SelectFieldSettings<V> {
}
export interface TreeSelectFieldSettings<V = string | number> extends BasicFieldSettings<V> {
  treeValues?: TreeData;
  treeExpandAll?: boolean;
  treeSelectOnlyLeafs?: boolean;
}
export interface TreeMultiSelectFieldSettings<V = string[] | number[]> extends TreeSelectFieldSettings<V> {
}
export interface BooleanFieldSettings<V = boolean> extends BasicFieldSettings<V> {
  labelYes?: RenderedReactElement;
  labelNo?: RenderedReactElement;
}
/**
 * @deprecated
 */
export interface CaseValueFieldSettings<V = any> extends BasicFieldSettings<V> {
}
// tip: use RuleValue here, TS can't determine correct types in `validateValue`
export type FieldSettings =
  NumberFieldSettings<RuleValue>
  | DateTimeFieldSettings<RuleValue>
  | SelectFieldSettings<RuleValue>
  | MultiSelectFieldSettings<RuleValue>
  | TreeSelectFieldSettings<RuleValue>
  | TreeMultiSelectFieldSettings<RuleValue>
  | BooleanFieldSettings<RuleValue>
  | TextFieldSettings<RuleValue>
  | BasicFieldSettings<RuleValue>;

type FieldTypeInConfig = string | "!struct" | "!group";
interface BaseField {
  type: FieldTypeInConfig;
  label?: string;
  tooltip?: string;
}
interface BaseSimpleField<FS = FieldSettings> extends BaseField {
  type: string;
  preferWidgets?: Array<string>;
  valueSources?: Array<ValueSource>;
  funcs?: Array<string>;
  tableName?: string; // legacy: PR #18, PR #20
  fieldName?: string;
  jsonLogicVar?: string;
  fieldSettings?: FS;
  defaultValue?: RuleValue;
  widgets?: TypedMap<WidgetConfigForType>;
  mainWidgetProps?: Optional<Widget>;
  hideForSelect?: boolean;
  hideForCompare?: boolean;
  //obsolete - moved to FieldSettings
  listValues?: ListValues;
  allowCustomValues?: boolean;
  isSpelVariable?: boolean;
}
interface SimpleField<FS = FieldSettings> extends BaseSimpleField<FS> {
  label2?: string;
  operators?: Array<string>;
  defaultOperator?: string;
  excludeOperators?: Array<string>;
}
interface FieldStruct extends BaseField {
  type: "!struct";
  subfields: Fields;
  isSpelMap?: boolean;
}
interface FieldGroup<FS = NumberFieldSettings<number>> extends BaseField {
  type: "!group";
  subfields: Fields;
  mode: RuleGroupMode;
  isSpelArray?: boolean;
  isSpelItemMap?: boolean;
  defaultField?: FieldPath;
  fieldSettings?: FS;
}
interface FieldGroupExt<FS = NumberFieldSettings<number>> extends BaseField {
  type: "!group";
  subfields: Fields;
  mode: "array";
  operators?: Array<string>;
  defaultOperator?: string;
  defaultField?: FieldPath;
  fieldSettings?: FS;
  initialEmptyWhere?: boolean;
  showNot?: boolean;
  conjunctions?: Array<string>;
  isSpelArray?: boolean;
  isSpelItemMap?: boolean;
}

export type Field = SimpleField;
export type FieldOrGroup = FieldStruct | FieldGroup | FieldGroupExt | Field;
export type Fields = TypedMap<FieldOrGroup>;

export type NumberField = SimpleField<NumberFieldSettings>;
export type DateTimeField = SimpleField<DateTimeFieldSettings>;
export type SelectField = SimpleField<SelectFieldSettings>;
export type MultiSelectField = SimpleField<MultiSelectFieldSettings>;
export type TreeSelectField = SimpleField<TreeSelectFieldSettings>;
export type TreeMultiSelectField = SimpleField<TreeMultiSelectFieldSettings>;
export type BooleanField = SimpleField<BooleanFieldSettings>;
export type TextField = SimpleField<TextFieldSettings>;


/////////////////
// Settings
/////////////////

type SpelFieldMeta = {
  key: string;
  parent: "map" | "class" | "[class]" | "[map]" | null;
  isSpelVariable?: boolean;
};
type ValueSourcesInfo = {[vs in ValueSource]?: {label: string, widget?: string}};
type AntdPosition = "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
type AntdSize = "small" | "large" | "medium";
type ChangeFieldStrategy = "default" | "keep" | "first" | "none";
type FormatReverse = (q: string, op: string, reversedOp: string, operatorDefinition: Operator, revOperatorDefinition: Operator, isForDisplay: boolean) => string;
type SqlFormatReverse = (q: string) => string;
type SpelFormatReverse = (q: string) => string;
type FormatField = (field: FieldPath, parts: Array<string>, label2: string, fieldDefinition: Field, config: Config, isForDisplay: boolean) => string;
type FormatSpelField = (field: FieldPath, parentField: FieldPath | null, parts: Array<string>, partsExt: Array<SpelFieldMeta>, fieldDefinition: Field, config: Config) => string;
type CanCompareFieldWithField = (leftField: FieldPath, leftFieldConfig: Field, rightField: FieldPath, rightFieldConfig: Field, op: string) => boolean;
type FormatAggr = (whereStr: string, aggrField: FieldPath, operator: string, value: string | ImmutableList<string>, valueSrc: ValueSource, valueType: string, opDef: Operator, operatorOptions: OperatorOptionsI, isForDisplay: boolean, aggrFieldDef: Field) => string;

export interface LocaleSettings {
  locale?: {
    moment?: string;
    antd?: Object;
    material?: Object;
    mui?: Object;
  };
  theme?: {
    material?: Object;
    mui?: Object;
  };
  valueLabel?: string;
  valuePlaceholder?: string;
  fieldLabel?: string;
  operatorLabel?: string;
  fieldPlaceholder?: string;
  funcPlaceholder?: string;
  funcLabel?: string;
  operatorPlaceholder?: string;
  lockLabel?: string;
  lockedLabel?: string;
  deleteLabel?: string;
  addGroupLabel?: string;
  addCaseLabel?: string;
  addDefaultCaseLabel?: string;
  defaultCaseLabel?: string;
  addRuleLabel?: string;
  addSubRuleLabel?: string;
  delGroupLabel?: string;
  notLabel?: string;
  fieldSourcesPopupTitle?: string;
  valueSourcesPopupTitle?: string;
  removeRuleConfirmOptions?: {
    title?: string;
    okText?: string;
    okType?: string;
    cancelText?: string;
  };
  removeGroupConfirmOptions?: {
    title?: string;
    okText?: string;
    okType?: string;
    cancelText?: string;
  };
}


export interface BehaviourSettings {
  reverseOperatorsForNot?: boolean;
  canShortMongoQuery?: boolean;
  defaultField?: FieldValue | FieldValueI;
  defaultOperator?: string;
  fieldSources?: Array<FieldSource>;
  valueSourcesInfo?: ValueSourcesInfo;
  canCompareFieldWithField?: CanCompareFieldWithField | SerializedFunction;
  canReorder?: boolean;
  canRegroup?: boolean;
  canRegroupCases?: boolean;
  showNot?: boolean;
  showLock?: boolean;
  canDeleteLocked?: boolean;
  maxNesting?: number;
  setOpOnChangeField: Array<ChangeFieldStrategy>;
  clearValueOnChangeField?: boolean;
  clearValueOnChangeOp?: boolean;
  canLeaveEmptyGroup?: boolean;
  canLeaveEmptyCase?: boolean;
  shouldCreateEmptyGroup?: boolean;
  forceShowConj?: boolean;
  immutableGroupsMode?: boolean;
  immutableFieldsMode?: boolean;
  immutableOpsMode?: boolean;
  immutableValuesMode?: boolean;
  maxNumberOfRules?: Number;
  maxNumberOfCases?: Number;
  showErrorMessage?: boolean;
  convertableWidgets?: TypedMap<Array<string>>;
  jsonLogicExportPreserveGroups?: boolean;
  removeEmptyGroupsOnLoad?: boolean;
  removeEmptyRulesOnLoad?: boolean;
  removeIncompleteRulesOnLoad?: boolean;
  removeInvalidMultiSelectValuesOnLoad?: boolean;
  groupOperators?: Array<string>;
  useConfigCompress?: boolean;
  keepInputOnChangeFieldSrc?: boolean;
  fieldItemKeysForSearch?: FieldItemSearchableKey[];
  listKeysForSearch?: ListItemSearchableKey[];
}

export interface OtherSettings {
  caseValueField?: Field;
  fieldSeparator?: string;
  fieldSeparatorDisplay?: string;
  formatReverse?: FormatReverse | SerializedFunction;
  sqlFormatReverse?: SqlFormatReverse | SerializedFunction;
  spelFormatReverse?: SpelFormatReverse | SerializedFunction;
  formatField?: FormatField | SerializedFunction;
  formatSpelField?: FormatSpelField | SerializedFunction;
  formatAggr?: FormatAggr | SerializedFunction;
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
type JsonLogicImportFunc = (val: JsonLogicValue) => Array<RuleValue> | undefined; // can throw
type SpelImportFunc = (spel: SpelRawValue) => Array<RuleValue>;
type SpelFormatFunc = (formattedArgs: TypedMap<string>) => string;

interface FuncGroup extends BaseField {
  type: "!struct";
  subfields: TypedMap<FuncOrGroup>;
}

// todo: uses `returnType` instead of `type` for now, but should be revisited to use `type`
export interface Func extends Omit<BaseSimpleField, "type"> {
  returnType: string;
  args: TypedMap<FuncArg>;
  sqlFunc?: string;
  spelFunc?: string;
  mongoFunc?: string;
  mongoArgsAsObject?: boolean;
  jsonLogic?: string | JsonLogicFormatFunc | JsonLogicFunction;
  // Deprecated!
  // Calling methods on objects was remvoed in JsonLogic 2.x
  // https://github.com/jwadhams/json-logic-js/issues/86
  jsonLogicIsMethod?: boolean;
  jsonLogicImport?: JsonLogicImportFunc | SerializedFunction;
  spelImport?: SpelImportFunc | SerializedFunction;
  formatFunc?: FormatFunc | SerializedFunction;
  sqlFormatFunc?: SqlFormatFunc | SerializedFunction;
  mongoFormatFunc?: MongoFormatFunc | SerializedFunction;
  renderBrackets?: Array<RenderedReactElement>;
  renderSeps?: Array<RenderedReactElement>;
  spelFormatFunc?: SpelFormatFunc | SerializedFunction;
  allowSelfNesting?: boolean;
}
export interface FuncArg extends BaseSimpleField {
  isOptional?: boolean;
  showPrefix?: boolean;
}
export type FuncOrGroup = Func | FuncGroup;
export type Funcs = TypedMap<FuncOrGroup>;


/////////////////
// CoreConfig
/////////////////

export interface CoreOperators<C = Config> extends Operators<C> {
  equal: BinaryOperator;
  not_equal: BinaryOperator;
  less: BinaryOperator;
  less_or_equal: BinaryOperator;
  greater: BinaryOperator;
  greater_or_equal: BinaryOperator;
  like: BinaryOperator;
  not_like: BinaryOperator;
  starts_with: BinaryOperator;
  ends_with: BinaryOperator;
  between: Operator2;
  not_between: Operator2;
  is_null: UnaryOperator;
  is_not_null: UnaryOperator;
  is_empty: UnaryOperator;
  is_not_empty: UnaryOperator;
  select_equals: BinaryOperator;
  select_not_equals: BinaryOperator;
  select_any_in: BinaryOperator;
  select_not_any_in: BinaryOperator;
  multiselect_contains: BinaryOperator;
  multiselect_not_contains: BinaryOperator;
  multiselect_equals: BinaryOperator;
  multiselect_not_equals: BinaryOperator;
  proximity: OperatorProximity<C>;
}

export interface CoreConjunctions extends Conjunctions {
  AND: Conjunction;
  OR: Conjunction;
}

export interface CoreWidgets<C = Config> extends Widgets<C> {
  text: TextWidget<C>;
  textarea: TextWidget<C>;
  number: NumberWidget<C>;
  slider: NumberWidget<C>;
  rangeslider: RangeSliderWidget<C>;
  select: SelectWidget<C>;
  multiselect: MultiSelectWidget<C>;
  treeselect: TreeSelectWidget<C>;
  treemultiselect: TreeMultiSelectWidget<C>;
  date: DateTimeWidget<C>;
  time: DateTimeWidget<C>;
  datetime: DateTimeWidget<C>;
  boolean: BooleanWidget<C>;
  field: FieldWidget<C>;
  func: FuncWidget<C>;
  /**
   * @deprecated
   */
  case_value: CaseValueWidget<C>;
}

export interface CoreTypes extends Types {
  text: Type;
  number: Type;
  date: Type;
  time: Type;
  datetime: Type;
  select: Type;
  multiselect: Type;
  treeselect: Type;
  treemultiselect: Type;
  boolean: Type;
  case_value: Type;
}

export interface CoreConfig extends Config {
  conjunctions: CoreConjunctions;
  operators: CoreOperators;
  widgets: CoreWidgets;
  types: CoreTypes;
  settings: Settings;
  ctx: ConfigContext;
}



/////////////////

export declare const Utils: Utils;
export declare const CoreConfig: CoreConfig;
export declare const BasicFuncs: Funcs;
export declare const TreeStore: TreeStore;
export declare const TreeActions: TreeActions;
export declare const Immutable: any;


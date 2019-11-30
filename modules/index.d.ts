
import Immutable from 'immutable';
import {ElementType, FunctionComponent, ComponentClass, ReactElement, Factory} from 'react';


// type ElementType<P = any> =
// {
//     [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never
// }[keyof JSX.IntrinsicElements] |
// ComponentType<P>;
// /**
// * @deprecated Please use `ElementType`
// */
// type ReactType<P = any> = ElementType<P>;
// type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;


// type Factory<P> = (props?: Attributes & P, ...children: ReactNode[]) => ReactElement<P>;

// interface FunctionComponent<P = {}> {
//   (props: PropsWithChildren<P>, context?: any): ReactElement | null;
//   propTypes?: WeakValidationMap<P>;
//   contextTypes?: ValidationMap<any>;
//   defaultProps?: Partial<P>;
//   displayName?: string;
// }

// interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
//   type: T;
//   props: P;
//   key: Key | null;
// }

// interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
//   new (props: P, context?: any): Component<P, S>;
//   propTypes?: WeakValidationMap<P>;
//   contextType?: Context<any>;
//   contextTypes?: ValidationMap<any>;
//   childContextTypes?: ValidationMap<any>;
//   defaultProps?: Partial<P>;
//   displayName?: string;
// }



////////////////
// common
/////////////////

type Optional<T> = {
  [P in keyof T]?: T[P];
}
type TypedMap<T> = {
  [key: string]: T;
};
type Empty = null | undefined;

type ValueSource = "value" | "field";
type ValidateValue = (val: any, fieldDef: Object) => Boolean;

export interface FieldSettings {
  //.....todo    min max
};

////////////////
// Query, Builder, Utils, Config
/////////////////

export type ImmutableTree = Immutable.Map<String, String|Object>;
export type JsonTree = Object;
export type MongoQuery = Object;

export interface Utils {
  queryBuilderFormat(tree: ImmutableTree, config: Config): String;
  queryString(tree: ImmutableTree, config: Config, isForDisplay?: Boolean): String;
  sqlFormat(tree: ImmutableTree, config: Config): String;
  mongodbFormat(tree: ImmutableTree, config: Config): MongoQuery;
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

type FormatValue = () => String; //.....todo
type SqlFormatValue = () => String; //.....todo
type MongoFormatValue = () => String; //.....todo

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
  labelYes?: Boolean,
  labelNo?: Boolean,
};
export type WidgetSettings = DateWidgetSettings | BooleanWidgetSettings | BaseWidgetSettings;

interface BaseWidgetProps {
  value: any,
  setValue(val: any): void,
  placeholder: String,
  field: String,
  operator: String,
  fieldDefinition: Field
  config: Config,
  delta: Number,
};
export interface RangeWidgetProps extends BaseWidgetProps {
  placeholders: Array<String>,
  textSeparators: Array<String>,
};
type WidgetProps = (BaseWidgetProps | RangeWidgetProps) & FieldSettings & WidgetSettings;

interface BaseWidget {
  type: String,
  factory: Factory<WidgetProps>,
  valueSrc?: ValueSource,
  valuePlaceholder?: String,
  valueLabel?: String,
  validateValue?: ValidateValue,
  formatValue: FormatValue,
  sqlFormatValue: SqlFormatValue,
  mongoFormatValue: MongoFormatValue,
};
interface RangeWidget extends BaseWidget {
  singleWidget?: String,
};

export type Widget = (RangeWidget | BaseWidget) & WidgetSettings;
export type Widgets = TypedMap<Widget>;


/////////////////
// Conjunctions
/////////////////

interface Conjunction {
  //...todo
};
export type Conjunctions = TypedMap<Conjunction>;


/////////////////
// Types
/////////////////

interface Type {
  //...todo
};
export type Types = TypedMap<Type>;


/////////////////
// Operators
/////////////////

interface Operator {
  //...todo
};
export type Operators = TypedMap<Operator>;


/////////////////
// Fields
/////////////////

type FieldType = String | "!struct";

interface WidgetConfigForType {
  widgetProps?: Optional<Widget>,
  opProps?: Optional<Operator>,
  operators?: Array<String>,
};

interface BaseField {
  type: FieldType,
  label?: String,
  tooltip?: String,
};
interface SimpleField extends BaseField {
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
export type FieldOrGroup = FieldGroup | Field;
export type Fields = TypedMap<FieldOrGroup>;


/////////////////
// FieldProps
/////////////////

type FieldItem = {
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

export interface MainSettings {
  renderField?: Factory<FieldProps>;
  renderOperator?: Factory<FieldProps>;
  valueSourcesInfo?: ValueSourcesInfo,
  maxNesting?: Number,
  canLeaveEmptyGroup?: Boolean,
  //....todo
};

export type Settings = LocaleSettings & MainSettings;

/////////////////












interface ReadyWidgets {
  FieldSelect: ElementType<FieldProps>,
  FieldDropdown: ElementType<FieldProps>,
  FieldCascader: ElementType<FieldProps>,
  VanillaFieldSelect: ElementType<FieldProps>
};

export interface OperatorProximity {
  textSeparators: Array<String>,
  valueLabels: Array<String | {label: String, placeholder: String}>,
  options: Object,
};

export interface BasicConfig extends Config {
  operators: {
    between: Object,
    proximity: OperatorProximity,
  },
  widgets: {
    text: Widget,
    slider: Widget,
    rangeslider: Widget,
    date: DateWidget,
    time: DateWidget,
    datetime: DateWidget,
  },
  types: {
    boolean: Object,
  }
};


export const BasicConfig: BasicConfig;
export const Utils: Utils;
export const Query: Query;
export const Builder: Builder;
export const Widgets: ReadyWidgets;


import Immutable from 'immutable';
import {ElementType, FunctionComponent, ComponentClass, ReactElement, Factory} from 'react';

type TypedMap<T> = {
  [key: string]: T;
};
type Empty = null | undefined;


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


export type ImmutableTree = Immutable.Map<String, String|Object>;
export type JsonTree = Object;
export type MongoQuery = Object;

export type Builder = ElementType<BuilderProps>;
export type Query = ElementType<QueryProps>;

export type Conjunctions = TypedMap<Object>;
export type Operators = TypedMap<Object>;
export type Types = TypedMap<Object>;

////////////////
// common
/////////////////

type ValueSource = "value" | "field";
export type ValidateValue = (val: any, fieldDef: Object) => Boolean;

/////////////////
// Widgets
/////////////////

export type FormatValue = () => String; //.....
export type SqlFormatValue = () => String; //.....
export type MongoFormatValue = () => String; //.....

export interface WidgetProps {
  //....
};
interface BaseWidget {
  type: String,
  factory: Factory<WidgetProps>, //???
  formatValue: FormatValue,
  valueSrc?: ValueSource,
  validateValue?: ValidateValue,
  customProps?: {},
  valuePlaceholder?: String,
  valueLabel?: String,
  sqlFormatValue: SqlFormatValue,
  mongoFormatValue: MongoFormatValue,
};
export interface SimpleWidget extends BaseWidget {
};
export interface DateWidget extends BaseWidget {
  timeFormat?: String,
  dateFormat?: String,
  valueFormat?: String,
  use12Hours?: Boolean,
};
export interface BooleanWidget extends BaseWidget {
  labelYes?: Boolean,
  labelNo?: Boolean,
};
export interface RangeWidget extends BaseWidget {
  singleWidget?: String,
};

export type Widget = DateWidget | BooleanWidget | RangeWidget | SimpleWidget;
export type Widgets = TypedMap<Widget>;


/////////////////
// Fields
/////////////////

type FieldType = String | "!struct";
export interface WidgetConfigForType {
  widgetProps?: WidgetConfig,
  opProps?: OpProps,
  operators?: Array<String>,
};
export interface OpProps {
};
export interface WidgetConfig {
  valueLabel?: String,
  valuePlaceholder?: String,
  validateValue?: ValidateValue
};
interface BaseField {
  type: FieldType,
  label?: String,
  tooltip?: String,
};
export interface SimpleField extends BaseField {
  label2?: String,
  operators?: Array<String>,
  defaultOperator?: String,
  excludeOperators?: Array<String>,
  preferWidgets?: Array<String>,
  valueSources?: Array<ValueSource>,
  tableName?: String,
  fieldSettings?: {},
  widgets?: TypedMap<WidgetConfigForType>,
  mainWidgetProps?: WidgetConfig,
};
export interface FieldGroup extends BaseField {
  type: "!struct",
  subfields: Fields,
};
export interface FieldWithValues extends SimpleField {
  listValues?: TypedMap<String>,
  allowCustomValues?: Boolean,
};
export type Field = FieldGroup | FieldWithValues;
export type Fields = TypedMap<Field>;

/////////////////
// Settings
/////////////////

type FieldItem = {items?: FieldItems, key: String, path?: String, label: String, fullLabel?: String, altLabel?: String, tooltip?: String};
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

export interface Settings extends LocaleSettings {
  renderField?: Factory<FieldProps>;
  renderOperator?: Factory<FieldProps>;
  valueSourcesInfo?: ValueSourcesInfo,
  maxNesting?: Number,
  canLeaveEmptyGroup?: Boolean,
};

/////////////////


export interface ReadyWidgets {
  FieldSelect: ElementType<FieldProps>,
  FieldDropdown: ElementType<FieldProps>,
  FieldCascader: ElementType<FieldProps>,
  VanillaFieldSelect: ElementType<FieldProps>
};

export interface Config {
  conjunctions: Conjunctions,
  operators: Operators,
  widgets: Widgets,
  types: Types,
  settings: Settings,
  fields: Fields,
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
  actions: Map<String, Function>,
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

export const BasicConfig: BasicConfig;
export const Utils: Utils;
export const Query: Query;
export const Builder: Builder;
export const Widgets: ReadyWidgets;

# react-awesome-query-builder
[![npm](https://img.shields.io/npm/v/react-awesome-query-builder.svg)](https://www.npmjs.com/package/react-awesome-query-builder) [![github](https://img.shields.io/github/package-json/v/ukrbublik/react-awesome-query-builder.svg)](https://github.com/ukrbublik/react-awesome-query-builder/packages/48416) [![travis](https://travis-ci.org/ukrbublik/react-awesome-query-builder.svg?branch=master)](https://github.com/ukrbublik/react-awesome-query-builder)

[![Open in codesandbox.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-awesome-query-builder-demo-64wwx?fontsize=14&module=%2Fdemo%2Fconfig.js)

User-friendly React component to build queries.

Inspired by [jQuery QueryBuilder](http://querybuilder.js.org/)

Using awesome [Ant Design](https://ant.design/) for widgets

Master branch uses [antd v3](https://ant.design/docs/react/introduce).
For [antd v2](https://2x.ant.design/docs/react/introduce) (which has more compact style) see [branch antd-2](https://github.com/ukrbublik/react-awesome-query-builder/tree/antd-2) and versions `0.1.*`. 

[Demo](https://ukrbublik.github.io/react-awesome-query-builder)


### Features
[![Screenshot](https://ukrbublik.github.io/react-awesome-query-builder/screenshot.png)](https://ukrbublik.github.io/react-awesome-query-builder)
- Highly configurable
- Fields can be of type:
  - simple (string, number, bool, date/time/datetime, list)
  - structs (will be displayed in selectbox as tree of members)
  - custom type (dev should add its own widget component for this) (it's not complex, you can add slider for example)
- Comparison operators can be:
  - binary (== != < > ..)
  - unary (is empty, is null)
  - 'between' (for numbers)
  - complex operators like 'proximity'
- Values of fields can be compared with values -or- another fields (of same type)
- Reordering support for rules and groups of rules
- Using awesome [Ant Design](https://ant.design/)
- Export to MongoDb or SQL


## Getting started
Install: `npm i react-awesome-query-builder`

See [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo) as example of usage and configuration.


## Usage
```javascript
import React, {Component} from 'react';
import {Query, Builder, Utils as QbUtils} from 'react-awesome-query-builder';
import 'react-awesome-query-builder/css/antd.less';
import 'react-awesome-query-builder/css/styles.scss';
import 'react-awesome-query-builder/css/compact_styles.scss'; //optional, for more compact styles

// You need to provide your own config. See below 'Config format'
import loadedConfig from './config';
// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue = {"id": QbUtils.uuid(), "type": "group"};

class DemoQueryBuilder extends Component {
    state = {
      tree: loadTree(queryValue),
      config: loadedConfig
    };
    
    render = () => (
      <div>
        <Query
            {...loadedConfig} 
            value={this.state.tree}
            onChange={this.onChange}
            get_children={this.renderBuilder}
        />
        {this.renderResult(this.state)}
      </div>
    )

    renderBuilder = (props) => (
      <div className="query-builder-container" style={{padding: '10px'}}>
        <div className="query-builder">
            <Builder {...props} />
        </div>
      </div>
    )

    renderResult = ({tree: immutableTree, config}) => (
      <div className="query-builder-result">
          <div>Query string: {QbUtils.queryString(immutableTree, config)}</div>
          <div>Mongodb query: {QbUtils.mongodbFormat(immutableTree, config)}</div>
      </div>
    )
    
    onChange = (immutableTree, config) => {
      // Tip: for better performance you can apply `throttle` - see `examples/demo`
      this.setState({tree: immutableTree, config: config});

      const jsonTree = QbUtils.getTree(immutableTree);
      // `jsonTree` can be saved to backend, and later loaded to `queryValue`
    }
}
```

- Please wrap `<Builder />` in `div.query-builder`.  
  Wrapping in `div.query-builder-container` in not necessary, but if you want to make query builder scrollable, it's best place to apply appropriate styles.
- Use can save query value in `onChange` callback.  
  Note that value will be in [`Immutable`](https://immutable-js.github.io/immutable-js/) format, so you can use `QbUtils.getTree()` to convert it into JS object.  
  You can store it on backend, and load later by passing in `value` prop of `<Query />`.


## Config format
Has 6 sections:
```javascript
{
  conjunctions,
  fields,
  types,
  operators,
  widgets,
  settings,
}
```
Each section is described below.  
There are functions for building query string: `formatConj`, `formatValue`, `formatOp`, `formatField`, which are used for `QbUtils.queryString()`. 
They have common param `isForDisplay` - false by default, true will be used for `QbUtils.queryString(immutableTree, config, true)` (see 3rd param true).  
Also there are similar `mongoConj`, `mongoFormatOp`, `mongoFormatValue` for building MongoDb query with `QbUtils.mongodbFormat()`.  


### config.conjunctions
```javascript
{
  AND: {
    label: 'And',
    formatConj: (children, _conj, not) => ( (not ? 'NOT ' : '') + '(' + children.join(' || ') + ')' ),
    reversedConj: 'OR',
    mongoConj: '$and',
  },
  OR: {...},
}
```
where `AND` and `OR` - available conjuctions (logical operators). You can add `NOR` if you want.

| key          | requred              | meaning       |
| ------------ | -------------------- | ------------- |
| label        | +                    | Label to be displayed in conjunctions swicther |
| formatConj   | +                    | Function for formatting query, used to join rules into group with conjunction. |
|              |                      |  `(Immultable.List children, string conj, bool not, bool isForDisplay) => string` |
|              |                      |  `children` - list of already formatted queries (strings) to be joined with conjuction |
| mongoConj    | + for MongoDB format | [Name](https://docs.mongodb.com/manual/reference/operator/query-logical/) of logical operator for MongoDb |
| reversedConj |                      | Opposite logical operator. |
|              |                      |  Can be used to optimize `!(A || B)` to `!A && !B` (done for MongoDB format) |


### config.operators
```javascript
import {Operators} from 'react-awesome-query-builder';
const { ProximityOperator } = Operators;
```
```javascript
{
  equal: {
    label: 'equals',
    reversedOp: 'not_equal',
    labelForFormat: '==',
    cardinality: 1,
    isUnary: false,
    formatOp: (field, _op, value, _valueSrc, _valueType, opDef) => `${field} ${opDef.labelForFormat} ${value}`,
    mongoFormatOp: (field, op, value) => ({ [field]: { '$eq': value } }),
  },
  ..
}
```

There is special `proximity` operator, its options are rendered with `<ProximityOperator />`.  
See [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo/config.js)  

| key            | requred                | default | meaning       |
| -------------- | ---------------------- | ------- | ------------- |
| label          | +                      |         | Label to be displayed in operators select component |
| labelForFormat | +                      |         | String used to join operands when building query string |
| reversedOp     | +                      |         | Opposite operator. |
| isUnary        |                        | false   | true for `is_empty` operator only |
| cardinality    |                        | 1       | Number of right operands (1 for binary, 2 for `between`) |
| formatOp       | +                      |         | Function for formatting query string, used to join operands into rule. |
|                |                        |         |  `(string field, string op, mixed value, string valueSrc, string valueType, Object opDef, Object operatorOptions, bool isForDisplay) => string` |
|                |                        |         |  `value` - string (already formatted value) for `cardinality==1` -or- `Immutable.List` of strings for `cardinality>1`  |
| mongoFormatOp  | + for MongoDB format   |         | Function for formatting MongoDb query, used to join operands into rule. |
|                |                        |         |  `(string field, string op, mixed value, string valueSrc, string valueType, Object opDef, Object operatorOptions) => object` |
|                |                        |         |  `value` - mixed for `cardinality==1` -or- `Array` for `cardinality>2` |
| valueLabels    | + for `cardinality==2` |         | `['Value from', {label: 'Value to', placeholder: 'Enter value to'}]` |
| textSeparators | + for `cardinality==2` |         | `[null, 'and']` |
| options        |                        |         | See `proximity` operator |
| isSpecialRange |                        | false   | Special for `cardinality==2`. Used to show 1 range widget instead of 2 widgets (see `range_between` operator for `rangeslider` widget in demo) |


### config.widgets
```javascript
import {Widgets} from 'react-awesome-query-builder';
const {
    TextWidget,
    NumberWidget,
    SelectWidget,
    MultiSelectWidget,
    DateWidget,
    BooleanWidget,
    TimeWidget,
    DateTimeWidget,
    ValueFieldWidget
} = Widgets;
```

```javascript
{
  text: {
    type: 'text',
    valueSrc: 'value',
    factory: (props) => <TextWidget {...props} />,
    formatValue: (val, _fieldDef, _wgtDef, isForDisplay) => (isForDisplay ? '"' + val + '"' : JSON.stringify(val)),
    mongoFormatValue: (val, _fieldDef, _wgtDef) => (val),
    validateValue: (val, _fieldDef) => (val.length < 5),
    // Options:
    valueLabel: "Text",
    valuePlaceholder: "Enter text",
    // Custom props (https://ant.design/components/input/):
    customProps: {
        maxLength: 3
    },
  },
  ..
},
```

There is special `field` widget (actually key name is defined in `config.settings.valueSourcesInfo.field.widget`), rendered by `<ValueFieldWidget />`.  
It can be used to compare field with another field of same type.  
To enable this feature set `valueSources` of type to `['value', 'field'']` (see below in [config.types](#configtypes)).  

| key              | requred                | default   | meaning       |
| ---------------- | ---------------------- | --------- | ------------- |
| type             | +                      |           | One of types described in [config.types](#configtypes) |
| valueSrc         |                        | `'value'` | `'value'` or `'field'` (only for special `field` widget) |
| factory          | +                      |           | React function component |
| formatValue      | +                      |           | Function for formatting widget's value in query string. |
|                  |                        |           |  `(mixed val, Object fieldDef, Object wgtDef, bool isForDisplay) => string` |
| mongoFormatValue | - for MongoDB format   | v => v    | Function for formatting widget's value in MongoDb query. |
|                  |                        |           |  `(mixed val, Object fieldDef, Object wgtDef) => object` |
| validateValue    |                        |           | Function to validate entered value. |
|                  |                        |           |  `(mixed val, Object fieldDef) => boolean` |
| valueLabel       | +                      |           | Common option, text to be placed on top of widget if `config.settings.showLabels` is true |
| valuePlaceholder | +                      |           | Common option, placeholder text to be shown in widget for empty value |
| timeFormat       |                        |           | Option for `<TimeWidget>`, `<DateTimeWidget />` to display time. Example: `'HH:mm'` |
| dateFormat       |                        |           | Option for `<DateWidget>`, `<DateTimeWidget />` to display date. Example: `YYYY-MM-DD` |
| valueFormat      |                        |           | Option for `<TimeWidget>`, `<DateWidget>`, `<DateTimeWidget />` to format value (to be passed to `moment()`). Example: `YYYY-MM-DD HH:mm` |
| customProps      |                        |           | You can pass any props directly to widget with `customProps`, for example enable search for [`<Select />`](https://ant.design/components/select/) widget: `widgetProps: {customProps: {showSearch: true}}` |
| singleWidget     |                        |           | Special option for `rangeslider` widget (`<RangeWidget />`), value equals to `slider` (`<SliderWidget />`) to connect them. |
|                  |                        |           |  Used together with operator `range_between` having `isSpecialRange=true` option. |


### config.types
```javascript
{
  time: {
      valueSources: ['value', 'field'],
      defaultOperator: 'equal',
      widgets: {
          time: {
              widgetProps: {
                  valuePlaceholder: "Time",
                  timeFormat: 'h:mm:ss A',
                  use12Hours: true,
              },
              operators: ['equal', 'between'],
              opProps: {
                  between: {
                      valueLabels: ['Time from', 'Time to'],
                  },
              },
          },
          field: {
              operators: [
                  'equal',
                  'not_equal',
              ],
          }
      },
  },
  ..
}
```
| key                                    | requred  | default | meaning       |
| -------------------------------------- | -------- | ------- | ------------- |
| `valueSources`                         |   | keys of `valueSourcesInfo` at [config.settings](#configsettings) | Array with values `'value'`, `'field'`. If `'value'` is included, you can compare field with values. If `'field'` is included, you can compare field with another field of same type (see special `field` widget). |
| `defaultOperator`                      |   |  | If specified, it will be auto selected when user selects field |
| `widgets.*`                            | + |  | Available widgets for current type and their config. |
|                                        |   |  |  Normally there is only 1 widget per type. But see type `number` at [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo/config.js) - it has 3 widhets `number`, `slider`, `rangeslider`. |
|                                        |   |  |  Or see type `select` - it has widget `select` for operator `=` and widget `multiselect` for operator `IN`. |
|                                        |   |  |  Also if `'field'` is included in `valueSources`, there will be special widget `field` you can also configure. |
| `widgets.<widget>.operators`           | + |  | List of operators for widget, described in [config.operators](#configoperators) |
| `widgets.<widget>.widgetProps`         |   |  | Can be used to override config of corresponding widget specified in [config.widgets](#configwidgets). Example: `{timeFormat: 'h:mm:ss A'}` for time field with AM/PM. |
| `widgets.<widget>.opProps.<operator>`  |   |  | Can be used to override config of operator for widget. Example: `opProps: { between: {valueLabels: ['Time from', 'Time to']} }` for building range of times. |


### config.fields
```javascript
{
  // simple
  qty: {
    type: 'number',
    label: 'Quantity',
  },
  // complex
  user: {
    type: '!struct', // special keyword for comlex fields
    label: 'User',
    subfields: {
      // subfields of complex field
      name: {
        type: 'text',
        label: 'Name',
        label2: 'User name', //optional, see below
      },
    },
  },
  ...
}
```

| key                 | requred                                | default | meaning       |
| ------------------- | -------------------------------------- | ------- | ------------- |
| `type`              | +                                      |        | One of types described in [config.types](#configtypes) or `!struct` for complex field |
| `subfields`         | + for `!struct` type                   |        | Config for subfields of complex field (multiple nesting is supported) |
| `label`             | +                                      |        | Label to be displayed in field list |
|                     |                                        |        |  (If not specified, fields's key will be used instead) |
| `label2`            |                                        |        | Can be optionally specified for nested fields. |
|                     |                                        |        |  By default, if nested field is selected (eg. `name` of `user` in example above), select component will have tootip like `User -> Subname` |
|                     |                                        |        |  (path constructed by joining `label`s with delimeter `->` specified by `config.settings.fieldSeparatorDisplay`) |
|                     |                                        |        |  That tooltip text can be overriden by setting `label2`, so it will become `User name`. 
| `tooptip`           |                                        |        | Optional tooltip to be displayed in field list by hovering on item |
| `listValues`        | + for `Select`/`MultiSelect` widgets   |        | List of values for Select widget. |
|                     |                                        |        |  Example: `{ yellow: 'Yellow', green: 'Green' }` where `Yellow` - label to display at list of options |
| `allowCustomValues` | - for `MultiSelect` widget             | false  | If true, user can provide own options in multiselect, otherwise they will be limited to `listValues` |
| `fieldSettings`     |                                        |        | Settings for widgets. Example: `{min: 1, max: 10}` |
|                     |                                        |        |  Available settings for Number widget: `min`, `max`, `step` |
| `operators`, `defaultOperator`, `widgets`, `valueSources` |  |        | You can override config of corresponding type (see below at section [config.types](#configtypes)) |
| `mainWidgetProps`   |                                        |        | Shorthand for `widgets.<main>.widgetProps` |
| `preferWidgets`     |                                        |        | See usecase at [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo/config.js) for `slider` field. |
|                     |                                        |        |  Its type is `number`. There are 3 widgets defined for number type: `number` (default), `slider`, `rangeslider`. So setting `preferWidgets: ['slider', 'rangeslider']` will force rendering slider instead of number input for current field. |


### config.settings
```javascript
import en_US from 'antd/lib/locale-provider/en_US';
```
```javascript
{
  locale: {
      short: 'en',
      full: 'en-US',
      antd: en_US,
  },
  valueSourcesInfo: {
    value: {
      label: "Value"
    },
    field: {
      label: "Field",
      widget: "field",
    }
  },
  canReorder: true,
  canRegroup: true,
  hideConjForOne: true,
  fieldSeparator: '.',
  fieldSeparatorDisplay: '->',
  maxNesting: 10,
  showLabels: false,
  showNot: true,
  setOpOnChangeField: ['keep', 'default'],
  customFieldSelectProps: {
      showSearch: true
  },
  ...
}
```

| key                             | required | default        | meaning       |
| ------------------------------- | ---------| -------------- | ------------- |
| `locale`                        | +       |                | Locale used for AntDesign widgets |
| `fieldSeparator`                | +       |                | Separaor for struct fields. Also used for formatting |
| `fieldSeparatorDisplay`         | +       |                | Separaor for struct fields to show at field's select tooltip. |
| `valueSourcesInfo`              | +       |                | Values of fields can be compared with values or another fields. |
|                                 |         |                |  If you want to disable this feature and leave only comparing with values, remove `field` |
| `canReorder`                    | +       | false          | Activate reordering support for rules and groups of rules? |
| `canRegroup`                    | +       | false          | Allow move rules (or groups) in/out groups during reorder? |
|                                 |         |                |  False - allow "safe" reorder, means only reorder at same level |
| `showLabels`                    | +       | false          | Show labels under all fields? |
| `showNot`                       | +       | false          | Show `NOT` together with `AND`/`OR`? |
| `hideConjForOne`                | +       | false          | Don't show conjunctions switcher for only 1 rule? |
| `maxNesting`                    |         |                | Max nesting for rule groups. |
|                                 |         |                | Set `1` if you don't want to use groups at all. This will remove also `Add group` button. |
| `maxLabelsLength`               |         | 100            | To shorten long labels of fields/values (by length, i.e. number of chars) |
| `dropdownPlacement`             |         | `bottomLeft`   | Placement of antdesign's [dropdown](https://ant.design/components/dropdown/) pop-up menu |
| `renderSize`                    |         | `small`        | Size of AntDesign components - `small` or `large` |
| `renderConjsAsRadios`           |         | false          | How to render conjunctions switcher?  true - use `RadioGroup`, false - use `ButtonGroup` |
| `renderFieldAndOpAsDropdown`    |         | false          | How to render fields/ops list?  true - use `Dropdown`/`Menu`, false - use `Select` |
| `customFieldSelectProps`        |         | `{}`           | You can pass props to `Select` field widget. Example: `{showSearch: true}` |
| `groupActionsPosition`          |         | `topRight`     | You can change the position of the group actions to the following: |
|                                 |         |                |   `topLeft, topCenter, topRight, bottomLeft, bottomCenter, bottomRight` |
| `setOpOnChangeField`            |         | `[]`           | Strategies for selecting operator for new field (used by order until success): |
|                                 |         |                |  `default` (default if present), `keep` (keep prev from last field), `first`, `none` |
| `clearValueOnChangeField`       |         | false          | Clear value on field change? false - if prev & next fields have same type (widget), keep |
| `clearValueOnChangeOp`          |         | false          | Clear value on operator change? |
| `immutableGroupsMode`           |         | false          | Not allow to add/delete rules or groups, but allow change |
| `canLeaveEmptyGroup`            |         | false          | Leave empty group after deletion or add 1 clean rule immediately? |
| `formatReverse`                 |         |                | Function for formatting query string, used to format rule with reverse operator which haven't `formatOp`. |
|                                 |         |                |  `(string q, string operator, string reversedOp, Object operatorDefinition, Object revOperatorDefinition, bool isForDisplay) => string` |
|                                 |         |                |  `q` - already formatted rule for opposite operator (which have `formatOp`) |
|                                 |         |                |  return smth like `"NOT(" + q + ")"` |
| `formatField`                   |         |                | Function for formatting query string, used to format field |
|                                 |         |                |  `(string field, Array parts, string label2, Object fieldDefinition, Object config, bool isForDisplay) => string` |
|                                 |         |                |  `parts` - for struct field |
|                                 |         |                |  `label2` - with using of `fieldSeparatorDisplay` |
|                                 |         |                |  just return `field` (or `label2` for `isForDisplay==true`) |
| `canCompareFieldWithField`      |         |                | Function for building right list of fields to compare field with field |
|                                 |         |                |  `(string leftField, Object leftFieldConfig, string rightField, Object rightFieldConfig) => boolean` |
|                                 |         |                |  For type == `select`/`multiselect` you can optionally check `listValues` |


Localization:
| key                       | example       |
| ------------------------- | ------------- |
| `valueLabel`              | Value |
| `valuePlaceholder`        | Value |
| `fieldLabel`              | Field |
| `operatorLabel`           | Operator |
| `fieldPlaceholder`        | Select field |
| `operatorPlaceholder`     | Select operator |
| `deleteLabel`             | `null` |
| `delGroupLabel`           | `null` |
| `addGroupLabel`           | Add group |
| `addRuleLabel`            | Add rule |
| `notLabel`                | Not |
| `valueSourcesPopupTitle`  | Select value source |
| `removeRuleConfirmOptions`         | If you want to ask confirmation of removing non-empty rule/group, add these options. List of all valid properties is [here](https://ant.design/components/modal/#API) |
| `removeRuleConfirmOptions.title`   | Are you sure delete this rule? |
| `removeRuleConfirmOptions.okText`  | Yes |
| `removeRuleConfirmOptions.okType`  | `danger` |
| `removeGroupConfirmOptions.title`  | Are you sure delete this group? |
| `removeGroupConfirmOptions.okText` | Yes |
| `removeGroupConfirmOptions.okType` | `danger` |



## Development
To build the component locally, clone this repo then run:

`npm install`
`npm run examples`

Then open localhost:3001 in a browser.

Scripts:
- `npm run build-npm` - Builds a npm module. Output path: `build/npm`
- `npm run build-global` - Builds with webpack the self contained pack of the component. Output path: `build/global`
- `npm run build-examples` - Builds with webpack the examples. Output path: `examples`
- `npm run examples` - Builds with webpack the examples and runs a dev-server on localhost:3001.
- `sh ./scripts/gh-pages.sh` - Update gh pages

The repo sticks in general to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

Pull Requests are always welcomed :)


## License
MIT. See also `LICENSE.txt`

Forked from [https://github.com/fubhy/react-query-builder](https://github.com/fubhy/react-query-builder)

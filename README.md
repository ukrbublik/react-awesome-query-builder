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
There are functions in it for building query string: `formatConj`, `formatValue`, `formatOp`, which are used for `QbUtils.queryString()`.
They have common param `isForDisplay` - false by default, true will be used for `QbUtils.queryString(immutableTree, config, true)` (see 3rd param true).  
Also there are similar `mongoConj` `mongoFormatValue`, `mongoFormatOp` for building MongoDb query with `QbUtils.mongodbFormat()`.  

### config.conjunctions
```javascript
{
  'AND': {
    label: 'And',
    formatConj: (children, conj, not, isForDisplay) => (
      (not ? 'NOT ' : '') + '(' + children.join(' || ') + ')'
    ),
    reversedConj: 'OR',
    mongoConj: '$and',
  },
  'OR': {...},
}
```
where `AND` and `OR` - available conjuctions (logical operators). You can add `NOR` if you want.

| key          | requred              | meaning       |
| ------------ | -------------------- | ------------- |
| label        | +                    | Label to be displayed in conjunctions swicther |
| formatConj   | +                    | Function to join rules into group with conjunction. |
|              |                      | `(Immultable.List children, string conj, bool not, bool isForDisplay) => string` |
|              |                      | `children` - list of already formatted queries (strings) to be joined with conjuction |
| mongoConj    | + for MongoDB format | [Name](https://docs.mongodb.com/manual/reference/operator/query-logical/) of logical operator for MongoDb |
| reversedConj |                      | Opposite logical operator. |
|              |                      | Can be used to optimize `!(A || B)` to `!A && !B` (done for MongoDB format) |


### config.types
```javascript
```

### config.operators
```javascript
```

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

| key          | requred            | default | meaning       |
| ------------ | ------------------ | ------- | ------------- |
| type         | +                  | | One of types described in [config.types](#configtypes) or `!struct` for complex field |
| subfields    | + for `!struct` type | |  Config for subfields of complex field (multiple nesting is supported) |
| label        | +                  | |  Label to be displayed in field list |
|              |                    | |  (If not specified, fields's key will be used instead) |
| label2       |                    | |  Can be optionally specified for nested fields. |
|              |                    | |  By default, if nested field is selected (eg. `name` of `user` in example above), select component will have tootip like `User -> Subname` |
|              |                    | |  (path constructed by joining `label`s with delimeter `->` specified by `config.settings.fieldSeparatorDisplay`) |
|              |                    | |  That tooltip text can be overriden by setting `label2`, so it will become `User name`. 
| tooptip      |                    | |  Optional tooltip to be displayed in field list by hovering on item |
| listValues   | + for `Select`/`MultiSelect` widgets | | List of values for Select widget. |
|              |                     | | Example: `{ yellow: 'Yellow', green: 'Green' }` where `Yellow` - label to display at list of options |
| allowCustomValues | - for `MultiSelect` widget | false | If true, user can provide own options in multiselect, otherwise they will be limited to `listValues` |
| fieldSettings | | | Settings for widgets. Example: `{min: 1, max: 10}` |
|               | | | Available settings for Number widget: `min`, `max`, `step` |
| operators, defaultOperator, widgets, valueSources | | | (optional) You can override some options of config of corresponding type (see below at section 'types') ??? |
| mainWidgetProps | | | ??? |
| preferWidgets | | | ??? |


### config.widgets
```javascript
import {Widgets, Operators} from 'react-awesome-query-builder';
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
import en_US from 'antd/lib/locale-provider/en_US';
```

### config.settings
```javascript
```




=======================================================================


## Config format
```javascript
export default {

  
  types: {
    number: { //type key
      //(optional) Values of fields can be compared with values or another fields
      // (see settings.valueSourcesInfo). If you want to compare values of this type 
      // only with values or other fields of this type, edit:
      valueSources: ['value'],
      //Available widgets for type and its configs:
      widgets: {
        number: { //widget key, see section 'widgets' below
          //List of operators can be applied to this type (see section 'operators' below)
          operators: ['greater', 'less'],
          defaultOperator: 'greater', //default operator to be selected for this type
          //Config for this widget (all optional):
          widgetProps: {
            //for example, here you can overwrire 'valueLabel', 'valuePlaceholder', 
            // for date/time: 'timeFormat', 'dateFormat', 'valueFormat'

            //also you can pass props directly to widget, for example enable search for Select widget:
            customProps: {
                showSearch: true
            }
          },
          //Config for operators for this widget (all optional):
          opProps: {
            between: { //operator key
              //for example, here you can overwrire 'valueLabels'
            },
            ...other ops
          },
        },
        //Most of types can have only 1 widget, but for list there can be 2: 
        // single-select widget (for op ==) and multi-select widget (for op 'in')
        ...other widgets if applicable
        //'field' is special widget to compare values of field of this type
        // with another fields (of this type)
        field: {
          ...you can overwrire 'operators' for example
        }
      }
    },
    ...other types
  },
  
  operators: {
    equal: { //operator key
      label: '==', //label for selectbox
      labelForFormat: '==', //string used for formatting query, only if 'formatOp' is not present
      reversedOp: 'not_equal', //operator opposite to current
      cardinality: 1, //number of right operands (1 for binary, 2 for 'between')
      isUnary: true,
      //(for building query string) function to format rule
      // value - string (already formatted value) for cardinality==1 
      // -or- Immutable.List of strings for cardinality>1
      formatOp: (string field, string op, mixed value, string valueSrc, string valueType, 
        Object opDef, Object operatorOptions, bool isForDisplay) => string,
      //(for building mongodb query) function to format rule
      // value - mixed for cardinality==1 -or- Array for cardinality>2 
      mongoFormatOp: (string field, string op, mixed value, string valueSrc, string valueType, 
        Object opDef, Object operatorOptions) => object,
      //for cardinality==2 ('between')
      valueLabels: ['Value from', {label: 'Value to', placeholder: 'Enter value to'}],
      textSeparators: [null, 'and'],
      ...also see examples/demo for config of 'proximity' operator
    },
  },
  
  widgets: {
    text: {
      type: "text", //see 'types' section
      valueSrc: 'value', //'value' or 'field' (only for special 'field' widget)
      factory: (props) => <TextWidget {...props} />, //React component
      //(for building query string) function to format widget's value
      formatValue: (mixed val, Object fieldDef, Object wgtDef, bool isForDisplay) => string,
      //(for building mongodb query) function to convert widget's value
      mongoFormatValue: (mixed val, Object fieldDef, Object wgtDef) => object,
      //func to validate widget's value
      validateValue: (mixed val, Object fieldDef) => bool,
      //Options:
      // common:
      valueLabel: "Text",
      valuePlaceholder: "Enter text",
      // for date/time widgets:
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD HH:mm',
      // ...for your custom widgets you can add here your options
      // also you can pass customProps, for example to enable search for select widget:
      customProps: { showSearch: true }
    },
    ...other widgets (you can add your custom ones here)
    ...also there should be special 'field' widget, see examples/demo
  },
  
  settings: {
    //Locale used for AntDesign widgets
    locale: {
        short: 'en',
        full: 'en-US',
        antd: en_US,
    },
    //To shorten long labels of fields/values (by length, i.e. number of chars)
    maxLabelsLength: 50,
    //Placement of antdesign's dropdown pop-up menu (default: 'bottomLeft')
    dropdownPlacement: 'bottomRight',
    //Don't show conjunctions switcher for only 1 rule?
    hideConjForOne: true,
    //Size of AntDesign components
    renderSize: 'small',
    //How to render conjunctions switcher? true - use RadioGroup, false - use ButtonGroup
    renderConjsAsRadios: false,
    //How to render fields/ops list? true - use Dropdown/Menu, false - use Select
    renderFieldAndOpAsDropdown: false,
    //You can pass props to Select field widget
    customFieldSelectProps: {
        showSearch: true
    },
    // You can change the position of the group actions to the following:
    // oneOf [topLeft, topCenter, topRight (default), bottomLeft, bottomCenter, bottomRight]
    groupActionsPosition: 'topRight', 
    //Strategies for selecting operator for new field (used by order until success)
    // 'default' (default if present), 'keep' (keep prev from last field), 'first', 'none'
    setOpOnChangeField: ['keep', 'default'],
    //Clear value on field change? false - if prev & next fields have same type (widget), keep
    clearValueOnChangeField: false,
    //Clear value on operator change?
    clearValueOnChangeOp: false,
    //?
    setDefaultFieldAndOp: false,
    //Max nesting for rule groups
    maxNesting: 10,
    //Separaor for struct fields
    fieldSeparator: '.', //also used for formatting
    fieldSeparatorDisplay: '->', //used for toggler's text for renderFieldAndOpAsDropdown==true
    //Show labels under all ui fields?
    showLabels: false,
    //Show NOT together with AND/OR?
    showNot: true,
    //Next options are for localization:
    valueLabel: "Value",
    valuePlaceholder: "Value",
    fieldLabel: "Field",
    operatorLabel: "Operator",
    fieldPlaceholder: "Select field",
    operatorPlaceholder: "Select operator",
    deleteLabel: null,
    addGroupLabel: "Add group",
    addRuleLabel: "Add rule",
    //Not allow to add/delete rules or groups, but allow change
    immutableGroupsMode: false,
    notLabel: "Not",
    //If you want to ask confirmation of removing non-empty rule/group, add these options
    //List of all valid properties: https://ant.design/components/modal/#API
    removeRuleConfirmOptions: {
        title: 'Are you sure delete this rule?',
        okText: 'Yes',
        okType: 'danger',
    },
    removeGroupConfirmOptions: {
        title: 'Are you sure delete this group?',
        okText: 'Yes',
        okType: 'danger',
    },
    delGroupLabel: null,
    valueSourcesPopupTitle: "Select value source",
    //Leave empty group after deletion or add 1 clean rule immediately?
    canLeaveEmptyGroup: true, //after deletion
    //(for building query string) function to format rule with reverse operator 
    // which haven't 'formatOp'
    // q - already formatted rule for opposite operator (which have 'formatOp')
    // return smth like "NOT(" + q + ")"
    formatReverse: (string q, string operator, string reversedOp, Object operatorDefinition, 
      Object revOperatorDefinition, bool isForDisplay) => string,
    //(for building query string) function to format field
    // parts - for struct field
    // label2 - with using of 'fieldSeparatorDisplay'
    //just return field (or label2 for isForDisplay==true)
    formatField: (string field, Array parts, string label2, Object fieldDefinition, Object config, 
      bool isForDisplay) => string,
    //Values of fields can be compared with values or another fields
    //If you want to disable this feature and leave only comparing with values, remove 'field'
    valueSourcesInfo: {
      value: {
        label: "Value"
      },
      field: {
        label: "Field",
        widget: "field",
      }
    },
    //Activate reordering support for rules and groups of rules?
    canReorder: true,
    //Allow move rules (or groups) in/out groups during reorder?
    //(False - allow "safe" reorder, means only reorder at same level)
    canRegroup: true,
    //(For comparing field with field) Function for building right list of fields to compare
    canCompareFieldWithField: (string leftField, Object leftFieldConfig, string rightField, 
      Object rightFieldConfig) => {
        //for type == 'select'/'multiselect' you can check listValues
        return true;
    },
  },
}

```


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

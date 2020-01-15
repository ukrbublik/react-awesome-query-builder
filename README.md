# react-awesome-query-builder
[![npm](https://img.shields.io/npm/v/react-awesome-query-builder.svg)](https://www.npmjs.com/package/react-awesome-query-builder) [![github](https://img.shields.io/github/package-json/v/ukrbublik/react-awesome-query-builder.svg)](https://github.com/ukrbublik/react-awesome-query-builder/packages/48416) [![travis](https://travis-ci.org/ukrbublik/react-awesome-query-builder.svg?branch=master)](https://github.com/ukrbublik/react-awesome-query-builder)

[![Open in codesandbox.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox?module=%2Fsrc%2Fdemo%2Fconfig.js)

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
  - structs (will be displayed in selectbox as tree)
  - custom type (dev should add its own widget component in config for this)
- Comparison operators can be:
  - binary (== != < > ..)
  - unary (is empty, is null)
  - 'between' (for numbers)
  - complex operators like 'proximity'
- Values of fields can be compared with:
  - values
  - another fields (of same type)
  - function (argumentss also can be values/fields/funcs)
- Reordering (drag-n-drop) support for rules and groups of rules
- Using awesome [Ant Design](https://ant.design/) (but using custom widgets of another framework is possible)
- Export to MongoDb, SQL, [JsonLogic](http://jsonlogic.com) or your custom format
- Import from [JsonLogic](http://jsonlogic.com)
- TypeScript support (see [types](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/index.d.ts) and [demo in TS](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo))


## Getting started
Install: `npm i react-awesome-query-builder`  
See [basic usage](#usage) and [API](#api) below.  
Also see [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo) (TS) or [`sandbox/src/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/sandbox/src/demo) (JS) for more advanced usage and configuration.



## Usage
```javascript
import React, {Component} from 'react';
import {Query, Builder, BasicConfig, Utils as QbUtils} from 'react-awesome-query-builder';
import 'react-awesome-query-builder/css/antd.less';
// or import "antd/dist/antd.css";
import 'react-awesome-query-builder/css/styles.scss';
import 'react-awesome-query-builder/css/compact_styles.scss'; //optional, for more compact styles

// You need to provide your own config. See below 'Config format'
const config = {
  ...BasicConfig,
  fields: {
    qty: {
        label: 'Qty',
        type: 'number',
        fieldSettings: {
            min: 0,
        },
        valueSources: ['value'],
        preferWidgets: ['number'],
    },
    price: {
        label: 'Price',
        type: 'number',
        valueSources: ['value'],
        fieldSettings: {
            min: 10,
            max: 100,
        },
        preferWidgets: ['slider', 'rangeslider'],
    },
    color: {
        label: 'Color',
        type: 'select',
        valueSources: ['value'],
        listValues: [
          { value: 'yellow', title: 'Yellow' },
          { value: 'green', title: 'Green' },
          { value: 'orange', title: 'Orange' }
        ],
    },
    is_promotion: {
        label: 'Promo?',
        type: 'boolean',
        operators: ['equal'],
        valueSources: ['value'],
    },
  }
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue = {"id": QbUtils.uuid(), "type": "group"};


class DemoQueryBuilder extends Component {
    state = {
      tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
      config: config
    };
    
    render = () => (
      <div>
        <Query
            {...config} 
            value={this.state.tree}
            onChange={this.onChange}
            renderBuilder={this.renderBuilder}
        />
        {this.renderResult(this.state)}
      </div>
    )

    renderBuilder = (props) => (
      <div className="query-builder-container" style={{padding: '10px'}}>
        <div className="query-builder qb-lite">
            <Builder {...props} />
        </div>
      </div>
    )

    renderResult = ({tree: immutableTree, config}) => (
      <div className="query-builder-result">
          <div>Query string: <pre>{JSON.stringify(QbUtils.queryString(immutableTree, config))}</pre></div>
          <div>MongoDb query: <pre>{JSON.stringify(QbUtils.mongodbFormat(immutableTree, config))}</pre></div>
          <div>SQL where: <pre>{JSON.stringify(QbUtils.sqlFormat(immutableTree, config))}</pre></div>
          <div>JsonLogic: <pre>{JSON.stringify(QbUtils.jsonLogicFormat(immutableTree, config))}</pre></div>
      </div>
    )
    
    onChange = (immutableTree, config) => {
      // Tip: for better performance you can apply `throttle` - see `examples/demo`
      this.setState({tree: immutableTree, config: config});

      const jsonTree = QbUtils.getTree(immutableTree);
      console.log(jsonTree);
      // `jsonTree` can be saved to backend, and later loaded to `queryValue`
    }
}
```


## API

### `<Query />`
Props:
- `{...config}` - destructured query [`CONFIG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CONFIG.adoc)
- `value` - query value in internal [Immutable](https://immutable-js.github.io/immutable-js/) format
- `onChange` - callback when value changed. Params: `value` (in Immutable format), `config`.
- `renderBuilder` - function to render query builder itself. Takes 1 param `props` you need to pass into `<Builder {...props} />`.

*Notes*:
- If you put query builder component inside [Material-UI](https://github.com/mui-org/material-ui)'s `<Dialog />` or `<Popover />`, please:
  - use prop `disableEnforceFocus={true}` for dialog or popver
  - set css `.MuiPopover-root, .MuiDialog-root { z-index: 1000 !important; }`

### `<Builder />`
Render this component only inside `Query.renderBuilder()` like in example above:
```js
  renderBuilder = (props) => (
    <div className="query-builder-container">
      <div className="query-builder qb-lite">
          <Builder {...props} />
      </div>
    </div>
  )
```
Wrapping `<Builder />` in `div.query-builder` is necessary.  
Optionally you can add class `.qb-lite` to it for showing action buttons (like delete rule/group, add, etc.) only on hover, which will look cleaner.  
Wrapping in `div.query-builder-container` is necessary if you put query builder inside scrollable block.  

### `Utils`
- Save, load:
  #### getTree (immutableValue) -> Object
  Convert query value from internal Immutable format to JS format. 
  You can use it to save value on backend in `onChange` callback of `<Query>`.
  #### loadTree (jsValue, config) -> Immutable
  Convert query value from JS format to internal Immutable format. 
  You can use it to load saved value from backend and pass as `value` prop to `<Query>` (don't forget to also apply `checkTree()`).
  #### checkTree (immutableValue, config) -> Immutable
  Validate query value corresponding to config. 
  Invalid parts of query (eg. if field was removed from config) will be deleted.
- Export:
  #### queryString (immutableValue, config, isForDisplay) -> String
  Convert query value to custom string representation. `isForDisplay` = true can be used to make string more "human readable".
  #### mongodbFormat (immutableValue, config) -> Object
  Convert query value to MongoDb query object.
  #### sqlFormat (immutableValue, config) -> String
  Convert query value to SQL where string.
  #### jsonLogicFormat (immutableValue, config) -> {logic, data, errors}
  Convert query value to [JsonLogic](http://jsonlogic.com) format. 
  If there are no `errors`, `logic` will be rule object and `data` will contain all used fields with null values ("template" data).
- Import:
  #### loadFromJsonLogic (jsonLogicObject, config) -> Immutable
  Convert query value from [JsonLogic](http://jsonlogic.com) format to internal Immutable format. 



## Config format
See [`CONFIG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CONFIG.adoc)


## Changelog
See [`CHANGELOG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CHANGELOG.md)


## Development
To build the component locally, clone this repo then run:

`npm install`
`npm run examples`

Then open localhost:3001 in a browser.

Scripts:
- `npm run examples` - Builds with webpack the examples and runs a dev-server on localhost:3001.
- `npm run build-examples` - Builds with webpack the examples. Output path: `examples`
- `npm run build-npm` - Builds a npm module. Output path: `build/npm`

The repo sticks in general to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)


## License
MIT. See also `LICENSE.txt`

Forked from [https://github.com/fubhy/react-query-builder](https://github.com/fubhy/react-query-builder)

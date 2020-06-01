# react-awesome-query-builder
[![npm](https://img.shields.io/npm/v/react-awesome-query-builder.svg)](https://www.npmjs.com/package/react-awesome-query-builder) [![github](https://img.shields.io/github/package-json/v/ukrbublik/react-awesome-query-builder.svg)](https://github.com/ukrbublik/react-awesome-query-builder/packages/48416) [![travis](https://travis-ci.org/ukrbublik/react-awesome-query-builder.svg?branch=master)](https://github.com/ukrbublik/react-awesome-query-builder) [![codecov](https://codecov.io/gh/ukrbublik/react-awesome-query-builder/branch/master/graph/badge.svg)](https://codecov.io/gh/ukrbublik/react-awesome-query-builder) [![Financial Contributors on Open Collective](https://opencollective.com/react-awesome-query-builder/all/badge.svg?label=financial+contributors)](https://opencollective.com/react-awesome-query-builder)


[![Open in codesandbox.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox?file=/src/demo/config_simple.tsx)

User-friendly React component to build queries.

Inspired by [jQuery QueryBuilder](http://querybuilder.js.org/)

Using awesome [Ant Design](https://ant.design/) v4 for widgets

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
  - function (arguments also can be values/fields/funcs)
- Reordering (drag-n-drop) support for rules and groups of rules
- Using awesome [Ant Design](https://ant.design/) as UI framework with rich features.  
  (But using custom widgets of another framework is possible, see below)
- Export to MongoDb, SQL, [JsonLogic](http://jsonlogic.com) or your custom format
- Import from [JsonLogic](http://jsonlogic.com)
- TypeScript support (see [types](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/index.d.ts) and [demo in TS](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo))


## Getting started
Install: `npm i react-awesome-query-builder`  
See [basic usage](#usage) and [API](#api) below.  
Also see [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo) or [`sandbox/src/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/sandbox/src/demo) for more advanced usage and configuration.


## v2 Migration
From v2.0 of this lib AntDesign is now optional (peer) dependency, so you need to explicitly include `antd` (4.x) in `package.json` of your project if you want to use AntDesign UI.  
Please import `AntdConfig` from `react-awesome-query-builder/lib/config/antd` and use it as base for your config (see below in [usage](#usage)).  
Alternatively you can use `BasicConfig` for simple vanilla UI, which is by default.  
Support of other UI frameworks (like Bootstrap, Material UI) are planned for future, see [Other UI frameworks](#other-ui-frameworks).


## Usage
```javascript
import React, {Component} from 'react';
import {Query, Builder, BasicConfig, Utils as QbUtils} from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import 'react-awesome-query-builder/css/antd.less'; // or import "antd/dist/antd.css";
import 'react-awesome-query-builder/css/styles.scss';
import 'react-awesome-query-builder/css/compact_styles.scss'; //optional, for more compact styles
const InitialConfig = AntdConfig; // or BasicConfig

// You need to provide your own config. See below 'Config format'
const config = {
  ...InitialConfig,
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


## Other UI frameworks
Currently there are 2 collections of widgets:
- [antdesign widgets](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/components/widgets/antd)
- [vanilla widgets](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/components/widgets/vanilla)

Let's say you want to create new collection of Bootstrap widgets to be used in this lib (and submit PR which is always welcomed!).  
You can use vanilla widgets as skeleton.  
Then to enable new widgets you need to create config overrides like this:
[antdesign config](https://github.com/ukrbublik/react-awesome-query-builder/blob/master/modules/config/antd/index.js)


## Development
To build the component locally, clone this repo then run:  
`npm install`  
`npm run examples`  
Then open localhost:3001 in a browser.

Scripts:
- `npm run examples` - Builds with webpack the examples and runs a dev-server on localhost:3001.
- `npm run build-examples` - Builds with webpack the examples. Output path: `examples`
- `npm run build-npm` - Builds a npm module. Output path: `lib`

The repo sticks in general to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)


## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/ukrbublik/react-awesome-query-builder/graphs/contributors"><img src="https://opencollective.com/react-awesome-query-builder/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/react-awesome-query-builder/contribute)]

#### Individuals

<a href="https://opencollective.com/react-awesome-query-builder"><img src="https://opencollective.com/react-awesome-query-builder/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/react-awesome-query-builder/contribute)]

<a href="https://opencollective.com/react-awesome-query-builder/organization/0/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/1/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/2/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/3/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/4/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/5/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/6/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/7/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/8/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/react-awesome-query-builder/organization/9/website"><img src="https://opencollective.com/react-awesome-query-builder/organization/9/avatar.svg"></a>

## License
MIT. See also `LICENSE.txt`

Forked from [https://github.com/fubhy/react-query-builder](https://github.com/fubhy/react-query-builder)

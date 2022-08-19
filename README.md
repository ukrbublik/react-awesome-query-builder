
<p align="center">
  <a href="https://ukrbublik.github.io/react-awesome-query-builder/" rel="noopener" target="_blank"><img src="https://raw.githubusercontent.com/ukrbublik/react-awesome-query-builder/gh-pages/logo_full_200.png" /></a>
</p>
<! --
[![travis](https://travis-ci.org/ukrbublik/react-awesome-query-builder.svg?branch=master)](https://travis-ci.com/github/ukrbublik/react-awesome-query-builder) 
[![Financial Contributors on Open Collective](https://opencollective.com/react-awesome-query-builder/all/badge.svg?label=financial+contributors)](https://opencollective.com/react-awesome-query-builder)
-->

[![npm](https://img.shields.io/npm/v/react-awesome-query-builder.svg)](https://www.npmjs.com/package/react-awesome-query-builder)
[![Smoke](https://github.com/ukrbublik/react-awesome-query-builder/actions/workflows/smoke.yml/badge.svg?text=Test)](https://github.com/ukrbublik/react-awesome-query-builder/actions/workflows/smoke.yml?query=branch%3Amaster)
[![travis](https://travis-ci.org/ukrbublik/react-awesome-query-builder.svg?branch=master)](https://travis-ci.com/github/ukrbublik/react-awesome-query-builder) 
[![codecov](https://codecov.io/gh/ukrbublik/react-awesome-query-builder/branch/master/graph/badge.svg?date=20201002)](https://codecov.io/gh/ukrbublik/react-awesome-query-builder)
[![antd](https://img.shields.io/badge/skin-Ant%20Design-blue?logo=Ant%20Design)](https://ant.design)
[![mui](https://img.shields.io/badge/skin-Material%20UI-blue?logo=MUI)](https://material-ui.com)
[![bootstrap](https://img.shields.io/badge/skin-Bootstrap-blue?logo=Bootstrap)](https://reactstrap.github.io/)
[![demo](https://img.shields.io/badge/demo-blue)](https://ukrbublik.github.io/react-awesome-query-builder/)
[![sandbox TS](https://img.shields.io/badge/sandbox-TS-blue)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox?file=/src/demo/config_simple.tsx)
[![sandbox JS](https://img.shields.io/badge/sandbox-JS-blue)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox_simple?file=/src/demo/config_simple.js)


User-friendly React component to build queries (filters).

Inspired by [jQuery QueryBuilder](http://querybuilder.js.org/). 
Using awesome [Ant Design](https://ant.design/) v4 for widgets. 
Now [Material-UI](https://material-ui.com/) is also supported!

See [live demo](https://ukrbublik.github.io/react-awesome-query-builder) 

[![Open in codesandbox.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox?file=/src/demo/config_simple.tsx)

* [Features](#features)
* [Getting started](#getting-started)
* [Usage](#usage)
  * [Minimal JavaScript example with class component](#minimal-javascript-example-with-class-component)
  * [Minimal TypeScript example with function component](#minimal-typescript-example-with-function-component)
* [API](#api)
  * [Config format](#config-format)
* [Versions](#versions)
  * [Changelog](#changelog)
  * [Migration to 5.2.0](#migration-to-520)
  * [Migration to 4.9.0](#migration-to-490)
  * [Migration from v1 to v2](#migration-from-v1-to-v2)
* [Contributing](#contributing)
  * [Code Contributing](#code-contributing)
  * [Financial Contributing](#financial-contributing)


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
  - 'between' (for numbers, dates, times)
  - complex operators like 'proximity'
- Values of fields can be compared with:
  - values
  - another fields (of same type)
  - function (arguments also can be values/fields/funcs)
- Reordering (drag-n-drop) support for rules and groups of rules
- Themes:
  - [Ant Design](https://ant.design/)
  - [Material-UI](https://material-ui.com/)
  - [Bootstrap](https://reactstrap.github.io/)
  - vanilla
  (Using another UI framework and custom widgets is possible, see below)
- Export to MongoDb, SQL, [JsonLogic](http://jsonlogic.com), [SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html), ElasticSearch or your custom format
- Import from [JsonLogic](http://jsonlogic.com), [SpEL](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html)
- TypeScript support (see [types](/modules/index.d.ts) and [demo in TS](/examples))


## Getting started
Install: 
```
npm i react-awesome-query-builder --save
```

For AntDesign widgets only:
```
npm i antd @ant-design/icons --save
```

For Material-UI 4 widgets only:
```
npm i @material-ui/core @material-ui/lab @material-ui/icons @material-ui/pickers material-ui-confirm@2 --save
```

For MUI 5 widgets only:
```
npm i @mui/material @emotion/react @emotion/styled @mui/lab @mui/icons-material @mui/x-date-pickers material-ui-confirm@3 --save
```

For Bootstrap widgets only:
```
npm i bootstrap reactstrap @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome --save
```

See [basic usage](#usage) for minimum code example. 

See [API](#api) and [config](#config-format) for documentation. 

Demo apps:
- [`npm start`](/examples) - demo app with hot reload of demo code and local library code, uses TS, uses complex config to demonstrate anvanced usage.
- [`npm run sandbox-ts`](/sandbox) - demo app with hot reload of only demo code (uses latest version of library from npm), uses TS, uses AntDesign widgets.
- [`npm run sandbox-js`](/sandbox_simple) - demo app with hot reload of only demo code (uses latest version of library from npm), not uses TS, uses vanilla widgets.



## Usage

#### Minimal JavaScript example with class component
```javascript
import React, {Component} from 'react';
import {Query, Builder, BasicConfig, Utils as QbUtils} from 'react-awesome-query-builder';

// For AntDesign widgets only:
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import 'antd/dist/antd.css'; // or import "react-awesome-query-builder/css/antd.less";
// For MUI 4/5 widgets only:
import MaterialConfig from 'react-awesome-query-builder/lib/config/material';
import MuiConfig from 'react-awesome-query-builder/lib/config/mui';
// For Bootstrap widgets only:
import BootstrapConfig from "react-awesome-query-builder/lib/config/bootstrap";

import 'react-awesome-query-builder/lib/css/styles.css';
import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig; // or MaterialConfig or MuiConfig or BootstrapConfig or BasicConfig

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
        fieldSettings: {
          listValues: [
            { value: 'yellow', title: 'Yellow' },
            { value: 'green', title: 'Green' },
            { value: 'orange', title: 'Orange' }
          ],
        }
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

#### Minimal TypeScript example with function component
([Codesandbox](https://codesandbox.io/s/relaxed-sun-erhnu?file=/src/demo/demo.tsx))
```typescript
import React, { useState, useCallback } from "react";
import { Query, Builder, Utils as QbUtils } from "react-awesome-query-builder";
// types
import {
  JsonGroup,
  Config,
  ImmutableTree,
  BuilderProps
} from "react-awesome-query-builder";

// For AntDesign widgets only:
import AntdConfig from "react-awesome-query-builder/lib/config/antd";
import "antd/dist/antd.css"; // or import "react-awesome-query-builder/css/antd.less";
// For MUI 4/5 widgets only:
//import MaterialConfig from 'react-awesome-query-builder/lib/config/material';
//import MuiConfig from 'react-awesome-query-builder/lib/config/mui';
// For Bootstrap widgets only:
//import BootstrapConfig from "react-awesome-query-builder/lib/config/bootstrap";

import "react-awesome-query-builder/lib/css/styles.css";
import "react-awesome-query-builder/lib/css/compact_styles.css"; //optional, for more compact styles

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig; // or MaterialConfig or MuiConfig or BootstrapConfig or BasicConfig

// You need to provide your own config. See below 'Config format'
const config: Config = {
  ...InitialConfig,
  fields: {
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0
      },
      valueSources: ["value"],
      preferWidgets: ["number"]
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 10,
        max: 100
      },
      preferWidgets: ["slider", "rangeslider"]
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" }
        ]
      }
    },
    is_promotion: {
      label: "Promo?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"]
    }
  }
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: "group" };

export const Demo: React.FC = () => {
  const [state, setState] = useState({
    tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
    config: config
  });

  const onChange = useCallback((immutableTree: ImmutableTree, config: Config) => {
    // Tip: for better performance you can apply `throttle` - see `examples/demo`
    setState(prevState => { ...prevState, tree: immutableTree, config: config });

    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  }, []);

  const renderBuilder = useCallback((props: BuilderProps) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  ), []);

  return (
    <div>
      <Query
        {...config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
      <div className="query-builder-result">
        <div>
          Query string:{" "}
          <pre>
            {JSON.stringify(QbUtils.queryString(state.tree, state.config))}
          </pre>
        </div>
        <div>
          MongoDb query:{" "}
          <pre>
            {JSON.stringify(QbUtils.mongodbFormat(state.tree, state.config))}
          </pre>
        </div>
        <div>
          SQL where:{" "}
          <pre>
            {JSON.stringify(QbUtils.sqlFormat(state.tree, state.config))}
          </pre>
        </div>
        <div>
          JsonLogic:{" "}
          <pre>
            {JSON.stringify(QbUtils.jsonLogicFormat(state.tree, state.config))}
          </pre>
        </div>
      </div>
    </div>
  );
};
```



## API

### `<Query />`
Props:
- `{...config}` - destructured query [`CONFIG`](/CONFIG.adoc)
- `value` - query value in internal [Immutable](https://immutable-js.github.io/immutable-js/) format
- `onChange` - callback when query value changed. Params: `value` (in Immutable format), `config`, `actionMeta` (details about action which led to the change, see `ActionMeta` in [`index.d.ts`](/modules/index.d.ts)).
- `renderBuilder` - function to render query builder itself. Takes 1 param `props` you need to pass into `<Builder {...props} />`.

*Notes*:
- Please apply `useCallback` for `onChange` and `renderBuilder` for performance reason
- If you put query builder component inside [Material-UI](https://github.com/mui-org/material-ui)'s `<Dialog />` or `<Popover />`, please:
  - use prop `disableEnforceFocus={true}` for dialog or popver
  - set css `.MuiPopover-root, .MuiDialog-root { z-index: 900 !important; }` (or 1000 for AntDesign v3)
- If you put query builder component inside [Fluent-UI](https://developer.microsoft.com/en-us/fluentui)'s `<Panel />`, please:
  - set css `.ms-Layer.ms-Layer--fixed.root-119 { z-index: 900 !important; }`
- `props` arg in `renderBuilder` have `actions` and `dispatch` you can use to run actions programmatically (for list of actions see `Actions` in [`index.d.ts`](/modules/index.d.ts)).

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
  #### getTree (immutableValue, light = true, children1AsArray = true) -> Object
  Convert query value from internal Immutable format to JS format. 
  You can use it to save value on backend in `onChange` callback of `<Query>`.  
  Tip: Use `light = false` in case if you want to store query value in your state in JS format and pass it as `value` of `<Query>` after applying `loadTree()` (which is not recommended because of double conversion). See issue [#190](https://github.com/ukrbublik/react-awesome-query-builder/issues/190)
  #### loadTree (jsValue, config) -> Immutable
  Convert query value from JS format to internal Immutable format. 
  You can use it to load saved value from backend and pass as `value` prop to `<Query>` (don't forget to also apply `checkTree()`).
  #### checkTree (immutableValue, config) -> Immutable
  Validate query value corresponding to config. 
  Invalid parts of query (eg. if field was removed from config) will be always deleted. 
  Invalid values (values not passing `validateValue` in config, bad ranges) will be deleted if `showErrorMessage` is false OR marked with errors if `showErrorMessage` is true.
  #### isValidTree (immutableValue) -> Boolean
  If `showErrorMessage` in config.settings is true, use this method to check is query has bad values.
- Export:
  #### queryString (immutableValue, config, isForDisplay = false) -> String
  Convert query value to custom string representation. `isForDisplay` = true can be used to make string more "human readable".
  #### mongodbFormat (immutableValue, config) -> Object
  Convert query value to MongoDb query object.
  #### sqlFormat (immutableValue, config) -> String
  Convert query value to SQL where string.
  #### spelFormat (immutableValue, config) -> String
  Convert query value to [Spring Expression Language (SpEL)](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html).
  #### elasticSearchFormat (immutableValue, config) -> Object
  Convert query value to ElasticSearch query object.
  #### jsonLogicFormat (immutableValue, config) -> {logic, data, errors}
  Convert query value to [JsonLogic](http://jsonlogic.com) format. 
  If there are no `errors`, `logic` will be rule object and `data` will contain all used fields with null values ("template" data).
- Import:
  #### loadFromJsonLogic (jsonLogicObject, config) -> Immutable
  Convert query value from [JsonLogic](http://jsonlogic.com) format to internal Immutable format. 
  #### _loadFromJsonLogic (jsonLogicObject, config) -> [Immutable, errors]
  #### loadFromSpel (string, config) -> [Immutable, errors]
  Convert query value from [Spring Expression Language (SpEL)](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html) format to internal Immutable format. 



### Config format
This library uses configarion driven aproach. 
Config defines what value types, operators are supported, how they are rendered, imported, exported. 
At minimum, you need to provide your own set of fields as in [basic usage](#usage). 
See [`CONFIG`](/CONFIG.adoc) for full documentation.



## Versions

Versions 5.x are backward-compatible with 2.x 3.x 4.x.  
It's recommended to update your version.

### Supported versions
| Version | Supported          |
| ------- | ------------------ |
| 5.x     | :white_check_mark: |
| 4.x     | :white_check_mark: |
| 3.x     | :white_check_mark: |
| 2.x     | :white_check_mark: |
| 1.x     | :warning:          |
| 0.x     | :x:                |

### Changelog
See [`CHANGELOG`](/CHANGELOG.md)

### Migration to 5.2.0
Breaking change: `children1` is now an indexed array (instead of object) in result of `Utils.getTree()` to preserve items order.  
Before:
```js
children1: {
  '<id1>': { type: 'rule', properties: ... },
  '<id2>': { type: 'rule', properties: ... }
}
```
After:
```js
children1: [
  { id: '<id1>', type: 'rule', properties: ... },
  { id: '<id2>', type: 'rule', properties: ... },
]
```
`Utils.loadTree()` is backward comatible with children1 being array or object.  
But if you rely on previous format (maybe do post-processing of `getTree()` result), please use `Utils.getTree(tree, true, false)` - it will behave same as before this change. 

### Migration to 4.9.0
Version 4.9.0 has a breaking change for operators `is_empty` and `is_not_empty`.  
Now these operators can be used for text type only (for other types they will be auto converted to `is_null`/`is_not_null` during loading of query value created with previous versions).  
Changed meaning of `is_empty` - now it's just strict comparing with empty string.  
Before change the meaning was similar to `is_null`.  
If you used `is_empty` for text types with intention of comparing with null, please replace `is_empty` -> `is_null`, `is_not_empty` -> `is_not_null` in saved query values.  
If you used JsonLogic for saving, you need to replace `{"!": {"var": "your_field"}}` -> `{"==": [{"var": "your_field"}, null]}` and `{"!!": {"var": "your_field"}}` -> `{"!=": [{"var": "your_field"}, null]}`.

### Migration from v1 to v2
From v2.0 of this lib AntDesign is now optional (peer) dependency, so you need to explicitly include `antd` (4.x) in `package.json` of your project if you want to use AntDesign UI.  
Please import `AntdConfig` from `react-awesome-query-builder/lib/config/antd` and use it as base for your config (see below in [usage](#usage)).  
Alternatively you can use `BasicConfig` for simple vanilla UI, which is by default.  
Support of other UI frameworks (like Bootstrap) are planned for future, see [Other UI frameworks](#other-ui-frameworks).



## Contributing

### Code Contributing

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/ukrbublik/react-awesome-query-builder/graphs/contributors"><img src="https://opencollective.com/react-awesome-query-builder/contributors.svg?width=890&button=false" /></a>

### Financial Contributing

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/react-awesome-query-builder/contribute)]

If you mention in an GitHub issue that you are a sponsor, we will prioritize helping you.

As a sponsor you can ask to implement a feature that is not in a todo list or motivate for faster implementation.

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

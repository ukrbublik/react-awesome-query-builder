# react-awesome-query-builder
[![npm](https://img.shields.io/npm/v/react-awesome-query-builder.svg)](https://www.npmjs.com/package/react-awesome-query-builder) [![travis](https://travis-ci.org/ukrbublik/react-awesome-query-builder.svg?branch=master)](https://travis-ci.com/github/ukrbublik/react-awesome-query-builder) [![Smoke](https://github.com/ukrbublik/react-awesome-query-builder/actions/workflows/smoke.yml/badge.svg)](https://github.com/ukrbublik/react-awesome-query-builder/actions/workflows/smoke.yml?query=branch%3Amaster) [![codecov](https://codecov.io/gh/ukrbublik/react-awesome-query-builder/branch/master/graph/badge.svg?date=20201002)](https://codecov.io/gh/ukrbublik/react-awesome-query-builder) [![antd](https://img.shields.io/badge/skin-Ant%20Design-blue?logo=Ant%20Design)](https://ant.design) [![mui](https://img.shields.io/badge/skin-Material%20UI-blue?logo=Material%20UI)](https://material-ui.com) [![Financial Contributors on Open Collective](https://opencollective.com/react-awesome-query-builder/all/badge.svg?label=financial+contributors)](https://opencollective.com/react-awesome-query-builder)
[![demo](https://img.shields.io/badge/demo-blue)](https://ukrbublik.github.io/react-awesome-query-builder/) [![sandbox TS](https://img.shields.io/badge/sandbox-TS-blue)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox?file=/src/demo/config_simple.tsx) [![sandbox JS](https://img.shields.io/badge/sandbox-JS-blue)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox_simple?file=/src/demo/config_simple.js)


[![Open in codesandbox.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/sandbox?file=/src/demo/config_simple.tsx)

User-friendly React component to build queries.

Inspired by [jQuery QueryBuilder](http://querybuilder.js.org/)

Using awesome [Ant Design](https://ant.design/) v4 for widgets

Now [Material-UI](https://material-ui.com/) is also supported!

[Demo page](https://ukrbublik.github.io/react-awesome-query-builder)


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
- Using awesome [Ant Design](https://ant.design/) as UI framework with rich features.  
  Now [Material-UI](https://material-ui.com/) is also supported!  
  (Using another UI framework and custom widgets is possible, see below)
- Export to MongoDb, SQL, [JsonLogic](http://jsonlogic.com) or your custom format
- Import from [JsonLogic](http://jsonlogic.com)
- TypeScript support (see [types](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/index.d.ts) and [demo in TS](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples))


## Getting started
Install: 
```
npm i react-awesome-query-builder
```

For AntDesign widgets only:
```
npm i antd
```

For Material-UI widgets only:
```
npm i @material-ui/core
npm i @material-ui/lab
npm i @material-ui/icons
npm i @material-ui/pickers
npm i material-ui-confirm
```

See [basic usage](#usage) for minimum code example. 

See [API](#api) and [config](#config-format) for documentation. 

Demo apps:
- [`npm start`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples) - demo app with hot reload of demo code and local library code, uses TS, uses complex config to demonstrate anvanced usage.
- [`npm run sandbox-ts`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/sandbox) - demo app with hot reload of only demo code (uses latest version of library from npm), uses TS, uses AntDesign widgets.
- [`npm run sandbox-js`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/sandbox_simple) - demo app with hot reload of only demo code (uses latest version of library from npm), not uses TS, uses vanilla widgets.



## Usage

#### Minimal Javascript example with class component
```javascript
import React, {Component} from 'react';
import {Query, Builder, BasicConfig, Utils as QbUtils} from 'react-awesome-query-builder';

// For AntDesign widgets only:
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import 'antd/dist/antd.css'; // or import "react-awesome-query-builder/css/antd.less";
// For Material-UI widgets only:
import MaterialConfig from 'react-awesome-query-builder/lib/config/material';

import 'react-awesome-query-builder/lib/css/styles.css';
import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig; // or MaterialConfig or BasicConfig

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
import React, { useState } from "react";
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
// For Material-UI widgets only:
//import MaterialConfig from "react-awesome-query-builder/lib/config/material";

import "react-awesome-query-builder/lib/css/styles.css";
import "react-awesome-query-builder/lib/css/compact_styles.css"; //optional, for more compact styles

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig; // or MaterialConfig or BasicConfig

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

  const onChange = (immutableTree: ImmutableTree, config: Config) => {
    // Tip: for better performance you can apply `throttle` - see `examples/demo`
    setState({ tree: immutableTree, config: config });

    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  };

  const renderBuilder = (props: BuilderProps) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  );

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
- `{...config}` - destructured query [`CONFIG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CONFIG.adoc)
- `value` - query value in internal [Immutable](https://immutable-js.github.io/immutable-js/) format
- `onChange` - callback when value changed. Params: `value` (in Immutable format), `config`.
- `renderBuilder` - function to render query builder itself. Takes 1 param `props` you need to pass into `<Builder {...props} />`.

*Notes*:
- If you put query builder component inside [Material-UI](https://github.com/mui-org/material-ui)'s `<Dialog />` or `<Popover />`, please:
  - use prop `disableEnforceFocus={true}` for dialog or popver
  - set css `.MuiPopover-root, .MuiDialog-root { z-index: 900 !important; }` (or 1000 for AntDesign v3)

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
  #### getTree (immutableValue, light = true) -> Object
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
  #### jsonLogicFormat (immutableValue, config) -> {logic, data, errors}
  Convert query value to [JsonLogic](http://jsonlogic.com) format. 
  If there are no `errors`, `logic` will be rule object and `data` will contain all used fields with null values ("template" data).
- Import:
  #### loadFromJsonLogic (jsonLogicObject, config) -> Immutable
  Convert query value from [JsonLogic](http://jsonlogic.com) format to internal Immutable format. 


### Config format
This library uses configarion driven aprroach. 
Config defines what value types, operators are supported, how they are rendered, imported, exported. 
At minimum, you need to provide your own set of fields as in [basic usage](#usage). 
See [`CONFIG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CONFIG.adoc) for full documentation.



## Versions

Versions 4.x are backward-compatible with 2.x and 3.x. 
It's recommended to update your version.

### Supported versions
| Version | Supported          |
| ------- | ------------------ |
| 4.x     | :white_check_mark: |
| 3.x     | :white_check_mark: |
| 2.x     | :white_check_mark: |
| 1.x     | :warning:          |
| 0.x     | :x:                |

### Changelog
See [`CHANGELOG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CHANGELOG.md)

### Migration from v1 to v2
From v2.0 of this lib AntDesign is now optional (peer) dependency, so you need to explicitly include `antd` (4.x) in `package.json` of your project if you want to use AntDesign UI.  
Please import `AntdConfig` from `react-awesome-query-builder/lib/config/antd` and use it as base for your config (see below in [usage](#usage)).  
Alternatively you can use `BasicConfig` for simple vanilla UI, which is by default.  
Support of other UI frameworks (like Bootstrap) are planned for future, see [Other UI frameworks](#other-ui-frameworks).



## Development
Clone this repo and run `npm start`. 
Open `http://localhost:3001/` in a browser. 
You will see demo app with hot reload of demo code and local library code. 

### Directory structure
- `modules` - Main source code of library
  - `components` - Core React components
    - `widgets` - Components to render list of fields, operators, values of different types. Built with UI frameworks
  - `config` - Basic config lives here. See [`CONFIG`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CONFIG.adoc) docs.
  - `export` - Code for export to JsonLogic, MongoDb, SQL, plain string
  - `import` - Code for import from JsonLogic
  - `actions` - Redux actions
  - `stores/tree.js` - Redux store
  - `index.d.ts` - TS definitions
- `css` - Styles for query builder
- `examples` - Demo app with hot reload of demo code and local library code, uses TS, uses complex config to demonstrate anvanced usage.
- `sandbox` - Demo app with hot reload of only demo code (uses latest version of library from npm), uses TS, uses AntDesign widgets.
- `sandbox_simple` - Demo app with hot reload of only demo code (uses latest version of library from npm), not uses TS, uses vanilla widgets.
- `tests` - All tests are here. Uses Karma, Mocha, Chai, Enzyme

### Scripts
- `npm test` - Run tests with Karma and update coverage. Requires Node.js v10+
- `npm run install-all` - Install npm packages in root, examples, sandboxes
- `npm run lint` - Run ESLint and TSC (in root, tests, examples, sandboxes)
- `npm run lint-fix` - Run ESLint with `--fix` option (in root, tests, examples, sandboxes)
- `npm run clean` - Clean all data that can be re-generated (like `node_modules`, `build`, `coverage`)
- `npm run smoke` - Run tests, lint, build lib, build examples, build sandboxes. Recommended before making PR
- `npm run build` - Build npm module to `lib`, build minified production package to `build`
- `npm run build-examples` - Build demo with webpack to `examples/build`

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)

### Other UI frameworks
Currently there are 3 collections of widgets:
- [antdesign widgets](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/components/widgets/antd)
- [material widgets](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/components/widgets/material)
- [vanilla widgets](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/modules/components/widgets/vanilla)

Let's say you want to create new collection of Bootstrap widgets to be used in this lib (and submit PR which is always welcomed!).  
You can use vanilla widgets as skeleton.  
Then to enable new widgets you need to create config overrides like this:
[material config](https://github.com/ukrbublik/react-awesome-query-builder/blob/master/modules/config/material/index.js)



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


react-awesome-query-builder is being sponsored by the following tool; please help to support us by taking a look and signing up to a free trial



## License
MIT. See also `LICENSE.txt`

Forked from [https://github.com/fubhy/react-query-builder](https://github.com/fubhy/react-query-builder)

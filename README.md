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
See [basic usage](#usage) below.  
Also see [`examples/demo`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/examples/demo) for more advanced usage and configuration.


## Usage
```javascript
import React, {Component} from 'react';
import {Query, Builder, BasicConfig, Utils as QbUtils} from 'react-awesome-query-builder';
import 'react-awesome-query-builder/css/antd.less';
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
        listValues: {
            yellow: 'Yellow',
            green: 'Green',
            orange: 'Orange'
        },
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
          <div>Query string: <pre>{JSON.stringify(QbUtils.queryString(immutableTree, config))}</pre></div>
          <div>Mongodb query: <pre>{JSON.stringify(QbUtils.mongodbFormat(immutableTree, config))}</pre></div>
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

- Please wrap `<Builder />` in `div.query-builder`.  
  Wrapping in `div.query-builder-container` in not necessary, but if you want to make query builder scrollable, it's best place to apply appropriate styles.
- Use can save query value in `onChange` callback.  
  Note that value will be in [`Immutable`](https://immutable-js.github.io/immutable-js/) format, so you can use `QbUtils.getTree()` to convert it into JS object.  
  You can store it on backend, and load later by passing in `value` prop of `<Query />`.


## Config format
See [`CONFIG.md`](https://github.com/ukrbublik/react-awesome-query-builder/tree/master/CONFIG.md)


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

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)


## Changelog
- 1.0
  - optimized renders & dragging
  - added: `allowCustomValues` (issue #88)
  - added: `canRegroup`
  - rename: `readonlyMode` -> `immutableGroupsMode`
  - rename: `get_children` -> `renderBuilder`  ####### todo (old  name is supported)
  - change: query value now can be exported to JSON (instead of `Immutable.Map`), and loaded with `loadTree`  (old format is supported)
  - removed: unused `<Preview />` component and `.query-preview` class
  - change: removed `renderFieldAndOpAsDropdown`, replaced by `renderField`
  - added `renderOperator`


## License
MIT. See also `LICENSE.txt`

Forked from [https://github.com/fubhy/react-query-builder](https://github.com/fubhy/react-query-builder)

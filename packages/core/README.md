# @react-awesome-query-builder/core

[![npm](https://img.shields.io/npm/v/@react-awesome-query-builder/core.svg)](https://www.npmjs.com/package/@react-awesome-query-builder/core)

This package has core functionality to import/export/store query, provides utils and core config. 
Can be used on server-side, does not require React.

## Installation

```
npm i @react-awesome-query-builder/core --save
```

## Usage

```js
import {
  CoreConfig, Utils,
  // types
  TreeStore, TreeState, TreeActions, InputAction, JsonTree
} from '@react-awesome-query-builder/core';

// config
const config = {
  ...CoreConfig,
  fields: {
    name: {
      label: 'Name',
      type: 'text',
    },
    age: {
      label: 'Age',
      type: 'number',
    }
  }
};

// load from JSON
const initialTree = Utils.loadTree({
  id: '00001',
  type: 'group',
  children1: [
    {
      id: '00002',
      type: 'rule',
      properties: {
        field: 'age',
        operator: 'greater_or_equal',
        value: [18],
        valueSrc: ['value']
      }
    }
  ]
});
// or import from jsonLogic
// const initialTree = Utils.loadFromJsonLogic({
//   'and': [
//     {
//       '<=': [
//         {var: 'age'},
//         18
//       ]
//     }
//   ]
// }, config);

// create store to manipulate tree on backend
const reducer = TreeStore(config);
let state: TreeState = reducer({tree: initialTree});

// add rule `name == 'denis'`
const rootPath = [ state.tree.get('id') as string ];
const action = TreeActions.tree.addRule(config, rootPath, {
  field: 'name',
  operator: 'equal',
  value: ['denis'],
  valueSrc: ['value'],
  valueType: ['text']
});
state = reducer(state, action);

// export
const tree = Utils.getTree(state.tree);
const { logic } = Utils.jsonLogicFormat(state.tree, config);
const sql = Utils.sqlFormat(state.tree, config);
const spel = Utils.sqlFormat(state.tree, config);
const mongo = Utils.mongodbFormat(state.tree, config);
const elastic = Utils.elasticSearchFormat(state.tree, config);
console.log({ tree, logic, sql, spel, mongo, elastic });

```

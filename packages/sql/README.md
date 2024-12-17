# @react-awesome-query-builder/sql

[![npm](https://img.shields.io/npm/v/@react-awesome-query-builder/sql.svg)](https://www.npmjs.com/package/@react-awesome-query-builder/sql)

This packages provides import from SQL using [node-sql-parser](https://www.npmjs.com/package/node-sql-parser)

## Installation

Install:

```sh
npm i @react-awesome-query-builder/sql --save
```

## Usage

```js
import { SqlUtils } from "@react-awesome-query-builder/sql";

const importFromSql = () => {
  const sqlStr = "num <> 2";
  const {tree, errors: sqlErrors, warnings: sqlWarnings} = SqlUtils.loadFromSql(sqlStr, state.config);
  const {fixedTree} = Utils.sanitizeTree(tree, state.config);
  setState({
    ...state, 
    tree: fixedTree,
  });
};

```

# @react-awesome-query-builder/material

This packages provides [Material-UI v4](https://v4.mui.com/) widgets

## Installation

Peer dependencies that needs to be installed:
```
npm i @material-ui/core @material-ui/lab @material-ui/icons @material-ui/pickers --save
```

Install:
```
npm i @react-awesome-query-builder/material --save
```

## Usage

```js
import { Query, Builder } from '@react-awesome-query-builder/material';
import { MaterialConfig, MaterialWidgets } from "@react-awesome-query-builder/material";
import '@react-awesome-query-builder/material/css/styles.css';

cosnt config = {
  ...MaterialConfig,
  // your config
};
// use <Query {...config} /> 
```


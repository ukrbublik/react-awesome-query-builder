# @react-awesome-query-builder/mui

This packages provides [MUI](https://mui.com/) widgets

## Installation

Peer dependencies that needs to be installed:
```
npm i @mui/material @emotion/react @emotion/styled @mui/lab @mui/icons-material @mui/x-date-pickers --save
```

Install:
```
npm i @react-awesome-query-builder/mui --save
```

## Usage

```js
import { Query, Builder } from '@react-awesome-query-builder/mui';
import { MuiConfig, MuiWidgets } from "@react-awesome-query-builder/mui";
import '@react-awesome-query-builder/mui/css/styles.css';

cosnt config = {
  ...MuiConfig,
  // your config
};
// use <Query {...config} /> 
```


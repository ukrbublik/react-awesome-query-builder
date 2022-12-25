# @react-awesome-query-builder/antd

This packages provides [Ant Design](https://ant.design/) widgets.

## Installation

Peer dependencies that needs to be installed:
```
npm i antd @ant-design/icons --save
```

Install:
```
npm i @react-awesome-query-builder/antd --save
```

## Usage

```js
import { Query, Builder } from '@react-awesome-query-builder/antd';
import { AntdConfig, AntdWidgets } from "@react-awesome-query-builder/antd";
import "antd/dist/antd.css";
import '@react-awesome-query-builder/antd/css/styles.css';

cosnt config = {
  ...AntdConfig,
  // your config
};
// use <Query {...config} /> 
```

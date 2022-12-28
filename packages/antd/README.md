# @react-awesome-query-builder/antd

[![npm](https://img.shields.io/npm/v/@react-awesome-query-builder/antd.svg)](https://www.npmjs.com/package/@react-awesome-query-builder/antd)

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

Use `AntdConfig`. 
Don't forget to import AntDesign CSS: `antd/dist/antd.css`. 

See [minimal example in readme](https://github.com/ukrbublik/react-awesome-query-builder#usage) with modifications at top:
```js
// >>>
import type { JsonGroup, Config, ImmutableTree, BuilderProps } from '@react-awesome-query-builder/antd'; // for TS example
import { Query, Builder, Utils as QbUtils } from '@react-awesome-query-builder/antd';
import { AntdConfig, AntdWidgets } from '@react-awesome-query-builder/antd';
import "antd/dist/antd.css";
import '@react-awesome-query-builder/antd/css/styles.css';
const InitialConfig = AntdConfig;
// <<<
```

# @react-awesome-query-builder/bootstrap

This packages provides [Bootstrap](https://reactstrap.github.io/) widgets

## Installation

Peer dependencies that needs to be installed:
```
npm i bootstrap reactstrap @popperjs/core @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome --save
```

Install:
```
npm i @react-awesome-query-builder/bootstrap --save
```

## Usage

```js
import { Query, Builder } from '@react-awesome-query-builder/bootstrap';
import { BootstrapConfig, BootstrapWidgets } from "@react-awesome-query-builder/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import '@react-awesome-query-builder/bootstrap/css/styles.css';

cosnt config = {
  ...BootstrapConfig,
  // your config
};
// use <Query {...config} /> 
```


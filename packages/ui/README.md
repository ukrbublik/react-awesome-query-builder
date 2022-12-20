# @react-awesome-query-builder/ui

This package has core React components like `<Query>` `<Builder>` and CSS, provides config with basic (vanilla) widgets.

## Usage

```js
import {
  Query, Builder, BasicConfig, VanillaWidgets,
  //types:
  BuilderProps
} from "@react-awesome-query-builder/ui";

import '@react-awesome-query-builder/ui/css/styles.css';
import '@react-awesome-query-builder/ui/css/compact_styles.css'; //optional, for more compact styles

cosnt config = {
  ...BasicConfig,
  // your config
};
// use <Query {...config} /> 
```

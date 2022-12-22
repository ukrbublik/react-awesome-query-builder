# Contributing

Feel free to open PRs to fix bugs, add new features, add new reusable types/widgets/operators (eg., regex operator/widget, IP type/widget).  

* [Development](#development)
  * [Directory structure](#directory-structure) 
  * [Scripts](#scripts)
  * [Other UI frameworks](#other-ui-frameworks)


## Development
Clone this repo, install `npm 7+` and run `npm start`. 
Open `http://localhost:3001/` in a browser. 
You will see demo app with hot reload of demo code and local library code. 

### Directory structure
- [`packages/core/modules`](/packages/core/modules) - Core functionality, does not depend from React
  - [`config`](/packages/core/modules/config) - Core config. See [`CONFIG`](/CONFIG.adoc) docs.
  - [`export`](/packages/core/modules/export) - Code for export to JsonLogic, MongoDb, SQL, ElasticSearch, plain string, SpEL
  - [`import`](/packages/core/modules/import) - Code for import from JsonLogic, SpEL
  - [`stores`](/packages/core/modules/stores) - Tree store reducer
  - [`actions`](/packages/core/modules/actions) - Actions to dispatch on store
  - [`index.d.ts`](/packages/core/modules/index.d.ts) - TS definitions
- [`packages/ui/modules`](/packages/ui/modules) - Core React components
  - [`stores`](/packages/ui/modules/stores) - Tree store reducer for Redux (reused from `core`)
  - [`actions`](/packages/ui/modules/actions) - Actions to dispatch on store (reused from `core`, added `drag`)
  - [`config`](/packages/ui/modules/config) - Basic config with vanilla widgets (extends core config with `factory` methods to render UI components)
  - [`hooks`](/packages/ui/modules/hooks) - Hooks. Contains useful hook for autocomplete for other UI frameworks
  - [`components`](/packages/ui/modules/components) - Core React components
    - [`item`](/packages/ui/modules/components/item) - Components representing building blocks of query - rule, group, more complex "rule-group" and switch/case (for ternary mode in SpEL)
    - [`containers`](/packages/ui/modules/components/containers) - Containers to support drag-n-drop
    - [`operators`](/packages/ui/modules/components/operators) - Custom operators (proximity)
    - [`rule`](/packages/ui/modules/components/rule) - Components representing building blocks of rule - field, operator, widget
    - [`widgets`](/packages/ui/modules/components/widgets) - Vanilla widgets - components to render list of fields, operators, values of different types
  - [`index.d.ts`](/packages/ui/modules/index.d.ts) - TS definitions
- [`packages/ui/css`](/packages/ui/css) - Styles for query builder
- [`packages/antd`](/packages/antd) - Provides config with [Ant Design](https://ant.design/) widgets
- [`packages/mui`](/packages/mui) - Provides config with [MUI](https://mui.com/) widgets
- [`packages/material`](/packages/material) - Provides config with [Material-UI v4](https://v4.mui.com/) widgets
- [`packages/bootstrap`](/packages/bootstrap) - Provides config with [Bootstrap](https://reactstrap.github.io/) widgets
- [`packages/examples`](/packages/examples) - Demo app with hot reload of demo code and local library code, uses TS, uses complex config to demonstrate anvanced usage.
  - [`demo`](/packages/examples/demo) - Advanced demo
  - [`demo_switch`](/packages/examples/demo_switch) - Demo of ternary mode (switch/case) for SpEL
- [`packages/sandbox`](/packages/sandbox) - Demo app with hot reload of only demo code (uses latest version of library from npm), uses TS, uses AntDesign widgets.
- [`packages/sandbox_simple`](/packages/sandbox_simple) - Demo app with hot reload of only demo code (uses latest version of library from npm), not uses TS, uses vanilla widgets.
- [`packages/tests`](/packages/tests) - All tests are here. Uses Karma, Mocha, Chai, Enzyme

### Scripts
- `npm i` - Install packages in all workspaces. **Required for other scripts!**
- `npm run build` - Build all packages and examples
- `npm run test` - Run tests with Karma and update coverage.
- `npm run lint` - Run ESLint and TSC (in all workspaces)
- `npm run lint-fix` - Run ESLint with `--fix` option (in in all workspaces)
- `npm run clean` - Clean all data that can be re-generated (like `node_modules`, `build`, `coverage`)
- `npm run smoke` - Run lint, test, build all packages and examples. Recommended before making PR
- `npm run build-examples` - Build only examples with webpack to `packages/examples/build`

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)

### Other UI frameworks
Currently there are 5 collections of widgets:
- [vanilla widgets](/packages/ui/modules/components/widgets/vanilla)
- [antdesign widgets](/packages/antd)
- [material v4 widgets](/packages/material)
- [mui v5 widgets](/packages/mui)
- [bootstrap widgets](/packages/bootstrap)

Let's say you want to create new collection of widgets for new UI framework X to be used in this lib (and submit PR which is always welcomed!).  
You can use any of this packages as a skeleton, eg. [mui](/packages/mui). I don't recommend to take [antd](/packages/antd) as example as it's more complicated.  
Create new package `@react-awesome-query-builder/x` in [packages](/packages). 
For a playground integrate it in [examples](/packages/examples) - add to `dependecies` in [package.json](/packages/examples/package.json), `paths` in [tsconfig.json](/packages/examples/tsconfig.json), `aliases` in [webpack.config.js](/packages/examples/webpack.config.js), `skinToConfig` in [config.tsx](/packages/examples/demo/config.tsx).


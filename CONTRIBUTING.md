# Contributing

Feel free to open PRs to fix bugs, add new features, add new reusable types/widgets/operators (eg., regex operator/widget, IP type/widget).  

* [Development](#development)
  * [Directory structure](#directory-structure) 
  * [Scripts](#scripts)
  * [Other UI frameworks](#other-ui-frameworks)


## Development
Clone this repo and run `yarn start`. 
Open `http://localhost:3001/` in a browser. 
You will see demo app with hot reload of demo code and local library code. 

### Directory structure
- [`packages/core/modules`](/packages/core/modules) - Main source code of library
  - [`components`](/packages/core/modules/components) - Core React components
    - [`widgets`](/packages/core/modules/components/widgets) - Components to render list of fields, operators, values of different types. Built with UI frameworks
  - [`config`](/packages/core/modules/config) - Basic config lives here. See [`CONFIG`](/CONFIG.adoc) docs.
  - [`export`](/packages/core/modules/export) - Code for export to JsonLogic, MongoDb, SQL, ElasticSearch, plain string
  - [`import`](/packages/core/modules/import) - Code for import from JsonLogic
  - [`actions`](/packages/core/modules/actions) - Redux actions
  - [`stores/tree.js`](/packages/core/modules/stores/tree.js) - Redux store
  - [`index.d.ts`](/packages/core/modules/index.d.ts) - TS definitions
- [`packages/core/css`](/packages/core/css) - Styles for query builder
- [`packages/examples`](/packages/examples) - Demo app with hot reload of demo code and local library code, uses TS, uses complex config to demonstrate anvanced usage.
- [`packages/sandbox`](/packages/sandbox) - Demo app with hot reload of only demo code (uses latest version of library from npm), uses TS, uses AntDesign widgets.
- [`packages/sandbox_simple`](/packages/sandbox_simple) - Demo app with hot reload of only demo code (uses latest version of library from npm), not uses TS, uses vanilla widgets.
- [`packages/tests`](/packages/tests) - All tests are here. Uses Karma, Mocha, Chai, Enzyme

### Scripts
- `yarn` - Install packages in all workspaces. **Required for other scripts!**
- `yarn test` - Run tests with Karma and update coverage.
- `yarn lint` - Run ESLint and TSC (in all workspaces)
- `yarn lint-fix` - Run ESLint with `--fix` option (in in all workspaces)
- `yarn clean` - Clean all data that can be re-generated (like `node_modules`, `build`, `coverage`)
- `yarn smoke` - Run tests, lint, build lib, build examples, build sandboxes. Recommended before making PR
- `yarn build` - Build npm module to `lib`, build minified production package to `build`
- `yarn build-examples` - Build demo with webpack to `packages/examples/build`

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)

### Other UI frameworks
Currently there are 5 collections of widgets:
- [antdesign widgets](/packages/core/modules/components/widgets/antd)
- [material widgets](/packages/core/modules/components/widgets/material)
- [mui widgets](/packages/core/modules/components/widgets/mui)
- [bootstrap widgets](/packages/core/modules/components/widgets/bootstrap)
- [vanilla widgets](/packages/core/modules/components/widgets/vanilla)

Let's say you want to create new collection of Bootstrap widgets to be used in this lib (and submit PR which is always welcomed!).  
You can use vanilla widgets as skeleton.  
Then to enable new widgets you need to create config overrides like this:
[material config](/packages/core/modules/config/material/index.jsx)


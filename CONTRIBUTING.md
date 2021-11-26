# Contributing

Feel free to open PRs to fix bugs, add new features, add new reusable types/widgets/operators (eg., regex operator/widget, IP type/widget).  

* [Development](#development)
  * [Directory structure](#directory-structure) 
  * [Scripts](#scripts)
  * [Other UI frameworks](#other-ui-frameworks)


## Development
Clone this repo and run `npm start`. 
Open `http://localhost:3001/` in a browser. 
You will see demo app with hot reload of demo code and local library code. 

### Directory structure
- [`modules`](/modules) - Main source code of library
  - [`components`](/modules/components) - Core React components
    - [`widgets`](/modules/components/widgets) - Components to render list of fields, operators, values of different types. Built with UI frameworks
  - [`config`](/modules/config) - Basic config lives here. See [`CONFIG`](/CONFIG.adoc) docs.
  - [`export`](/modules/export) - Code for export to JsonLogic, MongoDb, SQL, ElasticSearch, plain string
  - [`import`](/modules/import) - Code for import from JsonLogic
  - [`actions`](/modules/actions) - Redux actions
  - [`stores/tree.js`](/modules/stores/tree.js) - Redux store
  - [`index.d.ts`](/modules/index.d.ts) - TS definitions
- [`css`](/css) - Styles for query builder
- [`examples`](/examples) - Demo app with hot reload of demo code and local library code, uses TS, uses complex config to demonstrate anvanced usage.
- [`sandbox`](/sandbox) - Demo app with hot reload of only demo code (uses latest version of library from npm), uses TS, uses AntDesign widgets.
- [`sandbox_simple`](/sandbox_simple) - Demo app with hot reload of only demo code (uses latest version of library from npm), not uses TS, uses vanilla widgets.
- [`tests`](/tests) - All tests are here. Uses Karma, Mocha, Chai, Enzyme

### Scripts
- `npm run install-all` - Install npm packages in root, examples, sandboxes. **Required for other scripts!**
- `npm test` - Run tests with Karma and update coverage. Requires Node.js v10+
- `npm run lint` - Run ESLint and TSC (in root, tests, examples, sandboxes)
- `npm run lint-fix` - Run ESLint with `--fix` option (in root, tests, examples, sandboxes)
- `npm run clean` - Clean all data that can be re-generated (like `node_modules`, `build`, `coverage`)
- `npm run smoke` - Run tests, lint, build lib, build examples, build sandboxes. Recommended before making PR
- `npm run build` - Build npm module to `lib`, build minified production package to `build`
- `npm run build-examples` - Build demo with webpack to `examples/build`

Feel free to open PR to add new reusable types/widgets/operators (eg., regex operator for string, IP type & widget).  
Pull Requests are always welcomed :)

### Other UI frameworks
Currently there are 3 collections of widgets:
- [antdesign widgets](/modules/components/widgets/antd)
- [material widgets](/modules/components/widgets/material)
- [vanilla widgets](/modules/components/widgets/vanilla)

Let's say you want to create new collection of Bootstrap widgets to be used in this lib (and submit PR which is always welcomed!).  
You can use vanilla widgets as skeleton.  
Then to enable new widgets you need to create config overrides like this:
[material config](/modules/config/material/index.js)


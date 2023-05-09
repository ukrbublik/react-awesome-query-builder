# @react-awesome-query-builder/sandbox-next

[![npm](https://img.shields.io/npm/v/@react-awesome-query-builder/sandbox-next.svg)](https://www.npmjs.com/package/@react-awesome-query-builder/sandbox-next)

Demo app built with [Next.js](https://nextjs.org/).  
Uses MUI widgets by default.  
Enabled SSR with saving and loading query value and query config from session.  


### Run locally
From the root of cloned repository:
```sh
pnpm sandbox-next
```

Or copy `sandbox_next` dir and run inside it:
```sh
npm run preinstall
npm i
npm start
```

In first case local `@react-awesome-query-builder/*` packages will be used.  
In second case `@react-awesome-query-builder/*` packages will be downloaded from NPM.  

Then open `http://localhost:3002` in a browser.  
Feel free to play with code in `components/demo`, `lib`, `pages`.  


### Run in sandbox
[![Open in codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/packages/sandbox_next?file=/components/demo/index.tsx)
(if it freezes on "Initializing Sandbox Container" please click "Fork")

[![Open in stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ukrbublik/react-awesome-query-builder/tree/master?file=packages%2Fsandbox_next%2Fcomponents%2Fdemo%index.tsx&terminal=sandbox-next)
(installing dependencies can take a while)


### Directory structure
- [`pages`](pages)
  - [`index`](pages/index.tsx) - Implements `getServerSideProps()` to enable SSR, returns `jsonTree` and `zipConfig` from session data
  - [`api`](pages/api) - Server-side API
    - [`tree`](pages/api/tree.ts) - API to get/save `jsonTree` to session, and to convert tree to various formats like JsonLogic, SQL, MongoDb, SpEL
    - [`config`](pages/api/config.ts) - API to get/save `zipConfig` to session
    - [`autocomplete`](pages/api/autocomplete.ts) - API for autocomplete (see `asyncFetch` in [CONFIG](/CONFIG.adoc))
- [`lib`](lib)
  - [`config_base`](lib/config_base.ts) - Creates basic config on server-side
  - [`config`](lib/config.tsx) - Creates extended config on server-side (ready to compress and then pass to SSR)
  - [`config_update`](lib/config_update.ts) - Simple function to be used in `updateConfig()` in [DemoQueryBuilder](components/demo/index.tsx)
  - [`config_ser`](lib/config_ser.js) - It's just a test to show ability to serialize an entire config to string and deserialize back
- [`data`](data) - Contains JSON with initial query value, JSON with data for autocomplete
- [`components/demo`](components/demo/index.tsx) - `DemoQueryBuilder` component
  - [`config_ctx`](components/demo/config_ctx.tsx) - Config context for `DemoQueryBuilder`

### Description

#### Session data
Session data contains:
- `jsonTree` - query value in JSON format, got from [`Utils.getTree()`](/README.md#gettree-immutablevalue-light--true-children1asarray--true---object)
- `zipConfig` - compressed query config in JSON format, got from [`Utils.compressConfig()`](/README.md#compressconfigconfig-baseconfig---zipconfig)

Session data is saved to Redis (for deploying to Vercel with Upstash integration) or tmp json file (for local run), see [lib/withSession.ts](lib/withSession.ts) if you're interested in session implementation.

#### jsonTree
Initial `jsonTree` (if missing in session data) is loaded from [`data/init_logic`](data/init_logic.js).  
See [getInitialTree()](pages/api/tree.ts).  
With `POST /api/tree` query value can be saved to session data, and loaded from session with `GET /api/tree`.  
Response will contain result of converting provided tree into various formats (like `Utils.jsonLogicFormat()`, `Utils.sqlFormat()` - done on server-side).  

#### zipConfig
Initial `zipConfig` (if missing in session data) is generated on server-side as follows:
- based on `CoreConfig` (imported from `@react-awesome-query-builder/core`)
- added fields, funcs and some overrides in [`lib/config_base`](lib/config_base.ts)
- added UI mixins (`asyncFetch`, custom React components, `factory` overrides) in [`lib/config`](lib/config.tsx)
- compressed with [`Utils.compressConfig()`](/README.md#compressconfigconfig-baseconfig---zipconfig)

See [getInitialZipConfig()](pages/api/config.ts).  

Response of `GET /api/config?initial=true` shows initial zip config.  
Response of `GET /api/config` shows current zip config in session.  
With `POST /api/config` compressed config can be saved to session data.  


#### DemoQueryBuilder
`DemoQueryBuilder` component can use server-side props:
- It uses [`Utils.decompressConfig(zipConfig, MuiConfig, ctx)`](/README.md#decompressconfigzipconfig-baseconfig-ctx---config) to create initial config to be passed to `<Query>`. [`ctx`](/README.md#ctx) is imported from [`config_ctx`](components/demo/config_ctx.tsx)
- Initial tree (to be passed as `value` prop for `<Query>`) is a result of [`Utils.loadTree(jsonTree)`](/README.md#loadtree-jsvalue---immutable)

On `onChange` callback it calls `POST /api/tree` to update tree on backend and also export tree to various formats on server-side.  
On click on button `update config` it modifies config in state with [`config_update`](lib/config_update.ts), compresses it and sends to `POST /api/config` to save `zipConfig` on backend.  
On click on button `stringify config` it runs a test to show ability to serialize an entire config to string with [serialize-javascript](https://www.npmjs.com/package/serialize-javascript) package and deserialize back with `eval`, see [`config_ser`](lib/config_ser.js).


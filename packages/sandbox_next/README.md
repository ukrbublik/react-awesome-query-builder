# @react-awesome-query-builder/sandbox-next

[![npm](https://img.shields.io/npm/v/@react-awesome-query-builder/sandbox-next.svg)](https://www.npmjs.com/package/@react-awesome-query-builder/sandbox-next)

Demo app built with `Next.js`.  
Uses MUI widgets by default.  
Contains simple server API to store and load query value from session, see[`pages/api/tree.ts`](pages/api/tree.ts).  
Contains exmaple of server API for autocomplete, see[`pages/api/autocomplete.ts`](pages/api/autocomplete.ts), used on client side with [asyncFetch](components/demo/config.tsx).  
See [getServerSideProps](pages/index.tsx) as example for enabling SSR.  

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

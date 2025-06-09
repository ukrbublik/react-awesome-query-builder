# @react-awesome-query-builder/examples

[![npm](https://img.shields.io/npm/v/@react-awesome-query-builder/examples.svg)](https://www.npmjs.com/package/@react-awesome-query-builder/examples)

Demo app, uses local library with hot reload.  
You can switch between AntDesign, MUI, Bootstrap and vanilla widgets.  
Uses complex config to demonstrate anvanced usage.  
**Uses TypeScript.**

### Preview

Demo: https://ukrbublik.github.io/react-awesome-query-builder/

Demo for ternary mode: https://ukrbublik.github.io/react-awesome-query-builder/#/switch

### Run

From the root of cloned repository:

```sh
pnpm start
```

And open `http://localhost:3001` in a browser.  
For ternary mode open `http://localhost:3001/#/switch`  

Feel free to play with code in [`demo`](demo) (advanced demo) and [`demo_switch`](demo_switch) (demo for ternary mode) dirs.  

### Run in sandbox

[![Open in codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/ukrbublik/react-awesome-query-builder/tree/master/packages/examples?file=/demo/index.tsx)
(if it freezes on "Initializing Sandbox Container" please click "Fork")

[![Open in stackblitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ukrbublik/react-awesome-query-builder/tree/master?file=packages%examples%2Fdemo%2Findex.tsx)
(installing dependencies can take a while)

### Testing antd v4

Best way is to change verison of `antd` and `@ant-design/icons` in `package.json` for both `examples` and `antd` packages.

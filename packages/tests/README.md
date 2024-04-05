# @react-awesome-query-builder/tests

Karma tests.


### Run all tests

```sh
pnpm i
pnpm test
```

Coverage is saved to `coverage/html/index.html`.


### Watch mode

```sh
pnpm test-dev
```

In this mode Karma server is being run in background.  
You can modify tests and library sources, and tests would be executed on the fly.  


### Run selected specs

```sh
pnpm test --filter Validation Serialize
# pnpm test-dev --filter Validation Serialize
```


### Debug

```sh
pnpm test-debug --filter YourTest
```

This will open the Chromium browser with opened devtools (don't close them).  

To debug a test, add `debug: true` in options of `with_qb()` (last arg), see [test example](#test-example). 
Then type `debugger;` in your test code.  
In the console you can use global `window.dbg` object for debugging.  


### Debug with VSCode

- Open `Run and Debug` in VS Code
- Run `Run Karma tests in debug mode`. Enter spec name(s) you want to test (example: "Validation WidgetsVanilla") and hit Enter
- Run `Attach to Karma`

Now you can put breakpoints on test code and library code.  


### Idle

If you want to pause and play with one test in the dev console...  
Add `idle: true, debug: true` to the options of `with_qb()`.  
Only one test should have `idle: true`.  
Click `DEBUG` to open Karma DEBUG RUNNER (`http://localhost:9876/debug.html`)  
Testing will be stopped on the test with `idle`.  
In the console you can use global `window.dbg` object for debugging.  
Eg. just type this in console:
```js
// get current tree in SpEL format
Utils.spelFormat(onChange.lastCall.args[0], config);
// clear tree
qb.setProps({value: null});
```
You can start writing your test in the console.


### Test example

```js
import { Utils, ImmutableTree } from "@react-awesome-query-builder/core";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb } from "../support/utils";
import { expect } from "chai";

describe("my first tests", () => {
  it("change value from 2 to 200", async () => {
    await with_qb([
      configs.with_all_types, configs.with_show_error,
    ], inits.with_number, null, (qb, onChange, {
      expect_jlogic, config
    }, consoleData, onInit) => {
      const initialTree = onInit.getCall(0).args[0] as ImmutableTree;
      const initialSpel = Utils.spelFormat(initialTree, config);
      expect(initialSpel).to.eq("num == 2");

      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "200" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "num" }, 200 ] }] }
      ]);

      const changedTree = onChange.lastCall.args[0];
      const changedSpel = Utils.spelFormat(changedTree, config);
      expect(changedSpel).to.eq("num == 200");
    }, {
      debug: true,
      // idle: true,
    });
  });
});
```
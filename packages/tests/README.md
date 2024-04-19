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


### Run selected tests

```sh
pnpm test --filter Validation Serialize
# pnpm test-dev --filter Validation Serialize
```

Or alternatively edit `testsFilter` in [karma.tests.js](/packages/tests/karma.tests.js):
```js
const testsFilter = [
  "InteractionsVanilla"
];
```


### Run selected specs

Edit `testsFilter` and `specFilter` in [karma.tests.js](/packages/tests/karma.tests.js):
```js
const testsFilter = [
  "InteractionsVanilla"
];
const specFilter = [
  "change field",
  "change op"
];
```


### Debug

```sh
pnpm test-debug
```

This will run Karma in watch mode and start the Chromium browser with opened devtools (don't close them).  

To debug a test, add `debug: true` in options of `with_qb()` (last arg), see [test example](#test-example). 
Then write `debugger;` somewhere in your test code to pause test and debug in Chrome DevTools or VSCode.  
In the browser's console you can use global `window.dbg` object for debugging.  
See [known issue #1](#known-issues-in-debug-mode).  


### Debug with VSCode

- Open `Run and Debug` in VS Code (Shift-Command-D in Mac)
- Run `Run Karma tests in debug mode`
- Run `Attach to Karma`
- Wait for opening new Chromium browser with `http://localhost:9876/` (port can change)

Now you can put breakpoints on your test code in VSCode (and library code too!).  


### Idle

Here is a useful setup for writing new tests.

- Add empty test. See [example test](#test-example)
- Add its file name to `testsFilter`, spec name to `specFilter` in [karma.tests.js](/packages/tests/karma.tests.js)
- Run Karma tests in debug mode (with [terminal](#debug) or [VSCode](#debug-with-vscode))
- Click `DEBUG` in top-right corner of window, this will open new `Karma DEBUG RUNNER` page (`http://localhost:9876/debug.html`) in another tab
- Close original Karma tab (`http://localhost:9876/`)
- In your test code use `await startIdle();` to pause test execution. It's like `debugger;` but better for writing tests. You can inspect and interact with web page, use browser console etc.
- Type `stopIdle()` in browser console to continue test execution.

If you update test code, Karma won't reload the `DEBUG RUNNER` page automatically. It's fine. Just reload the page (`F5`) manually. You should see one of these messages in terminal when tests are recompiled after your chnages and ready to be executed:
- `WARN [karma]: Delaying execution, these browsers are not ready: Chrome xxx`
- `WARN [karma]: No captured browser, open http://localhost:9877/`.

Why `await startIdle();` is better that `debugger;` for writing tests?  
You can interact with UI!
You can just type something like this in browser console and see/debug results:
```js
// get current tree in SpEL format
Utils.spelFormat((onChange.lastCall || onInit.lastCall).args[0], config);
// clear tree
qb.setProps({value: null});
```
You can write your test code completely in the browser console, then copy it to your test file.  
You can also use `debugger;`

Note that `await startIdle();` works ONLY on Karma debug page.  


### Known issues in debug mode

1. 
**Issue:** After modifying test code, Karma doesn't rerun tests anymore. You see in terminal:
```
[karma]: Delaying execution, these browsers are not ready: Chrome
```
**Reason:** Probably you've put `debugger` in your test code, and test script execution was paused for more than 30 seconds.  
**Solution:** Reload (`F5`) Karma page in Chromium. 

2. 
**Issue:** Process "Attach to Karma" has stopped.  
**Solution:** Just start "Attach to Karma" in VSCode again.  


### Test example

```js
import { Utils, ImmutableTree } from "@react-awesome-query-builder/core";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb } from "../support/utils";
import { expect } from "chai";

describe("my first tests", () => {
  it("change value from 2 to 200", async () => {
    await with_qb(
      [ configs.with_all_types, configs.with_show_error ],
      inits.with_number,
      null,
      async (qb, {
        config, onInit, onChange, startIdle, 
        expect_jlogic,
      }) => {
        await startIdle(); // pause execution to debug initial state

        const initialTree = onInit.getCall(0).args[0] as ImmutableTree;
        const initialSpel = Utils.spelFormat(initialTree, config);
        expect(initialSpel).to.eq("num == 2");

        qb
          .find(".rule .rule--value .widget--widget input")
          .simulate("change", { target: { value: "200" } });
        expect_jlogic([null,
          { "and": [{ "==": [ { "var": "num" }, 200 ] }] }
        ]);

        await startIdle(); // pause execution to debug changed state

        const changedTree = onChange.lastCall.args[0];
        const changedSpel = Utils.spelFormat(changedTree, config);
        expect(changedSpel).to.eq("num == 200");
      },
      {
        debug: true,
      }
    );
  });
});
```
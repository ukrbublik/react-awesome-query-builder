import React, { ReactElement } from "react";
import { mount, shallow, ReactWrapper, MountRendererProps } from "enzyme";
import sinon, {spy} from "sinon";
import { expect } from "chai";
const stringify = JSON.stringify;
import serializeJs from "serialize-javascript";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";
import * as configs from "../support/configs";
import * as inits from "../support/inits";

import {
  Utils,
  JsonLogicTree, JsonTree, ImmutableTree, ConfigContext,
  Query, Builder, BasicConfig, Config,
  BuilderProps, ValidationItemErrors, SanitizeOptions,
  ActionMeta, OnInit, OnChange,
} from "@react-awesome-query-builder/ui";
const {
  uuid, 
  sanitizeTree, loadTree, _loadFromJsonLogic, loadFromSpel, isJsonLogic, elasticSearchFormat,
  queryString, sqlFormat, _sqlFormat, spelFormat, _spelFormat, mongodbFormat, _mongodbFormat, jsonLogicFormat, queryBuilderFormat, getTree, ConfigUtils
} = Utils;
import { AntdConfig } from "@react-awesome-query-builder/antd";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import { MaterialConfig } from "@react-awesome-query-builder/material";
import { BootstrapConfig } from "@react-awesome-query-builder/bootstrap";
import { FluentUIConfig } from "@react-awesome-query-builder/fluent";


let currentTestName: string;
let currentTest: Mocha.Test;
export const setCurrentTest = (test: Mocha.Test) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  currentTest = test;
};
export const setCurrentTestName = (name: string) => {
  currentTestName = name;
};
export const getCurrentTestName = () => {
  return currentTestName;
};
export const setCurrentTestTimeout = (ms: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  currentTest?.timeout?.(ms);
};

export const getIt = (options?: DoOptions) => {
  return (options?.insideIt ? ((name: string, func: Function) => { func(); }) : it) as (name: string, func: Function) => void;
};

const ConsoleMethods = [
  "warn", "error", "info", "log"
] as const;

type ConsoleIgnoreFn = (errText: string) => boolean;
type ConsoleMethod = Extract<Exclude<keyof Console, "Console">, typeof ConsoleMethods[number]>;
type ConsoleData = Partial<Record<ConsoleMethod, string[]>>;
interface MockedConsole extends Console {
  __origConsole: Console;
  __consoleData: ConsoleData;
}
type TreeValueFormat = "JsonLogic" | "default" | "SpEL" | null | undefined;
type TreeValue = JsonLogicTree | JsonTree | string | undefined;
type ConfigFn = (_: Config) => Config;
type ConfigFns = ConfigFn | ConfigFn[];
type ChecksFn = (qb: ReactWrapper, checkMeta: CheckMeta) => Promise<void> | void;
interface ExtectedExports {
  query?: string;
  queryHuman?: string;
  sql?: string | [string, string[]];
  spel?: string;
  mongo?: Object;
  elasticSearch?: Object;
  elasticSearch7?: Object;
  logic?: JsonLogicTree | [JsonLogicTree, string[]];
}
interface CheckExpects {
  expect_jlogic: (jlogics: Array<null | undefined | JsonLogicTree>, changeIndex?: number) => void;
  expect_queries: (queries: Array<string>) => void;
  expect_checks: (expects: ExtectedExports) => Promise<void>;
  expect_tree_validation_errors_in_console: (errs: string[]) => void;
}
interface DebugUtils {
  qb: ReactWrapper;
  config: Config;
  onChange: sinon.SinonSpy<Parameters<OnChange>>;
  onInit: sinon.SinonSpy<Parameters<OnInit>>;
  initialTree: ImmutableTree;
  initialJsonTree: JsonTree;
  consoleData: ConsoleData;
  pauseTest: (addToGlobal?: Record<string, unknown>) => Promise<void>;
  continueTest: () => void;
}
interface CheckMeta extends CheckExpects, DebugUtils  {
}
interface DoOptions {
  attach?: boolean; // default: true
  debug?: boolean;
  strict?: boolean;
  ignoreLog?: ConsoleIgnoreFn;
  withRender?: boolean;
  insideIt?: boolean;
  expectedLoadErrors?: string[];
  sanitizeOptions?: SanitizeOptions;
}

const emptyOnChange = (_immutableTree: ImmutableTree, _config: Config) => {};

const globalIgnoreFn: ConsoleIgnoreFn = (errText) => {
  return errText.includes("Fixed operator is_empty to is_null for num")
    // todo: issue after updating antd
    || errText.includes("The node you're attempting to unmount was rendered by another copy of React.")
    // tip: It's the issue with antd's Select component in "multiple" mode for React 17 (in React 18 it's fine)
    || errText.includes("Can't perform a React state update on an unmounted component")
      && errText.includes("a useEffect cleanup function") && errText.includes("at Overflow");
};

const mockConsole = (options?: DoOptions, _configName?: string) => {
  let origConsole = console;
  let consoleData: ConsoleData;
  let mockedConsole: Console;

  if ((origConsole as MockedConsole).__origConsole) {
    mockedConsole = origConsole;
    consoleData = (origConsole as MockedConsole).__consoleData;
    origConsole = (origConsole as MockedConsole).__origConsole;
  } else {
    consoleData = ConsoleMethods.reduce((aggr, m) => ({...aggr, [m]: []}), {});
    mockedConsole = {
      ...origConsole,
      __origConsole: origConsole,
      __consoleData: consoleData,
    } as Console;
    for (const method of ConsoleMethods) {
      mockedConsole[method] = (...args: string[]) => {
        // Prevent using of mocked console inside `ignoreLog()` or `globalIgnoreFn()`
        const _console = console;
        // eslint-disable-next-line no-global-assign
        console = origConsole;

        let finalArgs = [...args];
        if (args[0] === "Fixed tree errors: " || args[0] === "Tree check errors: ") {
          // Convert errors from `validateAndFixTree` or `checkTree`
          finalArgs = [
            args[0],
            ...stringifyValidationErrors(args[1] as unknown as ValidationItemErrors[])
          ];
        }
        const errText = finalArgs.map(a => typeof a === "object" ? JSON.stringify(a) : `${a}`).join("\n");
        consoleData[method]?.push(errText);
        const ignore = options?.ignoreLog?.(errText) || globalIgnoreFn(errText);

        // eslint-disable-next-line no-global-assign
        console = _console;

        if (!ignore) {
          origConsole[method].apply(null, [...finalArgs, "@", getCurrentTestName()]);
        }
      };
    }
  }

  // eslint-disable-next-line no-global-assign
  console = mockedConsole;

  const restoreConsole = () => {
    // eslint-disable-next-line no-global-assign
    console = origConsole;
  };

  return {consoleData, restoreConsole, mockedConsole, origConsole};
};

const stringifyValidationErrors = (errors: ValidationItemErrors[]) => {
  return errors
    .map(({
      errors, itemStr, itemPositionStr,
    }) => ({
      errors: errors.map(({
        side, delta, str, key, fixed
      }) => `${fixed ? "* " : ""}${side ? `[${[side, delta].filter(a => a != undefined).join(" ")}] ` : ""}${str || key}`),
      itemStr,
      itemPositionStr,
    }))
    .map(({errors, itemStr, itemPositionStr}, ii) => {
      return (itemStr || itemPositionStr || "") + "  >>  " + errors.map((e) => e).join(". ");
    });
};

export const load_tree = (value: TreeValue, config: Config, valueFormat: TreeValueFormat = null, options?: DoOptions) => {
  if (!valueFormat) {
    if (isJsonLogic(value))
      valueFormat = "JsonLogic";
    else if (typeof value === "string")
      valueFormat = "SpEL";
    else
      valueFormat = "default";
  }
  let errors: string[] = [];

  const {restoreConsole} = mockConsole(options);

  let tree: ImmutableTree | undefined;
  if (valueFormat === "JsonLogic") {
    [tree, errors] = _loadFromJsonLogic(value, config);
  } else if (valueFormat == "SpEL") {
    [tree, errors] = loadFromSpel(value as string, config);
  } else {
    tree = loadTree(value as JsonTree);
  }
  if (tree) {
    const { allErrors, fixedTree } = sanitizeTree(tree, config, options?.sanitizeOptions);
    tree = fixedTree;
    if (allErrors.length) {
      //console.warn("sanitizeTree errors: \n" + stringifyValidationErrors(allErrors) + "\n");
      errors = [
        // import errors:
        ...errors,
        // sanitize errors:
        ...stringifyValidationErrors(allErrors),
      ];
    }
  }

  restoreConsole();

  return {tree, errors};
};

export  const with_qb = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("vanilla", BasicConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_ant = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("antd", AntdConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_material = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("material", MaterialConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_mui = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("mui", MuiConfig, config_fn, value, valueFormat, checks, options);
};
  
export  const with_qb_bootstrap = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("bootstrap", BootstrapConfig, config_fn, value, valueFormat, checks, options);
};
  
export  const with_qb_fluent = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("fluent", FluentUIConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_skins = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb("vanilla", BasicConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb("antd", AntdConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb("material", MaterialConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb("mui", MuiConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb("bootstrap", BootstrapConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb("fluent", FluentUIConfig, config_fn, value, valueFormat, checks, options);
};

const activateIdle = (
  buildDebugVars?: () => Record<string, unknown>,
  printDebug?: () => void,
) => {
  const isDebugPage = document.location.href.includes("/debug.html");
  const idleOptions: SleepOptions = {};
  let isIdle = false;
  const pauseTest = async (addToGlobal?: Record<string, unknown>) => {
    exposeDebugVars();
    printDebug?.();

    if (isDebugPage) {
      console.log("Pausing test... Type `continueTest()` to continue");
      if (addToGlobal) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.assign((window as any).dbg, addToGlobal);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.assign(window as any, addToGlobal);
      }
      isIdle = true;
      const startIdleTime = new Date();
      while (isIdle) {
        await sleep(500, idleOptions);
        const currentTime = new Date();
        const isTimedOut = process?.env?.MAX_IDLE_TIME
          && (currentTime.getTime() - startIdleTime.getTime()) >= parseInt(process?.env?.MAX_IDLE_TIME );
        if (isTimedOut) {
          isIdle = false;
          break;
        }
      }
      isIdle = false;
    }
  };
  const continueTest = () => {
    if (isIdle) {
      isIdle = false;
      if (idleOptions?.wakeUp) {
        idleOptions?.wakeUp();
      }
    }
  };

  const exposeDebugVars = () => {
    const dbg = buildDebugVars?.() || {};
    // expose to window
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).dbg = dbg;
    if (isDebugPage) {
      for (const k in dbg) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (window as any)[k] = dbg[k];
      }
    }
  };

  return {
    pauseTest, continueTest, exposeDebugVars,
  };
};

const renderQueryBuilder = (
  config: Config,
  tree: ImmutableTree,
  options?: DoOptions,
  configName?: string,
  extraDebug?: Record<string, unknown>,
) => {
  // eslint-disable-next-line prefer-const
  let qb: ReactWrapper;
  const onChange = spy() as DebugUtils["onChange"];
  const onInit = spy() as DebugUtils["onInit"];

  // mock console
  const {restoreConsole, consoleData} = mockConsole(options, configName);

  // idle
  const buildDebugVars = () => {
    const qbDom = qb.first().getDOMNode();
    const ruleErrors = qb.find(".rule--error").map(e => e.text());

    const dbg: Record<string, unknown> = {
      ...debugUtils,
      ...(extraDebug || {}),
      ruleErrors,
      qbDom,
      Utils,
      configs,
      inits,
      expect,
    };
    return dbg;
  };
  const printDebug = () => {
    const qbDom = qb.first().getDOMNode();
    console.dirxml( qbDom );
  };
  const { pauseTest, continueTest, exposeDebugVars } = activateIdle(buildDebugVars, printDebug);

  let qbWrapper: HTMLElement;
  
  const mountOptions: MountRendererProps = {};
  if (options?.attach !== false) {
    qbWrapper = global.document.createElement("div");
    global.document.body.appendChild(qbWrapper);
    mountOptions.attachTo = qbWrapper;
  }

  const render_builder = (props: BuilderProps) => (
    <div className="query-builder-container" style={{padding: "10px"}}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  );

  const query = () => {
    let cmp = (
      <Query
        {...config}
        value={tree as ImmutableTree}
        renderBuilder={render_builder}
        onChange={onChange}
        onInit={onInit}
      />
    );
    if (options?.strict) {
      cmp = (
        <React.StrictMode>
          {cmp}
        </React.StrictMode>
      );
    }
    return cmp;
  };

  // debug
  const updateTestTimeout = () => {
    setCurrentTestTimeout(parseInt(process?.env?.DEBUG_TEST_TIMEOUT ?? "60000"));
  };
  if (options?.debug) {
    updateTestTimeout();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  qb = mount( query(), mountOptions );

  // debug
  const initialTree = onInit.getCall(0).args[0];
  const initialJsonTree = getTree(initialTree);
  const debugUtils: DebugUtils = {
    qb,
    config,
    onChange,
    onInit,
    pauseTest,
    continueTest,
    consoleData,
    initialTree,
    initialJsonTree,
    // tree,
  };

  if (options?.debug) {
    exposeDebugVars();
  }

  // destroy
  const destroyQb = async () => {
    if (options?.attach !== false) {
      // @ts-ignore
      qb.detach();
      // @ts-ignore
      global.document.body.removeChild(qbWrapper);
      // @ts-ignore
      qb.unmount();
      // @ts-ignore
      qbWrapper.remove();
    } else {
      // @ts-ignore
      qb.unmount();
    }

    onChange.resetHistory();

    // needed to catch potential "Warning: Can't perform a React state update on an unmounted component."
    await sleep(0);

    restoreConsole();
  };

  return {
    qb,
    destroyQb,
    debugUtils,
  };
};
  
const do_with_qb = async (
  configName: string, BasicConfig: Config, config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat,
  checks: ChecksFn, options?: DoOptions
) => {
  const config_fns = (Array.isArray(config_fn) ? config_fn : [config_fn]) as ConfigFn[];
  const config = config_fns.reduce((c, f) => f(c), BasicConfig);
  // normally config should be saved at state in `onChange`, see README
  const extendedConfig = ConfigUtils.extendConfig(config);

  // Load tree
  const {tree, errors} = load_tree(value, config, valueFormat, options);
  if (errors?.length) {
    if (options?.expectedLoadErrors) {
      for (let i = 0 ; i < Math.max(options.expectedLoadErrors.length, errors.length) ; i++) {
        expect(errors[i], `load error ${i}`).to.equal(options.expectedLoadErrors[i]);
      }
      expect(errors.join("; ")).to.equal(options?.expectedLoadErrors?.join("; "));
    } else {
      const errText = `Error while loading as ${valueFormat || "?"} with ${configName} @ ${getCurrentTestName()}:`
      + "\n" + errors.join("\n")
      + "\n" + JSON.stringify(value);
      if (!options?.ignoreLog?.(errText) && !globalIgnoreFn(errText)) {
        console.error(errText);
      }
    }
  } else {
    expect(options?.expectedLoadErrors?.length ?? 0, "expectedLoadErrors count").equal(0);
  }

  // Render
  const {
    qb,
    destroyQb,
    debugUtils,
  } = renderQueryBuilder(config, tree!, options, configName, {
    errors,
    extendedConfig,
  });
  const { onChange, consoleData } = debugUtils;

  // Checks
  const checkMeta: CheckMeta = {
    ...debugUtils,
    // expects
    expect_jlogic: (jlogics, changeIndex = 0) => {
      expect_jlogic_before_and_after(config, tree as ImmutableTree, onChange, jlogics, changeIndex);
    },
    expect_queries: (queries) => {
      expect_queries_before_and_after(config, tree as ImmutableTree, onChange, queries);
    },
    expect_checks: async (expects) => {
      await do_export_checks(extendedConfig, tree as ImmutableTree, expects, {
        ...options,
        withRender: false, 
        insideIt: true,
      });
    },
    expect_tree_validation_errors_in_console: (expectedLines) => {
      const errs = consoleData.warn?.filter(
        // Get console errors from `validateAndFixTree` or `checkTree`
        e => e.startsWith("Tree check errors:") || e.startsWith("Fixed tree errors:")
      );
      expect(errs?.length, "tree errors in console").eq(expectedLines.length ? 1 : 0);
      const lines = errs?.[0]?.split("\n") || [];
      for (let i = 0 ; i < Math.max(expectedLines.length, lines.length) ; i++) {
        expect(lines[i], `line ${i}`).to.equal(expectedLines[i]);
      }
      expect(errs?.[0] ?? "").to.equal(expectedLines.join("\n"));
    },
  };
  // @ts-ignore
  await checks(qb, checkMeta);

  // Destroy
  await destroyQb();
};

export const empty_value = {id: uuid(), type: "group"};

// ----------- export checks

const do_export_checks = async (config: Config, tree: ImmutableTree, expects?: ExtectedExports, options?: DoOptions) => {
  const doIt = getIt(options);

  if (!expects || Object.values(expects).some(e => e === "?")) {
    const {logic, data, errors} = jsonLogicFormat(tree, config);
    const correct = Object.fromEntries(Object.entries({
      query: queryString(tree, config),
      queryHuman: queryString(tree, config, true),
      sql: sqlFormat(tree, config),
      spel: spelFormat(tree, config),
      mongo: mongodbFormat(tree, config),
      logic: logic,
      elasticSearch: elasticSearchFormat(tree, config),
    }).filter(([k, _]) => expects ? expects[k as keyof ExtectedExports] === "?" : false));
    console.log(getCurrentTestName(), stringify(correct, undefined, 2));
  } else {
    if (expects["query"] !== undefined) {
      doIt("should work to query string", () => {
        const res = queryString(tree, config);
        expect(res).to.equal(expects["query"]);
      });
    }

    if (expects["queryHuman"] !== undefined) {
      doIt("should work to human query string", () => {
        const res2 = queryString(tree, config, true);
        expect(res2).to.equal(expects["queryHuman"]);
      });
    }
  
    if (expects["sql"] !== undefined) {
      doIt("should work to SQL", () => {
        const [expectedRes, expectedExportErrors] = Array.isArray(expects["sql"])
          ? expects["sql"]
          : [expects["sql"], []];
        const [res, errors] = _sqlFormat(tree, config);
        expect(res).to.equal(expectedRes);
        expect_objects_equal(errors, expectedExportErrors || []);
      });
    }
  
    if (expects["spel"] !== undefined) {
      doIt("should work to SpEL", () => {
        const [expectedRes, expectedExportErrors] = Array.isArray(expects["spel"])
          ? expects["spel"]
          : [expects["spel"], []];
        const [res, errors] = _spelFormat(tree, config);
        expect(res).to.equal(expectedRes);
        expect_objects_equal(errors, expectedExportErrors || []);
      });
    }
    
    if (expects["mongo"] !== undefined) {
      doIt("should work to MongoDb", () => {
        const [expectedRes, expectedExportErrors] = Array.isArray(expects["mongo"])
          ? expects["mongo"] as [Object, string[]]
          : [expects["mongo"], []];
        const [res, errors] = _mongodbFormat(tree, config);
        expect_objects_equal(res, expectedRes);
        expect_objects_equal(errors, expectedExportErrors || []);
      });
    }

    if (expects["elasticSearch"] !== undefined) {
      doIt("should work with elasticSearch", () => {
        const res = elasticSearchFormat(tree, config);
        expect_objects_equal(res, expects["elasticSearch"]);
      });
    }

    if (expects["elasticSearch7"] !== undefined) {
      doIt("should work with elasticSearch", () => {
        const res = elasticSearchFormat(tree, config, "ES_7_SYNTAX");
        expect_objects_equal(res, expects["elasticSearch7"]);
      });
    }

    if (expects["logic"] !== undefined) {
      doIt("should work to JsonLogic", () => {
        const [expectedLogic, expectedExportErrors] = (Array.isArray(expects["logic"])
          ? expects["logic"]
          : [expects["logic"], []]) as [JsonLogicTree, string[]];
        const {logic, data, errors} = jsonLogicFormat(tree, config);
        const safe_logic = logic ? JSON.parse(JSON.stringify(logic)) as Object : undefined;
        expect_objects_equal(safe_logic, expectedLogic);
        expect_objects_equal(errors, expectedExportErrors || []);
      });
    }
  
    doIt("should work to QueryBuilder", () => {
      const _res = queryBuilderFormat(tree, config);
    });

    if (options?.withRender) {
      const render = async () => {
        // Render
        const { destroyQb } = renderQueryBuilder(config, tree!, options);
        await destroyQb();
      };
      if (options?.insideIt) {
        await render();
      } else {
        doIt("should render without errors", render);
      }
    }
  }
};

export const export_checks = (
  config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat,
  expects?: ExtectedExports, expectedLoadErrors: Array<string> = [], options: DoOptions = {}
) => {
  // tip: No need to make this func async (and wait for do_export_checks),
  //  because `export_checks` should be called only inside `decribe` (insideIt is expected to be false)
  const doIt = getIt(options);
  const config_fns = (Array.isArray(config_fn) ? config_fn : [config_fn]) as ConfigFn[];
  const config = config_fns.reduce((c, f) => f(c), BasicConfig as Config);

  const withRender = options?.insideIt ? false : (options?.withRender ?? true);

  let tree, errors: string[] = [];
  try {
    ({tree, errors} = load_tree(value, config, valueFormat, options));
  } catch(e) {
    doIt("should load tree", () => {
      throw e;
    });
  }

  if (errors?.length) {
    if (expectedLoadErrors?.length) {
      doIt("should return errors on load tree", () => {
        for (let i = 0 ; i < Math.max(expectedLoadErrors.length, errors.length) ; i++) {
          expect(errors[i], `load error ${i}`).to.equal(expectedLoadErrors[i]);
        }
        expect(errors.join("; ")).to.equal(expectedLoadErrors.join("; "));
      });

      do_export_checks(config, tree as ImmutableTree, expects, {
        ...options,
        withRender,
      });
    } else {
      doIt("should load tree without errors", () => {
        throw new Error(errors.join("; "));
      });
    }
  } else {
    do_export_checks(config, tree as ImmutableTree, expects, {
      ...options,
      withRender,
    });
  }
};

export const export_checks_in_it = (config_fn: ConfigFn, value: TreeValue, valueFormat: TreeValueFormat, expects: ExtectedExports, options?: DoOptions) => {
  const config_fns = (Array.isArray(config_fn) ? config_fn : [config_fn]) as ConfigFn[];
  const config = config_fns.reduce((c, f) => f(c), BasicConfig as Config);

  const {tree, errors} = load_tree(value, config, valueFormat);
  if (errors?.length) {
    throw new Error(errors.join("; "));
  } else {
    do_export_checks(config, tree as ImmutableTree, expects, {
      ...options,
      withRender: true,
      insideIt: true,
    });
  }
};

const expect_queries_before_and_after = (config: Config, tree: ImmutableTree, onChange: sinon.SinonSpy, queries: Array<string>) => {
  const initTreeString = queryString(tree, config);
  if (queries[0] !== null) {
    expect(initTreeString).to.equal(queries[0]);
  }
  
  const call = onChange.getCall(0);
  if (!call) throw new Error("onChange was not called");
  const changedTreeString = queryString(call.args[0] as ImmutableTree, config);
  expect(changedTreeString).to.equal(queries[1]);
};

const expect_jlogic_before_and_after = (config: Config, tree: ImmutableTree, onChange: sinon.SinonSpy, jlogics: Array<null | undefined | JsonLogicTree>, changeIndex = 0) => {
  const {logic: initTreeJl} = jsonLogicFormat(tree, config);
  if (jlogics[0] !== null) {
    expect_objects_equal(initTreeJl, jlogics[0]);
  }
  if (jlogics.length > 1 && jlogics[1] !== null) {
    const call = onChange.getCall(changeIndex);
    if (!call) throw new Error("onChange was not called");
    const {logic: changedTreeJl} = jsonLogicFormat(call.args[0] as ImmutableTree, config);
    expect_objects_equal(changedTreeJl, jlogics[1]);
  }
};

export const expect_objects_equal = (act: any, exp: any, actLabel?: string, expLabel?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expSafe = exp ? JSON.parse(JSON.stringify(exp)) : exp;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actSafe = act ? JSON.parse(JSON.stringify(act)) : act;
  expect(actSafe).to.eql(expSafe);
};

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function hexToRgbString(hex: string) {
  const rgb = hexToRgb(hex);
  if (rgb) {
    const {r, g, b} = rgb;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return null;
  }
}

interface SleepOptions {
  wakeUp?: () => void;
}

export function sleep(delay: number, options?: SleepOptions) {
  return new Promise((resolve) => {
    let timerId: number | undefined;
    const onTimeout = () => {
      timerId = undefined;
      resolve(undefined);
    };
    timerId = setTimeout(onTimeout, delay) as unknown as number;
    if (options) {
      options.wakeUp = () => {
        if (timerId) {
          clearTimeout(timerId);
          onTimeout();
        }
      };
    }
  });
}

const mergeCustomizerCleanJSX = (_objValue: any, srcValue: any) => {
  const { isDirtyJSX, cleanJSX } = Utils.ConfigUtils;
  if (isDirtyJSX(srcValue)) {
    return cleanJSX(srcValue);
  }
  return undefined;
};

export const UNSAFE_serializeConfig = (config: Config): string => {
  const sanitizedConfig = mergeWith({}, omit(config, ["ctx"]), mergeCustomizerCleanJSX) as Config;
  const strConfig = serializeJs(sanitizedConfig, {
    space: 2,
    unsafe: true,
  });
  //remove coverage instructions
  const sanitizedStrConfig = strConfig.replace(/cov_\w+\(\)\.\w+(\[\d+\])+\+\+(;|,)/gm, "");
  return sanitizedStrConfig;
};

export const UNSAFE_deserializeConfig = (strConfig: string, ctx: ConfigContext): Config => {
  const config = eval("("+strConfig+")") as Config;
  config.ctx = ctx;
  return config;
};


// interaction helpers

export const getLhsOptions = (qb: ReactWrapper, fieldSrc: string) => {
  const select = fieldSrc === "func"
    ? qb.find(".rule .rule--field--func .rule--func select")
    : qb.find(".rule .rule--field select").at(0);
  const fieldOptions = Object.fromEntries(select
    .find("option")
    .map((o, i) => ([
      o.getDOMNode().getAttribute("value"),
      o.getDOMNode().getAttribute("style"),
    ]))
    .filter(([v, _s]) => !!v)) as Record<string, string | undefined>;
  const allOptions = Object.keys(fieldOptions);
  const boldOptions = Object.keys(fieldOptions).filter(k => fieldOptions[k]?.includes("bold"));
  return [allOptions, boldOptions];
};

export const getFuncsOptions = (qb: ReactWrapper) => getLhsOptions(qb, "func");
export const getFieldsOptions = (qb: ReactWrapper) => getLhsOptions(qb, "field");

export const selectFieldSrc = (qb: ReactWrapper, val: string) => {
  qb
    .find(".rule .rule--fieldsrc select")
    .simulate("change", { target: { value: val } });
};

export const selectField = (qb: ReactWrapper, val: string) => {
  qb
    .find(".rule .rule--field select")
    .simulate("change", { target: { value: val } });
};

export const selectFieldFunc = (qb: ReactWrapper, val: string) => {
  qb
    .find(".rule .rule--field--func .rule--func select")
    .filterWhere((n) => n.closest(".rule--func--wrapper--lev-1").length === 0)
    .simulate("change", { target: { value: val } });
};

export const setFieldFuncArgValue = (qb: ReactWrapper, ind: number, val: string) => {
  qb
    .find(".rule .rule--field--func .rule--func--args .rule--func--arg")
    .filterWhere((n) => n.closest(".rule--func--wrapper--lev-1").length === 0)
    .filterWhere((n) => typeof n.type() !== "string")
    .at(ind)
    .find(".rule--func--arg-value .rule--widget .widget--widget input")
    .simulate("change", { target: { value: val } });
};

export const setRhsValue = (qb: ReactWrapper, val: string) => {
  qb
    .find(".rule .rule--value .widget--widget input")
    .simulate("change", { target: { value: val } });
};

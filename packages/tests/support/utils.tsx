import React, { ReactElement } from "react";
import { mount, shallow, ReactWrapper, MountRendererProps } from "enzyme";
import { act } from "react-dom/test-utils";
import sinon, {spy} from "sinon";
import { expect } from "chai";
const stringify = JSON.stringify;
import serializeJs from "serialize-javascript";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";

import {
  Utils,
  JsonLogicTree, JsonTree, ImmutableTree, ConfigContext,
  Query, Builder, BasicConfig, Config,
  BuilderProps, ValidationItemErrors
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


let currentTest: string;
export const setCurrentTest = (testName: string) => {
  currentTest = testName;
};
export const getCurrentTest = () => {
  return currentTest;
};

const ConsoleMethods = [
  "warn", "error", "info", "log"
] as const;

type ConsoleIgnoreFn = (errText: string) => boolean;
type ConsoleMethod = Extract<Exclude<keyof Console, "Console">, typeof ConsoleMethods[number]>;
type ConsoleData = Partial<Record<ConsoleMethod, string[]>>;
type TreeValueFormat = "JsonLogic" | "default" | "SpEL" | null;
type TreeValue = JsonLogicTree | JsonTree | string | undefined;
type ConfigFn = (_: Config) => Config;
type ConfigFns = ConfigFn | ConfigFn[];
type ChecksFn = (qb: ReactWrapper, onChange: sinon.SinonSpy, tasks: Tasks, consoleData: ConsoleData) => Promise<void> | void;
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
interface Tasks {
  expect_jlogic: (jlogics: Array<null | undefined | JsonLogicTree>, changeIndex?: number) => void;
  expect_queries: (queries: Array<string>) => void;
  expect_checks: (expects: ExtectedExports) => void;
  config: Config;
}
interface DoOptions {
  attach?: boolean;
  strict?: boolean;
  ignoreLog?: ConsoleIgnoreFn;
  withRender?: boolean;
  insideIt?: boolean;
  expectedLoadErrors?: string[];
}

const emptyOnChange = (_immutableTree: ImmutableTree, _config: Config) => {};

const globalIgnoreFn: ConsoleIgnoreFn = (errText) => {
  // todo: issue after updating antd
  return errText.includes("The node you're attempting to unmount was rendered by another copy of React.")
    || errText.includes("Fixed operator is_empty to is_null for num");
};

const mockConsole = (options?: DoOptions, _configName?: string) => {
  const origConsole = console;
  const consoleData: ConsoleData = ConsoleMethods.reduce((aggr, m) => ({...aggr, [m]: []}), {});
  let mockedConsole: Console = {
    ...origConsole,
  };
  if (!(mockedConsole as any).__mocked) {
    (mockedConsole as any).__mocked = true;
    for (const method of ConsoleMethods) {
      mockedConsole[method] = (...args: string[]) => {
        let finalArgs = [...args];
        if (args[0] === "Fixed tree errors: ") {
          // Convert errors from `validateAndFixTree`
          finalArgs = [
            "Fixed tree errors: ",
            ...stringifyValidationErrors(args[1] as any)
          ];
        }
        const errText = finalArgs.map(a => typeof a === "object" ? JSON.stringify(a) : `${a}`).join("\n");
        consoleData[method]?.push(errText);
        if (!options?.ignoreLog?.(errText) && !globalIgnoreFn(errText)) {
          origConsole[method].apply(null, [...finalArgs, "@", getCurrentTest()]);
        }
      }
    }
  }
  return {mockedConsole, consoleData, origConsole};
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
    else
      valueFormat = "default";
  }
  let errors: string[] = [];

  // mock console
  const {mockedConsole, origConsole} = mockConsole(options);
  // eslint-disable-next-line no-global-assign
  console = mockedConsole;

  let tree: ImmutableTree | undefined;
  if (valueFormat === "JsonLogic") {
    [tree, errors] = _loadFromJsonLogic(value, config);
  } else if (valueFormat == "SpEL") {
    [tree, errors] = loadFromSpel(value as string, config);
  } else {
    tree = loadTree(value as JsonTree);
  }
  if (tree) {
    const { allErrors, fixedTree } = sanitizeTree(tree, config);
    tree = fixedTree;
    if (allErrors.length) {
      //console.warn("sanitizeTree errors: \n" + stringifyValidationErrors(allErrors) + "\n");
      errors = [
        ...errors,
        ...stringifyValidationErrors(allErrors),
      ];
    }
  }

  // restore console
  // eslint-disable-next-line no-global-assign
  console = origConsole;

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
      expect(errors.join("; ")).to.equal(options?.expectedLoadErrors?.join("; "));
    } else {
      const errText = `Error while loading as ${valueFormat || "?"} with ${configName} @ ${getCurrentTest()}:`
      + "\n" + errors.join("\n")
      + "\n" + JSON.stringify(value);
      if (!options?.ignoreLog?.(errText) && !globalIgnoreFn(errText)) {
        console.error(errText);
      }
    }
  }

  const onChange = spy();
  const tasks: Tasks = {
    expect_jlogic: (jlogics, changeIndex = 0) => {
      expect_jlogic_before_and_after(config, tree as ImmutableTree, onChange, jlogics, changeIndex);
    },
    expect_queries: (queries) => {
      expect_queries_before_and_after(config, tree as ImmutableTree, onChange, queries);
    },
    expect_checks: (expects) => {
      do_export_checks(extendedConfig, tree as ImmutableTree, expects, {
        ...options,
        withRender: false, 
        insideIt: true,
      });
    },
    config: config,
  };

  let qbWrapper: HTMLElement;
  
  const mountOptions: MountRendererProps = {};
  if (options?.attach) {
    qbWrapper = global.document.createElement("div");
    global.document.body.appendChild(qbWrapper);
    mountOptions.attachTo = qbWrapper;
  }

  const query = () => {
    let cmp = (
      <Query
        {...config}
        value={tree as ImmutableTree}
        renderBuilder={render_builder}
        onChange={onChange}
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

  // mock console
  const {mockedConsole, origConsole, consoleData} = mockConsole(options, configName);
  // eslint-disable-next-line no-global-assign
  console = mockedConsole;

  //await act(async () => {
  const qb = mount(
    query(), 
    mountOptions
  ) as ReactWrapper;

  // @ts-ignore
  await checks(qb, onChange, tasks, consoleData);
  //});

  if (options?.attach) {
    // @ts-ignore
    qb.detach();
    // @ts-ignore
    global.document.body.removeChild(qbWrapper);
  } else {
    // @ts-ignore
    qb.unmount();
  }

  // restore console
  // eslint-disable-next-line no-global-assign
  console = origConsole;
  
  onChange.resetHistory();
};
  
const render_builder = (props: BuilderProps) => (
  <div className="query-builder-container" style={{padding: "10px"}}>
    <div className="query-builder qb-lite">
      <Builder {...props} />
    </div>
  </div>
);
  
export const empty_value = {id: uuid(), type: "group"};

// ----------- export checks

const do_export_checks = (config: Config, tree: ImmutableTree, expects?: ExtectedExports, options?: DoOptions) => {
  const doIt = options?.insideIt ? ((name: string, func: Function) => { func(); }) : it;

  if (!expects || Object.values(expects).some(e => e === "?")) {
    const {logic, data, errors} = jsonLogicFormat(tree, config);
    const correct = {
      query: queryString(tree, config),
      queryHuman: queryString(tree, config, true),
      sql: sqlFormat(tree, config),
      spel: spelFormat(tree, config),
      mongo: mongodbFormat(tree, config),
      logic: logic,
      elasticSearch: elasticSearchFormat(tree, config),
    };
    console.log(getCurrentTest(), stringify(correct, undefined, 2));
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
        expect(JSON.stringify(errors)).to.eql(JSON.stringify(expectedExportErrors || []));
      });
    }
  
    if (expects["spel"] !== undefined) {
      doIt("should work to SpEL", () => {
        const [expectedRes, expectedExportErrors] = Array.isArray(expects["spel"])
          ? expects["spel"]
          : [expects["spel"], []];
        const [res, errors] = _spelFormat(tree, config);
        expect(res).to.equal(expectedRes);
        expect(JSON.stringify(errors)).to.eql(JSON.stringify(expectedExportErrors || []));
      });
    }
    
    if (expects["mongo"] !== undefined) {
      doIt("should work to MongoDb", () => {
        const [expectedRes, expectedExportErrors] = Array.isArray(expects["mongo"])
          ? expects["mongo"]
          : [expects["mongo"], []];
        const [res, errors] = _mongodbFormat(tree, config);
        expect(JSON.stringify(res)).to.eql(JSON.stringify(expectedRes));
        expect(JSON.stringify(errors)).to.eql(JSON.stringify(expectedExportErrors || []));
      });
    }

    if (expects["elasticSearch"] !== undefined) {
      doIt("should work with elasticSearch", () => {
        const res = elasticSearchFormat(tree, config);
        expect(JSON.stringify(res)).to.eql(JSON.stringify(expects["elasticSearch"]));
      });
    }

    if (expects["elasticSearch7"] !== undefined) {
      doIt("should work with elasticSearch", () => {
        const res = elasticSearchFormat(tree, config, "ES_7_SYNTAX");
        expect(JSON.stringify(res)).to.eql(JSON.stringify(expects["elasticSearch7"]));
      });
    }

    if (expects["logic"] !== undefined) {
      doIt("should work to JsonLogic", () => {
        const [expectedLogic, expectedExportErrors] = (Array.isArray(expects["logic"])
          ? expects["logic"]
          : [expects["logic"], []]) as [JsonLogicTree, string[]];
        const {logic, data, errors} = jsonLogicFormat(tree, config);
        const safe_logic = logic ? JSON.parse(JSON.stringify(logic)) as Object : undefined;
        expect(JSON.stringify(safe_logic)).to.eql(JSON.stringify(expectedLogic));
        expect(JSON.stringify(errors)).to.eql(JSON.stringify(expectedExportErrors || []));
      });
    }
  
    doIt("should work to QueryBuilder", () => {
      const _res = queryBuilderFormat(tree, config);
    });

    if (options?.withRender) {

      act(() => {
        // mock console
        const {mockedConsole, origConsole} = mockConsole(options);
        // eslint-disable-next-line no-global-assign
        console = mockedConsole;

        const qb = mount(
          <Query
            {...config}
            value={tree}
            renderBuilder={render_builder}
            onChange={emptyOnChange}
          />
        );
        qb.unmount();

        // restore console
        // eslint-disable-next-line no-global-assign
        console = origConsole;
      });
    }
  }
};

export const export_checks = (
  config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat,
  expects?: ExtectedExports, expectedLoadErrors: Array<string> = [], options: DoOptions = {}
) => {
  const doIt = options?.insideIt ? ((name: string, func: Function) => { func(); }) : it;
  const config_fns = (Array.isArray(config_fn) ? config_fn : [config_fn]) as ConfigFn[];
  const config = config_fns.reduce((c, f) => f(c), BasicConfig as Config);

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
        expect(errors.join("; ")).to.equal(expectedLoadErrors.join("; "));
      });

      do_export_checks(config, tree as ImmutableTree, expects, {
        ...options,
        withRender: options?.withRender ?? true,
      });
    } else {
      doIt("should load tree without errors", () => {
        throw new Error(errors.join("; "));
      });
    }
  } else {
    do_export_checks(config, tree as ImmutableTree, expects, {
      ...options,
      withRender: options?.withRender ?? true,
    });
  }
};

export const export_checks_in_it = (config_fn: ConfigFn, value: TreeValue, valueFormat: TreeValueFormat, expects: ExtectedExports, options?: DoOptions) => {
  const config = config_fn(BasicConfig);
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
    expect(JSON.stringify(initTreeJl)).to.equal(JSON.stringify(jlogics[0]));
  }
  
  const call = onChange.getCall(changeIndex);
  if (!call) throw new Error("onChange was not called");
  const {logic: changedTreeJl} = jsonLogicFormat(call.args[0] as ImmutableTree, config);
  expect(JSON.stringify(changedTreeJl)).to.equal(JSON.stringify(jlogics[1]));
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

export function sleep(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
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
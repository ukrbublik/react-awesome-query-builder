import React, { ReactElement } from "react";
import { mount, shallow, ReactWrapper, MountRendererProps } from "enzyme";
import { act } from "react-dom/test-utils";
import sinon, {spy} from "sinon";
import { expect } from "chai";
const stringify = JSON.stringify;

import {
  Query, Builder, Utils, BasicConfig, 
  JsonLogicTree, JsonTree, Config, ImmutableTree, BuilderProps
} from "react-awesome-query-builder";
const {
  uuid, 
  checkTree, loadTree, _loadFromJsonLogic, loadFromSpel, isJsonLogic, elasticSearchFormat,
  queryString, sqlFormat, spelFormat, mongodbFormat, jsonLogicFormat, queryBuilderFormat, getTree, ConfigUtils
} = Utils;
import AntdConfig from "react-awesome-query-builder/config/antd";
import MaterialConfig from "react-awesome-query-builder/config/material";
import MuiConfig from "react-awesome-query-builder/config/mui";
import BootstrapConfig from "react-awesome-query-builder/config/bootstrap";


type TreeValueFormat = "JsonLogic" | "default" | "SpEL" | null;
type TreeValue = JsonLogicTree | JsonTree | string | undefined;
type ConfigFn = (_: Config) => Config;
type ConfigFns = ConfigFn | [ConfigFn];
type ChecksFn = (qb: ReactWrapper, onChange: sinon.SinonSpy, tasks: Tasks) => Promise<void> | void;
interface ExtectedExports {
  query?: string;
  queryHuman?: string;
  sql?: string;
  spel?: string;
  mongo?: Object;
  elasticSearch?: Object;
  logic?: JsonLogicTree;
}
interface Tasks {
  expect_jlogic: (jlogics: Array<null | JsonLogicTree>, changeIndex?: number) => void;
  expect_queries: (queries: Array<string>) => void;
  expect_checks: (expects: ExtectedExports) => void;
  config: Config;
}
interface DoOptions {
  attach?: boolean;
}

const emptyOnChange = (_immutableTree: ImmutableTree, _config: Config) => {};


export const load_tree = (value: TreeValue, config: Config, valueFormat: TreeValueFormat = null) => {
  if (!valueFormat) {
    if (isJsonLogic(value))
      valueFormat = "JsonLogic";
    else
      valueFormat = "default";
  }
  let errors: string[] = [];
  let tree: ImmutableTree | undefined;
  if (valueFormat == "JsonLogic") {
    [tree, errors] = _loadFromJsonLogic(value, config);
  } else if (valueFormat == "SpEL") {
    [tree, errors] = loadFromSpel(value as string, config);
  } else {
    tree = loadTree(value as JsonTree);
  }
  tree = tree ? checkTree(tree, config) : undefined;
  return {tree, errors};
};

export  const with_qb = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb(BasicConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_ant = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb(AntdConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_material = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb(MaterialConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_mui = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb(MuiConfig, config_fn, value, valueFormat, checks, options);
};
  
export  const with_qb_bootstrap = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb(BootstrapConfig, config_fn, value, valueFormat, checks, options);
};

export  const with_qb_skins = async (config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  await do_with_qb(BasicConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb(AntdConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb(MaterialConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb(MuiConfig, config_fn, value, valueFormat, checks, options);
  await do_with_qb(BootstrapConfig, config_fn, value, valueFormat, checks, options);
};
  
const do_with_qb = async (BasicConfig: Config, config_fn: ConfigFns, value: TreeValue, valueFormat: TreeValueFormat, checks: ChecksFn, options?: DoOptions) => {
  const config_fns = (Array.isArray(config_fn) ? config_fn : [config_fn]) as [ConfigFn];
  const config = config_fns.reduce((c, f) => f(c), BasicConfig);
  // normally config should be saved at state in `onChange`, see README
  const extendedConfig = ConfigUtils.extendConfig(config);
  const onChange = spy();
  const {tree, errors} = load_tree(value, config, valueFormat);
  if (errors?.length) {
    console.error("Error while loading: " + errors.join("; "));
  }

  const tasks: Tasks = {
    expect_jlogic: (jlogics, changeIndex = 0) => {
      expect_jlogic_before_and_after(config, tree as ImmutableTree, onChange, jlogics, changeIndex);
    },
    expect_queries: (queries) => {
      expect_queries_before_and_after(config, tree as ImmutableTree, onChange, queries);
    },
    expect_checks: (expects) => {
      do_export_checks(extendedConfig, tree as ImmutableTree, expects, false, true);
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

  //await act(async () => {
  const qb = mount(
    <Query
      {...config}
      value={tree as ImmutableTree}
      renderBuilder={render_builder}
      onChange={onChange}
    />, 
    mountOptions
  ) as ReactWrapper;
  
  // @ts-ignore
  await checks(qb, onChange, tasks);
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

const do_export_checks = (config: Config, tree: ImmutableTree, expects: ExtectedExports, with_render = false, inside_it = false) => {
  const doIt = inside_it ? ((name: string, func: Function) => { func(); }) : it;

  if (expects) {
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
        const res = sqlFormat(tree, config);
        expect(res).to.equal(expects["sql"]);
      });
    }
  
    if (expects["spel"] !== undefined) {
      doIt("should work to SpEL", () => {
        const res = spelFormat(tree, config);
        expect(res).to.equal(expects["spel"]);
      });
    }
    
    if (expects["mongo"] !== undefined) {
      doIt("should work to MongoDb", () => {
        const res = mongodbFormat(tree, config);
        expect(JSON.stringify(res)).to.eql(JSON.stringify(expects["mongo"]));
      });
    }

    if (expects["elasticSearch"] !== undefined) {
      doIt("should work with elasticSearch", () => {
        const res = elasticSearchFormat(tree, config);
        expect(JSON.stringify(res)).to.eql(JSON.stringify(expects["elasticSearch"]));
      });
    }
  
    if (expects["logic"] !== undefined) {
      doIt("should work to JsonLogic", () => {
        const {logic, data, errors} = jsonLogicFormat(tree, config);
        const safe_logic = logic ? JSON.parse(JSON.stringify(logic)) as Object : undefined;
        expect(JSON.stringify(safe_logic)).to.eql(JSON.stringify(expects["logic"]));
        if (expects["logic"])
          expect(errors).to.eql([]);
      });
    }
  
    doIt("should work to QueryBuilder", () => {
      const res = queryBuilderFormat(tree, config);
    });

    if (with_render) {
      act(() => {
        const qb = mount(
          <Query
            {...config}
            value={tree}
            renderBuilder={render_builder}
            onChange={emptyOnChange}
          />
        );
  
        qb.unmount();
      });
    }
  } else {
    const {logic, data, errors} = jsonLogicFormat(tree, config);
    const correct = {
      query: queryString(tree, config),
      queryHuman: queryString(tree, config, true),
      sql: sqlFormat(tree, config),
      spel: spelFormat(tree, config),
      mongo: mongodbFormat(tree, config),
      logic: logic,
    };
    console.log(stringify(correct, undefined, 2));
  }
};

export const export_checks = (config_fn: ConfigFn, value: TreeValue, valueFormat: TreeValueFormat, expects: ExtectedExports, expectedErrors: Array<string> = []) => {
  const config = config_fn(BasicConfig);
  let tree, errors: string[] = [];
  try {
    ({tree, errors} = load_tree(value, config, valueFormat));
  } catch(e) {
    it("should load tree", () => {
      throw e;
    });
  }

  if (errors?.length) {
    if (expectedErrors?.length) {
      it("should return errors", () => {
        expect(errors.join("; ")).to.equal(expectedErrors.join("; "));
      });

      do_export_checks(config, tree as ImmutableTree, expects, true);
    } else {
      it("should load tree without errors", () => {
        throw new Error(errors.join("; "));
      });
    }
  } else {
    do_export_checks(config, tree as ImmutableTree, expects, true);
  }
};

export const export_checks_in_it = (config_fn: ConfigFn, value: TreeValue, valueFormat: TreeValueFormat, expects: ExtectedExports) => {
  const config = config_fn(BasicConfig);
  const {tree, errors} = load_tree(value, config, valueFormat);
  if (errors?.length) {
    throw new Error(errors.join("; "));
  } else {
    do_export_checks(config, tree as ImmutableTree, expects, true, true);
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

const expect_jlogic_before_and_after = (config: Config, tree: ImmutableTree, onChange: sinon.SinonSpy, jlogics: Array<null | JsonLogicTree>, changeIndex = 0) => {
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

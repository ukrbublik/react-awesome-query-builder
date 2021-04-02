import React from "react";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import sinon from "sinon";

import {
  Query,
  Builder,
  Utils,
  BasicConfig,
} from "react-awesome-query-builder";
import AntdConfig from "react-awesome-query-builder/config/antd";
import MaterialConfig from "react-awesome-query-builder/config/material";

const { stringify } = JSON;
const {
  uuid,
  checkTree,
  loadTree,
  loadFromJsonLogic,
  isJsonLogic,
  queryString,
  sqlFormat,
  mongodbFormat,
  jsonLogicFormat,
  queryBuilderFormat,
  getTree,
} = Utils;

export const load_tree = (value, config, valueFormat = null) => {
  if (!valueFormat) {
    if (isJsonLogic(value)) valueFormat = "JsonLogic";
    else valueFormat = "default";
  }
  const loadFn = valueFormat == "JsonLogic" ? loadFromJsonLogic : loadTree;
  const tree = loadFn(value, config);
  return checkTree(tree, config);
};

export const with_qb = (config_fn, value, valueFormat, checks) => {
  do_with_qb(BasicConfig, config_fn, value, valueFormat, checks);
};

export const with_qb_ant = (config_fn, value, valueFormat, checks) => {
  do_with_qb(AntdConfig, config_fn, value, valueFormat, checks);
};

export const with_qb_skins = (config_fn, value, valueFormat, checks) => {
  do_with_qb(BasicConfig, config_fn, value, valueFormat, checks);
  do_with_qb(AntdConfig, config_fn, value, valueFormat, checks);
  do_with_qb(MaterialConfig, config_fn, value, valueFormat, checks);
};

const do_with_qb = (BasicConfig, config_fn, value, valueFormat, checks) => {
  const config = config_fn(BasicConfig);
  const onChange = sinon.spy();
  const tree = load_tree(value, config, valueFormat);
  let qb;

  act(() => {
    qb = mount(
      <Query
        {...config}
        value={tree}
        renderBuilder={render_builder}
        onChange={onChange}
      />
    );
  });

  const tasks = {
    expect_jlogic: (jlogics, changeIndex = 0) => {
      expect_jlogic_before_and_after(
        config,
        value,
        onChange,
        jlogics,
        changeIndex
      );
    },
    expect_queries: (queries) => {
      expect_queries_before_and_after(config, value, onChange, queries);
    },
    expect_checks: (expects) => {
      do_export_checks(config, tree, expects, true);
    },
    config,
  };

  checks(qb, onChange, tasks);

  qb.unmount();

  onChange.resetHistory();
};

const render_builder = (props) => (
  <div className="query-builder-container" style={{ padding: "10px" }}>
    <div className="query-builder qb-lite">
      <Builder {...props} />
    </div>
  </div>
);

export const empty_value = { id: uuid(), type: "group" };

// ----------- export checks

export const do_export_checks = (config, tree, expects, inside_it = false) => {
  const doIt = inside_it
    ? (name, func) => {
      func();
    }
    : it;

  if (expects) {
    if (expects["query"] !== undefined) {
      doIt("should work to query string", () => {
        const res = queryString(tree, config);
        expect(res).to.equal(expects["query"]);
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

    if (expects["mongo"] !== undefined) {
      doIt("should work to MongoDb", () => {
        const res = mongodbFormat(tree, config);
        expect(JSON.stringify(res)).to.eql(JSON.stringify(expects["mongo"]));
      });
    }

    if (expects["logic"] !== undefined) {
      doIt("should work to JsonLogic", () => {
        const { logic, data, errors } = jsonLogicFormat(tree, config);
        const safe_logic = logic
          ? JSON.parse(JSON.stringify(logic))
          : undefined;
        expect(JSON.stringify(safe_logic)).to.eql(
          JSON.stringify(expects["logic"])
        );
        if (expects["logic"]) expect(errors).to.eql([]);
      });
    }

    doIt("should work to QueryBuilder", () => {
      const res = queryBuilderFormat(tree, config);
    });
  } else {
    const { logic, data, errors } = jsonLogicFormat(tree, config);
    const correct = {
      query: queryString(tree, config),
      queryHuman: queryString(tree, config, true),
      sql: sqlFormat(tree, config),
      mongo: mongodbFormat(tree, config),
      logic,
    };
    console.log(stringify(correct, undefined, 2));
  }
};

export const export_checks = (config_fn, value, valueFormat, expects) => {
  const config = config_fn(BasicConfig);
  const tree = load_tree(value, config, valueFormat);
  do_export_checks(config, tree, expects);
};

export const export_checks_in_it = (config_fn, value, valueFormat, expects) => {
  const config = config_fn(BasicConfig);
  const tree = load_tree(value, config, valueFormat);
  do_export_checks(config, tree, expects, true);
};

export const expect_queries_before_and_after = (
  config_fn,
  init_value_jl,
  onChange,
  queries
) => {
  const config
    = typeof config_fn === "function" ? config_fn(BasicConfig) : config_fn;
  const initTreeString = queryString(load_tree(init_value_jl, config), config);
  if (queries[0] !== null) {
    expect(initTreeString).to.equal(queries[0]);
  }

  const call = onChange.getCall(0);
  if (!call) throw new Error("onChange was not called");
  const changedTreeString = queryString(call.args[0], config);
  expect(changedTreeString).to.equal(queries[1]);
};

export const expect_jlogic_before_and_after = (
  config_fn,
  init_value_jl,
  onChange,
  jlogics,
  changeIndex = 0
) => {
  const config
    = typeof config_fn === "function" ? config_fn(BasicConfig) : config_fn;
  const { logic: initTreeJl } = jsonLogicFormat(
    load_tree(init_value_jl, config),
    config
  );
  if (jlogics[0] !== null) {
    expect(JSON.stringify(initTreeJl)).to.equal(JSON.stringify(jlogics[0]));
  }

  const call = onChange.getCall(changeIndex);
  if (!call) throw new Error("onChange was not called");
  const { logic: changedTreeJl } = jsonLogicFormat(call.args[0], config);
  expect(JSON.stringify(changedTreeJl)).to.equal(JSON.stringify(jlogics[1]));
};

// ----------- d-n-d

const createBubbledEvent = (type, props = {}) => {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, props);
  return event;
};

export const simulate_drag_n_drop = (sourceRule, targetRule, coords) => {
  const {
    mousePos,
    startMousePos,
    dragRect,
    plhRect,
    treeRect,
    hovRect,
  } = coords;
  const dragHandler = sourceRule.find(".qb-drag-handler").at(0);

  dragHandler.simulate(
    "mousedown",
    createBubbledEvent("mousedown", {
      ...startMousePos,
      __mocked_window: dragHandler.instance(),
    })
  );
  const targetContainer = targetRule.closest(".group-or-rule-container");
  targetContainer.instance().getBoundingClientRect = () => hovRect;
  dragHandler.instance().dispatchEvent(
    createBubbledEvent("mousemove", {
      ...mousePos,
      __mock_dom: ({ treeEl, dragEl, plhEl }) => {
        treeEl.getBoundingClientRect = () => treeRect;
        dragEl.getBoundingClientRect = () => dragRect;
        plhEl.getBoundingClientRect = () => plhRect;
      },
      __mocked_hov_container: targetContainer.instance(),
    })
  );
  dragHandler
    .instance()
    .dispatchEvent(createBubbledEvent("mouseup", { ...mousePos }));
};

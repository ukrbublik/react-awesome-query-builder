import React from "react";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import sinon from "sinon";
const stringify = JSON.stringify;

import {
  Query, Builder, Utils, BasicConfig,
} from "react-awesome-query-builder";
const {
  uuid, 
  checkTree, loadTree, loadFromJsonLogic, 
  queryString, sqlFormat, mongodbFormat, jsonLogicFormat, queryBuilderFormat, getTree,
} = Utils;
import AntdConfig from "react-awesome-query-builder/config/antd";

export const load_tree = (valueFormat, value, config) => {
  const loadFn = valueFormat == "JsonLogic" ? loadFromJsonLogic : loadTree;
  return checkTree(loadFn(value, config), config);
};

export  const with_qb = (config_fn, value, valueFormat, checks) => {
  do_with_qb(BasicConfig, config_fn, value, valueFormat, checks);
};
  
export  const with_qb_ant = (config_fn, value, valueFormat, checks) => {
  do_with_qb(AntdConfig, config_fn, value, valueFormat, checks);
};
  
export  const with_qb_skins = (config_fn, value, valueFormat, checks) => {
  do_with_qb(BasicConfig, config_fn, value, valueFormat, checks);
  do_with_qb(AntdConfig, config_fn, value, valueFormat, checks);
};
  
const do_with_qb = (BasicConfig, config_fn, value, valueFormat, checks) => {
  const config = config_fn(BasicConfig);
  const onChange = sinon.spy();
  const tree = load_tree(valueFormat, value, config);
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
      expect_jlogic_before_and_after(config, value, onChange, jlogics, changeIndex);
    },
    expect_queries: (queries) => {
      expect_queries_before_and_after(config, value, onChange, queries);
    },
    export_checks: (expects) => {
      do_export_checks(config, tree, expects);
    },
  };
  
  checks(qb, onChange, tasks);
    
  qb.unmount();
    
  onChange.resetHistory();
};
  
const render_builder = (props) => (
  <div className="query-builder-container" style={{padding: "10px"}}>
    <div className="query-builder qb-lite">
      <Builder {...props} />
    </div>
  </div>
);
  
export const empty_value = {id: uuid(), type: "group"};

export const do_export_checks = (config, tree, expects) => {
  if (expects) {
    if (expects["query"] !== undefined) {
      it("should work to query string", () => {
        const res = queryString(tree, config);
        expect(res).to.equal(expects["query"]);
        const res2 = queryString(tree, config, true);
        expect(res2).to.equal(expects["queryHuman"]);
      });
    }
  
    if (expects["sql"] !== undefined) {
      it("should work to SQL", () => {
        const res = sqlFormat(tree, config);
        expect(res).to.equal(expects["sql"]);
      });
    }
    
    if (expects["mongo"] !== undefined) {
      it("should work to MongoDb", () => {
        const res = mongodbFormat(tree, config);
        expect(res).to.eql(expects["mongo"]);
      });
    }
  
    if (expects["logic"] !== undefined) {
      it("should work to JsonLogic", () => {
        const {logic, data, errors} = jsonLogicFormat(tree, config);
        const safe_logic = logic ? JSON.parse(JSON.stringify(logic)) : undefined;
        expect(safe_logic).to.eql(expects["logic"]);
        if (expects["logic"])
          expect(errors).to.eql([]);
      });
    }
  
    it("should work to QueryBuilder", () => {
      const res = queryBuilderFormat(tree, config);
    });
  } else {
    const {logic, data, errors} = jsonLogicFormat(tree, config);
    const correct = {
      query: queryString(tree, config),
      queryHuman: queryString(tree, config, true),
      sql: sqlFormat(tree, config),
      mongo: mongodbFormat(tree, config),
      logic: logic,
    };
    console.log(stringify(correct, undefined, 2));
  }
    
};
  
export const export_checks = (config_fn, value, valueFormat, expects) => {
  const config = config_fn(BasicConfig);
  const loadFn = valueFormat == "JsonLogic" ? loadFromJsonLogic : loadTree;
  const tree = checkTree(loadFn(value, config), config);

  do_export_checks(config, tree, expects);
};
  
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
      __mock_dom: ({treeEl, dragEl, plhEl}) => {
        treeEl.getBoundingClientRect = () => treeRect;
        dragEl.getBoundingClientRect = () => dragRect;
        plhEl.getBoundingClientRect = () => plhRect;
      },
      __mocked_hov_container: targetContainer.instance(),
    })
  );
  dragHandler.instance().dispatchEvent(
    createBubbledEvent("mouseup", { ...mousePos })
  );
};
  
export const expect_queries_before_and_after = (config_fn, init_value_jl, onChange, queries) => {
  const config = typeof config_fn == "function" ? config_fn(BasicConfig) : config_fn;
  const initTreeString = queryString(loadFromJsonLogic(init_value_jl, config), config);
  expect(initTreeString).to.equal(queries[0]);
  
  const changedTreeString = queryString(onChange.getCall(0).args[0], config);
  expect(changedTreeString).to.equal(queries[1]);
};
  
export  const expect_jlogic_before_and_after = (config_fn, init_value_jl, onChange, jlogics, changeIndex = 0) => {
  const config = typeof config_fn == "function" ? config_fn(BasicConfig) : config_fn;
  const {logic: initTreeJl} = jsonLogicFormat(loadFromJsonLogic(init_value_jl, config), config);
  if (jlogics[0]) {
    expect(JSON.stringify(initTreeJl)).to.equal(JSON.stringify(jlogics[0]));
    //expect(initTreeJl).to.eql(jlogics[0]);
  }
  
  const call = onChange.getCall(changeIndex);
  if (!call) throw new Error("onChange was not called");
  const {logic: changedTreeJl} = jsonLogicFormat(call.args[0], config);
  expect(JSON.stringify(changedTreeJl)).to.equal(JSON.stringify(jlogics[1]));
  //expect(changedTreeJl).to.eql(jlogics[1]);
};


import sinon from "sinon";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb } from "../support/utils";
import { simulate_drag_n_drop } from "../support/dnd";


describe("drag-n-drop", () => {

  it("should move rule after second rule", () => {
    with_qb(configs.simple_with_number, inits.with_group, "JsonLogic", (qb, onChange, {expect_queries}) => {
      const firstRule = qb.find(".rule").at(0);
      const secondRule = qb.find(".rule").at(1);

      simulate_drag_n_drop(firstRule, secondRule, {
        "dragRect": {"x":58,"y":113,"width":1525,"height":46,"top":113,"right":1583,"bottom":159,"left":58},
        "plhRect":  {"x":59,"y":79,"width":1525,"height":46,"top":79,"right":1584,"bottom":125,"left":59},
        "treeRect": {"x":34,"y":34,"width":1571,"height":336.296875,"top":34,"right":1605,"bottom":370.296875,"left":34},
        "hovRect":  {"x":59,"y":135,"width":1535,"height":46.296875,"top":135,"right":1594,"bottom":181.296875,"left":59},
        "startMousePos": {"clientX":81,"clientY":101},
        "mousePos":      {"clientX":80,"clientY":135}
      });

      expect_queries([
        "(num == 1 && num == 2)",
        "(num == 2 && num == 1)"
      ]);
    });
  });

  it("should move group before rule", () => {
    with_qb(configs.simple_with_number, inits.with_number_and_group, "JsonLogic", (qb, onChange, {expect_queries}) => {
      const firstRule = qb.find(".rule").at(0);
      const group = qb.find(".group--children .group").at(0);

      simulate_drag_n_drop(group, firstRule, {
        "dragRect":{"x":52,"y":102,"width":1525,"height":159,"top":102,"right":1577,"bottom":261,"left":52},
        "plhRect":{"x":59,"y":135.296875,"width":1525,"height":156,"top":135.296875,"right":1584,"bottom":291.296875,"left":59},
        "treeRect":{"x":34,"y":34,"width":1571,"height":268.296875,"top":34,"right":1605,"bottom":302.296875,"left":34},
        "hovRect":{"x":59,"y":79,"width":1535,"height":46.296875,"top":79,"right":1594,"bottom":125.296875,"left":59},
        "startMousePos":{"clientX":220,"clientY":157},
        "mousePos":{"clientX":213,"clientY":124}
      });

      expect_queries([
        "(num == 1 || (num == 2 && num == 3))",
        "((num == 2 && num == 3) || num == 1)"
      ]);
    });
  });

  it("should move rule into group", () => {
    const do_test = (config, value, checks) => {
      with_qb(config, value, "JsonLogic", (qb, onChange, tasks) => {
        const secondRule = qb.find(".rule").at(1);
        const group = qb.find(".group--children .group").at(0);
        const groupHeader = group.find(".group--header").first();
  
        simulate_drag_n_drop(secondRule, groupHeader, {
          "dragRect":{"x":83,"y":167,"width":1525,"height":43,"top":167,"right":1608,"bottom":210,"left":83},
          "plhRect":{"x":59,"y":129,"width":1525,"height":43,"top":129,"right":1584,"bottom":172,"left":59},
          "treeRect":{"x":34,"y":34,"width":1571,"height":430,"top":34,"right":1605,"bottom":464,"left":34},
          "hovRect":{"x":59,"y":182,"width":1535,"height":158,"top":182,"right":1594,"bottom":340,"left":59},
          "startMousePos":{"clientX":81,"clientY":147},
          "mousePos":{"clientX":105,"clientY":185}
        });

        checks(config, value, onChange, tasks);
      });
    };

    do_test(configs.simple_with_number, inits.with_numbers_and_group, (config, value, onChange, {expect_queries}) => {
      expect_queries([
        "(num == 1 || num == 2 || (num == 3 && num == 4))",
        "(num == 1 || (num == 2 && num == 3 && num == 4))"
      ]);
    });
    
    do_test(configs.simple_with_number_without_regroup, inits.with_numbers_and_group, (_config, _value, onChange, _tasks) => {
      sinon.assert.notCalled(onChange);
    });
    
    do_test(configs.simple_with_number_max_nesting_1, inits.with_numbers_and_group, (_config, _value, onChange, _tasks) => {
      sinon.assert.notCalled(onChange);
    });
  });

  it("should move rule out of group", () => {
    const do_test = (config, value, checks) => {
      with_qb(config, value, "JsonLogic", (qb, onChange, tasks) => {
        const firstRuleInGroup = qb.find(".rule").at(1);
        const group = qb.find(".group--children .group").at(0);
        const groupHeader = group.find(".group--header").first();
  
        simulate_drag_n_drop(firstRuleInGroup, groupHeader, {
          "dragRect":{"x":81,"y":80,"width":1489,"height":43,"top":80,"right":1570,"bottom":123,"left":81},
          "plhRect":{"x":84,"y":119,"width":1489,"height":43,"top":119,"right":1573,"bottom":162,"left":84},
          "treeRect":{"x":34,"y":34,"width":1571,"height":203,"top":34,"right":1605,"bottom":237,"left":34},
          "hovRect":{"x":59,"y":76,"width":1535,"height":150,"top":76,"right":1594,"bottom":226,"left":59},
          "startMousePos":{"clientX":107,"clientY":139},
          "mousePos":{"clientX":104,"clientY":100}
        });
  
        checks(config, value, onChange, tasks);
      });
    };

    do_test(configs.simple_with_number, inits.with_number_and_group_3, (config, value, onChange, {expect_queries}) => {
      expect_queries([
        "(num == 1 || (num == 2 && num == 3 && num == 4))",
        "(num == 1 || num == 2 || (num == 3 && num == 4))"
      ]);
    });
    
    do_test(configs.simple_with_number_without_regroup, inits.with_number_and_group_3, (_config, _value, onChange, _tasks) => {
      sinon.assert.notCalled(onChange);
    });
  });

  it("should move group before group", () => {
    with_qb(configs.simple_with_number_without_regroup, inits.with_groups, "JsonLogic", (qb, onChange, {expect_queries}) => {
      const firstGroup = qb.find(".group--children .group").at(0);
      const secondGroup = qb.find(".group--children .group").at(1);
      const firstGroupHeader = firstGroup.find(".group--header").first();
      const secondGroupHeader = secondGroup.find(".group--header").first();

      simulate_drag_n_drop(secondGroup, firstGroupHeader, {
        "dragRect":{"x":55,"y":83,"width":1448,"height":159.296875,"top":83,"right":1503,"bottom":242.296875,"left":55},
        "plhRect":{"x":59,"y":250.5,"width":1448,"height":159.296875,"top":250.5,"right":1507,"bottom":409.796875,"left":59},
        "treeRect":{"x":34,"y":34,"width":1494,"height":386.796875,"top":34,"right":1528,"bottom":420.796875,"left":34},
        "hovRect":{"x":59,"y":79,"width":1458,"height":161.5,"top":79,"right":1517,"bottom":240.5,"left":59},
        "startMousePos":{"clientX":201,"clientY":272},
        "mousePos":{"clientX":197,"clientY":104}
      });

      expect_queries([
        "((num == 1 && num == 2) || (num == 3 && num == 4))",
        "((num == 3 && num == 4) || (num == 1 && num == 2))"
      ]);
    });
  });

});

import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
const stringify = JSON.stringify;

import {
  Query, Builder, Utils, BasicConfig,
} from 'react-awesome-query-builder';
const {
  uuid, 
  checkTree, loadTree, loadFromJsonLogic, 
  queryString, sqlFormat, mongodbFormat, jsonLogicFormat, getTree,
} = Utils;
import AntdConfig from 'react-awesome-query-builder/config/antd';

//////////////////////////////////////////////////////////////////////////////////////////
// utils

const with_qb = (config, value, valueFormat, checks) => {
  const loadFn = valueFormat == 'JsonLogic' ? loadFromJsonLogic : loadTree;
  const onChange = sinon.spy();
  let qb;

  act(() => {
    qb = mount(
      <Query
        {...config}
        value={checkTree(loadFn(value, config), config)}
        renderBuilder={render_builder}
        onChange={onChange}
      />
    );
  });

  checks(qb, onChange);
  
  qb.unmount();
  
  onChange.resetHistory();
};

const render_builder = (props) => (
    <div className="query-builder-container" style={{padding: '10px'}}>
        <div className="query-builder qb-lite">
            <Builder {...props} />
        </div>
    </div>
);

const empty_value = {id: uuid(), type: "group"};

const do_export_checks = (config, value, valueFormat, expects) => {
  const loadFn = valueFormat == 'JsonLogic' ? loadFromJsonLogic : loadTree;
  const tree = checkTree(loadFn(value, config), config);
  
  if (expects) {
    it('should work to query string', () => {
      const res = queryString(tree, config);
      expect(res).to.equal(expects["query"]);
      const res2 = queryString(tree, config, true);
      expect(res2).to.equal(expects["queryHuman"]);
    });

    it('should work to SQL', () => {
      const res = sqlFormat(tree, config);
      expect(res).to.equal(expects["sql"]);
    });

    it('should work to MongoDb', () => {
      const res = mongodbFormat(tree, config);
      expect(res).to.eql(expects["mongo"]);
    });

    it('should work to JsonLogic', () => {
      const {logic, data, errors} = jsonLogicFormat(tree, config);
      const safe_logic = JSON.parse(JSON.stringify(logic));
      expect(safe_logic).to.eql(expects["logic"]);
      expect(errors).to.eql([]);
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

const createBubbledEvent = (type, props = {}) => {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, props);
  return event;
};

const simulate_drag_n_drop = (sourceRule, targetRule, coords) => {
  const {
    mousePos,
    startMousePos,
    dragRect,
    plhRect,
    treeRect,
    hovRect,
  } = coords;
  const dragHandler = sourceRule.find('.qb-drag-handler').at(0);

  dragHandler.simulate(
    "mousedown", 
    createBubbledEvent("mousedown", {
      ...startMousePos, 
      __mocked_window: dragHandler.instance(), 
    })
  );
  targetRule.instance().getBoundingClientRect = () => hovRect;
  dragHandler.instance().dispatchEvent(
    createBubbledEvent("mousemove", {
      ...mousePos,
      __mock_dom: ({treeEl, dragEl, plhEl}) => {
        treeEl.getBoundingClientRect = () => treeRect;
        dragEl.getBoundingClientRect = () => dragRect;
        plhEl.getBoundingClientRect = () => plhRect;
      },
      __mocked_hov_container: targetRule.instance(),
    })
  );
};

const exect_queries_before_and_after = (config, init_value_jl, onChange, queries) => {
  const initTreeString = queryString(loadFromJsonLogic(init_value_jl, config), config);
  expect(initTreeString).to.equal(queries[0]);

  const changedTreeString = queryString(onChange.getCall(0).args[0], config);
  expect(changedTreeString).to.equal(queries[1]);
};

//////////////////////////////////////////////////////////////////////////////////////////

describe('library', () => {
  it('should be imported correctly', () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('basic query', () => {
  const simple_config_with_number = {
    ...BasicConfig,
    fields: {
      num: {
        label: 'Number',
        type: 'number',
        preferWidgets: ['number'],
        fieldSettings: {
          min: -1,
          max: 5
        },
      },
    },
  };

  const init_value_with_number = {
    type: "group",
    id: uuid(),
    children1: {
      [uuid()]: {
        type: "rule",
        properties: {
          field: "num",
          operator: "equal",
          value: [2],
          valueSrc: ["value"],
          valueType: ["number"]
        }
      },
    },
    properties: {
      conjunction: "AND",
      not: false
    }
  };

  const init_jl_value_with_number = {
    "and": [{
      "==": [
        { "var": "num" },
        2
      ]
    }]
  };

  describe('import', () => {
    it('should work with empty value', () => {
      with_qb(simple_config_with_number, empty_value, 'default', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });

    it('should work with simple value', () => {
      with_qb(simple_config_with_number, init_value_with_number, 'default', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });

    it('should work with simple value of JsonLogic format', () => {
      with_qb(simple_config_with_number, init_jl_value_with_number, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    do_export_checks(simple_config_with_number, init_value_with_number, 'default', {
      query: "num == 2",
      queryHuman: "Number == 2",
      sql: "num = 2",
      mongo: {num: 2},
      logic: {
        and: [
          { '==': [{ "var": "num" }, 2] }
        ]
      },
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with conjunction', () => {
  const config_with_number_and_string = {
    ...BasicConfig,
    fields: {
      num: {
        label: 'Number',
        type: 'number',
        preferWidgets: ['number'],
        fieldSettings: {
          min: -1,
          max: 5
        },
      },
      login: {
        type: 'text',
        excludeOperators: ['proximity'],
        mainWidgetProps: {
          valueLabel: "Login",
          valuePlaceholder: "Enter login",
          validateValue: (val, fieldDef) => {
            return (val.length < 10 && (val == "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
          },
        },
      }
    },
  };

  const init_jl_value_with_number_and_string = {
    "or": [{
      "<": [
        { "var": "num" },
        2
      ]
    }, {
      "==": [
        { "var": "login" },
        "ukrbublik"
      ]
    }]
  };


  describe('import', () => {
    it('should work with simple value of JsonLogic format', () => {
      with_qb(config_with_number_and_string, init_jl_value_with_number_and_string, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    do_export_checks(config_with_number_and_string, init_jl_value_with_number_and_string, 'JsonLogic', {
      query: '(num < 2 || login == "ukrbublik")',
      queryHuman: '(Number < 2 OR login == "ukrbublik")',
      sql: '(num < 2 OR login = \'ukrbublik\')',
      mongo: {
        "$or": [
          { "num": {"$lt": 2} },
          { "login": "ukrbublik" }
        ]
      },
      logic: {
        "or": [
          {
            "<": [ {"var": "num"}, 2 ]
          }, {
            "==": [ {"var": "login"}, "ukrbublik" ]
          }
        ]
      },
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with subquery and datetime types', () => {
  const config_with_date_and_time = {
    ...BasicConfig,
    fields: {
      date: {
        label: 'Date',
        type: 'date',
      },
      time: {
        label: 'Time',
        type: 'time',
      },
      datetime: {
        label: 'DateTime',
        type: 'datetime',
      },
    },
  };

  const init_jl_value_with_date_and_time = {
    "or": [{
      "==": [ { "var": "datetime" }, "2020-05-18T21:50:01.000Z" ]
    }, {
      "and": [{
        "==": [ {  "var": "date" }, "2020-05-18T21:00:00.000Z" ]
      }, {
        "==": [ { "var": "time" }, 3000 ]
      }]
    }]
  };


  describe('import', () => {
    it('should work with simple value of JsonLogic format', () => {
      with_qb(config_with_date_and_time, init_jl_value_with_date_and_time, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    do_export_checks(config_with_date_and_time, init_jl_value_with_date_and_time, 'JsonLogic', {
      "query": "(datetime == \"2020-05-18 21:50:01\" || (date == \"2020-05-18\" && time == \"00:50:00\"))",
      "queryHuman": "(DateTime == \"18.05.2020 21:50\" OR (Date == \"18.05.2020\" AND Time == \"00:50\"))",
      "sql": "(datetime = '2020-05-18 21:50:01.000' OR (date = '2020-05-18' AND time = '00:50:00'))",
      "mongo": {
        "$or": [
          {
            "datetime": "2020-05-18 21:50:01"
          },
          {
            "date": "2020-05-18",
            "time": "00:50:00"
          }
        ]
      },
      "logic": {
        "or": [
          {
            "==": [
              {
                "var": "datetime"
              },
              "2020-05-18T21:50:01.000Z"
            ]
          },
          {
            "and": [
              {
                "==": [
                  {
                    "var": "date"
                  },
                  "2020-05-18T00:00:00.000Z"
                ]
              },
              {
                "==": [
                  {
                    "var": "time"
                  },
                  3000
                ]
              }
            ]
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with select', () => {
  const config_with_select = {
    ...BasicConfig,
    fields: {
      // new format of listValues
      color: {
        label: 'Color',
        type: 'select',
        listValues: [
          { value: 'yellow', title: 'Yellow' },
          { value: 'green', title: 'Green' },
          { value: 'orange', title: 'Orange' },
        ],
      },
      // old format of listValues
      color2: {
        label: 'Color2',
        type: 'select',
        listValues: {
          yellow: 'Yellow',
          green: 'Green',
          orange: 'Orange',
        },
      },
      multicolor: {
        label: 'Colors',
        type: 'multiselect',
        listValues: {
          yellow: 'Yellow',
          green: 'Green',
          orange: 'Orange'
        },
        allowCustomValues: false
      },

    },
  };

  const init_jl_value_with_select = {
    "and": [{
      "==": [ { "var": "color" }, "yellow" ]
    }, {
      "all": [ 
        { "var": "multicolor" },
        { "in": [ { "var": "" }, [ "yellow", "green" ] ] }
      ]
    }]
  };


  describe('import', () => {
    it('should work with value of JsonLogic format', () => {
      with_qb(config_with_select, init_jl_value_with_select, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    do_export_checks(config_with_select, init_jl_value_with_select, 'JsonLogic', {
      "query": "(color == \"yellow\" && multicolor == [\"yellow\", \"green\"])",
      "queryHuman": "(Color == \"Yellow\" AND Colors == [\"Yellow\", \"Green\"])",
      "sql": "(color = 'yellow' AND multicolor = 'yellow,green')",
      "mongo": {
        "color": "yellow",
        "multicolor": [
          "yellow",
          "green"
        ]
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "color"
              },
              "yellow"
            ]
          },
          {
            "all": [
              {
                "var": "multicolor"
              },
              {
                "in": [
                  {
                    "var": ""
                  },
                  [
                    "yellow",
                    "green"
                  ]
                ]
              }
            ]
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with !struct', () => {
  //todo
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with !group', () => {
  //todo
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with field compare', () => {
  //todo
});

//////////////////////////////////////////////////////////////////////////////////////////

describe('query with func', () => {
  //todo
});

//todo: validation
//todo: widgets - bool, slider
//todo: antd widgets, treeselect

//////////////////////////////////////////////////////////////////////////////////////////

describe('interactions', () => {
  const simple_config_with_number = {
    ...BasicConfig,
    fields: {
      num: {
        label: 'Number',
        type: 'number',
        preferWidgets: ['number'],
        fieldSettings: {
          min: -1,
          max: 5
        },
      },
    },
  };

  const init_jl_value_with_number = {
    "and": [{
      "==": [ { "var": "num" }, 2 ]
    }]
  };

  const init_jl_value_with_group = {
    "or": [{
      "and": [
        {
          "==": [ { "var": "num" }, 1 ]
        }, {
          "==": [ { "var": "num" }, 2 ]
        }
      ]
    }]
  };

  const init_jl_value_with_number_and_group = {
    "or": [
      { "==": [ { "var": "num" }, 1 ] },
      { "and": [
        {
          "==": [ { "var": "num" }, 2 ]
        }, {
          "==": [ { "var": "num" }, 3 ]
        }
      ]}
    ]
  };

  const init_jl_value_with_number_and_group_3 = {
    "or": [
      { "==": [ { "var": "num" }, 1 ] },
      { "and": [
        {
          "==": [ { "var": "num" }, 2 ]
        }, {
          "==": [ { "var": "num" }, 3 ]
        }, {
          "==": [ { "var": "num" }, 4 ]
        }
      ]}
    ]
  };

  it('click on remove single rule will reave empty rule', () => {
    with_qb(simple_config_with_number, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--header button')
        .first()
        .simulate('click');
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal(null);
      expect(child.properties.operator).to.equal(null);
      expect(child.properties.value).to.eql([]);
    });

    //todo: config - remove completely
  });

  it('click on remove group will reave empty rule', () => {
    with_qb(simple_config_with_number, init_jl_value_with_group, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.group--children .group .group--header .group--actions button')
        .at(2)
        .simulate('click');
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal(null);
      expect(child.properties.operator).to.equal(null);
      expect(child.properties.value).to.eql([]);
    });

    //todo: config - remove completely
  });

  it('click on add rule will add new empty rule', () => {
    with_qb(simple_config_with_number, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.group--actions button')
        .first()
        .simulate('click');
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(2);
    });
  });

  it('click on add group will add new group with one empty rule', () => {
    with_qb(simple_config_with_number, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.group--actions button')
        .at(1)
        .simulate('click');
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(2);
      const child = changedTree.children1[childKeys[1]];
      expect(child.type).to.equal("group");
      expect(child.properties.conjunction).to.equal("AND");
      const subchildKeys = Object.keys(child.children1);
      const subchild = child.children1[subchildKeys[0]];
      expect(subchild).to.eql({
        type: 'rule', 
        properties: {field: null, operator: null, value: [], valueSrc: []}
      });
    });
  });

  describe('drag-n-drop', () => {
    it('should move rule after second rule', () => {
      with_qb(simple_config_with_number, init_jl_value_with_group, 'JsonLogic', (qb, onChange) => {
        const firstRule = qb.find('.rule').at(0);
        const secondRule = qb.find('.rule').at(1);

        simulate_drag_n_drop(firstRule, secondRule, {
          "dragRect": {"x":58,"y":113,"width":1525,"height":46,"top":113,"right":1583,"bottom":159,"left":58},
          "plhRect":  {"x":59,"y":79,"width":1525,"height":46,"top":79,"right":1584,"bottom":125,"left":59},
          "treeRect": {"x":34,"y":34,"width":1571,"height":336.296875,"top":34,"right":1605,"bottom":370.296875,"left":34},
          "hovRect":  {"x":59,"y":135,"width":1535,"height":46.296875,"top":135,"right":1594,"bottom":181.296875,"left":59},
          "startMousePos": {"clientX":81,"clientY":101},
          "mousePos":      {"clientX":80,"clientY":135}
        });

        exect_queries_before_and_after(simple_config_with_number, init_jl_value_with_group, onChange, [
          '(num == 1 && num == 2)',
          '(num == 2 && num == 1)'
        ]);
      });
    });

    it('should move rule out of group', () => {
      with_qb(simple_config_with_number, init_jl_value_with_number_and_group_3, 'JsonLogic', (qb, onChange) => {
        const firstRuleInGroup = qb.find('.rule').at(1);
        const group = qb.find('.group--children .group').at(0);

        simulate_drag_n_drop(firstRuleInGroup, group, {
          "dragRect":{"x":81,"y":80,"width":1489,"height":43,"top":80,"right":1570,"bottom":123,"left":81},
          "plhRect":{"x":84,"y":119,"width":1489,"height":43,"top":119,"right":1573,"bottom":162,"left":84},
          "treeRect":{"x":34,"y":34,"width":1571,"height":203,"top":34,"right":1605,"bottom":237,"left":34},
          "hovRect":{"x":59,"y":76,"width":1535,"height":150,"top":76,"right":1594,"bottom":226,"left":59},
          "startMousePos":{"clientX":107,"clientY":139},
          "mousePos":{"clientX":104,"clientY":100}
        });

        exect_queries_before_and_after(simple_config_with_number, init_jl_value_with_number_and_group_3, onChange, [
          '(num == 1 || (num == 2 && num == 3 && num == 4))',
          '(num == 1 || num == 2 || (num == 3 && num == 4))'
        ]);
      });
    });

    it('should move group before rule', () => {
      with_qb(simple_config_with_number, init_jl_value_with_number_and_group, 'JsonLogic', (qb, onChange) => {
        const firstRule = qb.find('.rule').at(0);
        const group = qb.find('.group--children .group').at(0);

        simulate_drag_n_drop(group, firstRule, {
          "dragRect":{"x":52,"y":102,"width":1525,"height":159,"top":102,"right":1577,"bottom":261,"left":52},
          "plhRect":{"x":59,"y":135.296875,"width":1525,"height":156,"top":135.296875,"right":1584,"bottom":291.296875,"left":59},
          "treeRect":{"x":34,"y":34,"width":1571,"height":268.296875,"top":34,"right":1605,"bottom":302.296875,"left":34},
          "hovRect":{"x":59,"y":79,"width":1535,"height":46.296875,"top":79,"right":1594,"bottom":125.296875,"left":59},
          "startMousePos":{"clientX":220,"clientY":157},
          "mousePos":{"clientX":213,"clientY":124}
        });

        exect_queries_before_and_after(simple_config_with_number, init_jl_value_with_number_and_group, onChange, [
          '(num == 1 || (num == 2 && num == 3))',
          '((num == 2 && num == 3) || num == 1)'
        ]);
      });
    });
  });


  //todo: change field, op, value

});


//////////////////////////////////////////////////////////////////////////////////////////


import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import moment from 'moment';
const stringify = JSON.stringify;

import {
  Query, Builder, Utils, BasicConfig,
} from 'react-awesome-query-builder';
const {
  uuid, 
  checkTree, loadTree, loadFromJsonLogic, 
  queryString, sqlFormat, mongodbFormat, jsonLogicFormat, queryBuilderFormat, getTree,
} = Utils;
import AntdConfig from 'react-awesome-query-builder/config/antd';
import AntdWidgets from 'react-awesome-query-builder/components/widgets/antd';
const {
    FieldDropdown,
    FieldCascader,
    FieldTreeSelect,
} = AntdWidgets;

//////////////////////////////////////////////////////////////////////////////////////////
// utils

const with_qb = (config_fn, value, valueFormat, checks) => {
  do_with_qb(BasicConfig, config_fn, value, valueFormat, checks);
};

const with_qb_ant = (config_fn, value, valueFormat, checks) => {
  do_with_qb(AntdConfig, config_fn, value, valueFormat, checks);
};

const with_qb_skins = (config_fn, value, valueFormat, checks) => {
  do_with_qb(BasicConfig, config_fn, value, valueFormat, checks);
  do_with_qb(AntdConfig, config_fn, value, valueFormat, checks);
};

const do_with_qb = (BasicConfig, config_fn, value, valueFormat, checks) => {
  const config = config_fn(BasicConfig);
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

const do_export_checks = (config_fn, value, valueFormat, expects) => {
  const config = config_fn(BasicConfig);
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
      const safe_logic = logic ? JSON.parse(JSON.stringify(logic)) : undefined;
      expect(safe_logic).to.eql(expects["logic"]);
      if (expects["logic"])
        expect(errors).to.eql([]);
    });

    it('should work to QueryBuilder', () => {
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
  const targetContainer = targetRule.closest('.group-or-rule-container');
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

const expect_queries_before_and_after = (config_fn, init_value_jl, onChange, queries) => {
  const config = config_fn(BasicConfig);
  const initTreeString = queryString(loadFromJsonLogic(init_value_jl, config), config);
  expect(initTreeString).to.equal(queries[0]);

  const changedTreeString = queryString(onChange.getCall(0).args[0], config);
  expect(changedTreeString).to.equal(queries[1]);
};

const expect_jlogic_before_and_after = (config_fn, init_value_jl, onChange, jlogics, changeIndex = 0) => {
  const config = config_fn(BasicConfig);
  const {logic: initTreeJl} = jsonLogicFormat(loadFromJsonLogic(init_value_jl, config), config);
  if (jlogics[0]) {
    expect(JSON.stringify(initTreeJl)).to.equal(JSON.stringify(jlogics[0]));
    //expect(initTreeJl).to.eql(jlogics[0]);
  }

  const {logic: changedTreeJl} = jsonLogicFormat(onChange.getCall(changeIndex).args[0], config);
  expect(JSON.stringify(changedTreeJl)).to.equal(JSON.stringify(jlogics[1]));
  //expect(changedTreeJl).to.eql(jlogics[1]);
};

//////////////////////////////////////////////////////////////////////////////////////////
// library

describe('library', () => {
  it('should be imported correctly', () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// basic query

describe('basic query', () => {
  const simple_config_with_number = (BasicConfig) => ({
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
  });

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
// query with conjunction

describe('query with conjunction', () => {
  const config_with_number_and_string = (BasicConfig) => ({
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
        fieldSettings: {
          validateValue: (val, fieldSettings) => {
            return (val.length < 10 && (val == "" || val.match(/^[A-Za-z0-9_-]+$/) !== null));
          },
        },
        mainWidgetProps: {
          valueLabel: "Login",
          valuePlaceholder: "Enter login",
        },
      }
    },
  });

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
      with_qb_skins(config_with_number_and_string, init_jl_value_with_number_and_string, 'JsonLogic', (qb) => {
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
// query with subquery and datetime types

describe('query with subquery and datetime types', () => {
  const config_with_date_and_time = (BasicConfig) => ({
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
  });

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
      with_qb_skins(config_with_date_and_time, init_jl_value_with_date_and_time, 'JsonLogic', (qb) => {
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
// query with select

describe('query with select', () => {
  const config_with_select = (BasicConfig) => ({
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
  });

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
      with_qb_skins(config_with_select, init_jl_value_with_select, 'JsonLogic', (qb) => {
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
// query with !struct and !group

describe('query with !struct', () => {

  const config_with_struct_and_group = (BasicConfig) => ({
    ...BasicConfig,
    fields: {
      user: {
        label: 'User',
        tooltip: 'Group of fields',
        type: '!struct',
        subfields: {
          firstName: {
            label2: 'Username', //only for menu's toggler
            type: 'text',
            mainWidgetProps: {
              valueLabel: "Name",
              valuePlaceholder: "Enter name",
            },
          },
          login: {
            type: 'text',
            mainWidgetProps: {
              valueLabel: "Login",
              valuePlaceholder: "Enter login",
            },
          },
        }
      },
      results: {
        label: 'Results',
        type: '!group',
        subfields: {
          slider: {
            label: 'Slider',
            type: 'number',
            preferWidgets: ['slider', 'rangeslider'],
            valueSources: ['value', 'field'],
            fieldSettings: {
              min: 0,
              max: 100,
              step: 1,
              marks: {
                0: <strong>0%</strong>,
                100: <strong>100%</strong>
              },
            },
            //overrides
            widgets: {
              slider: {
                widgetProps: {
                  valuePlaceholder: "..Slider",
                }
              }
            },
          },
          stock: {
            label: 'In stock',
            type: 'boolean',
            defaultValue: true,
            mainWidgetProps: {
              labelYes: "+",
              labelNo: "-"
            }
          },
        }
      },
    }
  });

  const init_jl_value_with_struct_and_group = {
    "and": [
      {
        "and": [
          { "==": [ { "var": "results.slider" }, 22 ] },
          { "<=": [ 13, { "var": "results.slider" }, 36 ] },
          { "==": [ { "var": "results.stock" }, true ] }
        ]
      },
      { "==": [ { "var": "user.firstName" }, "abc" ] },
      { "!!": { "var": "user.login" } }
    ]
  };

  describe('import', () => {
    it('should work with value of JsonLogic format', () => {
      with_qb_skins(config_with_struct_and_group, init_jl_value_with_struct_and_group, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    do_export_checks(config_with_struct_and_group, init_jl_value_with_struct_and_group, 'JsonLogic', {
      "query": "((results.slider == 22 && results.stock == true) && user.firstName == \"abc\" && !!user.login)",
      "queryHuman": "((Results.Slider == 22 AND Results.In stock) AND Username == \"abc\" AND User.login IS NOT EMPTY)",
      "sql": "((results.slider = 22 AND results.stock = true) AND user.firstName = 'abc' AND user.login IS NOT EMPTY)",
      "mongo": {
        "results": {
          "$elemMatch": {
            "slider": 22,
            "stock": true
          }
        },
        "user.firstName": "abc",
        "user.login": {
          "$exists": true
        }
      },
      "logic": {
        "and": [
          {
            "and": [
              {
                "==": [
                  {
                    "var": "results.slider"
                  },
                  22
                ]
              },
              {
                "==": [
                  {
                    "var": "results.stock"
                  },
                  true
                ]
              }
            ]
          },
          {
            "==": [
              {
                "var": "user.firstName"
              },
              "abc"
            ]
          },
          {
            "!!": {
              "var": "user.login"
            }
          }
        ]
      }
    });
  });

});


//////////////////////////////////////////////////////////////////////////////////////////
// query with field compare

describe('query with field compare', () => {
  const simple_config_with_number = (BasicConfig) => ({
    ...BasicConfig,
    fields: {
      num: {
        label: 'Number',
        type: 'number',
        preferWidgets: ['number'],
      },
      num2: {
        label: 'Number2',
        type: 'number',
        preferWidgets: ['number'],
      },
    },
  });

  const init_jl_value_with_number_field_compare = {
    "and": [
      { "==": [ { "var": "num" }, { "var": "num2" } ] }
    ]
  };

  describe('import', () => {
    it('should work with simple value of JsonLogic format', () => {
      with_qb_skins(simple_config_with_number, init_jl_value_with_number_field_compare, 'JsonLogic', (qb) => {
        expect(qb.find('.query-builder')).to.have.length(1);
      });
    });
  });

  describe('export', () => {
    do_export_checks(simple_config_with_number, init_jl_value_with_number_field_compare, 'JsonLogic', {
      "query": "num == num2",
      "queryHuman": "Number == Number2",
      "sql": "num = num2",
      "mongo": {
        "$expr": {
          "$eq": [
            "$num",
            "$num2"
          ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "num"
              },
              {
                "var": "num2"
              }
            ]
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// query with func

describe('query with func', () => {
  const config_with_funcs = (BasicConfig) => ({
    ...BasicConfig,
    funcs: {
      LOWER: {
        label: 'Lowercase',
        mongoFunc: '$toLower',
        jsonLogic: "toLowerCase",
        jsonLogicIsMethod: true,
        returnType: 'text',
        args: {
          str: {
            label: "String",
            type: 'text',
            valueSources: ['value', 'field'],
          },
        }
      },
      LINEAR_REGRESSION: {
        label: 'Linear regression',
        returnType: 'number',
        formatFunc: ({coef, bias, val}, _) => `(${coef} * ${val} + ${bias})`,
        sqlFormatFunc: ({coef, bias, val}) => `(${coef} * ${val} + ${bias})`,
        mongoFormatFunc: ({coef, bias, val}) => ({'$sum': [{'$multiply': [coef, val]}, bias]}),
        jsonLogic: ({coef, bias, val}) => ({ "+": [ {"*": [coef, val]}, bias ] }),
        renderBrackets: ['', ''],
        renderSeps: [' * ', ' + '],
        args: {
          coef: {
            label: "Coef",
            type: 'number',
            defaultValue: 1,
            valueSources: ['value'],
          },
          val: {
            label: "Value",
            type: 'number',
            valueSources: ['value'],
          },
          bias: {
            label: "Bias",
            type: 'number',
            defaultValue: 0,
            valueSources: ['value'],
          }
        }
      },
    },
    fields: {
      num: {
        label: 'Number',
        type: 'number',
      },
      str: {
        label: 'String',
        type: 'text',
      },
    }
  });

  const init_jl_value_with_number = {
    "and": [{
      "==": [ { "var": "num" }, 2 ]
    }]
  };
  const init_jl_value_with_text = {
    "and": [{  "==": [ { "var": "str" }, "abc" ]  }]
  };

  it('set function for number', () => {
    with_qb(config_with_funcs, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--value .widget--valuesrc select')
        .simulate('change', { target: { value: 'func' } });
      qb
        .find('.rule .rule--value .widget--widget .rule--func select')
        .simulate('change', { target: { value: 'LINEAR_REGRESSION' } });
      qb
        .find('.rule .rule--value .widget--widget .rule--func--args .rule--func--arg')
        .at(2)
        .find('input')
        .simulate('change', { target: { value: '4' } });
      expect_jlogic_before_and_after(config_with_funcs, init_jl_value_with_number, onChange, [null,
        { "and": [{ "==": [
          { "var": "num" }, 
          { "+": [ { "*": [ 1, 4 ] }, 0 ] }
        ] }] }
      ], 2);
      const updatedTree = onChange.getCall(2).args[0];
      do_export_checks(config_with_funcs, updatedTree, 'default', {
        "query": "num == (1 * 4 + 0)",
        "queryHuman": "Number == (1 * 4 + 0)",
        "sql": "num = (1 * 4 + 0)",
        "mongo": {
          "$expr": {
            "$eq": [
              "$num",
              {
                "$sum": [
                  {
                    "$multiply": [
                      1,
                      4
                    ]
                  },
                  0
                ]
              }
            ]
          }
        },
        "logic": {
          "and": [
            {
              "==": [
                {
                  "var": "num"
                },
                {
                  "+": [
                    {
                      "*": [
                        1,
                        4
                      ]
                    },
                    0
                  ]
                }
              ]
            }
          ]
        }
      });
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////
// config

describe('config', () => {
  const config_with_struct = (BasicConfig) => ({
    ...BasicConfig,
    fields: {
      user: {
        label: 'User',
        tooltip: 'Group of fields',
        type: '!struct',
        subfields: {
          login: {
            type: 'text',
          },
          info: {
            type: '!struct',
            subfields: {
              firstName: {
                type: 'text',
              },
            }
          }
        }
      },
    },
  });
  const config_with_cascader = (AntdConfig) => {
    const config = config_with_struct(AntdConfig);
    return {
      ...config,
      settings: {
        ...config.settings,
        renderField: (props) => <FieldCascader {...props} />,
      },
    };
  };
  const config_with_tree_select = (AntdConfig) => {
    const config = config_with_struct(AntdConfig);
    return {
      ...config,
      settings: {
        ...config.settings,
        renderField: (props) => <FieldTreeSelect {...props} />,
      },
    };
  };
  const config_with_dropdown = (AntdConfig) => {
    const config = config_with_struct(AntdConfig);
    return {
      ...config,
      settings: {
        ...config.settings,
        renderField: (props) => <FieldDropdown {...props} />,
      },
    };
  };

  const init_jl_value_with_struct_and_group = {
    "and": [
      { "==": [ { "var": "user.info.firstName" }, "abc" ] },
    ]
  };

  it('should render select by default', () => {
    with_qb_ant(config_with_struct, init_jl_value_with_struct_and_group, 'JsonLogic', (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
      expect(qb.find('.ant-select-selection-item').at(0).text()).to.equal("user.info.firstName");
    });
  });

  it('should render cascader', () => {
    with_qb_ant(config_with_cascader, init_jl_value_with_struct_and_group, 'JsonLogic', (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
      expect(qb.find('.ant-cascader-picker-label').text()).to.equal("User / info / firstName");
    });
  });

  it('should render tree select', () => {
    with_qb_ant(config_with_tree_select, init_jl_value_with_struct_and_group, 'JsonLogic', (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
      expect(qb.find('.ant-select.ant-tree-select')).to.have.length(1);
      expect(qb.find('.ant-select-selection-item').at(0).text()).to.equal("firstName");
    });
  });

  it('should render tree dropdown', () => {
    with_qb_ant(config_with_dropdown, init_jl_value_with_struct_and_group, 'JsonLogic', (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
      expect(qb.find('.ant-dropdown-trigger span').at(0).text().trim()).to.equal("firstName");
    });
  });

});


//////////////////////////////////////////////////////////////////////////////////////////
// proximity

describe('proximity', () => {
  const config_with_prox = (BasicConfig) => ({
    ...BasicConfig,
    fields: {
      str: {
        label: 'String',
        type: 'text',
      },
    },
  });
  
  const init_value_with_prox = {
    type: "group",
    id: uuid(),
    children1: {
      [uuid()]: {
        type: "rule",
        properties: {
          field: "str",
          operator: "proximity",
          value: [ "a", "b" ],
          valueSrc: [ "value", "value" ],
          valueType: [ "text", "text" ],
          operatorOptions: {
            proximity: 3
          }
        }
      },
    },
    properties: {
      conjunction: "AND",
      not: false
    }
  };

  it('should import', () => {
    with_qb(config_with_prox, init_value_with_prox, 'default', (qb) => {
      expect(qb.find('.query-builder')).to.have.length(1);
    });
  });

  describe('export', () => {
    do_export_checks(config_with_prox, init_value_with_prox, 'default', {
      "query": "str \"a\" NEAR/3 \"b\"",
      "queryHuman": "String \"a\" NEAR/3 \"b\"",
      "sql": "CONTAINS(str, 'NEAR((a, b), 3)')"
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// interactions

describe('interactions', () => {
  const simple_config_with_numbers_and_str = (BasicConfig) => ({
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
      num2: {
        label: 'Number2',
        type: 'number',
        preferWidgets: ['number'],
      },
      str: {
        label: 'String',
        type: 'text',
      },
      str2: {
        label: 'String',
        type: 'text',
        excludeOperators: ['equal'],
      },
    },
  });

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

  it('click on remove single rule will leave empty rule', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
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
  });

  it('click on remove group will leave empty rule', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_group, 'JsonLogic', (qb, onChange) => {
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
  });

  it('click on add rule will add new empty rule', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
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
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.group--actions button')
        .at(1)
        .simulate('click');
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(2);
      const child = changedTree.children1[childKeys[1]];
      expect(child.type).to.equal("group");
      expect(child.properties.conjunction).to.equal("AND"); //default
      const subchildKeys = Object.keys(child.children1);
      const subchild = child.children1[subchildKeys[0]];
      expect(subchild).to.eql({
        type: 'rule', 
        properties: {field: null, operator: null, value: [], valueSrc: []}
      });
    });
  });

  it('change field to of same type will same op & value', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--field select')
        .simulate('change', { target: { value: 'num2' } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal('num2');
      expect(child.properties.operator).to.equal('equal');
      expect(child.properties.value).to.eql([2]);
    });
  });

  it('change field to of another type will flush value and incompatible op', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--field select')
        .simulate('change', { target: { value: 'str2' } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal('str2');
      expect(child.properties.operator).to.equal(null);
      expect(child.properties.value).to.eql([]);
    });
  });

  it('change field to of another type will flush value and leave compatible op', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--field select')
        .simulate('change', { target: { value: 'str' } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal('str');
      expect(child.properties.operator).to.equal('equal');
      expect(child.properties.value).to.eql([undefined]);
    });
  });

  it('set not', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.group--conjunctions input[type="checkbox"]')
        .simulate('change', { target: { checked: true } });
      expect_jlogic_before_and_after(simple_config_with_numbers_and_str, init_jl_value_with_number, onChange, [null,
        { "!" : { "and": [{ "==": [ { "var": "num" }, 2 ] }] } }
      ]);
    });
  });

  it('change conjunction from AND to OR', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.group--conjunctions input[type="radio"][value="OR"]')
        .simulate('change', { target: { value: "OR" } });
      expect_jlogic_before_and_after(simple_config_with_numbers_and_str, init_jl_value_with_number, onChange, [null,
        { "or": [{ "==": [ { "var": "num" }, 2 ] }] }
      ]);
    });
  });

  it('change value source to another field of same type', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--value .widget--valuesrc select')
        .simulate('change', { target: { value: 'field' } });
      qb
        .find('.rule .rule--value .widget--widget select')
        .simulate('change', { target: { value: 'num2' } });
      expect_jlogic_before_and_after(simple_config_with_numbers_and_str, init_jl_value_with_number, onChange, [null,
        { "and": [{ "==": [ { "var": "num" }, { "var": "num2" } ] }] }
      ], 1);
    });
  });

  it('change op from equal to not_equal', () => {
    with_qb(simple_config_with_numbers_and_str, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--operator select')
        .simulate('change', { target: { value: 'not_equal' } });
      expect_jlogic_before_and_after(simple_config_with_numbers_and_str, init_jl_value_with_number, onChange, [null,
        { "and": [{ "!=": [ { "var": "num" }, 2 ] }] }
      ]);
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////
// widgets

const config_with_all_types = (BasicConfig) => ({
  ...BasicConfig,
  fields: {
    num: {
      label: 'Number',
      type: 'number',
      preferWidgets: ['number'],
    },
    str: {
      label: 'String',
      type: 'text',
    },
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
    slider: {
      label: 'Slider',
      type: 'number',
      preferWidgets: ['slider', 'rangeslider'],
      fieldSettings: {
        min: 0,
        max: 100,
        step: 1,
      },
    },
    stock: {
      label: 'In stock',
      type: 'boolean',
      defaultValue: true,
    },
    color: {
      label: 'Color',
      type: 'select',
      listValues: [
        { value: 'yellow', title: 'Yellow' },
        { value: 'green', title: 'Green' },
        { value: 'orange', title: 'Orange' },
      ],
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
});

const init_jl_value_with_number = {
  "and": [{  "==": [ { "var": "num" }, 2 ]  }]
};
const init_jl_value_with_text = {
  "and": [{  "==": [ { "var": "str" }, "abc" ]  }]
};
const init_jl_value_with_date = {
  "and": [{  "==": [ { "var": "date" }, "2020-05-26T00:00:00.000Z" ]  }]
};
const init_jl_value_with_datetime = {
  "and": [{  "==": [ { "var": "datetime" }, "2020-05-26T02:30:00.000Z" ]  }]
};

describe('widgets', () => {
  it('change number value', () => {
    with_qb_skins(config_with_all_types, init_jl_value_with_number, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--value .widget--widget input')
        .simulate('change', { target: { value: '3' } });
      expect_jlogic_before_and_after(config_with_all_types, init_jl_value_with_number, onChange, [null,
        { "and": [{ "==": [ { "var": "num" }, 3 ] }] }
      ]);
    });
  });

  it('change text value', () => {
    with_qb_skins(config_with_all_types, init_jl_value_with_text, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--value .widget--widget input')
        .simulate('change', { target: { value: 'def' } });
      expect_jlogic_before_and_after(config_with_all_types, init_jl_value_with_text, onChange, [null,
        { "and": [{ "==": [ { "var": "str" }, 'def' ] }] }
      ]);
    });
  });

  it('change date value', () => {
    with_qb(config_with_all_types, init_jl_value_with_date, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--value .widget--widget input')
        .simulate('change', { target: { value: '2020-05-05' } });
      expect_jlogic_before_and_after(config_with_all_types, init_jl_value_with_date, onChange, [null,
        { "and": [{ "==": [ { "var": "date" }, '2020-05-05T00:00:00.000Z' ] }] }
      ]);
    });
  });

  it('change datetime value', () => {
    with_qb(config_with_all_types, init_jl_value_with_datetime, 'JsonLogic', (qb, onChange) => {
      qb
        .find('.rule .rule--value .widget--widget input')
        .simulate('change', { target: { value: '2020-05-05T02:30' } });
      expect_jlogic_before_and_after(config_with_all_types, init_jl_value_with_datetime, onChange, [null,
        { "and": [{ "==": [ { "var": "datetime" }, '2020-05-05T02:30:00.000Z' ] }] }
      ]);
    });
  });

  //todo: time, slider, bool, multiselect, select
});


describe('antdesign widgets', () => {
  it('change date value', () => {
    with_qb_ant(config_with_all_types, init_jl_value_with_date, 'JsonLogic', (qb, onChange) => {
      qb
        .find('DateWidget')
        .instance()
        .handleChange(moment('2020-05-05'));
      expect_jlogic_before_and_after(config_with_all_types, init_jl_value_with_date, onChange, [null,
        { "and": [{ "==": [ { "var": "date" }, '2020-05-05T00:00:00.000Z' ] }] }
      ]);
    });
  });

  //todo: datetime, time, slider, bool, multiselect, select + treeselect, treemultiselect, range, slider
});


//////////////////////////////////////////////////////////////////////////////////////////
// drag-n-drop

describe('drag-n-drop', () => {
  const simple_config_with_number = (BasicConfig) => ({
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
  });

  const simple_config_with_number_without_regroup = (BasicConfig) => ({
    ...simple_config_with_number(BasicConfig),
    settings: {
      ...BasicConfig.settings,
      canRegroup: false,
    }
  });

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

  const init_jl_value_with_numbers_and_group = {
    "or": [
      { "==": [ { "var": "num" }, 1 ] },
      { "==": [ { "var": "num" }, 2 ] },
      { "and": [
        {
          "==": [ { "var": "num" }, 3 ]
        }, {
          "==": [ { "var": "num" }, 4 ]
        }
      ]}
    ]
  };

  const init_jl_value_with_groups = {
    "or": [
      { "and": [
        {
          "==": [ { "var": "num" }, 1 ]
        }, {
          "==": [ { "var": "num" }, 2 ]
        }
      ]}, { "and": [
        {
          "==": [ { "var": "num" }, 3 ]
        }, {
          "==": [ { "var": "num" }, 4 ]
        }
      ]}
    ]
  };

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

      expect_queries_before_and_after(simple_config_with_number, init_jl_value_with_group, onChange, [
        '(num == 1 && num == 2)',
        '(num == 2 && num == 1)'
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

      expect_queries_before_and_after(simple_config_with_number, init_jl_value_with_number_and_group, onChange, [
        '(num == 1 || (num == 2 && num == 3))',
        '((num == 2 && num == 3) || num == 1)'
      ]);
    });
  });

  it('should move rule into group', () => {
    const do_test = (config, value, checks) => {
      with_qb(config, value, 'JsonLogic', (qb, onChange) => {
        const secondRule = qb.find('.rule').at(1);
        const group = qb.find('.group--children .group').at(0);
        const groupHeader = group.find('.group--header').first();
  
        simulate_drag_n_drop(secondRule, groupHeader, {
          "dragRect":{"x":83,"y":167,"width":1525,"height":43,"top":167,"right":1608,"bottom":210,"left":83},
          "plhRect":{"x":59,"y":129,"width":1525,"height":43,"top":129,"right":1584,"bottom":172,"left":59},
          "treeRect":{"x":34,"y":34,"width":1571,"height":430,"top":34,"right":1605,"bottom":464,"left":34},
          "hovRect":{"x":59,"y":182,"width":1535,"height":158,"top":182,"right":1594,"bottom":340,"left":59},
          "startMousePos":{"clientX":81,"clientY":147},
          "mousePos":{"clientX":105,"clientY":185}
        });

        checks(config, value, onChange);
      });
    };

    do_test(simple_config_with_number, init_jl_value_with_numbers_and_group, (config, value, onChange) => {
      expect_queries_before_and_after(config, value, onChange, [
        '(num == 1 || num == 2 || (num == 3 && num == 4))',
        '(num == 1 || (num == 2 && num == 3 && num == 4))'
      ]);
    });
    
    do_test(simple_config_with_number_without_regroup, init_jl_value_with_numbers_and_group, (_config, _value, onChange) => {
      sinon.assert.notCalled(onChange);
    });
  });

  it('should move rule out of group', () => {
    const do_test = (config, value, checks) => {
      with_qb(config, value, 'JsonLogic', (qb, onChange) => {
        const firstRuleInGroup = qb.find('.rule').at(1);
        const group = qb.find('.group--children .group').at(0);
        const groupHeader = group.find('.group--header').first();
  
        simulate_drag_n_drop(firstRuleInGroup, groupHeader, {
          "dragRect":{"x":81,"y":80,"width":1489,"height":43,"top":80,"right":1570,"bottom":123,"left":81},
          "plhRect":{"x":84,"y":119,"width":1489,"height":43,"top":119,"right":1573,"bottom":162,"left":84},
          "treeRect":{"x":34,"y":34,"width":1571,"height":203,"top":34,"right":1605,"bottom":237,"left":34},
          "hovRect":{"x":59,"y":76,"width":1535,"height":150,"top":76,"right":1594,"bottom":226,"left":59},
          "startMousePos":{"clientX":107,"clientY":139},
          "mousePos":{"clientX":104,"clientY":100}
        });
  
        checks(config, value, onChange);
      });
    };

    do_test(simple_config_with_number, init_jl_value_with_number_and_group_3, (config, value, onChange) => {
      expect_queries_before_and_after(config, value, onChange, [
        '(num == 1 || (num == 2 && num == 3 && num == 4))',
        '(num == 1 || num == 2 || (num == 3 && num == 4))'
      ]);
    });
    
    do_test(simple_config_with_number_without_regroup, init_jl_value_with_number_and_group_3, (_config, _value, onChange) => {
      sinon.assert.notCalled(onChange);
    });
  });

  it('should move group before group', () => {
    with_qb(simple_config_with_number_without_regroup, init_jl_value_with_groups, 'JsonLogic', (qb, onChange) => {
      const firstGroup = qb.find('.group--children .group').at(0);
      const secondGroup = qb.find('.group--children .group').at(1);
      const firstGroupHeader = firstGroup.find('.group--header').first();
      const secondGroupHeader = secondGroup.find('.group--header').first();

      simulate_drag_n_drop(secondGroup, firstGroupHeader, {
        "dragRect":{"x":55,"y":83,"width":1448,"height":159.296875,"top":83,"right":1503,"bottom":242.296875,"left":55},
        "plhRect":{"x":59,"y":250.5,"width":1448,"height":159.296875,"top":250.5,"right":1507,"bottom":409.796875,"left":59},
        "treeRect":{"x":34,"y":34,"width":1494,"height":386.796875,"top":34,"right":1528,"bottom":420.796875,"left":34},
        "hovRect":{"x":59,"y":79,"width":1458,"height":161.5,"top":79,"right":1517,"bottom":240.5,"left":59},
        "startMousePos":{"clientX":201,"clientY":272},
        "mousePos":{"clientX":197,"clientY":104}
      });

      expect_queries_before_and_after(simple_config_with_number_without_regroup, init_jl_value_with_groups, onChange, [
        '((num == 1 && num == 2) || (num == 3 && num == 4))',
        '((num == 3 && num == 4) || (num == 1 && num == 2))'
      ]);
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////


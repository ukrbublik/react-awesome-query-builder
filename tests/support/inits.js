
import { Utils } from "react-awesome-query-builder";
const { uuid } = Utils;

export const tree_with_number = {
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

export const with_number = {
  "and": [{
    "==": [
      { "var": "num" },  2
    ]
  }]
};

export const with_range_slider = {
  "and": [{
    "<=": [
      18, 
      { "var": "slider" },
      42
    ]
  }]
};

export const with_range_dates = {
  "and": [{
    "<=": [
      "2020-05-10T21:00:00.000Z", 
      { "var": "date" },
      "2020-05-15T21:00:00.000Z"
    ]
  }]
};

export const with_range_bad_dates = {
  "and": [{
    "<=": [
      "2020-05-10TTTT", 
      { "var": "date" },
      "2020-05-15T21:00:00.000Z"
    ]
  }]
};

export const with_undefined_as_number = {
  "and": [{
    "==": [
      { "var": "num" },  undefined
    ]
  }]
};

export const with_number_not_in_group = {
  "==": [
    { "var": "num" },  2
  ]
};
  
export const with_number_and_string = {
  "or": [{
    "<": [
      { "var": "num" },  2
    ]
  }, {
    "==": [
      { "var": "login" },  "ukrbublik"
    ]
  }]
};
  
export const with_not_number_and_string = {
  "!": {
    "or": [{
      "<": [ { "var": "num" }, 2 ]
    }, {
      "==": [
        { "var": "login" },  "ukrbublik"
      ]
    }]
  }
};
  
export const with_date_and_time = {
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
  
export const with_select_and_multiselect = {
  "and": [{
    "==": [ { "var": "color" }, "yellow" ]
  }, {
    "all": [
      { "var": "multicolor" },
      { "in": [ { "var": "" }, [ "yellow", "green" ] ] }
    ]
  }]
};
  
export const with_struct_and_group = {
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
  
export const with_struct_and_group_mixed_obsolete = {
  "and": [
    { "==": [ { "var": "results.slider" }, 22 ] },
    { "==": [ { "var": "user.firstName" }, "abc" ] },
  ]
};

export const with_is_empty_in_some = {
  "and": [
    { "some": [
      { "var": "results" },
      {
        "!": { "var": "grade" }
      }
    ] }
  ]
};

export const with_bad_subfield_in_group = {
  "and": [
    { "some": [
      { "var": "results" },
      {
        "!": { "var": "bad-subfield" }
      }
    ] }
  ]
};

export const with_select_not_any_in_in_some = {
  "and": [
    { "some": [
      { "var": "cars" },
      { "!": 
        { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] }
      }
    ] }
  ]
};

export const with_not_and_in_some = {
  "and": [
    { "some": [
      { "var": "cars" },
      { "!": { "and": [
        { "==": [ { "var": "year" }, null ] },
        { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } }
      ] } }
    ] }
  ]
};

export const with_nested_group = {
  "and": [
    { "some": [
      { "var": "results" },
      {
        "and": [
          {
            ">": [  { "var": "score" },  15  ]
          }, {
            "some": [
              { "var": "user" },
              { "==": [  { "var": "name" },  "denis"  ] }
            ]
          }
        ]
      }
    ] }
  ]
};

export const two_rules_with_nested_group = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "==": [  { "var": "score" },  11  ] }
      ]
    },
    {
      "some": [
        { "var": "results" },
        { "some": [
          { "var": "user" }, 
          { "==": [ { "var": "name" },  "aaa" ] }
        ] }
      ]
    }
  ]
};

export const with_struct_inside_group = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "==": [  { "var": "user.name" },  "ddd"  ] }
      ]
    }
  ]
};

export const with_struct_inside_group_1_1s = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "and": [
          { ">=": [  { "var": "user.age" },  18  ] },
          { "==": [  { "var": "score" },  5  ] }
        ] }
      ]
    }
  ]
};

export const with_struct_inside_group_2 = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "and": [
          { "==": [  { "var": "user.name" },  "denis"  ] },
          { ">=": [  { "var": "user.age" },  18  ] }
        ] }
      ]
    }
  ]
};

export const with_struct_inside_group_1_1 = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "and": [
          { "==": [  { "var": "user.name" },  "denis"  ] },
          { "==": [  { "var": "quiz.name" },  "ethics"  ] }
        ] }
      ]
    }
  ]
};

export const with_struct_inside_group_2_2 = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "and": [
          { "==": [  { "var": "user.name" },  "denis"  ] },
          { "==": [  { "var": "quiz.name" },  "ethics"  ] },
          { ">=": [  { "var": "user.age" },  18  ] },
          { ">": [  { "var": "quiz.max_score" },  70  ] }
        ] }
      ]
    }
  ]
};

export const with_struct_inside_group_1_1_1s = {
  "and": [
    {
      "some": [
        { "var": "results" },
        { "and": [
          { ">=": [  { "var": "user.age" },  18  ] },
          { ">": [  { "var": "quiz.max_score" },  70  ] },
          { "<": [  { "var": "score" },  70  ] }
        ] }
      ]
    }
  ]
};

export const with_two_groups_1 = {
  "and": [
    {
      "and": [
        {
          "==": [ { "var": "results.user.name" },  "ddd" ]
        }, 
        {
          "==": [ { "var": "results.score" },  2 ]
        },
      ]
    },
    {
      "==": [ { "var": "group2.inside" },  33 ]
    },
    {
      "==": [ { "var": "results.score" },  2 ]
    },
    {
      "==": [ { "var": "num" },  -1 ]
    }
  ]
};

export const with_group_inside_struct_1 = {
  "and": [
    {
      "some": [
        { "var": "vehicles.cars" },
        { "and": [
          { "==": [ { "var": "vendor" }, "Toyota" ] }
        ] }
      ]
    }
  ]
};

export const with_group_inside_struct_2 = {
  "and": [
    {
      "some": [
        { "var": "vehicles.cars" },
        { "and": [
          { "==": [ { "var": "vendor" }, "Toyota" ] },
          { "==": [ { "var": "year" }, 2006 ] }
        ] }
      ]
    }
  ]
};

export const with_group_and_struct_deep = {
  "and": [
    {
      "some": [
        { "var": "vehicles.cars" },
        {
          "and": [
            { "==": [ { "var": "manufactured.vendor" }, "Toyota" ] },
            {
              "some": [
                { "var": "manufactured.type" },
                {
                  "and": [
                    { "==": [ { "var": "segment" }, "C" ] },
                    { "==": [ { "var": "class" }, "Mid" ] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const with_group_and_struct_deep_old = {
  "and": [
    {
      "some": [
        { "var": "vehicles.cars" },
        {
          "and": [
            { "==": [ { "var": "manufactured.vendor" }, "Toyota" ] },
            { "==": [ { "var": "manufactured.type.segment" }, "C" ] },
            { "==": [ { "var": "manufactured.type.class" }, "Mid" ] },
          ]
        }
      ]
    }
  ]
};

export const with_group_and_struct_deep_old2 = {
  "and": [
    { "==": [ { "var": "vehicles.cars.manufactured.vendor" }, "Toyota" ] },
    { "==": [ { "var": "vehicles.cars.manufactured.type.segment" }, "C" ] },
    { "==": [ { "var": "vehicles.cars.manufactured.type.class" }, "Mid" ] },
  ]
};

export const with_number_field_compare = {
  "and": [
    { "==": [ { "var": "num" }, { "var": "num2" } ] }
  ]
};

export const with_2_numbers = {
  "and": [
    { "==": [ { "var": "num" }, 2 ] },
    { "==": [ { "var": "num" }, 3 ] }
  ]
};

export const with_num_and_num2 = {
  "and": [
    { "==": [ { "var": "num" }, 2 ] },
    { "==": [ { "var": "num2" }, 3 ] }
  ]
};

export const with_group = {
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

export const with_text = {
  "and": [{  "==": [ { "var": "str" }, "abc" ]  }]
};

export const with_date = {
  "and": [{  "==": [ { "var": "date" }, "2020-05-26T00:00:00.000Z" ]  }]
};

export const with_datetime = {
  "and": [{  "==": [ { "var": "datetime" }, "2020-05-26T02:30:00.000Z" ]  }]
};

export const with_select = {
  "and": [{  "==": [ { "var": "color" }, "red" ]  }]
};

export const with_bool = {
  "and": [{  "==": [ { "var": "stock" }, true ]  }]
};

export const with_slider = {
  "and": [{  "==": [ { "var": "slider" }, 32 ]  }]
};

export const with_time = {
  "and": [{  "==": [ { "var": "time" }, 60*60*2+60*20 ]  }]
};

export const with_multiselect = {
  "and": [
    {
      "all": [
        { "var": "multicolor" },
        { "in": [ { "var": "" }, [ "green", "orange" ] ] }
      ]
    }
  ]
};

export const with_treeselect = {
  "and": [{  "==": [ { "var": "selecttree" }, "2" ]  }]
};

export const with_ops = {
  "and": [
    {
      "!=": [ { "var": "num" },  2 ]
    }, {
      "in": [ "abc",  { "var": "str" } ]
    }, {
      "!": {
        "in": [ "xyz", { "var": "str" } ]
      }
    }, {
      "<=": [  1,  { "var": "num" },  2  ]
    }, {
      "!": {
        "<=": [  3,  { "var": "num" },  4  ]
      }
    }, {
      "!": { "var": "num" }
    }, {
      "in": [
        { "var": "color" },
        [ "yellow" ]
      ]
    }, {
      "!": {
        "in": [
          { "var": "color" },  [ "green" ]
        ]
      }
    }, {
      "!": {
        "all": [
          { "var": "multicolor" },
          { "in": [ { "var": "" },  [ "yellow" ] ] }
        ]
      }
    }
  ]
};

export const with_multiselecttree = {
  "and": [
    {
      "all": [
        { "var": "multiselecttree" },
        { "in": [ { "var": "" }, [ "2", "5" ] ] }
      ]
    }
  ]
};

export const with_number_and_group_3 = {
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

export const with_number_and_group_1 = {
  "or": [
    { "==": [ { "var": "num" }, 1 ] },
    { "and": [
      {
        "==": [ { "var": "num" }, 2 ]
      }
    ]}
  ]
};

export const with_number_and_group = {
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

export const with_numbers_and_group = {
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

export const with_groups = {
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

export const with_nested = {
  "and": [
    { "==": [ { "var": "user.info.firstName" }, "abc" ] },
  ]
};

export const with_func_tolower_from_field = {
  "and": [
    {
      "==": [
        { "var": "str" },
        { "toLowerCase": [
          { "var": "str2" }
        ] }
      ]
    }
  ]
};

export const with_func_linear_regression = {
  type: "group",
  id: uuid(),
  children1: {
    [uuid()]: {
      type: "rule",
      properties: {
        field: "num",
        operator: "equal",
        value: [
          {
            func: "LINEAR_REGRESSION",
            args: {
              coef: { value: 2 },
              bias: { value: 0 },
              val: { value: 3 }
            }
          }
        ],
        valueSrc: [ "func" ],
        valueType: [ "number" ],
        valueError: [ null ]
      }
    },
  },
  properties: {
    conjunction: "AND",
    not: false
  }
};

export const with_prox = {
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

export const with_jl_value = {
  "==": [
    { "var": "num" },  { "+": [1, 2] }
  ]
};

export const with_group_array_cars = {
  "and": [
    { ">": [
      { "reduce": [
        { "filter": [
          { "var": "cars" },
          { "and": [
            {
              "==": [ { "var": "vendor" }, "Toyota" ]
            }, {
              ">=": [ { "var": "year" }, 2010 ]
            }
          ] }
        ] },
        { "+": [ 1, { "var": "accumulator" } ] },
        0
      ] },
      2
    ] }
  ]
};

export const with_group_array_custom_operator = {
  "and": [
    { "custom_group_operator": [
      { "var": "cars" },
      { "and": [
        {
          "==": [ { "var": "vendor" }, "Toyota" ]
        }, {
          ">=": [ { "var": "year" }, 2010 ]
        }
      ] }
    ] }
  ]
};

// rare
export const with_fieldName = {
  "and": [{
    "==": [
      { "var": "state.input.num" },  2
    ]
  }]
};

// rare
export const with_groupVarKey = {
  "and": [
    {
      "==": [ { "shortcut": "stock" }, true ]
    }, {
      "some": [
        { "varValues": "results" },
        { ">": [ { "var": "score" }, 8 ] }
      ]
    }
  ]
};

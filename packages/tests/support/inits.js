

export const tree_with_empty_group = {
  type: "group",
  children1: [
    {
      type: "group",
      properties: {
        conjunction: "AND",
        not: false
      },
      children1: []
    },
  ]
};

export const tree_with_incorrect_value_type_in_rule = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      field: "num",
      operator: "equal",
      value: ["100"],
      valueType: ["string"],
    }
  }],
};

export const tree_with_missing_value_type_in_rule = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      field: "num",
      operator: "equal",
      value: ["5"],
    }
  }],
};

export const tree_with_empty_groups_and_incomplete_rules = {
  type: "group",
  children1: [
    {
      type: "group",
      children1: [
        {
          type: "rule",
          properties: {
            field: "num",
            operator: "between",
          }
        },
      ]
    },
    {
      type: "rule",
      properties: {
        field: "num",
        operator: "is_null",
      }
    },
    {
      type: "group",
      children1: [
        {
          type: "rule",
          properties: {
          }
        },
      ]
    },
    {
      type: "rule",
      properties: {
        field: "num",
        operator: "greater",
      }
    },
    {
      type: "rule",
      properties: {
        field: "num",
        operator: "less",
        value: [100],
      }
    },
    {
      type: "group"
    }
  ]
};

export const tree_with_number = {
  type: "group",
  children1: [
    {
      type: "rule",
      properties: {
        field: "num",
        operator: "equal",
        value: [2],
        valueSrc: ["value"],
        valueType: ["number"]
      }
    },
  ],
  properties: {
    conjunction: "AND",
    not: false
  }
};

export const empty = {
  "and": []
};

export const with_number = {
  "and": [{
    "==": [
      { "var": "num" },  2
    ]
  }]
};

export const with_uneven_number = {
  "and": [{
    "==": [
      { "var": "evenNum" },  7
    ]
  }]
};

export const with_uneven_number_bigger_than_max = {
  "and": [{
    "==": [
      { "var": "evenNum" },  13
    ]
  }]
};

export const with_numLess5_eq_7 = {
  "and": [{
    "==": [
      { "var": "numLess5" },  7
    ]
  }]
};

export const with_number_bigger_than_max = {
  "and": [{
    "==": [
      { "var": "num" },  200
    ]
  }]
};

export const with_range_bigger_than_max = {
  "and": [{
    "<=": [
      100,
      { "var": "num" },
      200
    ]
  }]
};

export const with_range_from_field_to_big_number = {
  "and": [{
    "<=": [
      { "var": "numField" },
      { "var": "num" },
      100
    ]
  }]
};

export const with_bad_range = {
  "and": [{
    "<=": [
      4,
      { "var": "num" },
      3
    ]
  }]
};

export const with_bad_range_bigger_than_max = {
  "and": [{
    "<=": [
      400,
      { "var": "num" },
      300
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

export const with_bad_date_range = {
  "and": [{
    "<=": [
      "2020-05-15T21:00:00.000Z", 
      { "var": "date" },
      "2020-05-10T21:00:00.000Z"
    ]
  }]
};

export const with_date_range = {
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

export const with_less = {
  "<": [ { "var": "num" }, 2 ]
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
        { "<=": [ 13, { "var": "results.slider" }, 36 ] }, // tip: invalid
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
export const spel_with_is_empty_in_some = "results.?[grade <= ''].size() > 0";

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
export const spel_with_select_not_any_in_in_some = "cars.?[!({'Ford', 'Toyota'}.?[true].contains(vendor))].size() > 0";

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
export const spel_with_not_and_in_some = "cars.?[!(year == null && !({'Ford', 'Toyota'}.?[true].contains(vendor)))].size() > 0";

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

export const spel_with_nested_group = "results.?[score > 15 && user.?[name == 'denis'].size() > 0].size() > 0";

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

export const spel_two_rules_with_nested_group = "(results.?[user.?[name == 'aaa'].size() > 0].size() > 0 && results.?[score == 11].size() > 0)";

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
  "and": [{  "==": [ { "var": "color" }, "orange" ]  }]
};

export const with_bad_select_value = {
  "and": [{  "==": [ { "var": "color" }, "unexisting" ]  }]
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

export const with_bad_multiselect_value = {
  "and": [
    {
      "all": [
        { "var": "multicolor" },
        { "in": [ { "var": "" }, [ "unexisting1", "orange", "unexisting2" ] ] }
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
      "==": [ { "var": "text" },  "Long\nText" ]
    }, {
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

export const with_func_linear_regression_tree = {
  type: "group",
  children1: [
    {
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
  ],
  properties: {
    conjunction: "AND",
    not: false
  }
};


export const with_func_linear_regression = {
  "and": [
    {
      "==": [
        { "var": "num" },
        { "+": [ { "*": [ 2, 3 ] }, 0 ] }
      ]
    }
  ]
};

export const with_func_relative_datetime = {
  "and": [ {
    "==": [
      { "var": "datetime" },
      { "date_add": [ { "now": [] }, 2, "day" ] }
    ]
  } ]
};

export const with_func_sum_of_multiselect = {
  "and": [ {
    "==": [
      { "var": "num" },
      { "sumOfMultiselect": [
        [3, 5]
      ] }
    ]
  } ]
};

export const with_func_sum_of_multiselect_spel = "num == {5}.sumOfMultiselect()";

export const with_func_sum_of_multiselect_in_lhs = {
  "and": [
    {
      "<=": [
        { "sumOfMultiselect": [
          [ 1, 2]
        ] },
        { "sumOfMultiselect": [
          [ 3, 4]
        ] },
        { "sumOfMultiselect": [
          [ 5, 6]
        ] },
      ]
    }
  ]
};

export const tree_with_vfunc_in_lhs_with_missing_args = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      fieldSrc: "func",
      field: {
        func: "vld.tfunc1",
        args: {
          str1: { valueSrc: "value", value: "aaaaa" },
          str2: { valueSrc: "value", value: "bbbbb" },
          // num1 has defaultValue
          // num2 has NO defaultValue !!!
        },
      },
      operator: "equal",
      value: ["xxxxxx"],
      valueSrc: ["value"],
    },
  }]
};

export const tree_with_vfunc_in_lhs_with_invalid_args_and_rhs = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      fieldSrc: "func",
      field: {
        func: "vld.tfunc1",
        args: {
          str1: { valueSrc: "value", value: "aaaaaa" },
          str2: { valueSrc: "value", value: "bbbbbb" },
          num1: { valueSrc: "value", value: 20 },
          num2: { valueSrc: "value", value: 4 },
        },
      },
      operator: "equal",
      value: ["xxxxxx"],
      valueSrc: ["value"],
    },
  }]
};

export const tree_with_vfunc_in_both_sides_with_invalid_args_in_nested_funcs = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      fieldSrc: "func",
      field: {
        func: "vld.tfunc1",
        args: {
          str1: { valueSrc: "value", value: "aaaaaa" },
          str2: {
            valueSrc: "func",
            value: {
              func: "vld.tfunc1",
              args: {
                str1: { valueSrc: "value", value: "_aaaaaa" },
                // str2 has defaultValue
                // num1 has defaultValue
                num2: { valueSrc: "value", value: 4 },
              }
            }
          },
          num1: { valueSrc: "value", value: 20 },
          num2: { valueSrc: "value", value: 4 },
        },
      },
      operator: "equal",
      value: [{
        func: "vld.tfunc1",
        args: {
          // str1 has defaultValue
          str2: { valueSrc: "value", value: "rbbbbbb" },
          // num1 has defaultValue
          num2: { valueSrc: "value", value: 13 },
        }
      }],
      valueSrc: ["func"],
    },
  }]
};

export const tree_with_vfunc_in_both_sides_with_missing_args_in_nested_funcs = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      fieldSrc: "func",
      field: {
        func: "vld.tfunc1",
        args: {
          str1: {
            valueSrc: "func",
            value: {
              func: "vld.tfunc2",
              args: {
                // num1 has defaultValue
                num2: { valueSrc: "value", value: 3 },
                num3: { valueSrc: "value", value: 4 },
              },
            }
          },
          str2: {
            valueSrc: "func",
            value: {
              func: "vld.tfunc2",
              args: {
                num1: { valueSrc: "value", value: -13 },
                // num2 has NO defaultValue !!!
                num3: { valueSrc: "value", value: -14 },
              }
            }
          },
          num1: { valueSrc: "value", value: 20 },
          num2: { valueSrc: "value", value: 4 },
        },
      },
      operator: "equal",
      value: [{
        func: "vld.tfunc1",
        args: {
          str1: { valueSrc: "value", value: "raaaaaaa" },
          str2: { valueSrc: "value", value: "rbbb" },
          num1: { valueSrc: "value", value: 3 },
          num2: { valueSrc: "value", value: 4 },
        }
      }],
      valueSrc: ["func"],
    },
  }]
};

export const tree_with_vfunc2_at_lhs = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      fieldSrc: "func",
      field: {
        func: "vld.tfunc2",
        args: {
          num1: { valueSrc: "value", value: 7 },
          num2: { valueSrc: "value", value: 7 },
          num3: { valueSrc: "value", value: 7 },
        }
      },
      operator: "equal",
      value: ["xxxxxxx"]
    }
  }],
};

export const tree_with_vfunc2_at_lhs_and_long_rhs = {
  type: "group",
  children1: [{
    type: "rule",
    properties: {
      fieldSrc: "func",
      field: {
        func: "vld.tfunc2",
        args: {
          num1: { valueSrc: "value", value: 7 },
          num2: { valueSrc: "value", value: 7 },
          num3: { valueSrc: "value", value: 7 },
        }
      },
      operator: "equal",
      value: ["xxxxxyyyyyzzz"]
    }
  }],
};

export const with_prox = {
  type: "group",
  children1: [
    {
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
  ],
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

export const with_group_count = {
  "and": [
    { "==": [
      { "reduce": [
        { "var": "cars" },
        {  "+": [ 1, {  "var": "accumulator" } ] },
        0
      ] },
      2
    ] }
  ]
};
export const spel_with_group_count = "cars.size() == 2";

export const with_not_group_count = {
  "and": [
    { "!": 
      { "==": [
        { "reduce": [
          { "var": "cars" },
          {  "+": [ 1, {  "var": "accumulator" } ] },
          0
        ] },
        2
      ] }
    }
  ]
};
export const with_not_group_count_out = {
  "and": [
    { "!=": [
      { "reduce": [
        { "var": "cars" },
        {  "+": [ 1, {  "var": "accumulator" } ] },
        0
      ] },
      2
    ] }
  ]
};
export const spel_with_not_group_count = "!(cars.size() == 2)";
export const spel_with_not_group_count_out = "cars.size() != 2";

export const with_not_group_not_filter = {
  "!": {
    "and": [
      { "==": [
        { "reduce": [
          {  "filter": [
            { "var": "cars" },
            {
              "!": { "==": [
                { "var": "vendor" },
                "Toyota"
              ] }
            }
          ] },
          { "+": [ 1, { "var": "accumulator" } ] },
          0
        ] },
        6
      ] }
    ]
  }
};
export const with_not_group_not_filter_out = {
  "!": {
    "and": [
      { "==": [
        { "reduce": [
          {  "filter": [
            { "var": "cars" },
            {
              "!=": [
                { "var": "vendor" },
                "Toyota"
              ]
            }
          ] },
          { "+": [ 1, { "var": "accumulator" } ] },
          0
        ] },
        6
      ] }
    ]
  }
};

export const spel_with_not_group_not_filter = "!(cars.?[!(vendor == 'Toyota')].size() == 6)";
export const spel_with_not_group_not_filter_out = "cars.?[vendor != 'Toyota'].size() != 6";

export const with_not_some_not_is_null = {
  "!": {
    "and": [
      { "some": [
        { "var": "cars" },
        { "!": {
          "==": [
            { "var": "vendor" },
            null
          ]
        } }
      ] }
    ]
  }
};
export const with_not_some_not_is_null_out = {
  "!": {
    "and": [
      { "some": [
        { "var": "cars" },
        { "!=": [
          { "var": "vendor" },
          null
        ] }
      ] }
    ]
  }
};

export const spel_with_not_some_not_is_null = "!(cars.?[!(vendor == null)].size() > 0)";
export const spel_with_not_some_not_is_null_out = "!(cars.?[vendor != null].size() > 0)";

export const spel_with_not_some_not_contains = "!(results.?[!(grade.contains('Toy'))].size() > 0)";
export const spel_with_not_some_not_contains_out = "!(results.?[!(grade.contains('Toy'))].size() > 0)";

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

export const with_autocomplete_strict_a = {
  "and": [{
    "==": [
      { "var": "autocompleteStrict" },
      "a"
    ]
  }]
};

export const with_autocomplete_multi_strict_a = {
  "and": [{
    "all": [
      { "var": "autocompleteMultipleStrict" },
      { "in": [{ "var": "" },
        [
          "a"
        ]
      ]}
    ]
  }]
};

export const with_different_groups = {
  "and": [
    {
      "some": [
        { "var": "results" },
        {
          "and": [
            { "==": [ { "var": "score" }, 5 ] },
            { "==": [ { "var": "grade" }, "A" ] }
          ]
        }
      ]
    },
    {
      "some": [
        { "var": "cars" },
        {
          "and": [
            { "==": [ { "var": "vendor" }, "Toyota" ] },
            { "==": [ { "var": "year" }, 2006 ] }
          ]
        }
      ]
    },
    {
      "or": [
        { "==": [ { "var": "num" }, 5 ] },
        { "==": [ { "var": "str" }, "five" ] }
      ]
    }
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

export const spel_with_fieldName = "state.input.num == 2";

export const with_fieldName_in_group = {
  "and": [
    {
      "some": [
        { "var": "results" },
        {
          "==": [
            { "var": "outcome" },
            3
          ]
        }
      ]
    }
  ]
};

export const with_fieldName_in_struct = {
  "and": [
    {
      ">=": [ { "var": "person.age" }, 18 ]
    }, {
      "==": [ { "var": "userName" }, "Denys" ]
    }, {
      "==": [ { "var": "account.id" }, "123" ]
    }
  ]
};

export const spel_with_fieldName_in_group = "results.?[outcome == 3].size() > 0";

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

export const spel_with_number = "num == 2";
export const spel_with_between = "num >= 1 && num <= 2";
export const spel_with_not = "!(num == 2)";
export const spel_with_not_not = "!(num == 2 || !(num == 3))";
export const spel_with_cases = "(str == '222' ? is_string : (num == 222 ? is_number : unknown))";
export const spel_with_cases_and_concat = "(str == '222' ? foo : foo + bar)";

export const spel_with_lhs_toLowerCase = "str.toLowerCase().startsWith('aaa')";
export const spel_with_lhs_toLowerCase_toUpperCase = "str.toLowerCase().toUpperCase() == str.toUpperCase()";
//export const spel_with_new_Date = "datetime == new java.util.Date()";
//export const spel_with_SimpleDateFormat = "datetime == new java.text.SimpleDateFormat('yyyy-MM-dd').parse('2022-01-15')";
export const spel_with_LocalTime = "time == T(java.time.LocalTime).parse('02:03:00')";
export const spel_with_new_String = "str == new String('hello world').toUpperCase()";
export const spel_with_lhs_compareTo = "datetime.compareTo(T(java.time.LocalDateTime).now().plusDays(6)) < 0";
export const spel_with_lhs_compareTo_parse = "datetime.compareTo(T(java.time.LocalDateTime).parse('2005-11-12 11:11:12', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd HH:mm:ss'))) == 0";
export const spel_with_lhs_compareTo_parse_plusDays = "datetime.compareTo(T(java.time.LocalDateTime).parse('2023-01-01 00:00:00', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd HH:mm:ss')).plusDays(7)) > 0";

export const spel_with_lhs_toLowerCase2 = "str.toLowerCase2() == 'aaa'";
export const tree_with_lhs_toLowerCase2 = {
  "type": "group",
  "children1": [
    {
      "type": "rule",
      "properties": {
        //"fieldSrc": "func", //should be determined
        "field": {
          "func": "custom.LOWER2",
          "args": {
            "str": {
              "valueSrc": "field",
              "value": "str"
            }
          }
        },
        "operator": "equal",
        "value": [
          "aaa"
        ],
        "valueSrc": [
          "value"
        ]
      }
    }
  ],
  "properties": {
    "conjunction": "AND",
    "not": false
  }
};

export const with_dot_in_field = {
  "and": [
    { "==": [ { "var": "number.one" }, 11 ] },
  ]
};

export const spel_with_dot_in_field = "number.one == 11";


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
      { "var": "num" },
      2
    ]
  }]
};
  
export const with_number_and_string = {
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
  
export const with_not_number_and_string = {
  "!": {
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
      "!=": [
        {
          "var": "num"
        },
        2
      ]
    },
    {
      "in": [
        "abc",
        {
          "var": "str"
        }
      ]
    },
    {
      "!": {
        "in": [
          "xyz",
          {
            "var": "str"
          }
        ]
      }
    },
    {
      "<=": [
        1,
        {
          "var": "num"
        },
        2
      ]
    },
    {
      "!": {
        "<=": [
          3,
          {
            "var": "num"
          },
          4
        ]
      }
    },
    {
      "!": {
        "var": "num"
      }
    },
    {
      "in": [
        {
          "var": "color"
        },
        [
          "yellow"
        ]
      ]
    },
    {
      "!": {
        "in": [
          {
            "var": "color"
          },
          [
            "green"
          ]
        ]
      }
    },
    {
      "!": {
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
                "yellow"
              ]
            ]
          }
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
        {
          "var": "str"
        },
        {
          "method": [
            {
              "var": "str2"
            },
            "toLowerCase"
          ]
        }
      ]
    }
  ]
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

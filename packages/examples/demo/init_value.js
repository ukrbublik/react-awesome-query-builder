export default 
{
  "type": "group",
  "id": "9a99988a-0123-4456-b89a-b1607f326fd8",
  "children1": {
    "a98ab9b9-cdef-4012-b456-71607f326fd9": {
      "type": "rule",
      "properties": {
        "field": "user.login",
        "operator": "equal",
        "value": [
          {
            "func": "LOWER",
            "args": {
              "str": {
                "valueSrc": "field",
                "value": "user.firstName"
              }
            }
          }
        ],
        "valueSrc": [
          "func"
        ],
        "valueType": [
          "text"
        ],
        "valueError": [
          null
        ]
      }
    },
    "98a8a9ba-0123-4456-b89a-b16e721c8cd0": {
      "type": "rule",
      "properties": {
        "field": "stock",
        "operator": "equal",
        "value": [
          false
        ],
        "valueSrc": [
          "value"
        ],
        "valueType": [
          "boolean"
        ],
        "valueError": [
          null
        ]
      }
    },
    "aabbab8a-cdef-4012-b456-716e85c65e9c": {
      "type": "rule",
      "properties": {
        "field": "slider",
        "operator": "equal",
        "value": [
          35
        ],
        "valueSrc": [
          "value"
        ],
        "valueType": [
          "number"
        ],
        "valueError": [
          null
        ]
      }
    },
    "aaab8999-cdef-4012-b456-71702cd50090": {
      "type": "rule_group",
      "properties": {
        "conjunction": "AND",
        "field": "results"
      },
      "children1": {
        "99b8a8a8-89ab-4cde-b012-31702cd5078b": {
          "type": "rule",
          "properties": {
            "field": "results.product",
            "operator": "select_equals",
            "value": [
              "abc"
            ],
            "valueSrc": [
              "value"
            ],
            "valueType": [
              "select"
            ],
            "valueError": [
              null
            ]
          }
        },
        "88b9bb89-4567-489a-bcde-f1702cd53266": {
          "type": "rule",
          "properties": {
            "field": "results.score",
            "operator": "greater",
            "value": [
              8
            ],
            "valueSrc": [
              "value"
            ],
            "valueType": [
              "number"
            ],
            "valueError": [
              null
            ]
          }
        }
      }
    },
    "a99a9b9b-cdef-4012-b456-7175a7d54553": {
      "type": "rule_group",
      "properties": {
        "mode": "array",
        "operator": "greater",
        "valueType": [
          "number"
        ],
        "value": [
          2
        ],
        "valueSrc": [
          "value"
        ],
        "conjunction": "AND",
        "valueError": [
          null
        ],
        "field": "cars"
      },
      "children1": {
        "99a9a9a8-89ab-4cde-b012-3175a7d55374": {
          "type": "rule",
          "properties": {
            "field": "cars.vendor",
            "operator": "select_equals",
            "value": [
              "Toyota"
            ],
            "valueSrc": [
              "value"
            ],
            "valueError": [
              null
            ],
            "valueType": [
              "select"
            ]
          }
        },
        "988bbbab-4567-489a-bcde-f175a7d58793": {
          "type": "rule",
          "properties": {
            "field": "cars.year",
            "operator": "greater_or_equal",
            "value": [
              2010
            ],
            "valueSrc": [
              "value"
            ],
            "valueError": [
              null
            ],
            "valueType": [
              "number"
            ]
          }
        }
      }
    }
  },
  "properties": {
    "conjunction": "AND",
    "not": false
  }
};
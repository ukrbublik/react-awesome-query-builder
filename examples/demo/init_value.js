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
        ]
      }
    },
    "aaab8999-cdef-4012-b456-71702cd50090": {
      "type": "rule_group",
      "properties": {
        "conjunction": "AND",
        "field": "results",
        "ext": true
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
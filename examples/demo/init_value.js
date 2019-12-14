export default 
{
  "type": "group",
  "id": "9a99988a-0123-4456-b89a-b1607f326fd8",
  "children1": {
    "a98ab9b9-cdef-4012-b456-71607f326fd9": {
      "type": "rule",
      "properties": {
        "field": "user.firstName",
        "operator": "equal",
        "value": [
          {
            "func": "LOWER",
            "args": {
              "str": {
                "valueSrc": "field",
                "value": "user.login"
              },
              "opt": {
                "value": "opt3"
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
        ]
      }
    },
    "aabbab8a-cdef-4012-b456-716e85c65e1c": {
      "type": "rule",
      "properties": {
        "field": "num",
        "operator": "equal",
        "value": [
          {
            "func": "SUM",
            "args": {
            }
          }
        ],
        "valueSrc": [
          "func"
        ],
        "valueType": [
          "number"
        ]
      }
    }
  },
  "properties": {
    "conjunction": "AND",
    "not": false
  }
}
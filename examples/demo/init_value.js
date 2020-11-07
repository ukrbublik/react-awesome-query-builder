export default 
{
  "type": "group",
  "id": "9ba9aba9-cdef-4012-b456-71759ffa55be",
  "children1": {
    "998a98b9-89ab-4cde-b012-31759ffa5c5b": {
      "type": "rule_group",
      "properties": {
        "ext": true,
        "operator": "not_equal",
        "valueType": [
          "number"
        ],
        "value": [
          3
        ],
        "valueSrc": [
          "value"
        ],
        "conjunction": "OR",
        "valueError": [
          null
        ],
        "field": "results"
      },
      "children1": {
        "9a8b9998-4567-489a-bcde-f1759ffa6413": {
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
            "valueError": [
              null
            ],
            "valueType": [
              "select"
            ]
          }
        },
        "9abbba8a-89ab-4cde-b012-31759ffe7df8": {
          "type": "rule",
          "properties": {
            "field": "results.score",
            "operator": "equal",
            "value": [
              2
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
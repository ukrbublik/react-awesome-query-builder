export default {
  "type": "group",
  "id": "9a99988a-0123-4456-b89a-b1607f326fd8",
  "children1": {
    "babba99a-cdef-4012-b456-717b34c54ad7": {
      "type": "group",
      "properties": {
        "conjunction": "AND"
      },
      "children1": {
        "a9bbaa8a-89ab-4cde-b012-317b34c54ad8": {
          "type": "rule_group",
          "properties": {
            "conjunction": "AND",
            "field": "crDeal"
          },
          "children1": {
            "89898899-4567-489a-bcde-f17b34c556ae": {
              "type": "rule",
              "properties": {
                "field": "crDeal.id",
                "operator": "equal",
                "value": [
                  "55"
                ],
                "valueSrc": [
                  "value"
                ],
                "valueType": [
                  "text"
                ]
              }
            }
          }
        },
        "b8b99a9a-cdef-4012-b456-717b34c5a62f": {
          "type": "group",
          "properties": {
            "conjunction": "AND",
            "not": true
          },
          "children1": {
            "aa9a899a-89ab-4cde-b012-317b34c5a62f": {
              "type": "rule_group",
              "properties": {
                "conjunction": "AND",
                "field": "crDeal"
              },
              "children1": {
                "8b89a8bb-4567-489a-bcde-f17b34c5b5a3": {
                  "type": "rule",
                  "properties": {
                    "field": "crDeal.dealClassification",
                    "operator": "select_any_in",
                    "value": [
                      [
                        "AVAL"
                      ]
                    ],
                    "valueSrc": [
                      "value"
                    ],
                    "valueType": [
                      "multiselect"
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "properties": {
    "conjunction": "AND",
    "not": false
  }
}

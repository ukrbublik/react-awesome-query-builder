export default
{
    "type": "group",
    "id": "98bb8bba-cdef-4012-b456-71720942bcad",
    "children1": {
        "8ab88a9b-89ab-4cde-b012-31720942bcad": {
            "type": "rule_group",
            "properties": {
                "conjunction": "AND",
                "field": "results"
            },
            "children1": {
                "998a9baa-cdef-4012-b456-717209436255": {
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
                "babb898b-4567-489a-bcde-f1720d01a6df": {
                    "type": "rule",
                    "properties": {
                        "field": "results.score",
                        "operator": "equal",
                        "value": [
                            0
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
        },
        "88999999-cdef-4012-b456-71725ba881d9": {
            "type": "rule",
            "properties": {
                "field": "date",
                "operator": "range",
                "value": [
                    "2020-06-05",
                    "2020-07-16"
                ],
                "valueSrc": [
                    "value",
                    "value"
                ],
                "validity": true,
                "valueType": [
                    "date",
                    "date"
                ]
            }
        }
    },
    "properties": {
        "conjunction": "AND"
    }
}
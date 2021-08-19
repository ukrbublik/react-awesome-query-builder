export default {
  "and": [
    {
      "and": [
        {
          "some": [
            {
              "var": "crDeal"
            },
            {
              "==": [
                {
                  "var": "id"
                },
                "55"
              ]
            }
          ]
        },
        {
          "some": [
            {
              "var": "crDeal"
            },
            {
              "!": {
                "in": [
                  {
                    "var": "dealClassification"
                  },
                  [
                    "AVAL",
                    "CURRENT_ACCOUNT",
                    "FIXED_RATE"
                  ]
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}

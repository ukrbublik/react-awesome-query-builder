export default 
{
  "and": [
    {
      "==": [
        {
          "var": "user.login"
        },
        {
          "method": [
            {
              "var": "user.firstName"
            },
            "toLowerCase"
          ]
        }
      ]
    },
    {
      "==": [
        {
          "shortcut": "stock"
        },
        false
      ]
    },
    {
      "==": [
        {
          "var": "slider"
        },
        35
      ]
    },
    {
      "some": [
        {
          "varValues": "state.input.results"
        },
        {
          "and": [
            {
              "==": [
                {
                  "var": "product"
                },
                "abc"
              ]
            },
            {
              ">": [
                {
                  "var": "score"
                },
                8
              ]
            }
          ]
        }
      ]
    },
    {
      ">": [
        {
          "reduce": [
            {
              "filter": [
                {
                  "varValues": "cars"
                },
                {
                  "and": [
                    {
                      "==": [
                        {
                          "var": "vendor"
                        },
                        "Toyota"
                      ]
                    },
                    {
                      ">=": [
                        {
                          "var": "year"
                        },
                        2010
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "+": [
                1,
                {
                  "var": "accumulator"
                }
              ]
            },
            0
          ]
        },
        2
      ]
    }
  ]
};
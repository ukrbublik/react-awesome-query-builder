export default 
{
  "and": [
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
          "var": "results"
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
                  "var": "cars"
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
export default 
{
  "and": [
    {
      ">": [
        {
          "reduce": [
            {
              "filter": [
                {
                  "var": "results"
                },
                {
                  "==": [
                    {
                      "var": "product"
                    },
                    "abc"
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
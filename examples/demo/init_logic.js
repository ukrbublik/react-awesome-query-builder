export default 
{
  "!": {
    "and": [
      {
        "<": [
          {
            "reduce": [
              {
                "varValues": "results"
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
          3
        ]
      },
      {
        "some": [
          {
            "varValues": "results2"
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
        "some": [
          {
            "varValues": "results"
          },
          {
            "or": [
              {
                "==": [
                  {
                    "var": "product"
                  },
                  "def"
                ]
              },
              {
                "==": [
                  {
                    "var": "score"
                  },
                  2
                ]
              }
            ]
          }
        ]
      },
      {
        "<=": [
          {
            "reduce": [
              {
                "filter": [
                  {
                    "varValues": "results"
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
          5
        ]
      }
    ]
  }
}


// {
//   "and": [
//     {
//       "all": [
//         {
//           "varValues": "results"
//         },
//         {
//           "==": [
//             {
//               "var": "product"
//             },
//             "abc"
//           ]
//         }
//       ]
//     }
//   ]
// }

// {
//   "and": [
//     {
//       ">": [
//         {
//           "reduce": [
//             {
//               "filter": [
//                 {
//                   "varValues": "results"
//                 },
//                 {
//                   "==": [
//                     {
//                       "var": "product"
//                     },
//                     "abc"
//                   ]
//                 }
//               ]
//             },
//             {
//               "+": [
//                 1,
//                 {
//                   "var": "accumulator"
//                 }
//               ]
//             },
//             0
//           ]
//         },
//         2
//       ]
//     }
//   ]
// };
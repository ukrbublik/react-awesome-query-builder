export default 
{
  "!": {
    "and": [
      {
        "<": [
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
                      "def"
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
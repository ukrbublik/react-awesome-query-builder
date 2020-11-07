export default 
{
  "and": [
    {
      "all": [
        {
          "var": "results"
        },
        {
          "or": [
            {
              "==": [
                {
                  "var": "product"
                },
                "abc"
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
    }
  ]
}
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
export default
{
  "and": [
    {
      "!": {
        "in": [
          "Den",
          {
            "toLowerCase": [
              {
                "var": "user.firstName"
              }
            ]
          }
        ]
      }
    },
    {
      "!=": [
        {
          "toLowerCase": [
            {
              "toUpperCase": [
                {
                  "var": "user.login"
                }
              ]
            }
          ]
        },
        {
          "toLowerCase": [
            "user"
          ]
        }
      ]
    }
  ]
};
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
          "var": "stock"
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
    }
  ]
}
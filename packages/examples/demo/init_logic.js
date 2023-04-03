export default {
  and: [
    {
      "==": [{ toUpperCase: [{ toLowerCase: ["a"] }] }, { toLowerCase: ["b"] }],
    },
  ],
};
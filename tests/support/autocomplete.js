
import { Utils } from "react-awesome-query-builder";
const { simulateAsyncFetch } = Utils;

const demoListValues = [
  {title: "A", value: "a"},
  {title: "AA", value: "aa"},
  {title: "AAA1", value: "aaa1"},
  {title: "AAA2", value: "aaa2"},
  {title: "B", value: "b"},
  {title: "C", value: "c"},
  {title: "D", value: "d"},
  {title: "E", value: "e"},
  {title: "F", value: "f"},
  {title: "G", value: "g"},
  {title: "H", value: "h"},
  {title: "I", value: "i"},
  {title: "J", value: "j"},
];

// 50ms delay, 3 per page
export const simulatedAsyncFetch = simulateAsyncFetch(demoListValues, 3, 50);

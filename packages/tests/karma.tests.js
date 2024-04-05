import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {setCurrentTest, setCurrentTestName} from "./support/utils";
Enzyme.configure({adapter: new Adapter()});

const origDescribe = describe;
describe = function (suiteName, fn) {
  setCurrentTestName(suiteName);
  return origDescribe.call(this, suiteName, fn);
};

//console.log("Importing specs...");
const filterArgs = process?.env?.FILTER_ARGS;
const tests = require.context("./specs", true, /\.test\.[tj]sx?$/);
const filteredFiles = tests.keys().filter((path) => {
  if (!filterArgs?.length) {
    return true;
  }
  return !!filterArgs.find((filter) => path.includes(filter));
});
if (filterArgs?.length) {
  console.log("Matched tests: " + (filteredFiles.length ? filteredFiles.join(" ") : "none"));
}
filteredFiles.forEach(tests);

before(function() {
  //console.log("Starting tests...");
});

beforeEach(function() {
  this.currentTest.timeout(parseInt(process?.env?.TEST_TIMEOUT ?? "10000")); // increase from 2000
  setCurrentTest(this.currentTest);
});

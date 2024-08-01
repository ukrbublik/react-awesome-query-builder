import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {setCurrentTest, setCurrentTestName, setFilterSpec, getCurrentTestName} from "./support/utils";
import "@react-awesome-query-builder/ui/css/styles.scss";
Enzyme.configure({adapter: new Adapter()});

// FILTER YOUR TESTS HERE
const testsFilter = [
  "QueryWithOperators",
  "Basic",
];
const specFilter = [
  "@sql",
  "@util"
];

const origDescribe = describe;
// eslint-disable-next-line no-global-assign
describe = function (suiteName, fn) {
  setCurrentTestName(suiteName);
  return origDescribe.call(this, suiteName, fn);
};

//console.log("Importing specs...");
const filterArgs = testsFilter?.length ? testsFilter : process?.env?.FILTER_ARGS;
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
  const currentTestName = this.currentTest.titlePath().join(" - ");
  const canExecute = !specFilter?.length || !!specFilter.find(f => currentTestName.includes(f));
  if (canExecute) {
    this.currentTest.timeout(parseInt(process?.env?.TEST_TIMEOUT ?? "10000")); // increase from 2000
    setCurrentTest(this.currentTest);
    setCurrentTestName(currentTestName);
  } else {
    //console.log(`Skipping spec ${currentTestName}`);
    this.currentTest.fn = function() { this.skip(); };
  }
});

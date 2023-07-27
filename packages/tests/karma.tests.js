import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {setCurrentTest} from "./support/utils";
Enzyme.configure({adapter: new Adapter()});

const origDescribe = describe;
describe = function (suiteName, fn) {
  setCurrentTest(suiteName);
  return origDescribe.call(this, suiteName, fn);
};

//console.log("Importing specs...");
const tests = require.context("./specs", true, /\.test\.[tj]sx?$/);
tests.keys().forEach(tests);

before(function() {
  //console.log("Starting tests...");
});

beforeEach(function() {
  this.currentTest.timeout(5000); // increase from 2000
  setCurrentTest(this.currentTest.titlePath().join(" - "));
});

import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

Enzyme.configure({adapter: new Adapter()});

const tests = require.context("./specs", true, /\.test\.[tj]s$/);
tests.keys().forEach(tests);

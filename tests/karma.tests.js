import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

Enzyme.configure({adapter: new Adapter()});

const context = require.context("./specs", true, /\.test\.[tj]s$/);
context.keys().forEach(context);

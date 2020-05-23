import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({adapter: new Adapter()});

const context = require.context('./tests', true, /\.test\.js$/);
context.keys().forEach(context);

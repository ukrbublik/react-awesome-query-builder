import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Demo from './src/demo/demo';
import { hot } from 'react-hot-loader'

import '../css/antd.less';
import '../css/styles.scss';
//import '../css/compact_styles.scss'; //optional

/*
 * OLD styles import
 * Requires `style: true` for antd in `.babelrc`
 * But breaks some global styles, so need to apply `reset.scss` and `denormalize.scss`
 * See https://github.com/ukrbublik/react-awesome-query-builder/issues/93
 * 
import '../css/reset.scss';
import '../css/styles.scss';
//import '../css/compact_styles.scss'; //optional
import '../css/denormalize.scss';
*/

window.React = React;


class App extends Component {
    render() {
        return (
            <div>{this.props.children}</div>
        );
    }
}


const  AppContainer = hot(module)(App);

ReactDOM.render((
    <AppContainer>
        <Demo />
    </AppContainer>
), document.getElementById('root'));


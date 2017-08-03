window.jQuery = window.$ = require('jquery/dist/jquery.min');
import './reset.scss';
import './styles.scss';
//import './compact_styles.scss';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Demo from './demo';

window.React = React;

class App extends Component {
    render() {
        return (
            <div>{this.props.children}</div>
        );
    }
}

ReactDOM.render((
    <App>
        <Demo />
    </App>
), document.body);

window.jQuery = window.$ = require('jquery/dist/jquery.min');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap/dist/js/bootstrap.js');
import './reset.scss';
import './styles.scss';
//import './compact_styles.scss';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {hashHistory} from 'react-router';
import {Router, Route, Redirect} from 'react-router';
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
    <Router history={hashHistory}>
        <Redirect from="/" to="demo"/>
        <Route name="root" path="/" component={App}>
            <Route name="demo" path="/demo" component={Demo}/>
        </Route>
    </Router>
), document.body);

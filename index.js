import './reset.scss';
import './styles.scss';
import React, { Component } from 'react';
import HashHistory from 'react-router/lib/HashHistory';
import { Router, Route, Redirect } from 'react-router';
import Demo from './demo';

window.React = React;

class App extends Component {
  render() {
    return (
      <div>{this.props.children}</div>
    );
  }
}

React.render((
  <Router history={new HashHistory()}>
    <Redirect from="/" to="demo" />
    <Route name="root" path="/" component={App}>
      <Route name="demo" path="/demo" component={Demo} />
    </Route>
  </Router>
), document.body);

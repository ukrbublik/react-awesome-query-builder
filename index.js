import './styles.scss';
import React from 'react';
import { default as Router, Route, Redirect, Link, RouteHandler } from 'react-router';
import Simple from './simple';

window.React = React;

class App extends React.Component {
  render () {
    return (
      <div>
        <RouteHandler />
      </div>
    )
  }
}

var routes = (
  <Route handler={App} path="/">
    <Route name="simple" handler={Simple} />
    <Redirect from="/" to="simple" />
  </Route>
);

Router.run(routes, Router.HashLocation, function (Handler) {
  React.render(<Handler/>, document.body);
});


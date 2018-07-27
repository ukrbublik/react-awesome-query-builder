import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Demo from './demo/demo.js';
import { hot } from 'react-hot-loader'

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
), document.body);



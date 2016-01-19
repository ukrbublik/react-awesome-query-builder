import React, { Component, PropTypes } from 'react';
import createTreeStore from '../stores/tree';
import { createStore } from 'redux';
import { Provider, Connector, connect } from 'react-redux';
import bindActionCreators from '../utils/bindActionCreators';
import * as actions from '../actions';

var stringify = require('json-stringify-safe');

class ConnectedQuery extends Component {
    render() {
//        console.log("In ConnectedQuery:render. state="+this.props.store.getState().toString()+" props="+stringify(this.props));
//        console.log("get_children="+stringify(this.props.get_children));
//        console.log("dispatch="+stringify(this.props.dispatch));
        const { config, tree, get_children, dispatch, ...props } = this.props;
        return <div>
            {get_children({
                tree: tree,
                actions: bindActionCreators({ ...actions.tree, ...actions.group, ...actions.rule }, config, dispatch),
                config: config,
                dispatch: dispatch
            })}
        </div>
    }
}
const QueryContainer = connect(
                                (tree) => { console.log("connect:State="+tree.toString()); return {tree: tree}},
/*                                (dispatch, props) => {
                                    const { conjunctions, fields, operators, widgets, settings, children } = props;
                                    const config = { conjunctions, fields, operators, widgets, settings };
                                    return bindActionCreators({ ...actions.tree, ...actions.group, ...actions.rule }, config, dispatch);
                                  },*/
)(ConnectedQuery);

export default class Query extends Component {
  static propTypes: {
    conjunctions: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    operators: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);

    const config = {
      conjunctions: props.conjunctions,
      fields: props.fields,
      operators: props.operators,
      widgets: props.widgets,
      settings: props.settings
    };

    const tree = createTreeStore(config);

    this.state = {
      store: createStore(tree)
    };
//    console.log("Query:constructor. state="+stringify(this.state.store.getState()));
  }

  render() {
    const { conjunctions, fields, operators, widgets, settings, children, get_children, ...props } = this.props;
    const config = { conjunctions, fields, operators, widgets, settings };

//    console.log("In Query:render. state="+stringify(this.state.store.getState())+" props="+stringify(this.props));
//    console.log("children="+stringify(this.props.children));
    return <Provider store={this.state.store}><QueryContainer store={this.state.store} get_children={get_children} config={config}/></Provider>
    return (
      <Provider store={this.state.store}>{() => (
        <Connector select={({ tree }) => ({ tree })}>
          {({ tree, dispatch }) => {
            return children({
              tree: tree,
              actions: bindActionCreators({ ...actions.tree, ...actions.group, ...actions.rule }, config, dispatch),
              config: config
            });
          }}
        </Connector>
      )}</Provider>
    );
  }
}

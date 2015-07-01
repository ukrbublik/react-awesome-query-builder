import React, { Component, PropTypes } from 'react';
import createTreeStore from '../stores/tree';
import { createStore, bindActionCreators } from 'redux';
import { Provider, Connector } from 'redux/react';
import * as actions from '../actions';

export default class Query extends Component {
  static propTypes: {
    conjunctions: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    operators: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
  }

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
      store: createStore({ tree })
    };
  }

  render() {
    const { conjunctions, fields, operators, widgets, settings, children, ...props } = this.props;

    return (
      <Provider store={this.state.store}>{() => (
        <Connector select={({ tree }) => ({ tree })}>
          {({ tree, dispatch }) => {
            return children({
              tree: tree,
              actions: bindActionCreators(Object.assign({}, actions.tree, actions.group, actions.rule), dispatch),
              config: { conjunctions, fields, operators, widgets, settings }
            });
          }}
        </Connector>
      )}</Provider>
    );
  }
}

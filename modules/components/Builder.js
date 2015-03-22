import React from 'react';
import Immutable from 'immutable';
import Item from '../components/Item';
import TreeStore from '../stores/Tree';

class Builder extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      tree: TreeStore.getTree(),
      config: {
        conjunctions: props.conjunctions,
        fields: props.fields,
        operators: props.operators,
        widgets: props.widgets,
        settings: props.settings
      }
    }
  }

  getChildContext () {
    return {
      config: this.state.config
    }
  }

  componentDidMount () {
    TreeStore.addChangeListener(this.handleChange.bind(this));
  }

  componentWillUnmount () {
    TreeStore.removeChangeListener(this.handleChange.bind(this));
  }

  handleChange () {
    this.setState({
      tree: TreeStore.getTree()
    });
  }

  render () {
    let id = this.state.tree.get('id');
    let props = {
      id: id,
      path: Immutable.List.of(id),
      children: this.state.tree.get('children'),
      type: this.state.tree.get('type'),
      properties: this.state.tree.get('properties')
    };

    return (
      <div className="query-builder">
        <Item key={props.id} {...props} />
      </div>
    );
  }
}

Builder.childContextTypes = {
  config: React.PropTypes.object
};

Builder.propTypes = {
  conjunctions: React.PropTypes.object.isRequired,
  fields: React.PropTypes.object.isRequired,
  operators: React.PropTypes.object.isRequired,
  widgets: React.PropTypes.object.isRequired,
  settings: React.PropTypes.object.isRequired
};

export default Builder;

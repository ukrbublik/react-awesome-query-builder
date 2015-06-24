import React from 'react';
import Immutable from 'immutable';
import Item from '../components/Item';
import TreeStore from '../stores/Tree';

class Builder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tree: TreeStore.getTree()
    };

    this.handleChange = this.handleChange.bind(this);
  }

  getChildContext() {
    return {
      config: {
        conjunctions: this.props.conjunctions,
        fields: this.props.fields,
        operators: this.props.operators,
        widgets: this.props.widgets,
        settings: this.props.settings
      }
    }
  }

  componentDidMount() {
    TreeStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    TreeStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState({
      tree: TreeStore.getTree()
    });
  }

  render() {
    const tree = this.state.tree;
    const id = tree.get('id');

    return (
      <div className="query-builder">
        <Item key={id}
              id={id}
              path={Immutable.List.of(id)}
              type={tree.get('type')}
              properties={tree.get('properties')}>{tree.get('children')}</Item>
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

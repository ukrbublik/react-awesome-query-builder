import React from 'react';
import Immutable from 'immutable';
import Item from '../components/Item';
import TreeStore from '../stores/Tree';

class Builder extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      tree: TreeStore.getTree()
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
    if (!this.state.tree) {
      return null;
    }

    let props = {
      id: this.state.tree.get('id'),
      children: this.state.tree.get('children'),
      ancestors: new Immutable.List,
      type: this.state.tree.get('type'),
      properties: this.state.tree.get('properties'),
      config: this.props.config
    };

    return (
      <div className="query-builder">
        <Item key={props.id} {...props} />
      </div>
    );
  }
}

Builder.propTypes = {
  config: React.PropTypes.object.isRequired
};

export default Builder;

import React from 'react';
import TreeStore from '../stores/Tree';
import queryString from '../utils/QueryString';

class Preview extends React.Component {
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
    return <div>{queryString(this.state.tree, this.state.config)}</div>;
  }
}

Preview.propTypes = {
  conjunctions: React.PropTypes.object.isRequired,
  fields: React.PropTypes.object.isRequired,
  operators: React.PropTypes.object.isRequired,
  widgets: React.PropTypes.object.isRequired,
  settings: React.PropTypes.object.isRequired
};

export default Preview;
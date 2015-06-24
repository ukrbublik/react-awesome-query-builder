import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import TreeStore from '../stores/Tree';
import queryString from '../utils/queryString';

class Preview extends PureComponent {
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
    return this.props.children(queryString(this.state.tree, this.state.config));
  }
}

Preview.propTypes = {
  children: PropTypes.func.isRequired,
  conjunctions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  operators: PropTypes.object.isRequired,
  widgets: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

export default Preview;

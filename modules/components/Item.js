import React from 'react';
import Immutable from 'immutable';
import Rule from './Rule';
import Group from './Group';
import assign from 'react/lib/Object.assign';

const types = {
  group: Group,
  rule: Rule
};

class Item extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      path: props.ancestors.push(props.id)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!Immutable.is(this.props.ancestors, nextProps.ancestors)) {
      this.setState({
        path: this.props.ancestors.push(this.props.id)
      });
    }
  }

  render () {
    let children = this.props.children ? this.props.children.map(function (item) {
      let props = {
        config: this.props.config,
        ancestors: this.state.path,
        id: item.get('id'),
        children: item.get('children'),
        type: item.get('type'),
        properties: item.get('properties')
      };

      return <Item key={props.id} {...props} />;
    }, this).toList() : null;

    let component = types[this.props.type];
    let props = assign({}, this.props.properties.toObject(), {
      config: this.props.config,
      id: this.props.id,
      path: this.state.path,
      children: children
    });

    return React.createElement(component, props);
  }
}

Item.propTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  ancestors: React.PropTypes.instanceOf(Immutable.List).isRequired,
  properties: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  children: React.PropTypes.instanceOf(Immutable.OrderedMap)
};

export default Item;

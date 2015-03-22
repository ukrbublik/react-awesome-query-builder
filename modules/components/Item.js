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
  getChildContext () {
    return {
      id: this.props.id,
      path: this.props.path
    }
  }

  render () {
    let children = this.props.children ? this.props.children.map(function (item) {
      let id = item.get('id');
      let props = {
        id: id,
        path: this.props.path.push(id),
        children: item.get('children'),
        type: item.get('type'),
        properties: item.get('properties')
      };

      return <Item key={id} {...props} />;
    }, this).toList() : null;

    let component = types[this.props.type];
    let props = assign({}, this.props.properties.toObject(), {
      children: children
    });

    return React.createElement(component, props);
  }
}

Item.contextTypes = {
  config: React.PropTypes.object.isRequired
};

Item.childContextTypes = {
  path: React.PropTypes.instanceOf(Immutable.List),
  id: React.PropTypes.string
};

Item.propTypes = {
  id: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  properties: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  children: React.PropTypes.instanceOf(Immutable.OrderedMap)
};

export default Item;

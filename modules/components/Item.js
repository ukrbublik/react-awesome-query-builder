import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import shallowCompare from 'react-addons-shallow-compare';
import Rule from './Rule';
import Group from './Group';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Provider, Connector, connect} from 'react-redux';


const typeMap = {
  rule: (props) => (
    <Rule 
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      groupPath={props.groupPath}
      actions={props.actions}
      treeNodesCnt={props.treeNodesCnt}
      config={props.config}
      onDragStart={props.onDragStart}
    />
  ),
  group: (props) => (
    <Group 
      {...props.properties.toObject()}
      id={props.id}
      path={props.path}
      actions={props.actions}
      config={props.config}
      //tree={props.tree}
      treeNodesCnt={props.treeNodesCnt}
      onDragStart={props.onDragStart}
      children1={props.children1}
    />
  )
};


class Item extends Component {
  static propTypes = {
    //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.keys(typeMap)).isRequired,
    path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
    properties: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
    actions: PropTypes.object.isRequired,
    treeNodesCnt: PropTypes.number,
    onDragStart: PropTypes.func,
  };

  pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  shouldComponentUpdate = this.pureShouldComponentUpdate;

  render() {
    const { type, ...props } = this.props;
    return typeMap[type](props);
  }
}

export default Item;

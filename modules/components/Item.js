import { default as React, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import Immutable from 'immutable';
import Rule from './Rule';
import Group from './Group';

export default class Item extends PureComponent {
  render() {
    const { type, ...props } = this.props;

    switch (type) {
      case 'rule':
        return renderRule(props);

      case 'group':
        return renderGroup(props);
    }

    return null;
  }
}

Item.contextTypes = {
  config: PropTypes.object.isRequired
};

Item.childContextTypes = {
  path: PropTypes.instanceOf(Immutable.List),
  id: PropTypes.string
};

Item.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  path: PropTypes.instanceOf(Immutable.List).isRequired,
  properties: PropTypes.instanceOf(Immutable.Map).isRequired,
  children: PropTypes.instanceOf(Immutable.OrderedMap)
};

const renderGroup = props => {
  const children = props.children ? props.children.map(item => {
    const id = item.get('id');

    return (
      <Item key={id}
            id={id}
            path={props.path.push(id)}
            type={item.get('type')}
            properties={item.get('properties')}>{item.get('children')}</Item>
    );
  }).toList() : null;

  return (
    <Group id={props.id} path={props.path} {...props.properties.toObject()}>{children}</Group>
  );
};

const renderRule = props => <Rule id={props.id} path={props.path} {...props.properties.toObject()} />;

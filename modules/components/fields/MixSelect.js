import React from 'react';
import { get } from 'lodash';
import BaseSelect from './BaseSelect';
import GroupSelect from './GroupSelect';
import TreeSelect from './TreeSelect';

export default class MixSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const type = get(this.props, 'config.type');
    switch (type) {
      case 'group':
        return <GroupSelect {...this.props} />;
      case 'tree':
        return <TreeSelect {...this.props} />;
      default:
        return <BaseSelect {...this.propss} />;
    }
  }
};

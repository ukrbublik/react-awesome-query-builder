import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FuncSelect from './FuncSelect';

export default class FuncWidget extends PureComponent {
  render() {
    const selectProps = this.props;
    return <FuncSelect {...selectProps} />;
  }
}

import React from 'react';
import { Select } from 'antd';

export default class BaseSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { selectProps } = this.props;
    return (
      <Select {...selectProps} />
    );
  }
};

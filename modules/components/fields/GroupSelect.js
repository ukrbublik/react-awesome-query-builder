import React from 'react';
import { Select } from 'antd';
import { get, map, groupBy } from 'lodash';

export default class GroupSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { selectProps, fieldProps } = this.props;
    const { children, ...otherProps } = selectProps;
    const data = groupBy(map(get(fieldProps, 'config.fields', {}), (item, key) => {
      return {
        ...item,
        field: key
      };
    }), item => item.group || 'Group');
    return (
      <Select {...otherProps}>
        {
          map(data, (groupItem, group) => (
            <Select.OptGroup key={group} label={group}>
              {
                map(groupItem, item => (
                  <Select.Option key={item.field} value={item.field}>
                    {item.label}
                  </Select.Option>
                ))
              }
            </Select.OptGroup>
          ))
        }
      </Select>
    );
  }
}

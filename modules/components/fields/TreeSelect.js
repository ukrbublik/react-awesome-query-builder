import React from 'react';
import { TreeSelect as Tree } from 'antd';
import { pick, get, map, lowerCase, includes } from 'lodash';

export default class TreeSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { config, selectProps, fieldProps } = this.props;
    const fields = get(fieldProps, 'config.fields', {});
    const treeProps = pick(selectProps, [
      'disabled',
      'dropdownMatchSelectWidth',
      'onChange',
      'placeholder',
      'showSearch',
      'size',
      'style',
      'value'
    ]);
    const { treeData: data, ...customProps } = get(config, 'props', {});
    const treeData = (() => {
      const res = data ? data : map(fields, (item, key) => {
        return {
          id: key,
          pId: '__PARENT__',
          value: key,
          title: item.label
        };
      }).concat([{
        id: '__PARENT__',
        pId: '__ROOT__',
        value: '__PARENT__',
        title: 'Tree'
      }]);
      return map(res, item => {
        return {
          ...item,
          selectable: !!fields[item.value]
        };
      });
    })();
    return (
      <Tree
        filterTreeNode={(search, node) => {
          const v = lowerCase(search);
          return includes(lowerCase(node.value), v) || includes(lowerCase(node.title), v);
        }}
        treeDataSimpleMode
        treeDefaultExpandAll
        {...treeProps}
        {...customProps}
        treeData={treeData}
      />
    );
  }
}

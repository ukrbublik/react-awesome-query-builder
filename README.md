# react-query-builder-antd4
Forked from https://github.com/ukrbublik/react-awesome-query-builder

## Install
yarn add react-query-builder-antd4

## Usage
### 1. 自定义Field
#### 1.1 Select分组 渲染Field
```JSX
<Builder
  fields={{
    apple: {
      label: 'apple',
      type: 'text',
      group: 'fruit',
    },
    peach: {
      label: 'peach',
      type: 'text',
      group: 'fruit',
    },
    banana: {
      label: 'banana',
      type: 'text',
      group: 'fruit',
    },
    lsp: {
      label: 'lsp',
      type: 'text',
      group: 'man',
    },
    xz: {
      label: 'xz',
      type: 'text',
      group: 'man',
    },
  }}
  config={
    settings: {
      fieldFactory: { type: 'group' }
    }
  }
>
```

#### 1.2 TreeSelect 渲染Field
```JSX
<Builder
  fields={{
    apple: {
      label: 'apple',
      type: 'text',
    },
    peach: {
      label: 'peach',
      type: 'text',
    },
    banana: {
      label: 'banana',
      type: 'text',
    },
    lsp: {
      label: 'lsp',
      type: 'text',
    },
    xz: {
      label: 'xz',
      type: 'text',
    },
  }}
  config={
    settings: {
      fieldFactory: {
        type: 'tree',
        props: {
          treeData: [
            { id: 'apple', pId: 'fruit', value: 'apple', title: 'apple' },
            { id: 'peach', pId: 'fruit', value: 'peach', title: 'peach' },
            { id: 'banana', pId: 'fruit', value: 'banana', title: 'banana' },
            { id: 'lsp', pId: 'man', value: 'lsp', title: 'lsp' },
            { id: 'xz', pId: 'man', value: 'xz', title: 'xz' },
            { id: 'man', pId: 0, value: 'man', title: 'man' },
            { id: 'fruit', pId: 0, value: 'fruit', title: 'fruit' }
          ]
        }
      }
    }
  }
>
```

#### 1.3 自定义组件 渲染Field
```JSX
<Builder
  fields={{
    apple: {
      label: 'apple',
      type: 'text',
    },
    peach: {
      label: 'peach',
      type: 'text',
    },
    banana: {
      label: 'banana',
      type: 'text',
    },
    lsp: {
      label: 'lsp',
      type: 'text',
    },
    xz: {
      label: 'xz',
      type: 'text',
    },
  }}
  config={
    settings: {
      fieldFactory: (selectProps, builder) => {
        // selectProps: 默认使用Select渲染的Select Props
        // builder: 当前Builder实例
        return ReactElement;
      }
    }
  }
>
```

## Releaes
- v0.2.0 支持自定义Field
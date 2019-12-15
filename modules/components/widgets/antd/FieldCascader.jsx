import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Cascader, Tooltip } from 'antd';


export default class FieldCascader extends PureComponent {
  static propTypes = {
      config: PropTypes.object.isRequired,
      customProps: PropTypes.object,
      items: PropTypes.array.isRequired,
      placeholder: PropTypes.string,
      selectedKey: PropTypes.string,
      selectedKeys: PropTypes.array,
      selectedPath: PropTypes.array,
      selectedLabel: PropTypes.string,
      selectedAltLabel: PropTypes.string,
      selectedFullLabel: PropTypes.string,
      selectedOpts: PropTypes.object,
      //actions
      setField: PropTypes.func.isRequired,
  };

  onChange = (keys) => {
      this.props.setField(keys);
  }

  render() {
    const {
        config, customProps, items, placeholder,
        selectedPath, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
    } = this.props;

    let customProps2 = {...customProps};
    if (customProps2.showSearch) {
      const keysForFilter = ['label', 'key', 'altLabel'];
      customProps2.showSearch = {
        filter: (inputValue, path) => 
          path.some(option => (
            keysForFilter.map(k => option[k]).join("\0").toLowerCase().indexOf(inputValue.toLowerCase()) > -1
          ))
      };
    }

    let res = (
      <Cascader
        fieldNames={{ label: 'label', value: 'key', children: 'items' }}
        options={items}
        value={selectedPath}
        onChange={this.onChange}
        allowClear={false}
        placeholder={placeholder}
        size={config.settings.renderSize}
        {...customProps2}
      />
    );

    let tooltipText = selectedOpts.tooltip || selectedAltLabel;
    if (tooltipText == selectedLabel)
      tooltipText = null;
    if (tooltipText) {
        res = <Tooltip title={tooltipText}>{res}</Tooltip>;
    }
    
    return res;
}
}
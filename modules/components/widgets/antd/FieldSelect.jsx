import React, { PureComponent } from 'react';
import { Tooltip, Select } from 'antd';
import {BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth} from "../../../utils/stuff";
import PropTypes from 'prop-types';
const { Option, OptGroup } = Select;
import keys from 'lodash/keys';


export default class FieldSelect extends PureComponent {
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

  onChange = (key) => {
      this.props.setField(key);
  }

  filterOption = (input, option) => {
      const keysForFilter = ['title', 'value', 'grouplabel', 'children'];
      const valueForFilter = keysForFilter
        .map(k => (typeof option.props[k] == 'string' ? option.props[k] : ''))
        .join("\0");
      return valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
      const {
          config, customProps, items, placeholder,
          selectedKey, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
      } = this.props;
      const {showSearch} = customProps || {};

      const selectText = selectedLabel || placeholder;
      const selectWidth = calcTextWidth(selectText);
      const isFieldSelected = !!selectedKey;
      const dropdownPlacement = config.settings.dropdownPlacement;
      const dropdownAlign = dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined;
      const width = isFieldSelected && !showSearch ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;

      const fieldSelectItems = this.renderSelectItems(items);

      let res = (
          <Select
              dropdownAlign={dropdownAlign}
              dropdownMatchSelectWidth={false}
              style={{ width }}
              ref="field"
              placeholder={placeholder}
              size={config.settings.renderSize}
              onChange={this.onChange}
              value={selectedKey || undefined}
              filterOption={this.filterOption}
              {...customProps}
          >{fieldSelectItems}</Select>
      );

      if (selectedFullLabel && selectedFullLabel != selectedLabel && !selectedOpts.tooltip) {
        res = <Tooltip title={selectedFullLabel}>{res}</Tooltip>;
      }

      return res;
  }

  renderSelectItems(fields) {
    return keys(fields).map(fieldKey => {
        const field = fields[fieldKey];
        const {items, key, path, label, fullLabel, altLabel, tooltip, grouplabel} = field;
        if (items) {
            return <OptGroup
                    key={path}
                    label={label}
                >
                    {this.renderSelectItems(items)}
                </OptGroup>
        } else {
            const option = tooltip ? <Tooltip title={tooltip}>{label}</Tooltip> : label;
            return <Option
                key={path}
                value={path}
                title={altLabel}
                grouplabel={grouplabel}
            >
                {option}
            </Option>;
        }
    });
}

}

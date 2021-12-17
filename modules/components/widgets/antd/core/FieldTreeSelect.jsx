import React, { PureComponent } from "react";
import { Tooltip, TreeSelect } from "antd";
import {BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth} from "../../../../utils/domUtils";
import {useOnPropsChanged} from "../../../../utils/reactUtils";
import PropTypes from "prop-types";


export default class FieldTreeSelect extends PureComponent {
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
    readonly: PropTypes.bool,
    //actions
    setField: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);  
  }

  onPropsChanged(props) {
    const { items, config: {settings: {fieldSeparator}}} = props;

    let optionsMaxWidth = 0;
    const initialOffset = 24; // arrow + checkbox for leftmost item
    const offset = 20;
    const padding = 5 * 2;
    this.treeData = this.getTreeData(items, ({label, path}) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, 
        calcTextWidth(label, null) + padding + (path.split(fieldSeparator).length - 1) * offset + initialOffset
      );
    });
    this.optionsMaxWidth = optionsMaxWidth;
  }

  getTreeData(fields, fn = null) {
    return fields.map(field => {
      const {items, key, path, label, fullLabel, altLabel, tooltip, disabled} = field;
      if (fn)
        fn(field);
      const pathKey = path || key;
      const option = tooltip ? <Tooltip title={tooltip}>{label}</Tooltip> : label;

      if (items) {
        return {
          value: pathKey,
          title: option,
          children: this.getTreeData(items, fn),
          selectable: false,
          altLabel: altLabel,
          fullLabel: fullLabel,
          label: label,
          disabled: disabled,
        };
      } else {
        return {
          value: pathKey,
          title: option,
          altLabel: altLabel,
          fullLabel: fullLabel,
          label: label,
          disabled: disabled,
        };
      }
    });
  }

  onChange = (key) => {
    this.props.setField(key);
  }

  filterTreeNode = (input, option) => {
    const dataForFilter = option;
    const keysForFilter = ["title", "value", "label", "altLabel", "fullLabel"];
    const valueForFilter 
      = keysForFilter
        .map(k => (typeof dataForFilter[k] == "string" ? dataForFilter[k] : ""))
        .join("\0");
    return valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    const {
      config, customProps = {}, placeholder,
      selectedKey, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel, readonly,
    } = this.props;
    const { renderSize, fieldSeparator } = config.settings;
      
    let tooltipText = selectedAltLabel || selectedFullLabel;
    if (tooltipText == selectedLabel)
      tooltipText = null;
    const selectedPath = selectedKey ? selectedKey.split(fieldSeparator) : null;
    const treeDefaultExpandedKeys = selectedPath && selectedPath.length > 1 
      ? selectedPath.slice(0, -1).map((_key, i) => (selectedPath.slice(0, i+1).join(fieldSeparator))) 
      : null;
      
    const placeholderWidth = calcTextWidth(placeholder) + 6;
    const isFieldSelected = !!selectedKey;

    const minWidth = placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownMinWidth = 100;
    const dropdownMaxWidth = 800;
    const useAutoWidth = true; //tip: "auto" is good, but width will jump on expand/collapse
    const dropdownWidth = Math.max(dropdownMinWidth, Math.min(dropdownMaxWidth, this.optionsMaxWidth));

    let res = (
      <TreeSelect
        onChange={this.onChange}
        value={selectedKey || undefined}
        style={{
          minWidth: minWidth,
          width: isFieldSelected ? null : minWidth,
        }}
        dropdownStyle={{
          width: useAutoWidth ? "auto" : dropdownWidth + 20,
          paddingRight: "10px"
        }}
        multiple={false}
        treeCheckable={false}
        treeDataSimpleMode={false}
        treeData={this.treeData}
        size={renderSize}
        placeholder={placeholder}
        filterTreeNode={this.filterTreeNode}
        treeDefaultExpandedKeys={treeDefaultExpandedKeys}
        dropdownMatchSelectWidth={false}
        disabled={readonly}
        {...customProps}
      />
    );

    if (tooltipText && !selectedOpts.tooltip) {
      res = <Tooltip title={tooltipText}>{res}</Tooltip>;
    }

    return res;
  }

}

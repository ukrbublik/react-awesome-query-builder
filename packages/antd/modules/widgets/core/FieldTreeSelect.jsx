import React, { Component } from "react";
import { Tooltip, TreeSelect } from "antd";
import {BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth} from "../../utils/domUtils";
import PropTypes from "prop-types";
import { Utils } from "@react-awesome-query-builder/ui";
const { useOnPropsChanged } = Utils.ReactUtils;

const mapFieldItemToOptionKeys = {
  key: "_value2",
  path: "value",
  label: "label",
  altLabel: "altLabel",
  tooltip: "_tooltip",
  grouplabel: "_grouplabel",
  fullLabel: "fullLabel",
};

export default class FieldTreeSelect extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    customProps: PropTypes.object,
    errorText: PropTypes.string,
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

  onPropsChanged(nextProps) {
    const { items, config: {settings: {fieldSeparator}}} = nextProps;

    let optionsMaxWidth = 0;
    const initialOffset = 24; // arrow + checkbox for leftmost item
    const offset = 20;
    const padding = 5 * 2;
    this.treeData = this.getTreeData(items, ({label, path}) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, 
        calcTextWidth(label, null) + padding + (path.split(fieldSeparator).length - 1) * offset + initialOffset
      );
    });
    if (!isNaN(optionsMaxWidth) && optionsMaxWidth) {
      this.optionsMaxWidth = optionsMaxWidth;
    }
  }

  getTreeData(fields, fn = null) {
    return fields.map(field => {
      const {items, key, path, label, fullLabel, altLabel, tooltip, disabled, grouplabel, matchesType} = field;
      if (fn)
        fn(field);
      const pathKey = path || key;
      const optionText = matchesType ? <b>{label}</b> : label;
      const option = tooltip ? <Tooltip title={tooltip}>{optionText}</Tooltip> : optionText;

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
          _value2: key,
          _tooltip: tooltip,
          _grouplabel: grouplabel,
        };
      } else {
        return {
          value: pathKey,
          title: option,
          altLabel: altLabel,
          fullLabel: fullLabel,
          label: label,
          disabled: disabled,
          _value2: key,
          _tooltip: tooltip,
          _grouplabel: grouplabel,
        };
      }
    });
  }

  onChange = (key) => {
    this.props.setField(key);
  };

  filterTreeNode = (input, option) => {
    const { config } = this.props;
    const keysForFilter = config.settings.fieldItemKeysForSearch
      .map(k => mapFieldItemToOptionKeys[k]);
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    const matches = valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    return matches;
  };

  render() {
    const {
      config, customProps = {}, placeholder, errorText,
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
      
    const placeholderWidth = calcTextWidth(placeholder);
    const isFieldSelected = !!selectedKey;

    const minWidth = placeholderWidth ? placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT + 6 : null;
    const dropdownMinWidth = 100;
    const dropdownMaxWidth = 800;
    const useAutoWidth = true || !this.optionsMaxWidth; //tip: "auto" is good, but width will jump on expand/collapse
    const dropdownWidth = Math.max(dropdownMinWidth, Math.min(dropdownMaxWidth, this.optionsMaxWidth));

    let res = (
      <TreeSelect
        status={errorText && "error"}
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
        popupMatchSelectWidth={false}
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

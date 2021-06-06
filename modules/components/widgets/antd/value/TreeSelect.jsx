import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { TreeSelect } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../../utils/domUtils";
import { defaultTreeDataMap, mapListValues, getTitleInListValues } from "../../../../utils/stuff";
import { useOnPropsChanged } from "../../../../utils/reactUtils";

export default class TreeSelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    field: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
    readonly: PropTypes.bool,
    treeMultiple: PropTypes.bool,
    // from fieldSettings:
    listValues: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);  
  }

  onPropsChanged(props) {
    const { listValues, treeMultiple } = props;

    let optionsMaxWidth = 0;
    const initialOffset = (treeMultiple ? (24 + 22) : 24); // arrow + checkbox for leftmost item
    const offset = 20;
    const padding = 5 * 2;
    mapListValues(listValues, ({title, value, path}) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, 
        calcTextWidth(title, null) + padding + (path ? path.length : 0) * offset + initialOffset
      );
    });
    this.optionsMaxWidth = optionsMaxWidth;
  }

  handleChange = (val) => {
    if (!this.props.treeMultiple) {
      this.props.setValue(val);
      return;
    }
    if (val && !val.length) {
      this.props.setValue(undefined); //not allow []
      return;
    }
    if (typeof val[0] == "object" && val[0].value !== undefined) {
      //`treeCheckStrictly` is on
      val = val.map(v => v.value);
    }
    this.props.setValue(val);
  }

  filterTreeNode = (input, option) => {
    const dataForFilter = option.title;
    return dataForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }


  render() {
    const {
      config,
      placeholder,
      customProps = {},
      value,
      treeMultiple,
      listValues,
      treeExpandAll,
      readonly
    } = this.props;
    const treeCheckStrictly = customProps.treeCheckStrictly || false;
    const { renderSize } = config.settings;
    const placeholderWidth = calcTextWidth(placeholder) + 6;
    let aValue = value != undefined ? value : undefined;
    if (treeCheckStrictly && aValue !== undefined) {
      if (treeMultiple) {
        aValue = aValue.map(v => ({value: v, label: getTitleInListValues(listValues, v)}));
      }
    }
    const width = aValue ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownMinWidth = 100;
    const dropdownMaxWidth = 800;
    const useAutoWidth = true; //tip: "auto" is good, but width will jump on expand/collapse
    const dropdownWidth = Math.max(dropdownMinWidth, Math.min(dropdownMaxWidth, this.optionsMaxWidth));

    return (      
      <TreeSelect
        disabled={readonly}
        style={{
          minWidth: width,
          width: width,
        }}
        dropdownStyle={{
          width: useAutoWidth ? "auto" : dropdownWidth + 10,
          paddingRight: "10px"
        }}
        multiple={treeMultiple}
        treeCheckable={treeMultiple}
        key={"widget-treeselect"}
        dropdownMatchSelectWidth={false}
        placeholder={placeholder}
        size={renderSize}
        treeData={listValues}
        treeDataSimpleMode={defaultTreeDataMap}
        filterTreeNode={this.filterTreeNode}
        value={aValue}
        onChange={this.handleChange}
        treeDefaultExpandAll={treeExpandAll}
        {...customProps}
      />
    );
  }
}

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { TreeSelect } from "antd";
import { useOnPropsChanged, defaultTreeDataMap, mapListValues, calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../utils/stuff";

export default class TreeSelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    field: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
    // from fieldSettings:
    listValues: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    treeMultiple: PropTypes.bool,
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
    this.props.setValue(val);
  }


  render() {
    const {
      config,
      placeholder,
      customProps,
      value,
      treeMultiple,
      listValues,
      treeExpandAll
    } = this.props;
    const { renderSize } = config.settings;
    const placeholderWidth = calcTextWidth(placeholder) + 6;
    const _value = value && value.length ? value : undefined;
    const width = _value ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownMinWidth = 100;
    const dropdownMaxWidth = 800;
    const useAutoWidth = false; //tip: "auto" is good, but width will jump on expand/collapse
    const dropdownWidth = Math.max(dropdownMinWidth, Math.min(dropdownMaxWidth, this.optionsMaxWidth));

    return (      
        <TreeSelect
            style={{
              minWidth: width,
              width: width,
            }}
            dropdownStyle={{
              width: useAutoWidth ? "auto" : dropdownWidth,
              paddingRight: '10px'
            }}
            multiple={treeMultiple}
            treeCheckable={treeMultiple}
            key={"widget-treeselect"}
            dropdownMatchSelectWidth={true}
            ref="val"
            placeholder={placeholder}
            size={renderSize}
            treeData={listValues}
            treeDataSimpleMode={defaultTreeDataMap}
            value={_value}
            onChange={this.handleChange}
            treeDefaultExpandAll={treeExpandAll}
            {...customProps}
        />
    );
  }
}

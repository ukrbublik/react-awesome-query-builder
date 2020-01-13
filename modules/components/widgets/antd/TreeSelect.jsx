import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import map from "lodash/map";
import { TreeSelect, Select } from "antd";
import { useOnPropsChanged, flatizeTreeData, calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../utils/stuff";
const Option = Select.Option;

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
    const { listValues } = props;

    let optionsMaxWidth = 0;
    map(listValues, (title, value) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(title));
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

  filterOption = (input, option) => {
    return (
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

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
    const placeholderWidth = calcTextWidth(placeholder);
    const _value = value && value.length ? value : undefined;
    const width = _value ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const dropdownWidth = this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;

    return (      
        <TreeSelect
            style={{
              minWidth: width,
              width: width,
            }}
            dropdownStyle={{
              width: "auto",
              minWidth:  dropdownWidth,
              overflow: "hidden"
            }}
            multiple={treeMultiple}
            treeCheckable={treeMultiple}
            key={"widget-treeselect"}
            dropdownMatchSelectWidth={true}
            ref="val"
            placeholder={placeholder}
            size={renderSize}
            treeData={listValues}
            treeDataSimpleMode={{id: "value", pId: "parent"}}
            value={_value}
            onChange={this.handleChange}
            treeDefaultExpandAll={treeExpandAll}
            {...customProps}
        />
    );
  }
}

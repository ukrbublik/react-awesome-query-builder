import React, { Component } from "react";
import PropTypes from "prop-types";
import {calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT} from "../../utils/domUtils";
import { Select, version as antdVersion } from "antd";
import omit from "lodash/omit";
import { Utils } from "@react-awesome-query-builder/ui";
const { useOnPropsChanged } = Utils.ReactUtils;
const { mapListValues } = Utils.ListUtils;
const Option = Select.Option;

// see type ListItem
const mapListItemToOptionKeys = {
  value: "value",
  title: "children",
  groupTitle: "grouplabel", // not supported
};

export default class SelectWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.any,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), //key in listValues
    customProps: PropTypes.object,
    fieldDefinition: PropTypes.object,
    readonly: PropTypes.bool,
    // from fieldSettings:
    listValues: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };

  constructor(props) {
    super(props);
    useOnPropsChanged(this);
    this.onPropsChanged(props);
  }

  onPropsChanged(nextProps) {
    const {listValues} = nextProps;

    let optionsMaxWidth = 0;
    mapListValues(listValues, ({title, value}) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(title, null));
    });
    if (!isNaN(optionsMaxWidth) && optionsMaxWidth) {
      this.optionsMaxWidth = optionsMaxWidth;
    }

    this.options = mapListValues(listValues, ({title, value}) => {
      return (<Option key={value+""} value={value+""}>{title}</Option>);
    });
  }

  handleChange = (val) => {
    this.props.setValue(val);
  };

  filterOption = (input, option) => {
    const {config} = this.props;
    const keysForFilter = config.settings.listKeysForSearch
      .map(k => mapListItemToOptionKeys[k]);
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    const matches = valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    return matches;
  };

  render() {
    const {config, placeholder, customProps, value, readonly} = this.props;
    const {renderSize} = config.settings;
    const placeholderWidth = calcTextWidth(placeholder);
    const dropdownWidth = this.optionsMaxWidth ? this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT : null;
    const dropdownEmptyWidth = placeholderWidth ? placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT : null;
    const width = value ? dropdownWidth : dropdownEmptyWidth;
    const aValue = value != undefined ? value+"" : undefined;
    const customSelectProps = omit(customProps, [""]);

    const selectProps = {};
    const antdMajorVersion = parseInt(antdVersion.split(".")[0]);
    if (antdMajorVersion >= 5) {
      selectProps.popupMatchSelectWidth = false;
    } else {
      selectProps.dropdownMatchSelectWidth = false;
    }

    return (
      <Select
        disabled={readonly}
        style={{ width }}
        key={"widget-select"}
        placeholder={placeholder}
        size={renderSize}
        value={aValue}
        onChange={this.handleChange}
        filterOption={this.filterOption}
        {...selectProps}
        {...customSelectProps}
      >{this.options}
      </Select>
    );
  }
}

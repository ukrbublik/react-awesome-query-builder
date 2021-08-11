import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT} from "../../../../utils/domUtils";
import {mapListValues} from "../../../../utils/stuff";
import {useOnPropsChanged} from "../../../../utils/reactUtils";
import { Select } from "antd";
import omit from "lodash/omit";
const Option = Select.Option;

export default class SelectWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string,
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

  onPropsChanged (props) {
    const {listValues} = props;

    let optionsMaxWidth = 0;
    mapListValues(listValues, ({title, value}) => {
      optionsMaxWidth = Math.max(optionsMaxWidth, calcTextWidth(title, null));
    });
    this.optionsMaxWidth = optionsMaxWidth;

    this.options = mapListValues(listValues, ({title, value}) => {
      return (<Option key={value+""} value={value+""}>{title}</Option>);
    });
  }

  handleChange = (val) => {
    this.props.setValue(val);
  }

  filterOption = (input, option) => {
    const dataForFilter = option.children || option.value;
    return dataForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  render() {
    const {config, placeholder, customProps, value, readonly} = this.props;
    const {renderSize} = config.settings;
    const placeholderWidth = calcTextWidth(placeholder);
    const dropdownWidth = this.optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const width = value ? dropdownWidth : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
    const aValue = value != undefined ? value+"" : undefined;
    const customSelectProps = omit(customProps, [""]);

    return (
      <Select
        disabled={readonly}
        style={{ width }}
        key={"widget-select"}
        dropdownMatchSelectWidth={false}
        placeholder={placeholder}
        size={renderSize}
        value={aValue}
        onChange={this.handleChange}
        filterOption={this.filterOption}
        {...customSelectProps}
      >{this.options}
      </Select>
    );
  }
}

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Switch } from "antd";

export default class BooleanWidget extends PureComponent {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    value: PropTypes.bool,
    config: PropTypes.object.isRequired,
    field: PropTypes.any,
    customProps: PropTypes.object,
    readonly: PropTypes.bool,
    // from fieldSettings:
    labelYes: PropTypes.string,
    labelNo: PropTypes.string,
  };

  handleChange = (val) => {
    this.props.setValue(val);
  };

  static defaultProps = {
    labelYes: null, 
    labelNo: null, 
  };

  render() {
    const {customProps, value,  labelYes, labelNo, readonly, config} = this.props;
    const {renderSize} = config.settings;
        
    return (
      <Switch
        checkedChildren={labelYes || null}
        unCheckedChildren={labelNo || null}
        checked={value || null}
        onChange={this.handleChange}
        disabled={readonly}
        size={renderSize}
        {...customProps}
      />
    );
  }
}

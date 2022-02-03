import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import range from "lodash/range";

export default class Proximity extends PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    setOption: PropTypes.func.isRequired,
    options: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    minProximity: PropTypes.number,
    maxProximity: PropTypes.number,
    optionPlaceholder: PropTypes.string,
    optionTextBefore: PropTypes.string,
    optionLabel: PropTypes.string,
    customProps: PropTypes.object,
    readonly: PropTypes.bool,
    //children
  };

  static defaultProps = {
    customProps: {},
    minProximity: 2,
    maxProximity: 10,
    optionPlaceholder: "Select words between",
    optionLabel: "Words between",
    optionTextBefore: null,
  };

  handleChange = (value) => {
    this.props.setOption("proximity", parseInt(value));
  };

  render() {
    const {
      defaults, options, config, optionLabel, optionPlaceholder, customProps, 
      minProximity, maxProximity, optionTextBefore, readonly
    } = this.props;
    const {settings, widgets} = config;
    const defaultProximity = defaults ? defaults.proximity : undefined;
    const {showLabels} = settings;
    const selectedProximity = options.get("proximity", defaultProximity);
    const proxValues = range(minProximity, maxProximity + 1).map((item) => ({title: item, value: item}));
    const Select = widgets.select.factory;

    return (
      <div className="operator--PROXIMITY">
        <div className="operator--options">
          { showLabels
            && <label className="rule--label">{optionLabel}</label>
          }
          { !showLabels && optionTextBefore
            && <div className="operator--options--sep">
              <span>{optionTextBefore}</span>
            </div>
          }
          <Select
            config={config}
            value={selectedProximity}
            listValues={proxValues}
            setValue={this.handleChange}
            readonly={readonly}
            placeholder={optionPlaceholder}
            {...customProps}
          />
        </div>
        <div className="operator--widgets">{this.props.children}</div>
      </div>
    );
  }
}

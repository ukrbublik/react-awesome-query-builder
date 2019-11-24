import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import range from 'lodash/range';
import { Select } from 'antd';
const Option = Select.Option;
import {BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth} from '../../utils/stuff';

export default class Proximity extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    setOption: PropTypes.func.isRequired,
    options: PropTypes.any.isRequired, //instanceOf(Immutable.Map)
    minProximity: PropTypes.number,
    maxProximity: PropTypes.number,
    defaultProximity: PropTypes.number,
    optionPlaceholder: PropTypes.string,
    optionTextBefore: PropTypes.string,
    optionLabel: PropTypes.string,
    customProps: PropTypes.object,
    //children
  };

  static defaultProps = {
    customProps: {},
    minProximity: 2,
    maxProximity: 10,
    //defaultProximity: 2,
    optionPlaceholder: "Select words between",
    optionLabel: "Words between",
    optionTextBefore: null,
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = (value) => {
    this.props.setOption('proximity', value);
  }

  render() {
    const {
      defaultProximity, options, config: {settings}, optionLabel, optionPlaceholder, customProps, minProximity, maxProximity, optionTextBefore
    } = this.props;
    const obsoleteDefaultProximity = this.props.defaults ? this.props.defaults.proximity : undefined;
    const {dropdownPlacement, showLabels, renderSize} = settings;
    const selectedProximity = options.get('proximity', defaultProximity || obsoleteDefaultProximity);
    const placeholderWidth = calcTextWidth(optionPlaceholder);

    return (
      <div className="operator--PROXIMITY">
        <div className="operator--options">
          { showLabels &&
            <label>{optionLabel}</label>
          }
          { !showLabels && optionTextBefore &&
            <div className="operator--options--sep">
                <span>{optionTextBefore}</span>
            </div>
          }
          <Select
            dropdownAlign={dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined}
            dropdownMatchSelectWidth={false}
            size={renderSize}
            style={{ width: selectedProximity ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT }}
            ref="proximity"
            placeholder={optionPlaceholder}
            value={selectedProximity != null ? ""+selectedProximity : undefined}
            onChange={this.handleChange}
            {...customProps}
          >
            {range(minProximity, maxProximity + 1).map((item) => (
              <Option key={""+item} value={""+item}>{item}</Option>
            ))}
          </Select>
        </div>
        <div className="operator--widgets">{this.props.children}</div>
      </div>
    );
  }
}

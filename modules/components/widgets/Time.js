import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TimePicker } from 'antd';
import moment from 'moment';
import shallowCompare from 'react-addons-shallow-compare';


export default class TimeWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        timeFormat: PropTypes.string,
        valueFormat: PropTypes.string,
        use12Hours: PropTypes.bool,
        value: PropTypes.string, //in valueFormat
        config: PropTypes.object.isRequired,
        field: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        customProps: PropTypes.object,
    };

    shouldComponentUpdate = shallowCompare;

    constructor(props) {
        super(props);

        const {valueFormat, value, setValue} = props;
        let mValue = value ? moment(value, valueFormat) : null;
        if (mValue && !mValue.isValid()) {
            setValue(null);
        }
    }

    static defaultProps = {
        timeFormat: 'HH:mm',
        valueFormat: 'HH:mm:ss',
        use12Hours: false,
    };


    handleChange = (_value) => {
        const {setValue, valueFormat} = this.props;
        const value = _value && _value.isValid() ? _value.format(valueFormat) : null;
        if (value || _value === null)
            setValue(value);
    }

    render() {
        const {timeFormat, valueFormat, value, use12Hours} = this.props;
        let dateValue = value ? moment(value, valueFormat) : null;
        let customProps = this.props.customProps || {};

        return (
            <TimePicker
                use12Hours={use12Hours}
                key="widget-time"
                size={this.props.config.settings.renderSize}
                placeholder={this.props.placeholder}
                format={timeFormat}
                value={dateValue}
                onChange={this.handleChange}
                ref="datetime"
                {...customProps}
            />
        );
    }
}

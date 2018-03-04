import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import shallowCompare from 'react-addons-shallow-compare';


export default class DateTimeWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        timeFormat: PropTypes.string,
        dateFormat: PropTypes.string,
        valueFormat: PropTypes.string,
        value: PropTypes.string, //in valueFormat
        config: PropTypes.object.isRequired,
        field: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        use12Hours: PropTypes.bool,
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

        moment.locale(this.props.config.settings.locale.short);
    }

    static defaultProps = {
        timeFormat: 'HH:mm',
        dateFormat: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        use12Hours: false,
    };

    handleChange = (_value) => {
        const {setValue, valueFormat} = this.props;
        const value = _value && _value.isValid() ? _value.format(valueFormat) : null;
        if (value || _value === null)
            setValue(value);
    }

    render() {
        let customProps = this.props.customProps || {};
        const {dateFormat, timeFormat, valueFormat, value, use12Hours} = this.props;
        let dateValue = value ? moment(value, valueFormat) : null;

        return (
            <DatePicker
                key="widget-datetime"
                use12Hours={use12Hours}
                showTime={{ format: timeFormat }}
                placeholder={this.props.placeholder}
                size={this.props.config.settings.renderSize || "small"}
                format={dateFormat + ' ' + timeFormat}
                value={dateValue}
                onChange={this.handleChange}
                ref="datetime"
                {...customProps}
            />
        );
    }
}

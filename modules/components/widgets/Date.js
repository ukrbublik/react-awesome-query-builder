import React, {Component, PropTypes} from 'react';
import { DatePicker } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';


export default class DateWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired,
        dateFormat: PropTypes.string,
        valueFormat: PropTypes.string,
    };

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
        dateFormat: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
    };

    handleChange(_value) {
        const {setValue, valueFormat} = this.props;
        const value = _value instanceof moment && _value.isValid() ? _value.format(valueFormat) : null;
        if (value || _value === null)
            setValue(value);
    }

    render() {
        const {dateFormat, valueFormat, value} = this.props;
        let dateValue = value ? moment(value, valueFormat) : null;
        return (
            <DatePicker
                key="widget-date"
                placeholder={this.props.placeholder} 
                size={this.props.config.settings.renderSize || "small"}
                format={dateFormat}
                value={dateValue}
                onChange={this.handleChange.bind(this)}
                ref="datetime"
            />
        );
    }
}

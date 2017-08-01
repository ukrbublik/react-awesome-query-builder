import React, {Component, PropTypes} from 'react';
import { TimePicker } from 'antd';
import moment from 'moment';
import { LocaleProvider } from 'antd';
import {getAntLocale} from '../../utils';


export default class TimeWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired,
        timeFormat: PropTypes.string,
        valueFormat: PropTypes.string,
    };

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
    };
    

    handleChange(_value) {
        const {setValue, valueFormat} = this.props;
        const value = _value instanceof moment && _value.isValid() ? _value.format(valueFormat) : null;
        if (value || _value === null)
            setValue(value);
    }

    render() {
        const {timeFormat, valueFormat, value} = this.props;
        let dateValue = value ? moment(value, valueFormat) : null;
        return (
            <TimePicker
                key="widget-time"
                size={this.props.config.settings.renderSize || "small"}
                placeholder={this.props.placeholder} 
                format={timeFormat}
                value={dateValue}
                onChange={this.handleChange.bind(this)}
                ref="datetime"
            />
        );
    }
}

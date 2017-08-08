import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { Switch, Icon } from 'antd';

export default class BooleanWidget extends Component {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        delta: PropTypes.number.isRequired
    }

    handleChange(val) {
        this.props.setValue(val);
    }

    constructor(props) {
        super(props);
    }

    static defaultProps = {
        labelYes: null, //(<Icon type="check" />),
        labelNo: null, //(<Icon type="cross" />),
    }

    render() {
        const {value, delta, id} = this.props;
        return (
            <Switch 
                ref="switch" 
                checkedChildren={this.props.labelYes || null}
                unCheckedChildren={this.props.labelNo || null}
                checked={this.props.value || null} 
                onChange={this.handleChange.bind(this)} 
            />
        );
    }
}

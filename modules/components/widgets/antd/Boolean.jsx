import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, Icon } from 'antd';

export default class BooleanWidget extends PureComponent {
    static propTypes = {
        setValue: PropTypes.func.isRequired,
        value: PropTypes.bool,
        config: PropTypes.object.isRequired,
        field: PropTypes.string.isRequired,
        customProps: PropTypes.object,
        readonly: PropTypes.bool,
        // from fieldSettings:
        labelYes: PropTypes.string,
        labelNo: PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.switch = React.createRef();
    }

    handleChange = (val) => {
        this.props.setValue(val);
    }

    static defaultProps = {
        labelYes: null, //(<Icon type="check" />),
        labelNo: null, //(<Icon type="cross" />),
    }

    render() {
        const {customProps, value,  labelYes, labelNo, readonly} = this.props;
        
        return (
            <Switch
                ref={this.switch}
                checkedChildren={labelYes || null}
                unCheckedChildren={labelNo || null}
                checked={value || null}
                onChange={this.handleChange}
                disabled={readonly}
                {...customProps}
            />
        );
    }
}

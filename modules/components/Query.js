import React, {Component, PropTypes} from 'react';
import createTreeStore from '../stores/tree';
import {createStore} from 'redux';
import {Provider, Connector, connect} from 'react-redux';
import * as actions from '../actions';
import {extendConfig} from "../utils/configUtils";
import {bindActionCreators} from "../utils/stuff";
import {validateTree} from "../utils/validation";
import { LocaleProvider } from 'antd';


class ConnectedQuery extends Component {
    constructor(props) {
        super(props);

        this.validatedTree = this.validateTree(props);
        console.log(1, props.tree, this.validatedTree);
    }

    validateTree (props) {
        return validateTree(props.tree, props.config, true, true);
    }

    componentWillReceiveProps(nextProps) {
        const {tree, onChange} = nextProps;
        const oldTree = this.props.tree;
        if (oldTree !== tree) {
            this.validatedTree = this.validateTree(nextProps);
            console.log(1, tree, this.validatedTree);
            onChange && onChange(this.validatedTree);
            this.setState({treeChanged: true})
        } else {
            this.setState({treeChanged: false})
        }
    }

    render() {
        const {config, tree, get_children, dispatch, ...props} = this.props;
        const validatedTree = this.validatedTree;
        return <div>
            {get_children({
                tree: this.validatedTree,
                actions: bindActionCreators({...actions.tree, ...actions.group, ...actions.rule}, config, dispatch),
                config: config,
                dispatch: dispatch
            })}
        </div>
    }
}
const QueryContainer = connect(
    (tree) => {
        return {tree: tree}
    },
)(ConnectedQuery);

export default class Query extends Component {
    static propTypes: {
        conjunctions: PropTypes.object.isRequired,
        fields: PropTypes.object.isRequired,
        types: PropTypes.object.isRequired,
        operators: PropTypes.object.isRequired,
        widgets: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);
        const config = {
            conjunctions: props.conjunctions,
            fields: props.fields,
            types: props.types,
            operators: props.operators,
            widgets: props.widgets,
            settings: props.settings,
            tree: props.value,
        };

        const tree = createTreeStore(config);

        this.state = {
            store: createStore(tree)
        };
    }

    render() {
        const {conjunctions, fields, types, operators, widgets, settings, get_children, onChange, onBlur, value, tree, children, ...props} = this.props;
        let config = {conjunctions, fields, types, operators, widgets, settings};
        config = extendConfig(config);

        return (
            <LocaleProvider locale={config.settings.locale.antd}>
                <Provider store={this.state.store}>
                    <QueryContainer store={this.state.store} get_children={get_children} config={config} onChange={onChange}/>
                </Provider>
            </LocaleProvider>
        )
    }
}

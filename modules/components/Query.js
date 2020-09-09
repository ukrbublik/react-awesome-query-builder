import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ConfigProvider } from 'antd';
import createTreeStore from '../stores/tree';
import {createStore} from 'redux';
import {Provider, Connector, connect} from 'react-redux';
import * as actions from '../actions';
import {extendConfig} from "../utils/configUtils";
import {fixPathsInTree} from '../utils/treeUtils';
import {bindActionCreators} from "../utils/stuff";
import {validateTree} from "../utils/validation";
import {queryString} from "../utils/queryString";
import {defaultRoot} from "../utils/defaultUtils";
import Immutable from 'immutable';


class ConnectedQuery extends Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        onChange: PropTypes.func,
        get_children: PropTypes.func,
        tree: PropTypes.any, //instanceOf(Immutable.Map)
        //dispatch: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this._updateActions(props);

        this.validatedTree = this.validateTree(props, props.config, props.tree);
        if (props.tree !== this.validatedTree) {
            props.onChange && props.onChange(this.validatedTree);
        }
    }

    validateTree (props, oldConfig, oldTree) {
        let tree = validateTree(props.tree, oldTree, props.config, oldConfig, true, true);
        tree = fixPathsInTree(tree);
        return tree;
    }

    _updateActions (props) {
      const {config, dispatch} = props;
      this.actions = bindActionCreators({...actions.tree, ...actions.group, ...actions.rule}, config, dispatch);
    }

    componentWillReceiveProps(nextProps) {
        const {tree, onChange} = nextProps;
        const oldTree = this.props.tree;
        const oldConfig = this.props.config;
        const newTree = nextProps.tree;
        const newConfig = nextProps.config;
        const oldValidatedTree = this.validatedTree;

        if (oldConfig !== newConfig) {
            this._updateActions(nextProps);
        }

        this.validatedTree = this.validateTree(nextProps, oldConfig, oldTree);
        let validatedTreeChanged = oldValidatedTree !== this.validatedTree 
            && JSON.stringify(oldValidatedTree) != JSON.stringify(this.validatedTree);
        if (validatedTreeChanged) {
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
                actions: this.actions,
                config: config,
                dispatch: dispatch
            })}
        </div>
    }
}

const QueryContainer = connect(
    (state) => {
        return {
          tree: state.tree,
        }
    },
)(ConnectedQuery);


export default class Query extends Component {
    static propTypes = {
        //config
        conjunctions: PropTypes.object.isRequired,
        fields: PropTypes.object.isRequired,
        types: PropTypes.object.isRequired,
        operators: PropTypes.object.isRequired,
        widgets: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,

        onChange: PropTypes.func,
        get_children: PropTypes.func,
        value: PropTypes.any, //instanceOf(Immutable.Map)
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

        const store = createTreeStore(config);

        this.state = {
            store: createStore(
                store,
                window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
            )
        };
    }

    // handle case when value property changes
    componentWillReceiveProps(nextProps) {
        if (this.props.dontDispatchOnNewProps)
            return;

        let getQueryStringForProps = (props) => props.value != null
            ? queryString(props.value, props)
            : '';
        let previousQueryString = getQueryStringForProps(this.props);
        let nextQueryString = getQueryStringForProps(nextProps);

        // compare stringified trees
        if (previousQueryString !== nextQueryString) {
            let nextTree = nextProps.value || defaultRoot({ ...nextProps, tree: null });
            this.state.store.dispatch(
                actions.tree.setTree(nextProps, nextTree)
            );
        }
    }

    render() {
        const {conjunctions, fields, types, operators, widgets, settings, get_children, onChange, value, tree, children, prefixCls, ...props} = this.props;
        let config = {conjunctions, fields, types, operators, widgets, settings};
        config = extendConfig(config);

        return (
          <ConfigProvider prefixCls={prefixCls}>
            <Provider store={this.state.store}>
                <QueryContainer
                  store={this.state.store}
                  get_children={get_children}
                  config={config}
                  onChange={onChange}
                />
            </Provider>
          </ConfigProvider>
        )
    }
}

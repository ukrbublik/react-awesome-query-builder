import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import createTreeStore from '../stores/tree';
import {createStore} from 'redux';
import {Provider, Connector, connect} from 'react-redux';
import * as actions from '../actions';
import {extendConfig} from "../utils/configUtils";
import {fixPathsInTree} from '../utils/treeUtils';
import {bindActionCreators, deepCompare} from "../utils/stuff";
import {shallowEqual} from '../utils/renderUtils';
import {validateTree} from "../utils/validation";
import {queryString} from "../utils/queryString";
import {defaultRoot} from "../utils/defaultUtils";
import {liteShouldComponentUpdate} from "../utils/renderUtils";
import pick from 'lodash/pick';
import { ConfigProvider } from 'antd';


const configKeys = ["conjunctions", "fields", "types", "operators", "widgets", "settings"];

const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig) => {
    let tree = validateTree(newTree, _oldTree, newConfig, oldConfig, true, true);
    tree = fixPathsInTree(tree);
    return tree;
};


class Query extends PureComponent {
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
        props.onChange && props.onChange(this.validatedTree, props.config);
    }

    validateTree (props, oldConfig, oldTree) {
        return validateAndFixTree(props.tree, oldTree, props.config, oldConfig);
    }

    _updateActions (props) {
      const {config, dispatch} = props;
      this.actions = bindActionCreators({...actions.tree, ...actions.group, ...actions.rule}, config, dispatch);
    }

    componentWillReceiveProps(nextProps) {
        const {onChange} = nextProps;
        const oldTree = this.props.tree;
        const oldConfig = this.props.config;
        const _newTree = nextProps.tree;
        const newConfig = nextProps.config;
        const oldValidatedTree = this.validatedTree;

        if (oldConfig !== newConfig) {
            this._updateActions(nextProps);
        }

        if (nextProps.__isInternalValueChange) {
            this.validatedTree = nextProps.tree;
            onChange && onChange(this.validatedTree, newConfig);
        } else {
            this.validatedTree = this.validateTree(nextProps, oldConfig, oldTree);
            //todo: should validate here OR just at value= prop ????
            console.log(111, 
                this.validatedTree == oldValidatedTree,
                nextProps.tree == oldTree,
                this.validatedTree.equals(this.validateTree(nextProps, oldConfig, oldTree))
            )
            let validatedTreeChanged = oldValidatedTree !== this.validatedTree 
                && !deepCompare(oldValidatedTree, this.validatedTree);
            if (validatedTreeChanged) {
                onChange && onChange(this.validatedTree, newConfig);
                this.setState({treeChanged: true})
            } else {
                this.setState({treeChanged: false})
            }
        }
    }

    render() {
        const {config, get_children, dispatch, __isInternalValueChange} = this.props;
        const builderProps = {
            tree: this.validatedTree,
            actions: this.actions,
            config: config,
            dispatch: dispatch,
            __isInternalValueChange
        };

        return get_children(builderProps);
    }
}

const ConnectedQuery = connect(
    (state) => {
        return {
          tree: state.tree,
          __isInternalValueChange: state.__isInternalValueChange,
        }
    },
)(Query);
ConnectedQuery.displayName = "ConnectedQuery";


export default class QueryContainer extends Component {
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

        const config = pick(props, configKeys);
        const extendedConfig = extendConfig(config);
        const tree = props.value;
        const validatedTree = tree ? validateAndFixTree(tree, null, config, config) : null;

        const store = createTreeStore({...config, tree: validatedTree});

        this.state = {
            store: createStore(store),
            config: extendedConfig
        };
    }

    // handle case when value property changes
    componentWillReceiveProps(nextProps) {
        if (this.props.dontDispatchOnNewProps)
            return;
        
        // compare configs
        const oldConfig = pick(this.props, configKeys);
        let nextConfig = pick(nextProps, configKeys);
        if (!shallowEqual(oldConfig, nextConfig)) {
            nextConfig = extendConfig(config);
            this.setState({config: nextConfig});
        }

        const getQueryStringForProps = (props) => props.value != null
            ? queryString(props.value, props)
            : '';
        const previousQueryString = getQueryStringForProps(this.props);
        const nextQueryString = getQueryStringForProps(nextProps);

        // compare stringified (for simplicity) trees, then validate & set
        if (previousQueryString !== nextQueryString) {
            const nextTree = nextProps.value || defaultRoot({ ...nextProps, tree: null });
            const validatedTree = validateAndFixTree(nextTree, null, nextConfig, oldConfig);
            this.state.store.dispatch(
                actions.tree.setTree(nextProps, validatedTree)
            );
        }
    }

    render() {
        const {get_children, onChange} = this.props;
        const {config, store} = this.state;

        return (
            <ConfigProvider locale={config.settings.locale.antd}>
                <Provider store={store}>
                    <ConnectedQuery
                      store={store}
                      config={config}
                      onChange={onChange}
                      get_children={get_children}
                    />
                </Provider>
            </ConfigProvider>
        )
    }
}

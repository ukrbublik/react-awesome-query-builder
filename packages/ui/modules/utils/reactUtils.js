import React from "react";
import mapValues from "lodash/mapValues";
import {shallowEqual} from "./stuff";

const getReactContainerType = (el) => {
  if (el._reactRootContainer) {
    return "root";
  }
  if (Object.getOwnPropertyNames(el).filter(k => k.startsWith("__reactContainer")).length > 0) {
    return "container";
  }
  return undefined;
};

const getReactRootNodeType = (node) => {
  if (!node) {
    return undefined;
  }
  const type = getReactContainerType(node);
  if (type !== undefined) {
    return type;
  } else {
    return getReactRootNodeType(node.parentNode);
  }
};

export const isUsingLegacyReactDomRender = (node) => {
  return getReactRootNodeType(node) === "root";
};


export const liteShouldComponentUpdate = (self, config) => (nextProps, nextState) => {
  const prevProps = self.props;
  const prevState = self.state;

  let should = nextProps != prevProps || nextState != prevState;
  if (should) {
    if (prevState == nextState && prevProps != nextProps) {
      let chs = [];
      for (let k in nextProps) {
        let changed = (nextProps[k] != prevProps[k]);
        if (changed) {
          if (config[k] == "ignore")
            changed = false;
          else if (config[k] == "shallow_deep")
            changed = !shallowEqual(nextProps[k], prevProps[k], true);
          else if (config[k] == "shallow")
            changed = !shallowEqual(nextProps[k], prevProps[k]);
          else if (typeof config[k] == "function")
            changed = config[k](nextProps[k], prevProps[k], nextState);
        }
        if (changed)
          chs.push(k);
      }
      if (!chs.length)
        should = false;
    }
  }
  return should;
};

export const pureShouldComponentUpdate = (self) => function(nextProps, nextState) {
  return (
    !shallowEqual(self.props, nextProps)
    || !shallowEqual(self.state, nextState)
  );
};

const canUseUnsafe = () => {
  const v = React.version.split(".").map(parseInt.bind(null, 10));
  return v[0] == 16 && v[1] < 3 || v[0] < 16;
};

export const useOnPropsChanged = (obj) => {
  // 1. `shouldComponentUpdate` should be called after `componentWillReceiveProps`
  // 2. `shouldComponentUpdate` should not be used for PureComponent

  if (canUseUnsafe) {
    obj.componentWillReceiveProps = (nextProps) => {
      obj.onPropsChanged(nextProps);
    };
    if (!obj.shouldComponentUpdate) {
      obj.shouldComponentUpdate = pureShouldComponentUpdate(obj);
    }
  } else {
    if (!obj.shouldComponentUpdate) {
      obj.shouldComponentUpdate = pureShouldComponentUpdate(obj);
    }
    const origShouldComponentUpdate = obj.shouldComponentUpdate;
    const newShouldComponentUpdate = function(nextProps, nextState) {
      const shouldNotify = !shallowEqual(obj.props, nextProps);
      if (shouldNotify) {
        obj.onPropsChanged(nextProps);
      }
      const shouldUpdate = origShouldComponentUpdate.call(obj, nextProps, nextState);
      return shouldUpdate;
    };
    obj.shouldComponentUpdate = newShouldComponentUpdate.bind(obj);
  }
};

export const bindActionCreators = (actionCreators, config, dispatch) =>
  mapValues(actionCreators, (actionCreator) =>
    (...args) => dispatch(actionCreator(config, ...args))
  );

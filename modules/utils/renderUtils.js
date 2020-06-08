import {shallowEqual} from "./stuff";

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

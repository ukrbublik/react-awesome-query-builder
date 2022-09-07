import React from "react";

const canUseUnsafe = () => {
  const v = React.version.split(".").map(parseInt.bind(null, 10));
  return v[0] == 16 && v[1] >= 3 || v[0] > 16;
};

export const useOnPropsChanged = (obj) => {
  if (canUseUnsafe) {
    obj.UNSAFE_componentWillReceiveProps = (nextProps) => {
      obj.onPropsChanged(nextProps);
    };
  } else {
    obj.componentWillReceiveProps = (nextProps) => {
      obj.onPropsChanged(nextProps);
    };
  }
};

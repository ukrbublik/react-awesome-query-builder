import pick from "lodash/pick";
import { Utils } from "@react-awesome-query-builder/core";
const { extendConfig, configKeys } = Utils.ConfigUtils;

const pickConfig = (props) => {
  return pick(props, configKeys);
};

export const createConfigMemo = () => {
  const configStore = new Map();
  const maxSize = 2; // current and prev
  let configId = 0;

  const extendAndStore = (config) => {
    const extendedConfig = extendConfig(config, ++configId);
    if ((configStore.size + 1) > maxSize) {
      configStore.delete(configStore.keys()[0]);
    }
    configStore.set(config, extendedConfig);
    return extendedConfig;
  };

  const findBasic = (findConfig) => {
    for (const basicConfig of configStore.keys()) {
      const extConfig = configStore.get(basicConfig);
      const found = configKeys.map(k => extConfig[k] === findConfig[k]).filter(v => !v).length === 0;
      if (found) {
        return basicConfig;
      }
    }
    return findConfig;
  };

  const findExtended = (findConfig) => {
    // strict find:
    // return configStore.get(findConfig) || configStore.values().find(ec => ec === findConfig);

    for (const savedConfig of configStore.keys()) {
      const found = configKeys.map(k => savedConfig[k] === findConfig[k]).filter(v => !v).length === 0;
      if (found) {
        return configStore.get(savedConfig);
      }
    }

    for (const extendedConfig of configStore.values()) {
      const found = configKeys.map(k => extendedConfig[k] === findConfig[k]).filter(v => !v).length === 0;
      if (found) {
        return extendedConfig;
      }
    }

    return null;
  };

  const findOrExtend = (config) => {
    return findExtended(config) || extendAndStore(config);
  };
  
  return {
    getExtended: (props) => findOrExtend(pickConfig(props)),
    getBasic: findBasic
  };
};

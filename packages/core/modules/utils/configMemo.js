import pick from "lodash/pick";
import { extendConfig } from "./configExtend";
import { configKeys } from "./configUtils";

let currentConfigMemo;

export const getCurrentConfigMemo = () => {
  return currentConfigMemo;
};

export const createConfigMemo = () => {
  const configStore = new Map();
  const maxSize = 2; // current and prev
  let configId = 0;
  let isActive = true;

  const pickConfig = (props) => {
    return pick(props, configKeys);
  };

  const extendAndStore = (config) => {
    const extendedConfig = extendConfig(config, ++configId);
    if ((configStore.size + 1) > maxSize) {
      configStore.delete(configStore.keys().next().value);
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
      const foundParts = configKeys.filter(k => savedConfig[k] === findConfig[k]);
      const found = foundParts.length === configKeys.length;
      if (found) {
        return configStore.get(savedConfig);
      }
    }

    for (const extendedConfig of configStore.values()) {
      const foundParts = configKeys.filter(k => extendedConfig[k] === findConfig[k]);
      const found = foundParts.length === configKeys.length;
      if (found) {
        return extendedConfig;
      }
    }

    return null;
  };

  const findOrExtend = (config) => {
    return findExtended(config) || extendAndStore(config);
  };

  const clearConfigMemo = () => {
    isActive = false;
    configStore.clear();
  };

  currentConfigMemo = {
    getExtendedConfig: (props) => findOrExtend(pickConfig(props)),
    findExtendedConfig: findExtended,
    getBasicConfig: findBasic,
    clearConfigMemo,
    configId,
  };

  return currentConfigMemo;
};

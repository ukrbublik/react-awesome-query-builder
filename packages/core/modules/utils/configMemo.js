import pick from "lodash/pick";
import { configKeys } from "./configUtils";

let memoId = 0;
let configId = 0;
let commonMemo;
const memos = {};

export const getCommonMemo = (extendConfig) => {
  if (!commonMemo) {
    commonMemo = createConfigMemo({
      reactIndex: undefined,
      maxSize: 3,
      canCompile: undefined, // default is true
      extendConfig,
    });
  }
  return commonMemo;
};

export const findExtendedConfigInAllMemos = (config, needsToBeCompiled) => {
  let foundExtConfig;
  for (const k in memos) {
    const found = memos[k].findExtendedConfig(config, needsToBeCompiled);
    if (found) {
      foundExtConfig = found;
      break;
    }
  }
  return foundExtConfig;
};

export const createConfigMemo = (meta = {
  reactIndex: undefined,
  maxSize: 2, // current and prev
  canCompile: true,
  extendConfig: undefined, // should be passed!
}) => {
  const configStore = new Map();
  const maxSize = meta.maxSize || 2;
  const currentMemoId = ++memoId;
  let currentMemo;
  let isActive = true;

  const pickConfig = (props) => {
    return pick(props, configKeys);
  };

  const extendAndStore = (config) => {
    const extendedConfig = meta.extendConfig(config, ++configId, meta.canCompile);
    storeConfigPair(config, extendedConfig);
    return extendedConfig;
  };

  const getSize = () => {
    return configStore.size;
  };

  const storeConfigPair = (config, extendedConfig) => {
    if ((configStore.size + 1) > maxSize) {
      configStore.delete(configStore.keys().next().value);
    }
    configStore.set(config, extendedConfig);
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

  const findExtended = (findConfig, needsToBeCompiled) => {
    // strict find:
    // return configStore.get(findConfig) || configStore.values().find(ec => ec === findConfig);

    for (const savedConfig of configStore.keys()) {
      const foundParts = configKeys.filter(k => savedConfig[k] === findConfig[k]);
      const found = foundParts.length === configKeys.length && (needsToBeCompiled ? savedConfig.__compliled : true);
      if (found) {
        return configStore.get(savedConfig);
      }
    }

    for (const extendedConfig of configStore.values()) {
      const foundParts = configKeys.filter(k => extendedConfig[k] === findConfig[k]);
      const found = foundParts.length === configKeys.length && (needsToBeCompiled ? extendedConfig.__compliled : true);
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
    delete memos[currentMemoId];
    if (commonMemo === currentMemo) {
      commonMemo = undefined;
    }
  };

  currentMemo = {
    getExtendedConfig: (props) => findOrExtend(pickConfig(props)),
    findExtendedConfig: findExtended,
    getBasicConfig: findBasic,
    clearConfigMemo,
    configId,
    storeConfigPair,
    getSize,
    configStore,
    memoId: currentMemoId,
    meta,
  };

  if (meta.reactIndex === undefined) {
    commonMemo = currentMemo;
  }
  memos[currentMemoId] = currentMemo;

  return currentMemo;
};

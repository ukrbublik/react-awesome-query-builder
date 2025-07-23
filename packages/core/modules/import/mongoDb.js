
import uuid from "../utils/uuid";
import { getFieldConfig } from "../utils/configUtils";
import {extendConfig} from "../utils/configExtend";
import {loadTree} from "./tree";
import {defaultGroupConjunction} from "../utils/defaultUtils";

function findConjunctionByMongoConj(config, mongoConj) {
  const conjs = config.conjunctions;
  for (const conjKey in conjs) {
    if (conjs[conjKey].mongoConj === mongoConj) {
      return conjKey;
    }
  }
  return null;
}

function findOperatorByMongoOp(config, mongoOp, value) {
  const ops = config.operators;
  for (const opKey in ops) {
    const opDef = ops[opKey];
    if (opDef.mongoImportOp) {
      if (Array.isArray(opDef.mongoImportOp)) {
        for (const test of opDef.mongoImportOp) {
          if (typeof test === "string" && test === mongoOp) return opKey;
          if (typeof test === "function") {
            const res = test(mongoOp, value);
            if (res === opKey) return opKey;
          }
          if (Array.isArray(test) && Array.isArray(mongoOp) && test.length === mongoOp.length && test.every((t, i) => t === mongoOp[i])) {
            return opKey;
          }
        }
      } else if (opDef.mongoImportOp === mongoOp) {
        return opKey;
      }
    }
  }
  return null;
}

export function loadFromMongoDb(mongoQuery, config) {
  if (!mongoQuery || typeof mongoQuery !== "object" || Array.isArray(mongoQuery)) {
    return [undefined, ["Invalid MongoDB query format"]];
  }
  const extendedConfig = extendConfig(config, undefined, false);
  let [tree, errors] = convertFromMongoDb(mongoQuery, extendedConfig);

  if (tree && tree.type !== "group") {
    tree = wrapInGroup(tree, extendedConfig);
  }

  const immTree = tree ? loadTree(tree) : undefined;
  return [immTree, errors];
}

function wrapInGroup(rule, config) {
  return {
    id: uuid(),
    type: "group",
    properties: { conjunction: defaultGroupConjunction(config), not: false },
    children1: {
      [rule.id]: rule
    }
  };
}

function convertFromMongoDb(mongoQuery, config) {
  const errors = [];

  // Handle $and/$or at root
  for (const conjKey of ["$and", "$or"]) {
    if (mongoQuery[conjKey]) {
      const conj = findConjunctionByMongoConj(config, conjKey);
      const arr = mongoQuery[conjKey];
      const children1 = {};
      arr.forEach((sub, idx) => {
        const [childTree, childErrors] = convertFromMongoDb(sub, config);
        if (childTree) {
          children1[childTree.id] = childTree;
        }
        if (childErrors && childErrors.length) {
          errors.push(...childErrors);
        }
      });
      return [
        {
          id: uuid(),
          type: "group",
          properties: { conjunction: conj, not: false },
          children1,
        },
        errors,
      ];
    }
  }

  // Only support single field for now
  const fields = Object.keys(mongoQuery);
  if (fields.length !== 1) {
    errors.push("Only single field queries are supported in minimal import");
    return [undefined, errors];
  }
  const field = fields[0];
  const value = mongoQuery[field];

  // Find field config
  const fieldConfig = getFieldConfig(config, field);
  if (!fieldConfig) {
    errors.push(`No config for field ${field}`);
    return [undefined, errors];
  }

  let operator = "equal";
  let opValue = [value];
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    // e.g. { num: { $gt: 2 } } or { num: { $gte: 1, $lte: 2 } }
    const opKeys = Object.keys(value);
    if (opKeys.length === 1) {
      const mongoOp = opKeys[0];
      operator = findOperatorByMongoOp(config, mongoOp, value[mongoOp]) || "equal";
      opValue = [ value[mongoOp] ];
    } else if (opKeys.length === 2 && opKeys.includes("$gte") && opKeys.includes("$lte")) {
      operator = findOperatorByMongoOp(config, ["$gte", "$lte"], [value["$gte"], value["$lte"]]) || "between";
      opValue = [ value["$gte"], value["$lte"] ];
    }
  }

  const rule = {
    id: uuid(),
    type: "rule",
    properties: {
      field,
      operator,
      value: opValue,
      valueSrc: ["value"],
      valueType: [fieldConfig.type],
    }
  };

  return [rule, errors];
}

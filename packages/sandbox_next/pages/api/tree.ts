import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils, CoreConfig,
  //types:
  ImmutableTree, Config, JsonTree, JsonLogicTree, JsonLogicResult, JsonConfig
} from "@react-awesome-query-builder/core";
import { IronSession } from "iron-session";
import { withSessionRoute } from "../../lib/withSession";
import loadedConfig from "../../lib/config";
import loadedInitValue from "../../lib/init_value";
import loadedInitLogic from "../../lib/init_logic";
const {
  uuid, checkTree, loadFromJsonLogic, loadTree,
  jsonLogicFormat, queryString, sqlFormat, mongodbFormat, getTree
} = Utils;
const { serializeConfig, deserializeConfig } = Utils.ConfigUtils;


type Session = IronSession & {
  tree: JsonTree;
};

export type PostBody = {
  jsonTree: JsonTree,
  jsonConfig: JsonConfig,
};

export interface PostResult {
  jl?: JsonLogicResult;
  qs?: string;
  qsh?: string;
  sql?: string;
  mongo?: Object;
}

export interface GetResult {
  tree: JsonTree;
}

function getEmptyTree(): JsonTree {
  return {"id": uuid(), "type": "group"};
}

function getInitialTree(config: Config, fromLogic = false): JsonTree {
  let tree: JsonTree;
  if (fromLogic) {
    const logicTree: JsonLogicTree = loadedInitLogic && Object.keys(loadedInitLogic).length > 0 ? loadedInitLogic : undefined;
    const immTree = logicTree && loadFromJsonLogic(logicTree, config);
    tree = immTree && getTree(immTree);
  } else {
    tree = loadedInitValue && Object.keys(loadedInitValue).length > 0 ? loadedInitValue as JsonTree : undefined;
  }
  if (!tree) {
    tree = getEmptyTree();
  }
  return tree;
}

export async function getSavedTree(req: NextApiRequest): Promise<JsonTree> {
  const session = req.session as Session;
  let tree: JsonTree = session.tree;
  if (!tree) {
    tree = getInitialTree(loadedConfig);
    await saveTree(session, tree);
  }
  return tree;
}

async function saveTree(session: Session, tree: JsonTree) {
  session.tree = tree;
  await session.save();
}

function prepareResult(immutableTree: ImmutableTree, config: Config): PostResult {
  const jl = jsonLogicFormat(immutableTree, config);
  const qs = queryString(immutableTree, config);
  const qsh = queryString(immutableTree, config, true);
  const sql = sqlFormat(immutableTree, config);
  const mongo = mongodbFormat(immutableTree, config);

  const result = {
    jl,
    qs,
    qsh,
    sql,
    mongo,
  };
  return result;
}

async function post(req: NextApiRequest, res: NextApiResponse<PostResult>) {
  const session = req.session as Session;
  const { jsonTree, jsonConfig } = JSON.parse(req.body as string) as PostBody;
  const config = deserializeConfig(jsonConfig, CoreConfig.ctx);
  const immutableTree: ImmutableTree = loadTree(jsonTree);
  await saveTree(session, jsonTree);
  const result = prepareResult(immutableTree, config);
  return res.status(200).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse<GetResult>) {
  const tree: JsonTree = req.query["initial"] ? getInitialTree(loadedConfig) : await getSavedTree(req);
  const result: GetResult = {
    tree
  };
  return res.status(200).json(result);
}

async function del(req: NextApiRequest, res: NextApiResponse<GetResult>) {
  const session = req.session as Session;
  const tree: JsonTree = req.query["initial"] ? getInitialTree(loadedConfig) : getEmptyTree();
  await saveTree(session, tree);
  const result: GetResult = {
    tree
  };
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return post(req, res);
  } else if (req.method === "GET") {
    return get(req, res);
  } else if (req.method === "DELETE") {
    return del(req, res);
  } else {
    return res.status(400);
  }
}

export default withSessionRoute(route);

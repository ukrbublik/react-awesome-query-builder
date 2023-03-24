import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils, CoreConfig,
  //types:
  ImmutableTree, Config, JsonTree, JsonLogicTree, JsonLogicResult
} from "@react-awesome-query-builder/core";
import { withSessionRoute, Session, getSessionData, saveSessionData } from "../../lib/withSession";
import pureServerConfig from "../../lib/config";
import loadedInitValue from "../../data/init_value";
import loadedInitLogic from "../../data/init_logic";
const {
  uuid, checkTree, loadFromJsonLogic, loadTree,
  jsonLogicFormat, queryString, sqlFormat, mongodbFormat, getTree
} = Utils;

// API to get/save `jsonTree` to session
// Initial tree is loaded from `data` dir
// After saving `jsonTree` is exported to multiple formats on server side and returned in response
// Note that `pureServerConfig` is used for export utils
// TODO: use decompressed saved config for export utils?

export type PostTreeBody = {
  jsonTree: JsonTree,
};
export interface PostTreeResult {
  jl?: JsonLogicResult;
  qs?: string;
  qsh?: string;
  sql?: string;
  mongo?: Object;
}
export type GetTreeQuery = {
  initial?: string;
};
export interface GetTreeResult {
  tree: JsonTree;
}

function getEmptyTree(): JsonTree {
  return {"id": uuid(), "type": "group"};
}

export function getInitialTree(fromLogic = false): JsonTree {
  const config = pureServerConfig;
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
  return getSessionData(req.session).jsonTree || getInitialTree();
}


async function saveTree(session: Session, jsonTree: JsonTree) {
  await saveSessionData(session, { jsonTree });
}

function prepareResult(immutableTree: ImmutableTree, config: Config): PostTreeResult {
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

async function post(req: NextApiRequest, res: NextApiResponse<PostTreeResult>) {
  const { jsonTree } = JSON.parse(req.body as string) as PostTreeBody;
  const immutableTree: ImmutableTree = loadTree(jsonTree);
  await saveTree(req.session, jsonTree);
  const result: PostTreeResult = prepareResult(immutableTree, pureServerConfig);
  return res.status(200).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse<GetTreeResult>) {
  const tree: JsonTree = (req.query as GetTreeQuery).initial ? getInitialTree() : await getSavedTree(req);
  const result: GetTreeResult = {
    tree
  };
  return res.status(200).json(result);
}

async function del(req: NextApiRequest, res: NextApiResponse<GetTreeResult>) {
  const tree: JsonTree = (req.query as GetTreeQuery).initial ? getInitialTree() : getEmptyTree();
  await saveTree(req.session, tree);
  const result: GetTreeResult = {
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
    return res.status(400).end();
  }
}

export default withSessionRoute(route);

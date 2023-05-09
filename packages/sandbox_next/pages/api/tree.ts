import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils,
  //types:
  ImmutableTree, Config, JsonTree, JsonLogicTree, JsonLogicResult
} from "@react-awesome-query-builder/core";
import { withSessionRoute, getSessionData, saveSessionData } from "../../lib/withSession";
import serverConfig from "../../lib/config";
import loadedInitValue from "../../data/init_value";
import loadedInitLogic from "../../data/init_logic";
import { decompressSavedConfig } from "./config";
const {
  uuid, checkTree, loadFromJsonLogic, loadTree,
  jsonLogicFormat, queryString, sqlFormat, mongodbFormat, getTree
} = Utils;

// API to get/save `jsonTree` to session
// Initial tree is loaded from `data` dir (by default from `init_logic.js`, or from `init_value.js` if `fromLogic = false`)
// After saving `jsonTree` is exported to multiple formats on server side and returned in response

interface ConvertResult {
  jl?: JsonLogicResult;
  qs?: string;
  qsh?: string;
  sql?: string;
  mongo?: Object;
}
export type PostTreeQuery = {
  saveTree?: string;
};
export type PostTreeBody = {
  jsonTree: JsonTree,
};
export type PostTreeResult = ConvertResult;
export type GetTreeQuery = {
  initial?: string;
};
export type GetTreeResult = ConvertResult & {
  jsonTree: JsonTree;
}

function getEmptyTree(): JsonTree {
  return {"id": uuid(), "type": "group"};
}

export function getInitialTree(fromLogic = true): JsonTree {
  const config = serverConfig;
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

async function getSavedTree(req: NextApiRequest): Promise<JsonTree> {
  return (await getSessionData(req))?.jsonTree || getInitialTree();
}


async function saveTree(req: NextApiRequest, jsonTree: JsonTree) {
  await saveSessionData(req, { jsonTree });
}

function convertTree(immutableTree: ImmutableTree, config: Config): ConvertResult {
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
  const doSaveTree = (req.query as PostTreeQuery).saveTree === "true";
  const immutableTree: ImmutableTree = loadTree(jsonTree);
  const config = await decompressSavedConfig(req);
  const convertResult = convertTree(immutableTree, config);
  const result: PostTreeResult = convertResult;
  if (doSaveTree) {
    await saveTree(req, jsonTree);
  }
  return res.status(200).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse<GetTreeResult>) {
  const jsonTree: JsonTree = (req.query as GetTreeQuery).initial ? getInitialTree() : await getSavedTree(req);
  const immutableTree: ImmutableTree = loadTree(jsonTree);
  const config = await decompressSavedConfig(req);
  const convertResult = convertTree(immutableTree, config);
  const result: GetTreeResult = {
    jsonTree,
    ...convertResult
  };
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return await post(req, res);
  } else if (req.method === "GET") {
    return await get(req, res);
  } else {
    return res.status(400).end();
  }
}

export default withSessionRoute(route);

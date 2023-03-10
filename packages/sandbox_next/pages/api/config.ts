import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils, CoreConfig,
  //types:
  ImmutableTree, Config, JsonTree, JsonLogicTree, JsonLogicResult, ZipConfig
} from "@react-awesome-query-builder/core";
import { IronSession } from "iron-session";
import { withSessionRoute } from "../../lib/withSession";
import serverConfig from "../../lib/config";
import loadedInitValue from "../../lib/init_value";
import loadedInitLogic from "../../lib/init_logic";
const {
  uuid, checkTree, loadFromJsonLogic, loadTree,
  jsonLogicFormat, queryString, sqlFormat, mongodbFormat, getTree
} = Utils;
const { UNSAFE_serializeConfig, UNSAFE_deserializeConfig } = Utils.ConfigUtils;


type Session = IronSession & {
  zipConfig: ZipConfig;
};

export type PostConfigBody = {
  zipConfig: ZipConfig,
};

export interface PostResult {
}

export interface GetResult {
  zipConfig: ZipConfig;
}


export async function getSavedConfig(req: NextApiRequest): Promise<ZipConfig> {
  const session = req.session as Session;
  let zipConfig: ZipConfig = session.zipConfig;
	if (!zipConfig) {
		zipConfig = Utils.ConfigUtils.compressConfig(serverConfig, CoreConfig);
	}
  return zipConfig;
}

async function saveConfig(session: Session, zipConfig: ZipConfig) {
  session.zipConfig = zipConfig;
  await session.save();
}

async function post(req: NextApiRequest, res: NextApiResponse<PostResult>) {
  const session = req.session as Session;
  const { zipConfig } = JSON.parse(req.body as string) as PostConfigBody;
  await saveConfig(session, zipConfig);
  const result = {};
  return res.status(200).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse<GetResult>) {
  const zipConfig = await getSavedConfig(req);
  const result: GetResult = {
    zipConfig
  };
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return post(req, res);
  } else if (req.method === "GET") {
    return get(req, res);
  } else {
    return res.status(400);
  }
}

export default withSessionRoute(route);

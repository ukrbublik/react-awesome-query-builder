import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils, CoreConfig,
  //types:
  ZipConfig
} from "@react-awesome-query-builder/core";
import { BaseSession, withSessionRoute, getSessionData, saveSessionData } from "../../lib/withSession";
import serverConfig from "../../lib/config";
const { UNSAFE_serializeConfig, UNSAFE_deserializeConfig } = Utils.ConfigUtils;


export type PostConfigBody = {
  zipConfig: ZipConfig,
};

export interface PostResult {
}

export interface GetResult {
  zipConfig: ZipConfig;
}


export async function getSavedConfig(req: NextApiRequest): Promise<ZipConfig> {
  let zipConfig: ZipConfig = getSessionData(req.session as BaseSession).zipConfig;
	if (!zipConfig) {
		zipConfig = getInitialConfig();
	}
  return zipConfig;
}

export function getInitialConfig() {
	return Utils.ConfigUtils.compressConfig(serverConfig, CoreConfig);
}

async function saveConfig(session: BaseSession, zipConfig: ZipConfig) {
	await saveSessionData(session, { zipConfig });
}

async function post(req: NextApiRequest, res: NextApiResponse<PostResult>) {
  const { zipConfig } = JSON.parse(req.body as string) as PostConfigBody;
  await saveConfig(req.session as BaseSession, zipConfig);
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

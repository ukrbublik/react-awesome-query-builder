import { NextApiRequest, NextApiResponse } from "next";
import {
  Utils, CoreConfig,
  //types:
  ZipConfig,
  Config
} from "@react-awesome-query-builder/core";
import { withSessionRoute, getSessionData, saveSessionData } from "../../lib/withSession";
import serverConfig from "../../lib/config";

// API to get/save `zipConfig` to session
// Initial config is created in `lib/config` and compressed with `Utils.ConfigUtils.compressConfig()`

export type GetConfigQuery = {
  initial?: string;
};
export interface PostConfigBody {
  zipConfig: ZipConfig;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PostConfigResult {
}
export interface GetConfigResult {
  zipConfig: ZipConfig;
}

export async function decompressSavedConfig(req: NextApiRequest): Promise<Config> {
  const zipConfig = await getSavedZipConfig(req);
  const config = Utils.ConfigUtils.decompressConfig(zipConfig, serverConfig as Config);
  return config;
}

export async function getSavedZipConfig(req: NextApiRequest): Promise<ZipConfig> {
  return (await getSessionData(req))?.zipConfig || getInitialZipConfig();
}

export function getInitialZipConfig() {
  return Utils.ConfigUtils.compressConfig(serverConfig as Config, CoreConfig);
}

async function saveZipConfig(req: NextApiRequest, zipConfig: ZipConfig) {
  await saveSessionData(req, { zipConfig });
}

async function post(req: NextApiRequest, res: NextApiResponse<PostConfigResult>) {
  const { zipConfig } = JSON.parse(req.body as string) as PostConfigBody;
  await saveZipConfig(req, zipConfig);
  const result: PostConfigResult = {};
  return res.status(200).json(result);
}

async function get(req: NextApiRequest, res: NextApiResponse<GetConfigResult>) {
  const zipConfig = (req.query as GetConfigQuery).initial ? getInitialZipConfig() : await getSavedZipConfig(req);
  const result: GetConfigResult = {
    zipConfig
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

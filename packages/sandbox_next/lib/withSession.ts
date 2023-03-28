import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest
} from "next";
import { IronSession, IronSessionOptions } from "iron-session";
import {
  JsonTree, ZipConfig
} from "@react-awesome-query-builder/core";
import { nanoid } from "nanoid";
import { IncomingMessage } from "http";
import { Redis } from "@upstash/redis";
import jsonfile from "jsonfile";
import { existsSync } from "node:fs";

// API to manage session data.
// Wrappers to enable session for routes and SSR

export type SessionData = {
  jsonTree?: JsonTree;
  zipConfig?: ZipConfig;
};
export type Session = IronSession & {
  id: string;
};

// Wrappers

export const sessionOptions: IronSessionOptions = {
  cookieName: "raqb_sandbox",
  password: "complex_password_at_least_32_characters_long",
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}

declare module "next" {
  interface NextApiRequest {
    session: Session;
  }
}


// Manage session data storage - Redis or local tmp file

const redis = process.env.UPSTASH_REDIS_REST_URL ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

export const saveSessionData = async (req: IncomingMessage, newData: SessionData) => {
  const session = (req.session as Session);
  if (!session.id) {
    session.id = nanoid();
    await session.save();
  }
  const sid = session.id;

  if (redis) {
    let data = await getSessionData(req);
    if (!data) {
      data = {};
      await redis.json.set(`sessions.${sid}`, "$", data);
    }
    if (newData.jsonTree) {
      await redis.json.set(`sessions.${sid}`, "$.jsonTree", newData.jsonTree);
    }
    if (newData.zipConfig) {
      await redis.json.set(`sessions.${sid}`, "$.zipConfig", newData.zipConfig);
    }
  } else {
    const data = {
      ...(await getSessionData(req)),
      ...newData,
    };
    jsonfile.writeFileSync(`/tmp/sessions_${sid}`, data);
  }
};

export const getSessionData = async (req: IncomingMessage): Promise<SessionData> => {
  const sid = (req.session as Session).id;
  if (redis) {
    return await redis.json.get(`sessions.${sid}`) as SessionData;
  } else {
    return existsSync(`/tmp/sessions_${sid}`) ? jsonfile.readFileSync(`/tmp/sessions_${sid}`) as SessionData : {};
  }
};

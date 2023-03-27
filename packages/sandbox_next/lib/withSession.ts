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


// API to manage session data

export const saveSessionData = async (req: IncomingMessage, data: SessionData) => {
  const session = (req.session as Session);
  if (!session.id) {
    session.id = nanoid();
    await session.save();
  }
  await setSessionDataForReq(req, data);
};


export const getSessionData = async (req: IncomingMessage) => {
  const sid = (req.session as Session).id;
  const url = `http://${req.headers.host}/api/session?sid=${sid}&pass=${sessionOptions.password as string}`;
  const sessionData: SessionData = await (await fetch(url)).json() as SessionData;
  return sessionData;
};

const setSessionDataForReq = async (req: IncomingMessage, data: SessionData) => {
  const sid = (req.session as Session).id;
  const url = `http://${req.headers.host}/api/session?sid=${sid}&pass=${sessionOptions.password as string}`;
  const sessionData: SessionData = await (await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
  })).json() as SessionData;
  return sessionData;
};

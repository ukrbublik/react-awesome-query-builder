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

// Internal in-memory store
let allSessions: Record<string, SessionData> = {};

// API to manage session data
export const saveSessionData = async (session: Session, data: SessionData) => {
	if (!session.id) {
		session.id = nanoid();
    await session.save();
	}
  allSessions[session.id] = {
		...(allSessions[session.id] || {}),
		...data
	};
};

export const getSessionData = (session: Session): SessionData => {
  return {
		...(allSessions[session.id] || {})
	};
};

export const getSessionDataById = (sid: string): SessionData => {
  return {
		...(allSessions[sid] || {})
	};
};

// Internal method to retrieve session data, used by `getServerSideProps`
// Using HTTP request is a hack, but direct call `getSessionData()` from `getServerSideProps` entry point will not work
export const getSessionDataForReq = async (req: IncomingMessage) => {
  const sid = (req.session as Session).id;
  const url = `http://${req.headers.host}/api/session?sid=${sid}&pass=${sessionOptions.password}`;
  const sessionData: SessionData = await(await fetch(url)).json();
  return sessionData;
};

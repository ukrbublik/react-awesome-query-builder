import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler
} from "next";
import { IronSession, IronSessionOptions } from "iron-session";
import {
  JsonTree, ZipConfig
} from "@react-awesome-query-builder/core";
import { nanoid } from "nanoid";

const sessionOptions: IronSessionOptions = {
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

// Theses types are compatible with InferGetStaticPropsType https://nextjs.org/docs/basic-features/data-fetching#typescript-use-getstaticprops
export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}

// in-memory store
let sessionData: Record<string, SessionData> = {};

export type SessionData = {
  tree?: JsonTree;
	zipConfig?: ZipConfig;
};

export type BaseSession = IronSession & {
  id: string;
};

export const saveSessionData = async (session: BaseSession, data: SessionData) => {
	if (!session.id) {
		session.id = nanoid();
	}
  sessionData[session.id] = {
		...(sessionData[session.id] || {}),
		...data
	};
  await session.save();
};

export const getSessionData = (session: BaseSession): SessionData => {
  return {
		...(sessionData[session.id] || {})
	};
};

export const getSessionDataById = (sid: string): SessionData => {
  return {
		...(sessionData[sid] || {})
	};
};

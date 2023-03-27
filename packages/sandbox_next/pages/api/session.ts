import { NextApiRequest, NextApiResponse } from "next";
import { SessionData, Session, withSessionRoute, sessionOptions } from "../../lib/withSession";

// Internal routes to manage in-memory session store

export type GetSessionQuery = {
  sid?: string;
  pass: string;
};
export type GetSessionResult = SessionData;
export type PostSessionQuery = {
  sid?: string;
  pass: string;
};
export type PostSessionBody = SessionData;
export type PostSessionResult = SessionData;

// Internal in-memory store
const allSessions: Record<string, SessionData> = {};

function get(req: NextApiRequest, res: NextApiResponse<GetSessionResult>) {
  const query = req.query as GetSessionQuery;
  const sid = query.sid || req.session.id;
  if (sid !== req.session.id && query.pass !== sessionOptions.password) {
    return res.status(401).end();
  }

  const result: GetSessionResult = {
    ...(allSessions[sid] || {})
  };

  return res.status(200).json(result);
}

function post(req: NextApiRequest, res: NextApiResponse<PostSessionResult>) {
  const query = req.query as PostSessionQuery;
  const sid = query.sid || req.session.id;
  if (sid !== req.session.id && query.pass !== sessionOptions.password) {
    return res.status(401).end();
  }
  const sessionData = req.body as PostSessionBody;
  
  allSessions[sid] = {
    ...(allSessions[sid] || {}),
    ...sessionData
  };

  const result: PostSessionResult = allSessions[sid];
  return res.status(200).json(result);
}

function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return get(req, res);
  } else if (req.method === "POST") {
    return post(req, res);
  } else {
    return res.status(400).end();
  }
}

export default withSessionRoute(route);

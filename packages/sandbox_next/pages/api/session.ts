import { NextApiRequest, NextApiResponse } from "next";
import { getSessionDataById, SessionData, Session, withSessionRoute, sessionOptions } from "../../lib/withSession";

// Internal route to retrieve session data by sid, used by `getServerSideProps`

export type GetSessionQuery = {
  sid?: string;
  pass: string;
};
export type GetSessionResult = SessionData;

async function get(req: NextApiRequest, res: NextApiResponse<GetSessionResult>) {
  const query = req.query as GetSessionQuery;
  const sid = query.sid || req.session.id;
  if (sid !== req.session.id && query.pass !== sessionOptions.password) {
    return res.status(401).end();
  }
  const result: GetSessionResult = getSessionDataById(sid);
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return get(req, res);
  } else {
    return res.status(400).end();
  }
}

export default withSessionRoute(route);

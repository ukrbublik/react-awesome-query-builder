import { NextApiRequest, NextApiResponse } from "next";
import { getSessionDataById, SessionData, BaseSession, withSessionRoute } from "../../lib/withSession";

// Internal route to retrieve session data via getServerSideProps
async function get(req: NextApiRequest, res: NextApiResponse<SessionData>) {
  const sid = req.query["sid"] as string || (req.session as BaseSession).id;
  const result = getSessionDataById(sid);
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return get(req, res);
  } else {
    return res.status(400);
  }
}

export default withSessionRoute(route);

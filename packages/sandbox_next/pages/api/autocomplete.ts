import { NextApiRequest, NextApiResponse } from "next";
import { Utils, AsyncFetchListValuesResult, AsyncFetchListValuesFn } from "@react-awesome-query-builder/core";

export type GetResult = AsyncFetchListValuesResult;

const demoListValues = [
  { title: "A", value: "a" },
  { title: "AA", value: "aa" },
  { title: "AAA1", value: "aaa1" },
  { title: "AAA2", value: "aaa2" },
  { title: "B", value: "b" },
  { title: "C", value: "c" },
  { title: "D", value: "d" },
  { title: "E", value: "e" },
  { title: "F", value: "f" },
  { title: "G", value: "g" },
  { title: "H", value: "h" },
  { title: "I", value: "i" },
  { title: "J", value: "j" },
];

const filter: AsyncFetchListValuesFn = Utils.Autocomplete.simulateAsyncFetch(demoListValues, 3, 0);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const search = String(req.query.search) || null;
  let offset = parseInt(String(req.query.offset));
  if (isNaN(offset)) {
    offset = null;
  }
  const result: GetResult = await filter(search, offset);
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return get(req, res);
  } else {
    return res.status(400);
  }
}

export default route;

import { NextApiRequest, NextApiResponse } from "next";
import { Utils, AsyncFetchListValuesResult, AsyncFetchListValuesFn } from "@react-awesome-query-builder/core";
import demoListValues from "../../data/autocomplete";

// API to return portion of `demoListValues`, requested by `search` and `offset`, limited by `PAGE_SIZE`

const PAGE_SIZE = 3;

export type GetAutocompleteResult = AsyncFetchListValuesResult;
export type GetAutocompleteQuery = {
  search?: string;
  offset?: string;
};

const filter: AsyncFetchListValuesFn = Utils.Autocomplete.simulateAsyncFetch(demoListValues, PAGE_SIZE, 0);

async function get(req: NextApiRequest, res: NextApiResponse<GetAutocompleteResult>) {
  const query = req.query as GetAutocompleteQuery;
  const search = query.search ? query.search : null;
  let offset = parseInt(query.offset);
  if (isNaN(offset)) {
    offset = null;
  }
  const result: GetAutocompleteResult = await filter(search, offset);
  return res.status(200).json(result);
}

async function route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return get(req, res);
  } else {
    return res.status(400).end();
  }
}

export default route;

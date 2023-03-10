
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../lib/sessionOptions";
import Demo, { DemoQueryBuilderProps } from "../components/demo/index";
import { getSavedTree } from "../pages/api/tree";
import { getSavedConfig } from "../pages/api/config";
import coreConfig, { createConfig } from "../lib/config";
import realConfig from "../components/demo/config";
import { NextApiRequest } from "next";
import { Utils } from "@react-awesome-query-builder/core";
import { MuiConfig } from "@react-awesome-query-builder/mui";
const { UNSAFE_serializeConfig } = Utils.ConfigUtils;


export default Demo;

export const getServerSideProps = withIronSessionSsr<DemoQueryBuilderProps>(
  async function getServerSideProps({ req }) {
    return {
      props: {
        initValue: await getSavedTree(req as NextApiRequest),
        zipConfig: await getSavedConfig(req as NextApiRequest),
      }
    };
  },
  sessionOptions
);


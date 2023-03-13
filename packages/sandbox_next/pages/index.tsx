
import { withSessionSsr, BaseSession, SessionData } from "../lib/withSession";
import Demo, { DemoQueryBuilderProps } from "../components/demo/index";
import { getSavedTree, getInitialTree } from "../pages/api/tree";
import { getSavedConfig, getInitialConfig } from "../pages/api/config";
import coreConfig, { createConfig } from "../lib/config";
import realConfig from "../components/demo/config";
import { NextApiRequest } from "next";
import { Utils } from "@react-awesome-query-builder/core";
import { MuiConfig } from "@react-awesome-query-builder/mui";
const { UNSAFE_serializeConfig } = Utils.ConfigUtils;

export default Demo;

export const getServerSideProps = withSessionSsr<DemoQueryBuilderProps>(
  async function getServerSideProps({ req }) {
    const sid = (req.session as BaseSession).id;
    const url = `http://${req.headers.host}/api/session?sid=${sid}`;
    const sessionData: SessionData = await(await fetch(url)).json();

    return {
      props: {
        initValue: sessionData?.tree || getInitialTree(),
        zipConfig: sessionData?.zipConfig || getInitialConfig(),
      }
    };
  }
);


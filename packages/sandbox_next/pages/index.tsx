
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../lib/sessionOptions";
import Demo, { DemoQueryBuilderProps } from "../components/demo/index";
import { getSavedTree } from "../pages/api/tree";
import { NextApiRequest } from "next";

export default Demo;

export const getServerSideProps = withIronSessionSsr<DemoQueryBuilderProps>(
  async function getServerSideProps({ req }) {
    return {
      props: {
        initValue: await getSavedTree(req as NextApiRequest),
      }
    };
  },
  sessionOptions
);

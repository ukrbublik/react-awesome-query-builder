
import { withSessionSsr, getSessionData } from "../lib/withSession";
import Demo, { DemoQueryBuilderProps } from "../components/demo/index";
import { getInitialTree } from "../pages/api/tree";
import { getInitialZipConfig } from "../pages/api/config";

export default Demo;

// Get current `jsonTree` and `zipConfig` from session
// If `jsonTree` is missing, will be loaded from `data` dir
// If `zipConfig` is missing, will be created from `lib/config` (based on `CoreConfig`) and compressed with `compressConfig`
export const getServerSideProps = withSessionSsr<DemoQueryBuilderProps>(
  async function getServerSideProps({ req }) {
    const sessionData = await getSessionData(req);
    return {
      props: {
        jsonTree: sessionData?.jsonTree || getInitialTree(),
        zipConfig: sessionData?.zipConfig || getInitialConfig(),
      }
    };
  }
);

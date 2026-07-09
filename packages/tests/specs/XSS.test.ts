import { expect } from "chai";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, with_qb_skins, with_qb_ant, sleep } from "../support/utils";


describe("XSS", () => {
  it("HTML injections in config", async () => {
    await with_qb_skins(configs.with_html_injections, inits.with_html_injections, undefined, (qb, {alertData, skinName}) => {
      expect(alertData, `alertData (${skinName})`).to.eql([]);
    }, {
      delayAfterRender: 500, // to catch alerts
      ignoreAlert: (msg: string) => msg.includes("xss"),
      debug: true,
      ignoreLog: (errText) => {
        // ignore unsupported widgets for skins other than antd
        return errText.includes("No widget for type");
      }
    });
  });

  it("HTML injections in tree", async () => {
    await with_qb_ant(configs.with_html_injections, inits.tree_with_html_injections, undefined, (qb, {alertData, skinName}) => {
      expect(alertData, `alertData (${skinName})`).to.eql([]);
    }, {
      delayAfterRender: 500, // to catch alerts
      ignoreAlert: (msg: string) => msg.includes("xss"),
      debug: true,
      ignoreLog: (errText) => {
        // ignore unsupported widgets for skins other than antd
        return errText.includes("No widget for type");
      }
    });
  });
});

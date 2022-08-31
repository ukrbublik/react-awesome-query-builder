import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_material, sleep } from "../support/utils";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { expect } from "chai";

const stringifyOptions = (options) => {
  return options.map(({title, value}) => `${value}_${title}`).join(";");
};

describe("interactions on MUI", () => {

  describe("autocomplete", () => {
    it("find B", async () => {
      await with_qb_material(configs.with_autocomplete, inits.with_autocomplete_a, "JsonLogic", async (qb, onChange, {expect_jlogic}) => {
        let ac = qb.find(Autocomplete).filter({label: "Select value"});
        expect(stringifyOptions(ac.prop("options"))).to.eq("a_a");
        
        ac.prop("onInputChange")(null, "b");
        await sleep(200); // should be > 50ms delay
        qb.update();
        ac = qb.find(Autocomplete).filter({label: "Select value"});

        expect(stringifyOptions(ac.prop("options"))).to.eq("a_a;b_B");
      });
    });
  });

  it("should render labels with showLabels=true", async () => {
    await with_qb_material([configs.with_different_groups, configs.with_settings_show_labels], inits.with_different_groups, "JsonLogic", (qb) => {
      //todo
    });
  });

  it("should render admin mode with showLock=true", async () => {
    await with_qb_material([configs.with_different_groups, configs.with_settings_show_lock], inits.with_different_groups, "JsonLogic", (qb) => {
      //todo
    });
  });

});

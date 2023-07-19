import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_material } from "../support/utils";
import { expect } from "chai";
import { autocompleteTestsFor } from "./Autocomplete";

describe("interactions on Material-UI", () => {

  describe("autocomplete", () => {
    const {
      testsSingleStrict,
      testsMultipleStrict,
    } = autocompleteTestsFor("mui", 4, it, with_qb_material);

    describe("single-strict", () => {
      testsSingleStrict();
    });

    describe("multiple-strict", () => {
      testsMultipleStrict();
    });
  });

  //-------

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

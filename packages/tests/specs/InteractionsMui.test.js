import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_mui } from "../support/utils";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import { expect } from "chai";
import { autocompleteTestsFor } from "./Autocomplete";


describe("interactions on MUI", () => {
  describe("autocomplete", () => {
    const {
      testsSingleStrict,
      testsMultipleStrict,
    } = autocompleteTestsFor("mui", 5, it, with_qb_mui);

    describe("single-strict", () => {
      testsSingleStrict();
    });

    describe("multiple-strict", () => {
      testsMultipleStrict();
    });
  });

  //-------

  it("change range slider value", async () => {
    await with_qb_mui(configs.with_all_types, inits.with_range_slider, "JsonLogic", async (qb, {expect_jlogic, expect_checks}) => {
      await expect_checks({
        "query": "slider >= 18 && slider <= 42",
        "queryHuman": "Slider BETWEEN 18 AND 42",
        "sql": "slider BETWEEN 18 AND 42",
        "mongo": {
          "slider": {
            "$gte": 18,
            "$lte": 42
          }
        },
        "logic": {
          "and": [
            { "<=": [ 18, { "var": "slider" }, 42 ] }
          ]
        }
      });

      qb.find(Slider).prop("onChange")(null, [19, 42]);
      qb.update();
      expect_jlogic([null,
        { "and": [{ "<=": [ 19, { "var": "slider" }, 42 ] }] }
      ], 0);

      qb.find(TextField).filter({placeholder: "Enter number from"}).prop("onChange")({target: {value: 20}});
      qb.update();
      expect_jlogic([null,
        { "and": [{ "<=": [ 20, { "var": "slider" }, 42 ] }] }
      ], 1);

      qb.find(TextField).filter({placeholder: "Enter number to"}).prop("onChange")({target: {value: 40}});
      qb.update();
      expect_jlogic([null,
        { "and": [{ "<=": [ 20, { "var": "slider" }, 40 ] }] }
      ], 2);

      qb.find(TextField).filter({placeholder: "Enter number from"}).prop("onChange")({target: {value: null}});
      qb.update();
      qb.find(TextField).filter({placeholder: "Enter number to"}).prop("onChange")({target: {value: null}});
      qb.update();
      expect_jlogic([null, undefined], 3);

    });
  });
});

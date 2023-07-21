import { CoreConfig, Utils } from "@react-awesome-query-builder/core";
import {
  Config, BasicConfig, Fields, Field,
  SelectField, AsyncFetchListValuesFn, SelectFieldSettings, NumberFieldSettings,
} from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import { MaterialConfig } from "@react-awesome-query-builder/material";
import { AntdConfig } from "@react-awesome-query-builder/antd";
import { BootstrapConfig } from "@react-awesome-query-builder/bootstrap";
import { FluentUIConfig } from "@react-awesome-query-builder/fluent";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { export_checks, with_qb } from "../support/utils";
import { SliderMark, configMixin, makeCtx, zipInits, expectedZipConfig } from "../support/zipConfigs";
import chai from "chai";
import sinon from "sinon";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import merge from "lodash/merge";
const { ConfigUtils } = Utils;
chai.use(deepEqualInAnyOrder);
const { expect } = chai;

const BaseConfigs: Record<string, Config> = {
  CoreConfig,
  BasicConfig,
  MuiConfig,
  MaterialConfig,
  AntdConfig,
  BootstrapConfig,
  FluentUIConfig,
};

describe("Compressed config", () => {
  const makeConfig: (base: Config) => Config = configs.with_all_types;

  for (const configKey in BaseConfigs) {
    const BaseConfig = BaseConfigs[configKey];
    const config: Config = merge({}, makeConfig(BaseConfig), {
      settings: {
        useConfigCompress: true
      }
    });

    describe(configKey, () => {
      it("should contain only diff", () => {
        const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
        expect((zipConfig as Config).ctx).to.be.undefined;
        expect(JSON.stringify(zipConfig.fields)).to.equal(JSON.stringify(config.fields));
        expect(Object.keys(zipConfig.widgets).length).to.equal(0);
      });

      describe("should be decompressed and used without errors", () => {
        const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
        const decConfig = ConfigUtils.decompressConfig(zipConfig, BaseConfig);
        export_checks(() => decConfig, inits.with_ops, "JsonLogic", {}, [], configKey !== "CoreConfig");
      });
    });

    it("should throw if contains functions", () => {
      const badConfig = merge({}, makeConfig(BaseConfig), {
        fields: {
          str: {
            fieldSettings: {
              validateValue: (val: string) => {
                return (val.length < 10);
              },
            },
          },
        },
      });
      expect(() => ConfigUtils.compressConfig(badConfig, BaseConfig)).to.throw();
    });
  }
});

describe("settings.useConfigCompress", () => {
  let BaseConfig = BasicConfig;

  it("decompressConfig() should throw if useConfigCompress is not true", () => {
    const config: Config = merge({}, BaseConfig);
    const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
    expect(() => ConfigUtils.decompressConfig(zipConfig, BaseConfig)).to.throw();
  });

  it("extendConfig() should compile functions", async () => {
    const config: Config = configMixin(BaseConfig);
    const ctx = makeCtx(BaseConfig);

    // compress and decompress
    const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
    const decConfig = ConfigUtils.decompressConfig(zipConfig, BaseConfig, ctx);
    export_checks(() => decConfig, inits.with_ops, "JsonLogic", {});

    // extend manually
    const extConfig = ConfigUtils.extendConfig(decConfig) as BasicConfig;
    // check autocomplete
    let asyncFetch: AsyncFetchListValuesFn;
    asyncFetch = ((extConfig.fields.autocomplete as Field).fieldSettings as SelectFieldSettings).asyncFetch as AsyncFetchListValuesFn;
    await asyncFetch("aa", 0);
    expect(ctx.autocompleteFetch.callCount).to.equal(1);
    asyncFetch = ((extConfig.fields.autocomplete2 as Field).fieldSettings as SelectFieldSettings).asyncFetch as AsyncFetchListValuesFn;
    await asyncFetch("bb", 0);
    expect(ctx.autocompleteFetch.callCount).to.equal(2);
    asyncFetch = ((extConfig.fields.autocomplete3 as Field).fieldSettings as SelectFieldSettings).asyncFetch as AsyncFetchListValuesFn;
    expect(() => asyncFetch("cc", 0)).to.throw();

    // check funcs
    expect(zipConfig.funcs, "zipConfig.funcs").to.deep.equalInAnyOrder(expectedZipConfig.funcs);
    expect(zipConfig.operators, "zipConfig.operators").to.deep.equalInAnyOrder(expectedZipConfig.operators);
    expect(zipConfig.types, "zipConfig.operators").to.deep.equalInAnyOrder(expectedZipConfig.types);

    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.sqlFormatFunc", null);
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.myFormat", null);
    expect(decConfig.funcs).to.not.have.nested.property("numeric.subfields.LINEAR_REGRESSION.spelFormatFunc");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.returnType", "number");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.renderBrackets[0]", "");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.renderBrackets[1]", "");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.renderSeps[0]", "*");
    expect(decConfig.funcs).to.not.have.nested.property("numeric.subfields.LINEAR_REGRESSION.renderSeps[1]");
    expect(decConfig.funcs).to.not.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.bias");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.coef.type", "number");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.coef.newKey", "new_arg");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.coef.defaultValue", 10);
    expect(decConfig.funcs).to.not.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.coef.label");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.newArg.type", "string");
    expect(decConfig.funcs).to.have.nested.property("numeric.subfields.LINEAR_REGRESSION.args.newArg.label", "New arg");
    expect(decConfig.funcs).to.not.have.nested.property("LOWER.spelFunc");
    expect(decConfig.funcs).to.not.have.nested.property("LOWER.label");
    expect(decConfig.funcs).to.have.nested.property("LOWER.myFormat", 123);
    expect(decConfig.funcs).to.have.nested.property("LOWER.jsonLogicCustomOps", 1);
    expect(decConfig.funcs).to.have.nested.property("LOWER.mongoFunc.lower", 12);
    expect(decConfig.funcs).to.have.nested.property("LOWER.jsonLogic", "ToLowerCase");
    
    // check operators
    expect(decConfig.operators).to.have.deep.nested.property("between.jsonLogic", {aaa: 1});
    expect(decConfig.operators).to.have.nested.property("between.reversedOp", "not_between");
    expect(decConfig.operators).to.not.have.nested.property("between.labelForFormat");

    // check types
    expect(decConfig.types).to.have.nested.property("boolean.widgets.boolean.opProps", 111);

    // can't compress extended config
    expect(() => ConfigUtils.compressConfig(extConfig, BaseConfig)).to.throw();
  });

  it("extendConfig() should compile React components", async () => {
    BaseConfig = MuiConfig;
    const config: Config = configMixin(BaseConfig);
    const ctx = makeCtx(BaseConfig);

    // compress and decompress
    const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
    const decConfig = ConfigUtils.decompressConfig(zipConfig, BaseConfig, ctx);

    // extend via render
    await with_qb(() => decConfig, zipInits.withSlider, "JsonLogic", (qb, onChange, {expect_queries}) => {
      // check slider marks
      const rule0 = qb.find(".rule").at(0);
      const slider0 = rule0.find(".rule--value .widget--widget .MuiSlider-root").at(0);
      const marks0 = slider0.find(".MuiSlider-markLabel");
      const mark00 = marks0.filterWhere(m => m.prop("data-index") == 0).at(0);
      const mark01 = marks0.filterWhere(m => m.prop("data-index") == 1).at(0);
      expect(mark00.html()).to.contain("<strong><span>0</span><span>%</span></strong>");
      expect(mark01.html()).to.contain("<strong><span>50</span><span>%</span></strong>");

      const rule1 = qb.find(".rule").at(1);
      const slider1 = rule1.find(".rule--value .widget--widget .MuiSlider-root").at(0);
      const mark10 = slider1.find(".MuiSlider-markLabel").at(0);
      expect(mark10.html()).to.contain("<slidermark_notexists");

    }, {
      ignoreLog: (errText) => {
        return errText.includes("The tag <%s> is unrecognized in this browser") && errText.includes("slidermark_notexists")
          || errText.includes("Invalid DOM property `%s`") && errText.includes("readonly")
        ;
      }
    });
  });
});

import { CoreConfig, Utils } from "@react-awesome-query-builder/core";
import {
  Config, BasicConfig, Fields, 
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
import { SliderMark, configMixin, makeCtx, zipInits } from "../support/zipConfigs";
import { expect } from "chai";
import sinon from "sinon";
import merge from "lodash/merge";
const { ConfigUtils } = Utils;

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

        // todo: check funcs
      });
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
    const config: Config = merge({}, BaseConfig, configMixin);
    const ctx = makeCtx(BaseConfig);

    // compress and decompress
    const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
    const decConfig = ConfigUtils.decompressConfig(zipConfig, BaseConfig, ctx);
    export_checks(() => decConfig, inits.with_ops, "JsonLogic", {});

    // extend manually
    const extConfig = ConfigUtils.extendConfig(decConfig) as BasicConfig;
    // check autocomplete
    await ((extConfig.fields.autocomplete as SelectField).fieldSettings!.asyncFetch as AsyncFetchListValuesFn)("aa", 0);
    expect(ctx.autocompleteFetch.callCount).to.equal(1);
    await ((extConfig.fields.autocomplete2 as SelectField).fieldSettings!.asyncFetch as AsyncFetchListValuesFn)("bb", 0);
    expect(ctx.autocompleteFetch.callCount).to.equal(2);
    expect(() =>
      ((extConfig.fields.autocomplete3 as SelectField).fieldSettings!.asyncFetch as AsyncFetchListValuesFn)("cc", 0)
    ).to.throw();
  });

  it("extendConfig() should compile React components", async () => {
    BaseConfig = MuiConfig;
    const config: Config = merge({}, BaseConfig, configMixin);
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
      const mark00 = marks0.filterWhere(m => m.prop('data-index') == 0).at(0);
      const mark01 = marks0.filterWhere(m => m.prop('data-index') == 1).at(0);
      expect(mark00.html()).to.contain("<strong><span>0</span><span>%</span></strong>");
      expect(mark01.html()).to.contain("<strong><span>50</span><span>%</span></strong>");

      const rule1 = qb.find(".rule").at(1);
      const slider1 = rule1.find(".rule--value .widget--widget .MuiSlider-root").at(0);
      const mark10 = slider1.find(".MuiSlider-markLabel").at(0);
      expect(mark10.html()).to.contain("<slidermark_notexists");

    });
  });
});

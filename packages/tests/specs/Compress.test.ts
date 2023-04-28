import { CoreConfig, Utils } from "@react-awesome-query-builder/core";
import { Config, BasicConfig } from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import { MaterialConfig } from "@react-awesome-query-builder/material";
import { AntdConfig } from "@react-awesome-query-builder/antd";
import { BootstrapConfig } from "@react-awesome-query-builder/bootstrap";
import { FluentUIConfig } from "@react-awesome-query-builder/fluent";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { export_checks } from "../support/utils";
import { expect } from "chai";
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
  for (const configKey in BaseConfigs) {
    const BaseConfig = BaseConfigs[configKey];
    const makeConfig: (base: Config) => Config = configs.with_all_types;
    const config = makeConfig(BaseConfig);

    describe(configKey, () => {
      it("should contain only diff", async () => {
        const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
        expect((zipConfig as any).ctx).to.be.undefined;
        expect(JSON.stringify(zipConfig.fields)).to.equal(JSON.stringify(config.fields));
        expect(Object.keys(zipConfig.widgets).length).to.equal(0);
      });

      describe("should be decompressed and used without errors", async () => {
        const zipConfig = ConfigUtils.compressConfig(config, BaseConfig);
        const decConfig = ConfigUtils.decompressConfig(zipConfig, BaseConfig);
        export_checks(() => decConfig, inits.with_ops, "JsonLogic", {}, [], configKey !== "CoreConfig");
      });
    });
  }
});

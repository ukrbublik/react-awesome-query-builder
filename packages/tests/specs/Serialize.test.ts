import { CoreConfig } from "@react-awesome-query-builder/core";
import { Config, BasicConfig } from "@react-awesome-query-builder/ui";
import { MuiConfig } from "@react-awesome-query-builder/mui";
import { MaterialConfig } from "@react-awesome-query-builder/material";
import { AntdConfig } from "@react-awesome-query-builder/antd";
import { BootstrapConfig } from "@react-awesome-query-builder/bootstrap";
import { FluentUIConfig } from "@react-awesome-query-builder/fluent";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { UNSAFE_serializeConfig, UNSAFE_deserializeConfig, export_checks } from "../support/utils";
import { expect } from "chai";

const BaseConfigs: Record<string, Config> = {
  CoreConfig,
  BasicConfig,
  MuiConfig,
  MaterialConfig,
  AntdConfig,
  BootstrapConfig,
  FluentUIConfig,
};

describe("Serialized config", () => {
  for (const configKey in BaseConfigs) {
    const BaseConfig = BaseConfigs[configKey];
    const makeConfig: (base: Config) => Config = configs.with_all_types;
    const config = makeConfig(BaseConfig);

    describe(configKey, () => {
      it("should not contain refs to webpack", () => {
        const strConfig = UNSAFE_serializeConfig(config);
        expect(strConfig).to.not.contain("__WEBPACK_IMPORTED_MODULE_");
      });

      it("should be deserialized correctly", () => {
        const strConfig = UNSAFE_serializeConfig(config);
        const deserConfig = UNSAFE_deserializeConfig(strConfig, BaseConfig.ctx);
        expect(deserConfig).to.satisfy((c: Config) => !!c.ctx, "Should contain ctx");
      });

      describe("should be deserialized and used without errors", () => {
        const strConfig = UNSAFE_serializeConfig(config);
        const deserConfig = UNSAFE_deserializeConfig(strConfig, BaseConfig.ctx);
        export_checks(() => deserConfig, inits.with_ops, "JsonLogic", {}, [], configKey !== "CoreConfig");
      });
    });
  }
});

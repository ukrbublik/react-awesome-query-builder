import {BasicConfig} from "react-awesome-query-builder";

const fields = {
  crDeal: {
    label: "crDeal",
    type: "!group",
    subfields: {
      id: {
        label: "dealId",
        type: "text",
        excludeOperators: ["proximity"],
        valueSources: ["value"],
      },
      currency: {
        label: "common:currency",
        type: "text",
        excludeOperators: ["proximity"],
        valueSources: ["value"],
      },
      dealClassification: {
        label: "dealClassification",
        type: "select",
        fieldSettings: {
          listValues: [
            { value: "AVAL", title: "AVAL" },
            { value: "CURRENT_ACCOUNT", title: "CURRENT_ACCOUNT"},
            { value: "FIXED_RATE", title: "FIXED_RATE"},
          ],
        },
        valueSources: ["value"],
      },
    },
  },
};

export default{ ...BasicConfig, fields: fields, settings: { ...BasicConfig.settings, showNot: true } };

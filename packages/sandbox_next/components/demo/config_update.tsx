import React from "react";
import { Config } from "@react-awesome-query-builder/mui";
import merge from "lodash/merge";

function randomColor() {
  let hex = Math.floor(Math.random() * 0xFFFFFF);
  let color = "#" + hex.toString(16);
  return color;
}

function randomName() {
  return Math.random().toString(36).slice(2, 7);
}

export default (baseConfig: Config) => {
  const newFieldName = "custom_" + randomName();
  return merge(
    {},
    baseConfig,
    {
      // Update MUI colors
      settings: {
        theme: {
          mui: {
            palette: {
              primary: { main: randomColor() },
              secondary: { main: randomColor() },
            },
          }
        }
      },
      // Add new field
      fields: {
        [newFieldName]: {
          type: "text",
        },
      },
      // Reset boolean widget to basic one
      types: {
        boolean: {
          widgets: {
            boolean: {
              widgetProps: {
                factory: "VanillaBooleanWidget",
              }
            }
          }
        }
      }
    },
  );
};

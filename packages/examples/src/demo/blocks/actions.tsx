import React, { Dispatch, SetStateAction, MutableRefObject } from "react";
import {
  Utils, ImmutableTree, Actions,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState, DemoQueryBuilderMemo } from "../types";


// Demonstrates how actions can be called programmatically
const _runActions = (tree: ImmutableTree, actions: Actions) => {
  const rootPath = [ tree.get("id") ];
  const childrenCount = tree.get("children1")?.size || 0;
  const firstItem = tree.get("children1")?.first()!;
  const lastItem = tree.get("children1")?.last()!;
  const firstPath = [
    tree.get("id"), 
    firstItem?.get("id")
  ];
  const lastPath = [
    tree.get("id"), 
    lastItem?.get("id")
  ];

  // Change root group to NOT OR
  actions.setNot(rootPath, true);
  actions.setConjunction(rootPath, "OR");

  // Move first item
  if (childrenCount > 1) {
    actions.moveItem(firstPath, lastPath, "before");
  }

  // Change first rule to `num between 2 and 4`
  if (childrenCount && firstItem.get("type") === "rule") {
    actions.setFieldSrc(firstPath, "field");
    actions.setField(firstPath, "num");
    actions.setOperator(firstPath, "between");
    actions.setValueSrc(firstPath, 0, "value");
    actions.setValue(firstPath, 0, 2, "number");
    actions.setValue(firstPath, 1, 4, "number");
  }

  // Remove last rule
  if (childrenCount > 1) {
    actions.removeRule(lastPath);
  }

  // Add rule `lower(aaa) == lower(AAA)`
  const newPath = [
    tree.get("id"), 
    Utils.uuid()
  ];
  actions.addRule(rootPath, {
    id: newPath[1], // use pre-generated id
    field: null,
    operator: null,
    value: [],
  });
  actions.setFieldSrc(newPath, "func");
  actions.setFuncValue(newPath, -1, [], null, "string.LOWER", "string");
  actions.setFuncValue(newPath, -1, [], "str", "aaa", "string");
  actions.setValueSrc(newPath, 0, "func");
  actions.setFuncValue(newPath, 0, [], null, "string.LOWER", "string");
  actions.setFuncValue(newPath, 0, [], "str", "AAA", "string");

  // Add rule `login == "denis"`
  actions.addRule(
    rootPath,
    {
      field: "user.login",
      operator: "equal",
      value: ["denis"],
      valueSrc: ["value"],
      valueType: ["text"]
    },
  );

  // Add rule `login == firstName`
  actions.addRule(
    rootPath,
    {
      field: "user.login",
      operator: "equal",
      value: ["user.firstName"],
      valueSrc: ["field"]
    },
  );

  // Add rule-group `cars` with `year == 2021`
  actions.addRule(
    rootPath,
    {
      field: "cars",
      mode: "array",
      operator: "all",
    },
    "rule_group",
    [
      {
        type: "rule",
        properties: {
          field: "cars.year",
          operator: "equal",
          value: [2021]
        }
      }
    ]
  );

  // Add group with `slider == 40` and subgroup `slider < 20`
  actions.addGroup(
    rootPath,
    {
      conjunction: "AND"
    },
    [
      {
        type: "rule",
        properties: {
          field: "slider",
          operator: "equal",
          value: [40]
        }
      },
      {
        type: "group",
        properties: {
          conjunction: "AND"
        },
        children1: [
          {
            type: "rule",
            properties: {
              field: "slider",
              operator: "less",
              value: [20]
            }
          },
        ]
      }
    ]
  );
};

export const useActions = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
  memo: MutableRefObject<DemoQueryBuilderMemo>,
) => {
  const runActions = () => {
    _runActions(state.tree, memo.current.actions!);
  };

  const renderRunActions = () => {
    return (
      <>
        {state.renderBocks.queryBuilder && <button onClick={runActions}>Run actions</button>}
      </>
    );
  };

  return {
    runActions,
    renderRunActions,
  };
};



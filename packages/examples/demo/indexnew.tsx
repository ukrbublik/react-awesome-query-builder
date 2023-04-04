import React, { useCallback, useState } from "react";
import {
    Utils, 
    //types:
    ImmutableTree, Config, JsonTree, JsonGroup, JsonLogicTree, ActionMeta, Actions
  } from "@react-awesome-query-builder/core";
  import {
    Query, Builder, 
    //types:
    BuilderProps
  } from "@react-awesome-query-builder/ui";

import { queryBuilderConfig } from "./confignew";
import { StyledWrapper } from "./styled";

import "@react-awesome-query-builder/mui/css/styles.scss";


const defaultLogic = {
    and: [
      { all: [{ var: "GroupB.FieldB" }, { in: [{ var: "" }, ["1", "2", "3"]] }] },
    ],
  };
  
  export const Filters: React.FC = () => {
    const [state, setState] = useState({
      tree: Utils.checkTree(
        Utils.loadFromJsonLogic(defaultLogic, queryBuilderConfig)!,
        queryBuilderConfig
      ),
      config: queryBuilderConfig,
    });
  
    const handleFilterChange = useCallback(
      (immutableTree: ImmutableTree, config: Config) => {
        setState((prev) => ({ ...prev, tree: immutableTree, config }));
      },
      []
    );
  
    const renderBuilder = useCallback(
      (props: BuilderProps) => (
        <div className="query-builder-container">
          <div className="query-builder">
            <Builder {...props} />
          </div>
        </div>
      ),
      []
    );
  
    return (
        <StyledWrapper>
          <Query
            {...queryBuilderConfig}
            value={state.tree}
            onChange={handleFilterChange}
            renderBuilder={renderBuilder}
          />
        </StyledWrapper>
      );
  };
  
  export default Filters;

import React, { Dispatch, SetStateAction } from "react";
import type { DemoQueryBuilderState } from "../types";


export const useBlocksSwitcher = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const switchRenderBlock = (blockName: string) => {
    setState({...state, renderBocks: {...state.renderBocks, [blockName]: !state.renderBocks[blockName]}});
  };

  const renderBlocksSwitcher = () => {
    return (
      <>
        <button onClick={switchRenderBlock.bind(null, "queryBuilder")}>Builder: {state.renderBocks.queryBuilder ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "validation")}>Validation: {state.renderBocks.validation ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "jsTree")}>Tree: {state.renderBocks.jsTree ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "jsonlogic")}>JsonLogic: {state.renderBocks.jsonlogic ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "spel")}>SpEL: {state.renderBocks.spel ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "strings")}>Strings: {state.renderBocks.strings ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "sql")}>SQL: {state.renderBocks.sql ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "mongo")}>Mongo: {state.renderBocks.mongo ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "elasticSearch")}>ElasticSearch: {state.renderBocks.elasticSearch ? "on" : "off"}</button>
        {state.renderBocks.queryBuilder && <button onClick={switchRenderBlock.bind(null, "actions")}>Actions in console: {state.renderBocks.actions ? "on" : "off"}</button>}
      </>
    );
  };

  return {
    renderBlocksSwitcher,
  };
};

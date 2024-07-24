import React from "react";
import {
  Utils
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";

const stringify = JSON.stringify;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };


export const useOutput = (
  state: DemoQueryBuilderState,
) => {
  const renderJsonLogicBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.jsonlogic) {
      return null;
    }

    const {logic, data: logicData, errors: logicErrors} = Utils.jsonLogicFormat(immutableTree, config);

    return (
      <>
        <div>
          <a href="http://jsonlogic.com/play.html" target="_blank" rel="noopener noreferrer">jsonLogicFormat</a>: 
          { (logicErrors?.length || 0) > 0 
            && <pre style={preErrorStyle}>
              {stringify(logicErrors, undefined, 2)}
            </pre> 
          }
          { !!logic
            && <pre style={preStyle}>
              {"// Rule"}:<br />
              {stringify(logic, undefined, 2)}
              <br />
              <hr />
              {"// Data"}:<br />
              {stringify(logicData, undefined, 2)}
            </pre>
          }
        </div>
        <hr/>
      </>
    );
  };

  const renderMongoBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.mongo) {
      return null;
    }

    const [mongo, mongoErrors] = Utils._mongodbFormat(immutableTree, config);

    return (
      <>
        <div>
          mongodbFormat: 
          { mongoErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(mongoErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {stringify(mongo, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderElasticSearchBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.elasticSearch) {
      return null;
    }

    const elasticSearch = Utils.elasticSearchFormat(immutableTree, config);

    return (
      <>
        <div>
          elasticSearchFormat: 
          <pre style={preStyle}>
            {stringify(elasticSearch, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderJsTreeBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.jsTree) {
      return null;
    }

    const treeJs = Utils.getTree(immutableTree);

    return (
      <>
        <div>
          Tree: 
          <pre style={preStyle}>
            {stringify(treeJs, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderSpelBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.spel) {
      return null;
    }

    const [spel, spelErrors] = Utils._spelFormat(immutableTree, config);

    return (
      <>
        <div>
          spelFormat: 
          { spelErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(spelErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {stringify(spel, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderStringsBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.strings) {
      return null;
    }

    const queryStr = Utils.queryString(immutableTree, config);
    const humanQueryStr = Utils.queryString(immutableTree, config, true);

    return (
      <>
        <div>
          stringFormat: 
          <pre style={preStyle}>
            {stringify(queryStr, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          humanStringFormat: 
          <pre style={preStyle}>
            {stringify(humanQueryStr, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderSqlBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.sql) {
      return null;
    }

    const [sql, sqlErrors] = Utils._sqlFormat(immutableTree, config);

    return (
      <>
        <div>
          sqlFormat: 
          { sqlErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(sqlErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {stringify(sql, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderOutput = () => {
    return (
      <div>
        <hr/>
        {renderSpelBlock(state)}
        {renderStringsBlock(state)}
        {renderSqlBlock(state)}
        {renderJsonLogicBlock(state)}
        {renderMongoBlock(state)}
        {renderElasticSearchBlock(state)}
        {renderJsTreeBlock(state)}
      </div>
    );
  };

  return {
    renderOutput,
  };
};

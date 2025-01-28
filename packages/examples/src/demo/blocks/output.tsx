import React from "react";
import {
  Utils
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";

const stringify = JSON.stringify;


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
            && <pre className="qb-demo-error-pre">
              {stringify(logicErrors, undefined, 2)}
            </pre> 
          }
          { !!logic
            && <pre className="qb-demo-pre">
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
            && <pre className="qb-demo-error-pre">
              {stringify(mongoErrors, undefined, 2)}
            </pre> 
          }
          <pre className="qb-demo-pre">
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
          <pre className="qb-demo-pre">
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
          <pre className="qb-demo-pre">
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
            && <pre className="qb-demo-error-pre">
              {stringify(spelErrors, undefined, 2)}
            </pre> 
          }
          <pre className="qb-demo-pre">
            {spel}
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
          <pre className="qb-demo-pre">
            {queryStr}
          </pre>
        </div>
        <hr/>
        <div>
          humanStringFormat: 
          <pre className="qb-demo-pre">
            {humanQueryStr}
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
            && <pre className="qb-demo-error-pre">
              {stringify(sqlErrors, undefined, 2)}
            </pre> 
          }
          <pre className="qb-demo-pre">
            {sql}
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

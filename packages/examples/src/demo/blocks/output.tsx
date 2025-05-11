import React, { memo } from "react";
import {
  Utils, ImmutableTree, Config,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";

interface PropsForFormat {
  tree: ImmutableTree;
  config: Config;
}

const stringify = JSON.stringify;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const JsonLogicOutput = memo(({tree, config}: PropsForFormat) => {
  const {logic, data: logicData, errors: logicErrors} = Utils.jsonLogicFormat(tree, config);

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
});

const MongoOutput = memo(({tree, config}: PropsForFormat) => {
  const [mongo, mongoErrors] = Utils._mongodbFormat(tree, config);

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
});

const EsOutput = memo(({tree, config}: PropsForFormat) => {
  const elasticSearch = Utils.elasticSearchFormat(tree, config);

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
});

const TreeJsOutput = memo(({tree, config}: PropsForFormat) => {
  const treeJs = Utils.getTree(tree);

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
});

const SpelOutput = memo(({tree, config}: PropsForFormat) => {
  const [spel, spelErrors] = Utils._spelFormat(tree, config);

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
          {spel}
        </pre>
      </div>
      <hr/>
    </>
  );
});

const SqlOutput = memo(({tree, config}: PropsForFormat) => {
  const [sql, sqlErrors] = Utils._sqlFormat(tree, config);

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
          {sql}
        </pre>
      </div>
      <hr/>
    </>
  );
});

const StringsOutput = memo(({tree, config}: PropsForFormat) => {
  const queryStr = Utils.queryString(tree, config);
  const humanQueryStr = Utils.queryString(tree, config, true);

  return (
    <>
      <div>
        stringFormat: 
        <pre style={preStyle}>
          {queryStr}
        </pre>
      </div>
      <hr/>
      <div>
        humanStringFormat: 
        <pre style={preStyle}>
          {humanQueryStr}
        </pre>
      </div>
      <hr/>
    </>
  );
});

export const useOutput = (
  state: DemoQueryBuilderState,
) => {
  const {
    renderBocks,
    tree,
    config,
  } = state;

  const renderOutput = () => {
    return (
      <div>
        <hr/>
        {renderBocks.spel && <SpelOutput tree={tree} config={config} />}
        {renderBocks.strings && <StringsOutput tree={tree} config={config} />}
        {renderBocks.sql && <SqlOutput tree={tree} config={config} />}
        {renderBocks.jsonlogic && <JsonLogicOutput tree={tree} config={config} />}
        {renderBocks.mongo && <MongoOutput tree={tree} config={config} />}
        {renderBocks.elasticSearch && <EsOutput tree={tree} config={config} />}
        {renderBocks.jsTree && <TreeJsOutput tree={tree} config={config} />}
      </div>
    );
  };

  return {
    renderOutput,
  };
};

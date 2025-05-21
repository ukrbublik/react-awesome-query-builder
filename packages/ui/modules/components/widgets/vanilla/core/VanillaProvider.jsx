import React from "react";

const VanillaProvider = ({config, children}) => {
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = config.settings.compactMode;

  const base = (<div className={`${compactMode ? "qb-compact" : ""} qb-${themeMode}`}>{children}</div>);
  return base;
};

export { VanillaProvider };

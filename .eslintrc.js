module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "ignorePatterns": [
        "**/ts_out/*",
        "**/build/*",
        "**/scripts/*",
        "**/dist/*",
        "**/node_modules/*",
        "bundle.js",
        "*.bundle.js",
        "webpack.config.js",
        "vite.config.ts"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:import/recommended",
        // "plugin:import/typescript", // not needed for JS
        "plugin:react/recommended",
        // "plugin:@typescript-eslint/eslint-recommended", // not needed for JS
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "plugins": [
        "react",
        "babel",
        "import",
        "@typescript-eslint"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 11,
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module",
        "project": "tsconfig.json", // resolves dynamically for each package
    },
    "settings": {
        "react": {
            "version": "detect"
        },
        "import/extensions": [
            ".js", ".jsx",
            // ".ts", ".tsx"
        ],
        "import/parsers": {
            "@typescript-eslint/parser": [
                ".ts", ".tsx"
            ],
        },
        "import/resolver": {
            // order matters, so push "node" to end as fallback
            "typescript": {
                // "alwaysTryTypes": true,
               "project": "packages/*/tsconfig.json",
            },
            "node": true,
        },
        "import/core-modules": [
            // "@react-awesome-query-builder/ui/css/styles.scss",
            "react" // for import `react` in `core/modules/index.d.ts`
        ],
        "import/ignore": [
            /\.(scss|less|css)$/
        ],
        "import/internal-regex": /^@react-awesome-query-builder/
    },
    "rules": {
        "indent": [
            "error",
            2,
            {
            }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "operator-linebreak": [
            "warn",
            "before"
        ],
        "quotes": [
            "warn",
            "double",
            {
                "avoidEscape": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-tabs": [
            "error",
            {
                "allowIndentationTabs": false
            }
        ],
        "no-unused-vars": [
            //todo: set to warn
            "off", 
            {
                "args": "all", 
                "argsIgnorePattern": "^_", 
                "ignoreRestSiblings": true, 
                "caughtErrors": "none", 
                "varsIgnorePattern": "^_"
            }
        ],
        "react/display-name": [
            "off"
        ],
        "global-require": [
            "off"
        ],
        "react/prop-types": [
            //todo: set to warn
            "off", {}
        ],
        "prefer-const": [
            //todo: set to warn
            "off", {}
        ],
        "import/no-named-as-default-member": [
            "off", {}
        ]
    },
    "overrides": [
      {
        "files": ["packages/tests/**/*"],
        "env": {
            "mocha": true,
            "jasmine": true,
        },
        "settings": {
            "import/core-modules": [
                "sinon",
                "chai"
            ],
            // "import/resolver": {
            //     "webpack": {
            //         "config": "./webpack.config.js"
            //     }
            // },
        },
      },
      {
        "files": ["packages/sandbox_simple/**/*"],
        "parser": "@babel/eslint-parser",
        "parserOptions": {
            "requireConfigFile": false,
            "babelOptions": {
                "presets": [
                    "@babel/preset-env",
                    "@babel/preset-react"
                ],
            },
            "sourceType": "module",
        },
        "settings": {
            "import/core-modules": [
                "react",
                "@react-awesome-query-builder/ui/css/styles.css"
            ],
        },
      },

      {
        "files": ["**/*.ts", "**/*.tsx"],
        "extends": [
            "eslint:recommended",
            "plugin:import/recommended",
            "plugin:import/typescript",
            "plugin:react/recommended",
            "plugin:@typescript-eslint/eslint-recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking"
        ],
        "rules": {
            //todo
            "@typescript-eslint/no-unused-vars": 0,
            "@typescript-eslint/ban-types": 0,
            "@typescript-eslint/explicit-module-boundary-types": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-empty-interface": 0,
            "@typescript-eslint/unbound-method": 0,
            "@typescript-eslint/prefer-regexp-exec": 0,
            "@typescript-eslint/no-empty-function": 0,
            "@typescript-eslint/ban-ts-comment": 0,
            "@typescript-eslint/no-floating-promises": 0,
            "@typescript-eslint/no-non-null-assertion": 0,
        }
      },
    ],
}

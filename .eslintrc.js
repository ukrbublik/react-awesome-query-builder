module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true,
        "jest": true,
        "node": true
    },
    "ignorePatterns": [
        "**/ts_out/*",
        "**/build/*",
        "**/node_modules/*",
        "bundle.js",
        "webpack.config.js"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 11,
        "ecmaFeatures": {
            "legacyDecorators": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "babel",
        "import",
        "@typescript-eslint"
    ],
    "settings": {
        "react": {
            "version": "detect"
        },
        "import/resolver": {
            "webpack": {
                "config": "./webpack.config.js"
            }
        },
        "import/extensions": [
            ".js",
            ".jsx",
            ".ts",
            ".tsx"
        ],
        "import/parsers": {
            "@typescript-eslint/parser": [
                ".ts", 
                ".tsx"
            ]
        },
        "import/core-modules": [
            "react-awesome-query-builder/lib/css/styles.css"
        ]
    },
    "parser": "@typescript-eslint/parser",
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
        ]
    },
    "overrides": [
      {
        "files": ["**/*.ts", "**/*.tsx"],
        "extends": [
            "eslint:recommended",
            "plugin:import/recommended",
            "plugin:import/typescript",
            "plugin:react/recommended",
            "plugin:@typescript-eslint/recommended"
        ],
        "rules": {
            //todo
            "@typescript-eslint/no-unused-vars": 0,
            "@typescript-eslint/ban-types": 0,
            "@typescript-eslint/explicit-module-boundary-types": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-empty-interface": 0
        }
      },
    ],
}

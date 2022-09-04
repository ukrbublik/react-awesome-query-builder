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
            "@react-awesome-query-builder/core/css/styles.css"
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
        "files": ["packages/core/modules/**/*.ts", "packages/core/modules/**/*.tsx"],
        "parserOptions": {
          "project": 'tsconfig.json',
        },
      },
      {
        "files": ["packages/antd/**/*.ts", "packages/antd/**/*.tsx"],
        "parserOptions": {
          "project": 'tsconfig.json',
        },
      },
      {
        "files": ["packages/examples/**/*.ts", "packages/examples/**/*.tsx"],
        "parserOptions": {
          "project": 'tsconfig.json',
        },
      },
      {
        "files": ["packages/examples/**/*"],
        "settings": {
            "import/resolver": {
                "typescript": true,
                "webpack": {
                    "config": "./webpack.config.js"
                }
            },
        },
      },
      {
        "files": ["packages/sandbox/**/*.ts", "packages/sandbox/**/*.tsx"],
        "parserOptions": {
          "project": './tsconfig.json',
        },
        "settings": {
            "import/resolver": {
               "typescript": true
            },
        },
      },
      {
        "files": ["packages/tests/**/*.ts", "packages/tests/**/*.tsx"],
        "parserOptions": {
            "project": './tsconfig.json',
        },
      },
      {
        "files": ["packages/tests/**/*"],
        "settings": {
            "import/resolver": {
                "typescript": true,
                "webpack": {
                    "config": "./webpack.config.js"
                }
            },
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
            "@typescript-eslint/ban-ts-comment": 0
        }
      },
    ],
}

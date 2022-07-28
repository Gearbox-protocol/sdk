module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:import/recommended",
    "prettier"
  ],
  settings: {
    "import/resolver": {
      typescript: {},
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "./"]
      }
    },
    react: {
      version: "detect"
    }
  },
  rules: {
    "prettier/prettier": "error",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "@typescript-eslint/no-use-before-define": [
      "error",
      {
        functions: false,
        classes: false
      }
    ],
    "no-console": ["error", { allow: ["warn", "error", "debug"] }],
    "@typescript-eslint/default-param-last": ["warn"],

    "no-nested-ternary": ["warn"],
    "@typescript-eslint/no-unused-vars": ["warn"],
    "no-underscore-dangle": ["error", { allowAfterThis: true }],

    "react/no-unused-prop-types": ["off"], // switch on when necessary
    "max-classes-per-file": ["off"],
    "react/jsx-props-no-spreading": ["off"],
    "react/no-array-index-key": ["off"],
    "react/require-default-props": ["off"],
    "import/prefer-default-export": ["off"],
    "react/jsx-no-useless-fragment": ["off"]
  }
};

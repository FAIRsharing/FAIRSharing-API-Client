module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  "extends": [
    "eslint:recommended"
  ],
  rules: {
    'no-console': process.env.NODE_ENV === "production" ? "error" : "off",
    'no-debugger': process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint"
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)"
      ],
      env: {
        jest: true
      }
    }
  ]
};

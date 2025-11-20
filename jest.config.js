module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  transform: {
    "^.+\\.(js)$": [
      "babel-jest",
      { configFile: "./tests/babel.config.js" }
    ]
  }
};

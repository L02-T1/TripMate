module.exports = {
  preset: "jest-expo",
  coverageProvider: "v8",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // ✅ sửa ở đây

  moduleNameMapper: {
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo-router$": "<rootDir>/__mocks__/expo-router.js",
    "^expo/(.*)$": "<rootDir>/__mocks__/expo.js",
  },
};

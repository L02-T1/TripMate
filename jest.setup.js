// fix expo runtime
global.__ExpoImportMetaRegistry = {};

// 🔥 FIX structuredClone (QUAN TRỌNG)
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Icon",
}));

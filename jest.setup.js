import "@testing-library/jest-native/extend-expect";

// MOCK CSS INTEROP (QUAN TRỌNG)
jest.mock("react-native-css-interop", () => ({
  cssInterop: () => ({}),
  remapProps: () => ({}),
}));

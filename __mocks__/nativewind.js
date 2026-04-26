const React = require("react");

module.exports = {
  styled: (component) => component,
  useColorScheme: () => ({ colorScheme: "light" }),
  cssInterop: (component) => component,
};

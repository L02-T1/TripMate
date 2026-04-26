import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../app/tabs/home";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("HomeScreen", () => {
  test("renders home screen without crashing", () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId("home-screen")).toBeTruthy();
  });

  test("renders trip list", () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId("trip-list")).toBeTruthy();
  });

  test("renders both trip cards", () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId("trip-card-1")).toBeTruthy();
    expect(getByTestId("trip-card-2")).toBeTruthy();
  });

  test("renders add trip FAB button", () => {
    const { getByTestId } = render(<HomeScreen />);
    const fab = getByTestId("add-trip-button");
    expect(fab).toBeTruthy();
  });

  test("pressing add trip button does not crash", () => {
    const { getByTestId } = render(<HomeScreen />);
    const fab = getByTestId("add-trip-button");
    expect(() => fireEvent.press(fab)).not.toThrow();
  });

  test("search toggle button is rendered", () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId("search-toggle-button")).toBeTruthy();
  });

  test("pressing search button shows search input", () => {
    const { getByTestId } = render(<HomeScreen />);
    const searchToggle = getByTestId("search-toggle-button");
    fireEvent.press(searchToggle);
    expect(getByTestId("search-input")).toBeTruthy();
  });

  test("search input filters trips", () => {
    const { getByTestId, queryByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId("search-toggle-button"));
    const input = getByTestId("search-input");
    fireEvent.changeText(input, "Da Lat");
    expect(getByTestId("trip-card-1")).toBeTruthy();
    expect(queryByTestId("trip-card-2")).toBeNull();
  });

  test("empty state shown when no trips match search", () => {
    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId("search-toggle-button"));
    const input = getByTestId("search-input");
    fireEvent.changeText(input, "xxxxxxxx_no_match");
    expect(getByTestId("empty-state")).toBeTruthy();
  });
});

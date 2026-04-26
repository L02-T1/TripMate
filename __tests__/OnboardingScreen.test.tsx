import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import OnboardingScreen from "../app/onboarding";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("OnboardingScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  test("renders screen", () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId("onboarding-screen")).toBeTruthy();
  });

  test("renders flatlist", () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId("onboarding-flatlist")).toBeTruthy();
  });

  test("renders 4 dots", () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId("dot-0")).toBeTruthy();
    expect(getByTestId("dot-1")).toBeTruthy();
    expect(getByTestId("dot-2")).toBeTruthy();
    expect(getByTestId("dot-3")).toBeTruthy();
  });

  test("slides render correctly", () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId("onboarding-slide-1")).toBeTruthy();
    expect(getByTestId("onboarding-slide-2")).toBeTruthy();
  });

  test("skip works", () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText("Bỏ qua"));
    expect(mockReplace).toHaveBeenCalledWith("/tabs/home");
  });
});

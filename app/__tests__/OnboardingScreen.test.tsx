import { fireEvent, render } from "@testing-library/react-native";
import OnboardingScreen from "../components/OnboardingScreen";

describe("OnboardingScreen", () => {
  it("renders correctly", () => {
    render(<OnboardingScreen />);
  });

  it("shows text", () => {
    const { getByText } = render(<OnboardingScreen />);

    expect(getByText("Chào mừng đến TripMate")).toBeTruthy();
    expect(getByText("Tiếp tục")).toBeTruthy();
  });
  it("skip button works", () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText("Bỏ qua"));
  });
  it("should go to next slide when pressing continue", () => {
  const { getByText } = render(<OnboardingScreen />);

  const btn = getByText("Tiếp tục");
  fireEvent.press(btn);

  // Sau khi bấm, title phải đổi (slide 2)
  expect(getByText("Đi cùng bạn bè")).toBeTruthy();
});
it("should show 'Bắt đầu' at last slide", () => {
  const { getByText } = render(<OnboardingScreen />);

  // bấm 3 lần
  fireEvent.press(getByText("Tiếp tục"));
  fireEvent.press(getByText("Tiếp tục"));
  fireEvent.press(getByText("Tiếp tục"));

  expect(getByText("Bắt đầu")).toBeTruthy();
});
  it("does not crash", () => {
    render(<OnboardingScreen />);
  });
});

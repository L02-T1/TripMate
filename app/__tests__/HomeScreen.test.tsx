import { fireEvent, render } from "@testing-library/react-native";
import HomeScreen from "../components/HomeScreen";

describe("HomeScreen", () => {
  it("renders without crashing", () => {
    render(<HomeScreen />);
  });

  it("button press works", () => {
    const { getByTestId } = render(<HomeScreen />);

    const btn = getByTestId("fab-add-trip");
    fireEvent.press(btn);
  });
it("should render trip list", () => {
  const { getByText } = render(<HomeScreen />);

  expect(getByText("Đà Lạt Trip")).toBeTruthy();
  expect(getByText("Hạ Long Bay")).toBeTruthy();
});
it("should press a trip card", () => {
  const { getByText } = render(<HomeScreen />);

  const trip = getByText("Đà Lạt Trip");
  fireEvent.press(trip);

  expect(trip).toBeTruthy();
});
  it("does not crash", () => {
    render(<HomeScreen />);
  });
});

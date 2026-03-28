import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
export default function NotFoundScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center px-4">
      <Image
        source={require("@assets/images/react-logo.png")}
        alt="Not Found"
        className="mb-4 h-40 w-40 object-contain animate-spin"
      />
      <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Not Found
      </ThemedText>
      <ThemedText className="mt-2 text-gray-700 dark:text-gray-300">
        This screen could not be found. Try adding a new one?
      </ThemedText>
    </ThemedView>
  );
}

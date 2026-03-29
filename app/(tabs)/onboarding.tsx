import { useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const ONBOARDING_STEPS = [
  {
    title: "Template headline 01",
    description:
      "Replace this paragraph with your first onboarding message. Keep it concise and focused on one clear benefit.",
    accent: "#2A9D8F",
  },
  {
    title: "Template headline 02",
    description:
      "Use this space for your second message. Explain another key value and how users can get started quickly.",
    accent: "#E76F51",
  },
  {
    title: "Template headline 03",
    description:
      "Add your final onboarding message here. End with a clear call-to-action that leads into the app experience.",
    accent: "#264653",
  },
] as const;

export default function OnboardingScreenTemplate() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { width } = useWindowDimensions();

  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const completeOnboarding = React.useCallback(() => {
    // Route to the home page.
    router.replace("/home");
  }, [router]);

  const goToNextStep = React.useCallback(() => {
    if (isLastStep) {
      completeOnboarding();
      return;
    }

    setCurrentStepIndex((prev) =>
      Math.min(prev + 1, ONBOARDING_STEPS.length - 1),
    );
  }, [completeOnboarding, isLastStep]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 24,
          backgroundColor: palette.background,
        }}
      >
        <View
          style={{
            borderRadius: 28,
            borderCurve: "continuous",
            overflow: "hidden",
            minHeight: 320,
            padding: 24,
            justifyContent: "space-between",
            backgroundColor: colorScheme === "dark" ? "#1B1E1F" : "#F2F7F7",
            boxShadow:
              colorScheme === "dark"
                ? "0 4px 16px rgba(0, 0, 0, 0.35)"
                : "0 8px 24px rgba(17, 24, 28, 0.08)",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: width * 0.7,
              height: width * 0.7,
              borderRadius: 999,
              top: -width * 0.35,
              right: -width * 0.2,
              backgroundColor: currentStep.accent,
              opacity: 0.18,
            }}
          />

          <View style={{ gap: 14 }}>
            <Text
              selectable
              style={{
                color: palette.icon,
                fontSize: 13,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </Text>

            <Text
              selectable
              style={{
                color: palette.text,
                fontSize: 34,
                lineHeight: 40,
                fontWeight: "700",
                maxWidth: "90%",
              }}
            >
              {currentStep.title}
            </Text>

            <Text
              selectable
              style={{
                color: palette.icon,
                fontSize: 17,
                lineHeight: 26,
                maxWidth: "95%",
              }}
            >
              {currentStep.description}
            </Text>
          </View>

          <View
            style={{
              width: 124,
              height: 124,
              borderRadius: 32,
              borderCurve: "continuous",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: currentStep.accent,
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.18)",
            }}
          >
            <Text
              selectable
              style={{ color: "#FFFFFF", fontSize: 36, fontWeight: "800" }}
            >
              {currentStepIndex + 1}
            </Text>
          </View>
        </View>

        <View style={{ gap: 20 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {ONBOARDING_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;

              return (
                <View
                  key={step.title}
                  style={{
                    height: 8,
                    width: isActive ? 30 : 8,
                    borderRadius: 999,
                    backgroundColor: isActive
                      ? step.accent
                      : palette.tabIconDefault,
                    opacity: isActive ? 1 : 0.35,
                  }}
                />
              );
            })}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={completeOnboarding}
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: 16,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: palette.tabIconDefault,
              }}
            >
              <Text
                selectable
                style={{ color: palette.text, fontSize: 16, fontWeight: "600" }}
              >
                Skip
              </Text>
            </Pressable>

            <Pressable
              onPress={goToNextStep}
              style={{
                flex: 2,
                minHeight: 52,
                borderRadius: 16,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: currentStep.accent,
              }}
            >
              <Text
                selectable
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                {isLastStep ? "Get Started" : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

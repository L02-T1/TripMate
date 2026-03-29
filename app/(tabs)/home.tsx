import { Link } from "expo-router";
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

const HOME_STATS = [
  { label: "Metric A", value: "00" },
  { label: "Metric B", value: "00" },
  { label: "Metric C", value: "00" },
] as const;

const HOME_LIST_ITEMS = [
  "Template list item one",
  "Template list item two",
  "Template list item three",
] as const;

export default function HomeTemplateScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
        gap: 18,
        backgroundColor: palette.background,
      }}
    >
      <View
        style={{
          borderRadius: 28,
          borderCurve: "continuous",
          padding: 20,
          gap: 10,
          backgroundColor: colorScheme === "dark" ? "#1A1D1F" : "#F5F8FA",
          boxShadow:
            colorScheme === "dark"
              ? "0 8px 20px rgba(0, 0, 0, 0.35)"
              : "0 10px 24px rgba(17, 24, 28, 0.08)",
        }}
      >
        <Text
          selectable
          style={{
            color: palette.icon,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Home template
        </Text>
        <Text
          selectable
          style={{
            color: palette.text,
            fontSize: 32,
            lineHeight: 36,
            fontWeight: "700",
          }}
        >
          Replace with your main headline
        </Text>
        <Text
          selectable
          style={{
            color: palette.icon,
            fontSize: 16,
            lineHeight: 24,
            maxWidth: "95%",
          }}
        >
          Use this section for a short overview. Keep it focused on one clear
          outcome and one next action.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text
          selectable
          style={{
            color: palette.text,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Snapshot
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {HOME_STATS.map((stat) => (
            <View
              key={stat.label}
              style={{
                width: isCompact ? "100%" : "31%",
                minHeight: 88,
                borderRadius: 18,
                borderCurve: "continuous",
                padding: 14,
                justifyContent: "space-between",
                backgroundColor: colorScheme === "dark" ? "#202427" : "#FFFFFF",
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#2D353A" : "#E8EDF1",
              }}
            >
              <Text selectable style={{ color: palette.icon, fontSize: 13 }}>
                {stat.label}
              </Text>
              <Text
                selectable
                style={{
                  color: palette.text,
                  fontSize: 28,
                  lineHeight: 30,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text
          selectable
          style={{
            color: palette.text,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Quick actions
        </Text>
        <View style={{ flexDirection: isCompact ? "column" : "row", gap: 10 }}>
          <Link href="/(tabs)/home" asChild>
            <Pressable
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: 16,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: palette.tint,
              }}
            >
              <Text
                selectable
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
              >
                Primary action
              </Text>
            </Pressable>
          </Link>

          <Link href="/(tabs)/onboarding" asChild>
            <Pressable
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
                Secondary action
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text
          selectable
          style={{
            color: palette.text,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Recent items
        </Text>
        {HOME_LIST_ITEMS.map((item) => (
          <View
            key={item}
            style={{
              borderRadius: 14,
              borderCurve: "continuous",
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: colorScheme === "dark" ? "#1C2023" : "#FFFFFF",
              borderWidth: 1,
              borderColor: colorScheme === "dark" ? "#2B3338" : "#E9EEF3",
            }}
          >
            <Text
              selectable
              style={{ color: palette.text, fontSize: 15, lineHeight: 22 }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

import React from "react";
import { Image, Text, View, StyleSheet } from "react-native";

export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
}

export default function OnboardingSlide({
  item,
  width,
  height,
}: {
  item: OnboardingItem;
  width: number;
  height: number;
}) {
  return (
    <View style={[styles.container, { width }]} testID={`onboarding-slide-${item.id}`}>

      {/* IMAGE */}
      <Image
        source={{ uri: item.image }}
        style={[styles.image, { width, height: height * 0.55 }]}
        resizeMode="cover"
      />

      {/* BADGE */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>{item.badge}</Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  image: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  badgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badge: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  content: {
    paddingTop: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0a7ea4",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
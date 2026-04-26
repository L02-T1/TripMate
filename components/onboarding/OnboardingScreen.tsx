import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ViewToken,
} from "react-native";

import OnboardingSlide, { OnboardingItem } from "./OnboardingSlide";

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Chào mừng đến với TripMate!",
    description: "Lên kế hoạch du lịch và quản lý chi phí đang chờ nhóm bạn",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    badge: "Bắt đầu",
  },
  {
    id: "2",
    title: "Mời bạn bè tham gia chuyến đi",
    description: "Thêm đồng hành bạn bè vào chuyến đi",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
    badge: "Bạn bè",
  },
  {
    id: "3",
    title: "Ghi chép chi phí",
    description: "Theo dõi mọi khoản chi tiêu",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    badge: "Chi phí",
  },
  {
    id: "4",
    title: "Lập kế hoạch nhanh",
    description: "Quản lý lịch trình dễ dàng",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
    badge: "Kế hoạch",
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToOffset({
        offset: next * width,
        animated: true,
      });
      setCurrentIndex(next);
    } else {
      router.replace("/tabs/home");
    }
  };

  const handleSkip = () => {
    router.replace("/tabs/home");
  };

  const isLast = currentIndex === onboardingData.length - 1;

  return (
    <View style={styles.container} testID="onboarding-screen">
      {/* SKIP */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      {/* SLIDES */}
      <FlatList
        testID="onboarding-flatlist"
        ref={flatListRef}
        data={onboardingData}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <OnboardingSlide item={item} width={width} height={height} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.dots} testID="dots-container">
          {onboardingData.map((_, i) => (
            <View
              key={i}
              testID={`dot-${i}`}
              style={[styles.dot, i === currentIndex && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={{ color: "white", fontWeight: "700" }}>
            {isLast ? "Bắt đầu" : "Tiếp tục"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },

  footer: {
    padding: 24,
    alignItems: "center",
    gap: 20,
  },

  dots: {
    flexDirection: "row",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
  },

  activeDot: {
    width: 24,
    backgroundColor: "#0a7ea4",
  },

  button: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 30,
  },
});

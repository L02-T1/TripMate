import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Chào mừng đến TripMate",
    desc: "Quản lý chuyến đi và chi phí dễ dàng",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
  {
    title: "Đi cùng bạn bè",
    desc: "Thêm thành viên và chia tiền minh bạch",
    img: "https://images.unsplash.com/photo-1539635278303-d4002c07dee3",
  },
  {
    title: "Theo dõi chi phí",
    desc: "Tự động tính toán chi tiêu",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
  },
  {
    title: "Sẵn sàng khám phá",
    desc: "Bắt đầu hành trình ngay hôm nay",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={{ uri: SLIDES[index].img }} style={styles.image} />

      <SafeAreaView style={styles.overlay}>
        <Pressable onPress={() => router.replace("/(tabs)/HomeScreen")}>
          <Text style={styles.skip}>Bỏ qua</Text>
        </Pressable>
      </SafeAreaView>

      <View style={styles.content}>
        <Text style={styles.title}>{SLIDES[index].title}</Text>
        <Text style={styles.desc}>{SLIDES[index].desc}</Text>

        {/* DOT */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, index === i && styles.active]} />
          ))}
        </View>

        <Pressable
          onPress={() =>
            index === 3
              ? router.replace("/(tabs)/HomeScreen")
              : setIndex(index + 1)
          }
          style={styles.button}
        >
          <Text style={styles.btnText}>
            {index === 3 ? "Bắt đầu" : "Tiếp tục"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  image: { height: height * 0.6 },

  overlay: {
    position: "absolute",
    top: 40,
    right: 20,
  },

  skip: { color: "#fff", fontWeight: "600" },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },

  desc: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 10,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },

  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#E2E8F0",
    margin: 4,
    borderRadius: 3,
  },

  active: {
    width: 20,
    backgroundColor: "#3B82F6",
  },

  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "700" },
});

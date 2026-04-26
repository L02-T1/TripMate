import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TRIPS = [
  {
    id: 1,
    name: "Đà Lạt Trip",
    date: "15 - 20/04/2026",
    members: 5,
    cost: "3.850.000",
    progress: 0.65,
    img: "https://images.unsplash.com/photo-1580982327559-c1202864eb05?q=80&w=400",
  },
  {
    id: 2,
    name: "Hạ Long Bay",
    date: "01 - 03/05/2026",
    members: 4,
    cost: "2.100.000",
    progress: 0.3,
    img: "https://images.unsplash.com/photo-1552423126-ef8c5040d297?q=80&w=400",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng ☀️";
  if (hour < 18) return "Chào buổi chiều 🌤";
  return "Chào buổi tối 🌙";
};

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>{getGreeting()}</Text>
          <Text style={styles.title}>TripMate</Text>
        </View>

        <Pressable style={styles.profileBtn}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Chuyến đi của bạn</Text>

        {TRIPS.map((trip) => (
          <Pressable
            key={trip.id}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <Image source={{ uri: trip.img }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{trip.name}</Text>

              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.meta}>{trip.date}</Text>

                <Ionicons
                  name="people-outline"
                  size={14}
                  color="#64748B"
                  style={{ marginLeft: 10 }}
                />
                <Text style={styles.meta}>{trip.members} người</Text>
              </View>

              <Text style={styles.cost}>
                Tổng:{" "}
                <Text style={{ color: "#3B82F6", fontWeight: "700" }}>
                  {trip.cost}đ
                </Text>
              </Text>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${trip.progress * 100}%` },
                  ]}
                />
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </Pressable>
        ))}
      </ScrollView>

      {/* FAB */}
      <Pressable
        testID="fab-add-trip"
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.9 }] },
        ]}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },

  welcome: { color: "#64748B", fontSize: 13 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#334155",
  },

  avatar: { width: 45, height: 45, borderRadius: 22 },

  profileBtn: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 25,
    padding: 2,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  image: { width: 85, height: 85, borderRadius: 18 },

  info: { flex: 1, marginLeft: 14 },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },

  meta: { fontSize: 12, color: "#64748B", marginLeft: 4 },

  cost: { marginTop: 6, fontSize: 14 },

  progressBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginTop: 10,
  },

  progressFill: {
    height: 6,
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});

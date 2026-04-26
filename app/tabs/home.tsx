import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalCost: string;
  status: "UPCOMING" | "DONE" | "ONGOING";
  image: string;
  members: string[];
}

const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Da Lat Summer 2025",
    startDate: "28/06/2026",
    endDate: "04/07/2026",
    totalCost: "10.800.000 đ",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    members: ["A", "B", "+3"],
  },
  {
    id: "2",
    name: "Phu Quoc Tour",
    startDate: "10/07/2025",
    endDate: "13/07/2025",
    totalCost: "14.300.000 đ",
    status: "DONE",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    members: ["A", "B", "+3"],
  },
];

const statusColor: Record<Trip["status"], string> = {
  UPCOMING: "#f59e0b",
  DONE: "#10b981",
  ONGOING: "#3b82f6",
};

const statusLabel: Record<Trip["status"], string> = {
  UPCOMING: "UPCOMMING",
  DONE: "DONE",
  ONGOING: "ONGOING",
};

function TripCard({ trip }: { trip: Trip }) {
  return (
    <TouchableOpacity
      style={styles.card}
      testID={`trip-card-${trip.id}`}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: trip.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor[trip.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusLabel[trip.status]}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{trip.name}</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.dateText}>
            {trip.startDate} - {trip.endDate}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.memberAvatars}>
            {trip.members.map((m, i) => (
              <View key={i} style={styles.avatar}>
                <Text style={styles.avatarText}>{m}</Text>
              </View>
            ))}
          </View>
          <View style={styles.costBlock}>
            <Text style={styles.totalLabel}>TOTAL COST</Text>
            <Text style={styles.costText}>{trip.totalCost}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = mockTrips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container} testID="home-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person-circle-outline" size={36} color="#0a7ea4" />
          </View>
          <Text style={styles.headerTitle}>Your journey</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          testID="search-toggle-button"
        >
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm chuyến đi..."
            value={search}
            onChangeText={setSearch}
            testID="search-input"
          />
        </View>
      )}

      {/* Trip List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty} testID="empty-state">
            <Ionicons name="airplane-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có chuyến đi nào</Text>
          </View>
        }
        testID="trip-list"
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} testID="add-trip-button">
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f4f8",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  memberAvatars: {
    flexDirection: "row",
    gap: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  costBlock: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 10,
    color: "#0a7ea4",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  costText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a7ea4",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0a7ea4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0a7ea4",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

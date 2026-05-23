import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList, Image, RefreshControl, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { computeTripStatus, daysUntil, fmtVND } from '../../utils/helpers';
import { Trip } from '../../types';

const STATUS_CONFIG = {
  UPCOMING: { label: 'UPCOMING', color: '#F59E0B', bg: '#FEF3C7' },
  ONGOING:  { label: 'ĐANG ĐI',  color: '#3B82F6', bg: '#EFF6FF' },
  DONE:     { label: 'HOÀN THÀNH', color: '#10B981', bg: '#ECFDF5' },
};

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const status = computeTripStatus(trip.startDate, trip.endDate);
  const cfg = STATUS_CONFIG[status];
  const total = trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const days = daysUntil(trip.startDate);
  const checkDone = trip.checklist?.filter(c => c.completed).length || 0;
  const checkTotal = trip.checklist?.length || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: trip.image || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        {status === 'UPCOMING' && days > 0 && (
          <View style={styles.countdownBadge}>
            <Ionicons name="time-outline" size={11} color="#fff" />
            <Text style={styles.countdownText}>{days} ngày nữa</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{trip.name}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.metaText}>{trip.startDate} – {trip.endDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={styles.metaText} numberOfLines={1}>
              {trip.destinations?.join(', ') || 'Chưa xác định'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {/* Members */}
          <View style={styles.avatarsRow}>
            {trip.members?.slice(0, 4).map((m, i) => (
              <View key={m.id} style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }]}>
                <Text style={styles.avatarText}>{m.initials?.[0] || '?'}</Text>
              </View>
            ))}
            {(trip.members?.length || 0) > 4 && (
              <View style={[styles.avatar, styles.avatarMore, { marginLeft: -8 }]}>
                <Text style={styles.avatarText}>+{trip.members!.length - 4}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            {checkTotal > 0 && (
              <View style={styles.statChip}>
                <Ionicons name="checkmark-circle-outline" size={12} color="#10B981" />
                <Text style={styles.statChipText}>{checkDone}/{checkTotal}</Text>
              </View>
            )}
            <View style={styles.costChip}>
              <Text style={styles.costLabel}>TỔNG</Text>
              <Text style={styles.costValue}>{fmtVND(total)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const router = useRouter();
  const { trips, user, refreshTrips, isOnline } = useApp();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<'all' | 'UPCOMING' | 'ONGOING' | 'DONE'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTrips();
    setRefreshing(false);
  };

  const filtered = trips
    .map(t => ({ ...t, status: computeTripStatus(t.startDate, t.endDate) }))
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.destinations?.some(d => d.toLowerCase().includes(search.toLowerCase()));
      const matchFilter = filter === 'all' || t.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      // Ongoing first, then upcoming, then done
      const order = { ONGOING: 0, UPCOMING: 1, DONE: 2 };
      return order[a.status] - order[b.status];
    });

  const counts = {
    all: trips.length,
    UPCOMING: trips.filter(t => computeTripStatus(t.startDate, t.endDate) === 'UPCOMING').length,
    ONGOING: trips.filter(t => computeTripStatus(t.startDate, t.endDate) === 'ONGOING').length,
    DONE: trips.filter(t => computeTripStatus(t.startDate, t.endDate) === 'DONE').length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/profile/index')} style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Xin chào 👋</Text>
            <Text style={styles.headerTitle}>{user?.username || 'Bạn'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.iconBtn}>
          <Ionicons name={showSearch ? 'close' : 'search-outline'} size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm chuyến đi, điểm đến..."
            placeholderTextColor="#C0C8D0"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterBar}>
        {([
          { key: 'all', label: `Tất cả (${counts.all})` },
          { key: 'ONGOING', label: `Đang đi (${counts.ONGOING})` },
          { key: 'UPCOMING', label: `Sắp tới (${counts.UPCOMING})` },
          { key: 'DONE', label: `Đã xong (${counts.DONE})` },
        ] as const).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Offline banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#92400E" />
          <Text style={styles.offlineText}>Đang xem dữ liệu offline · Kết nối internet để đồng bộ</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B4F8A" />}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => router.push(`/trip/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="airplane-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Không tìm thấy chuyến đi' : 'Chưa có chuyến đi nào'}
            </Text>
            <Text style={styles.emptySub}>
              {search ? 'Thử tìm với từ khóa khác' : 'Nhấn nút + để tạo chuyến đi đầu tiên'}
            </Text>
            {!search && (
              <TouchableOpacity style={styles.emptyCreateBtn} onPress={() => router.push('/trip/create')}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyCreateText}>Tạo chuyến đi</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/trip/create')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  greeting: { fontSize: 12, color: '#9CA3AF' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', gap: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#1B4F8A' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#1B4F8A', fontWeight: '700' },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#FDE68A' },
  offlineText: { fontSize: 12, color: '#92400E' },
  listContent: { padding: 16, gap: 14, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 170 },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  countdownBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countdownText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  cardBody: { padding: 14, gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
  cardMeta: { gap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#6B7280', flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  avatarsRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarMore: { backgroundColor: '#6B7280' },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statChipText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  costChip: { alignItems: 'flex-end' },
  costLabel: { fontSize: 9, color: '#1B4F8A', fontWeight: '700', letterSpacing: 0.5 },
  costValue: { fontSize: 14, fontWeight: '800', color: '#1B4F8A' },
  fab: { position: 'absolute', bottom: 80, right: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center', shadowColor: '#1B4F8A', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  emptyCreateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1B4F8A', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  emptyCreateText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

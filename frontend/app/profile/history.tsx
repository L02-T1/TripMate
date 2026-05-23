import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList, Image, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { computeTripStatus, fmtVND } from '../../utils/helpers';
import { Trip } from '../../types';

const STATUS_CONFIG = {
  UPCOMING: { label: 'Sắp tới', color: '#F59E0B', bg: '#FEF3C7' },
  ONGOING:  { label: 'Đang đi', color: '#3B82F6', bg: '#EFF6FF' },
  DONE:     { label: 'Hoàn thành', color: '#10B981', bg: '#ECFDF5' },
};

type SortKey = 'newest' | 'oldest' | 'cost_high' | 'cost_low';

export default function TripHistoryScreen() {
  const router = useRouter();
  const { trips } = useApp();
  const [sort, setSort] = useState<SortKey>('newest');
  const [showSort, setShowSort] = useState(false);

  const doneTripsList = trips.filter(t => computeTripStatus(t.startDate, t.endDate) === 'DONE');

  const stats = useMemo(() => {
    const totalCost = doneTripsList.reduce((s, t) => s + t.expenses.reduce((ss, e) => ss + e.amount, 0), 0);
    const totalDays = doneTripsList.reduce((s, t) => {
      const [d1, m1, y1] = t.startDate.split('/').map(Number);
      const [d2, m2, y2] = t.endDate.split('/').map(Number);
      const start = new Date(y1, m1 - 1, d1);
      const end = new Date(y2, m2 - 1, d2);
      return s + Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    }, 0);
    const allDests = new Set(doneTripsList.flatMap(t => t.destinations));
    return { count: doneTripsList.length, totalCost, totalDays, destinations: allDests.size };
  }, [doneTripsList]);

  const sortedTrips = useMemo(() => {
    const list = [...doneTripsList];
    switch (sort) {
      case 'newest': return list.sort((a, b) => b.startDate.split('/').reverse().join('').localeCompare(a.startDate.split('/').reverse().join('')));
      case 'oldest': return list.sort((a, b) => a.startDate.split('/').reverse().join('').localeCompare(b.startDate.split('/').reverse().join('')));
      case 'cost_high': return list.sort((a, b) => b.expenses.reduce((s, e) => s + e.amount, 0) - a.expenses.reduce((s, e) => s + e.amount, 0));
      case 'cost_low':  return list.sort((a, b) => a.expenses.reduce((s, e) => s + e.amount, 0) - b.expenses.reduce((s, e) => s + e.amount, 0));
      default: return list;
    }
  }, [doneTripsList, sort]);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'newest', label: 'Mới nhất trước' },
    { key: 'oldest', label: 'Cũ nhất trước' },
    { key: 'cost_high', label: 'Chi phí cao nhất' },
    { key: 'cost_low', label: 'Chi phí thấp nhất' },
  ];

  const renderTrip = ({ item }: { item: Trip }) => {
    const total = item.expenses.reduce((s, e) => s + e.amount, 0);
    const [d1, m1, y1] = item.startDate.split('/').map(Number);
    const [d2, m2, y2] = item.endDate.split('/').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/trip/${item.id}`)}
        activeOpacity={0.86}
      >
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80' }}
          style={styles.cardImg}
          resizeMode="cover"
        />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG.DONE.bg }]}>
              <Text style={[styles.statusText, { color: STATUS_CONFIG.DONE.color }]}>
                {STATUS_CONFIG.DONE.label}
              </Text>
            </View>
          </View>

          <View style={styles.destRow}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
            <Text style={styles.destText} numberOfLines={1}>
              {item.destinations?.join(', ') || 'Chưa xác định'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="calendar-outline" size={12} color="#6B7280" />
              <Text style={styles.metaChipText}>{item.startDate}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.metaChipText}>{days} ngày</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={12} color="#6B7280" />
              <Text style={styles.metaChipText}>{item.members.length} người</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.costLabel}>Tổng chi</Text>
            <Text style={styles.costValue}>{fmtVND(total)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử chuyến đi</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={sortedTrips}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{stats.count}</Text>
                <Text style={styles.statLabel}>Chuyến đi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{stats.destinations}</Text>
                <Text style={styles.statLabel}>Địa điểm</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{stats.totalDays}</Text>
                <Text style={styles.statLabel}>Ngày đi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal} numberOfLines={1}>
                  {stats.totalCost >= 1000000
                    ? `${(stats.totalCost / 1000000).toFixed(1)}M`
                    : `${(stats.totalCost / 1000).toFixed(0)}k`}
                </Text>
                <Text style={styles.statLabel}>Chi phí</Text>
              </View>
            </View>

            {/* Sort bar */}
            <View style={styles.sortBar}>
              <Text style={styles.resultCount}>{stats.count} chuyến đã hoàn thành</Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setShowSort(!showSort)}
              >
                <Ionicons name="funnel-outline" size={14} color="#1B4F8A" />
                <Text style={styles.sortBtnText}>
                  {SORT_OPTIONS.find(s => s.key === sort)?.label}
                </Text>
                <Ionicons name={showSort ? 'chevron-up' : 'chevron-down'} size={14} color="#1B4F8A" />
              </TouchableOpacity>
            </View>

            {/* Sort dropdown */}
            {showSort && (
              <View style={styles.sortDropdown}>
                {SORT_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.key}
                    style={[styles.sortOption, sort === o.key && styles.sortOptionActive]}
                    onPress={() => { setSort(o.key); setShowSort(false); }}
                  >
                    {sort === o.key && <Ionicons name="checkmark" size={14} color="#1B4F8A" />}
                    <Text style={[styles.sortOptionText, sort === o.key && { color: '#1B4F8A', fontWeight: '700' }]}>
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="airplane-outline" size={44} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có chuyến đi nào hoàn thành</Text>
            <Text style={styles.emptySub}>Các chuyến đi đã hoàn thành sẽ hiển thị tại đây</Text>
            <TouchableOpacity style={styles.goBtn} onPress={() => router.replace('/(tabs)/trips')}>
              <Text style={styles.goBtnText}>Xem chuyến đi</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={renderTrip}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  list: { paddingBottom: 40 },
  statsStrip: {
    flexDirection: 'row', backgroundColor: '#1B4F8A', padding: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: '#93C5FD', fontWeight: '500' },
  sortBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  resultCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  sortBtnText: { fontSize: 12, color: '#1B4F8A', fontWeight: '600' },
  sortDropdown: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
    borderWidth: 1, borderColor: '#F3F4F6', marginTop: 4, overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  sortOptionActive: { backgroundColor: '#EFF6FF' },
  sortOptionText: { fontSize: 14, color: '#374151' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardImg: { width: '100%', height: 140 },
  cardBody: { padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardName: { flex: 1, fontSize: 16, fontWeight: '800', color: '#111' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  destText: { fontSize: 12, color: '#6B7280', flex: 1 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F7FA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  metaChipText: { fontSize: 11, color: '#6B7280' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  costLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  costValue: { fontSize: 15, fontWeight: '800', color: '#1B4F8A' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 10 },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
  goBtn: { marginTop: 8, backgroundColor: '#1B4F8A', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  goBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

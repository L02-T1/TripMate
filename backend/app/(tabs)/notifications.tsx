import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { computeTripStatus, daysUntil } from '../../utils/helpers';

interface Notification {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  tripId?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { trips } = useApp();

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    trips.forEach(trip => {
      const status = computeTripStatus(trip.startDate, trip.endDate);
      const days = daysUntil(trip.startDate);

      // Upcoming countdown
      if (status === 'UPCOMING' && days > 0 && days <= 7) {
        items.push({
          id: `countdown-${trip.id}`,
          icon: 'airplane',
          iconColor: '#1B4F8A',
          iconBg: '#EFF6FF',
          title: `${days} ngày nữa khởi hành!`,
          desc: trip.name,
          time: `Còn ${days} ngày`,
          tripId: trip.id,
        });
      }

      // Ongoing trip
      if (status === 'ONGOING') {
        items.push({
          id: `ongoing-${trip.id}`,
          icon: 'navigate',
          iconColor: '#3B82F6',
          iconBg: '#EFF6FF',
          title: 'Chuyến đi đang diễn ra',
          desc: `${trip.name} · Hãy cập nhật chi phí!`,
          time: 'Hôm nay',
          tripId: trip.id,
        });
      }

      // Uncompleted checklist
      const pending = trip.checklist?.filter(c => !c.completed).length || 0;
      if (pending > 0 && status === 'UPCOMING' && days <= 14) {
        items.push({
          id: `checklist-${trip.id}`,
          icon: 'checkbox-outline',
          iconColor: '#F59E0B',
          iconBg: '#FFFBEB',
          title: `Còn ${pending} việc chưa hoàn thành`,
          desc: trip.name,
          time: days > 0 ? `${days} ngày nữa đi` : 'Đang đi',
          tripId: trip.id,
        });
      }

      // Unsettled expenses
      const totalExp = trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
      if (totalExp > 0 && status === 'DONE') {
        items.push({
          id: `expense-${trip.id}`,
          icon: 'cash',
          iconColor: '#10B981',
          iconBg: '#ECFDF5',
          title: 'Chuyến đi đã kết thúc',
          desc: `${trip.name} · Kiểm tra quyết toán chi phí`,
          time: 'Cần thanh toán',
          tripId: trip.id,
        });
      }

      // Members recently added
      if ((trip.members?.length || 0) > 2) {
        items.push({
          id: `members-${trip.id}`,
          icon: 'people',
          iconColor: '#8B5CF6',
          iconBg: '#F5F3FF',
          title: `${trip.members!.length} thành viên tham gia`,
          desc: trip.name,
          time: 'Nhóm đầy đủ',
          tripId: trip.id,
        });
      }
    });

    // Sort: ONGOING first
    return items.sort((a, b) => {
      if (a.id.startsWith('ongoing')) return -1;
      if (b.id.startsWith('ongoing')) return 1;
      if (a.id.startsWith('countdown')) return -1;
      if (b.id.startsWith('countdown')) return 1;
      return 0;
    }).slice(0, 20);
  }, [trips]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptySub}>Tạo hoặc tham gia chuyến đi để nhận thông báo</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => item.tripId && router.push(`/trip/${item.tripId}`)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc} numberOfLines={1}>{item.desc}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#E5E7EB" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  badge: { backgroundColor: '#1B4F8A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  iconWrap: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  itemDesc: { fontSize: 13, color: '#6B7280' },
  itemTime: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#6B7280' },
  emptySub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});

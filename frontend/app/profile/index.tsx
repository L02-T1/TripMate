import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const MenuItem = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#6B7280'} />
      <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, trips, signOut } = useApp();

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/sign-in' as any); } },
    ]);
  };

  // Real stats from context
  const totalTrips = trips.length;
  const uniqueFriends = new Set(
    trips.flatMap(t => t.members.filter(m => m.phone !== user?.phone).map(m => m.phone))
  ).size;
  const totalCost = trips.reduce((s, t) => s + t.expenses.reduce((ss, e) => ss + e.amount, 0), 0);
  const costDisplay = totalCost >= 1_000_000
    ? `${(totalCost / 1_000_000).toFixed(1)}M đ`
    : totalCost >= 1_000 ? `${(totalCost / 1_000).toFixed(0)}k đ` : `${totalCost} đ`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/trips')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings/index' as any)} style={styles.backBtn}>
          <Ionicons name="settings-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrap} onPress={() => router.push('/profile/setup')}>
            <View style={styles.avatarBig}>
              <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={11} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.username || 'Người dùng'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalTrips}</Text>
            <Text style={styles.statLabel}>Chuyến đi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{uniqueFriends}</Text>
            <Text style={styles.statLabel}>Bạn bè</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal} numberOfLines={1}>{costDisplay}</Text>
            <Text style={styles.statLabel}>Tổng chi</Text>
          </View>
        </View>

        {/* Info chips */}
        <View style={styles.infoRow}>
          {user?.location && (
            <View style={styles.infoChip}>
              <Ionicons name="location-outline" size={13} color="#6B7280" />
              <Text style={styles.infoChipText}>{user.location}</Text>
            </View>
          )}
          {user?.job && (
            <View style={styles.infoChip}>
              <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
              <Text style={styles.infoChipText}>{user.job}</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Thông tin cá nhân" onPress={() => router.push('/profile/setup')} />
          <View style={styles.divider} />
          <MenuItem icon="qr-code-outline" label="QR & Số tài khoản ngân hàng" onPress={() => router.push('/profile/qr')} />
          <View style={styles.divider} />
          <MenuItem icon="time-outline" label="Lịch sử chuyến đi" onPress={() => router.push('/profile/history')} />
          <View style={styles.divider} />
          <MenuItem icon="settings-outline" label="Cài đặt" onPress={() => router.push('/settings/index' as any)} />
          <View style={styles.divider} />
          <MenuItem icon="log-out-outline" label="Đăng xuất" onPress={handleSignOut} danger />
        </View>
      </ScrollView>
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
  avatarSection: { alignItems: 'center', paddingVertical: 28, backgroundColor: '#fff', gap: 8 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatarBig: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#1B4F8A',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#1B4F8A', width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 22, fontWeight: '800', color: '#111' },
  email: { fontSize: 14, color: '#6B7280' },
  bio: { fontSize: 13, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40, lineHeight: 18 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', marginTop: 1,
    paddingVertical: 16, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: '#F3F4F6' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  infoRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', marginTop: 1,
  },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  infoChipText: { fontSize: 12, color: '#6B7280' },
  menuCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuLabel: { fontSize: 15, color: '#111', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 54 },
});
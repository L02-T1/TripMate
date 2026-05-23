import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function ProfileTab() {
  const router = useRouter();
  const { user, signOut } = useApp();

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/sign-in'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings/index')}>
          <Ionicons name="settings-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarArea}>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigText}>{user?.username ? user.username[0].toUpperCase() : 'U'}</Text>
        </View>
        <Text style={styles.nameText}>{user?.username || 'Người dùng'}</Text>
        <Text style={styles.emailText}>{user?.email || ''}</Text>
      </View>

      <View style={styles.card}>
        <MenuItem icon="person-outline" label="Thông tin cá nhân" onPress={() => router.push('/profile/setup')} />
        <View style={styles.divider} />
        <MenuItem icon="qr-code-outline" label="QR & Số tài khoản ngân hàng" onPress={() => router.push('/profile/qr')} />
        <View style={styles.divider} />
        <MenuItem icon="time-outline" label="Lịch sử chuyến đi" onPress={() => router.push('/(tabs)/trips')} />
        <View style={styles.divider} />
        <MenuItem icon="settings-outline" label="Cài đặt" onPress={() => router.push('/settings/index')} />
        <View style={styles.divider} />
        <MenuItem icon="log-out-outline" label="Đăng xuất" onPress={handleSignOut} danger />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  settingsBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  avatarArea: { alignItems: 'center', paddingVertical: 28, backgroundColor: '#fff', marginBottom: 16 },
  avatarBig: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#1B4F8A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  avatarBigText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  nameText: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  emailText: { fontSize: 14, color: '#6B7280' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuLabel: { fontSize: 15, color: '#111', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 54 },
});

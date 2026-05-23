import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const SettingRow = ({ icon, label, value, onPress, danger, right }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
    <View style={styles.rowLeft}>
      <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#6B7280'} />
      <View>
        <Text style={[styles.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
    </View>
    {right || <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, signOut } = useApp();
  const [darkMode, setDarkMode] = React.useState(user?.darkMode || false);

  const handleDeleteAccount = () => {
    Alert.alert('Xoá tài khoản', 'Bạn có chắc muốn xoá tài khoản? Hành động này không thể hoàn tác.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/sign-in'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* User info */}
      <View style={styles.userCard}>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigText}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{user?.username || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>
      </View>

      {/* General */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GENERAL</Text>
        <View style={styles.card}>
          <SettingRow icon="language-outline" label="Language" value={user?.language || 'Tiếng Việt'} onPress={() => router.push('/settings/language')} />
          <View style={styles.divider} />
          <SettingRow icon="cash-outline" label="Currency" value={user?.currency || 'VND — Vietnamese Đồng'} onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="location-outline" label="Default location" value={user?.defaultLocation || 'Đồng Hoa, Hồ Chí Minh'} onPress={() => {}} />
        </View>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="moon-outline" size={20} color="#6B7280" />
              <Text style={styles.rowLabel}>Dark mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={v => { setDarkMode(v); updateUser({ darkMode: v }); }}
              trackColor={{ false: '#E5E7EB', true: '#1B4F8A' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <SettingRow icon="calendar-outline" label="Trip date format" value={user?.dateFormat || 'DD/MM/YYYY'} onPress={() => {}} />
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SECURITY</Text>
        <View style={styles.card}>
          <SettingRow icon="lock-closed-outline" label="Change password" onPress={() => router.push('/settings/password')} />
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
        <Text style={styles.deleteBtnText}>Delete account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatarBig: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center' },
  avatarBigText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  userName: { fontSize: 17, fontWeight: '700', color: '#111' },
  userEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowLabel: { fontSize: 15, color: '#111', fontWeight: '500' },
  rowValue: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 50 },
  deleteBtn: { marginHorizontal: 16, marginTop: 28, backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#FECACA' },
  deleteBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});

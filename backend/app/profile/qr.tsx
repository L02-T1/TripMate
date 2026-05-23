import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, Clipboard, ScrollView, Share, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

// Simple QR placeholder rendered with squares
function QRPlaceholder({ value }: { value: string }) {
  // Generate deterministic pattern from value string
  const hash = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const SIZE = 9;
  const pattern = Array.from({ length: SIZE * SIZE }, (_, i) => {
    const r = Math.floor(i / SIZE), c = i % SIZE;
    // fixed corner markers
    if ((r < 3 && c < 3) || (r < 3 && c >= SIZE - 3) || (r >= SIZE - 3 && c < 3)) return true;
    return ((hash * (i + 1) * 7919) % 100) > 45;
  });

  return (
    <View style={qrStyles.wrap}>
      {/* Bank logos area */}
      <View style={qrStyles.bankLogos}>
        <View style={qrStyles.bankLogoBox}><Text style={qrStyles.bankLogoText}>VIETOR</Text></View>
        <View style={[qrStyles.bankLogoBox, { backgroundColor: '#1652F0' }]}><Text style={qrStyles.bankLogoText}>MB</Text></View>
      </View>
      {/* QR grid */}
      <View style={qrStyles.grid}>
        {Array.from({ length: SIZE }, (_, r) => (
          <View key={r} style={qrStyles.row}>
            {Array.from({ length: SIZE }, (_, c) => (
              <View
                key={c}
                style={[
                  qrStyles.cell,
                  pattern[r * SIZE + c] ? qrStyles.cellBlack : qrStyles.cellWhite,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={qrStyles.ownerLabel}>OWNER</Text>
      <Text style={qrStyles.ownerName}>{value}</Text>
    </View>
  );
}

const qrStyles = StyleSheet.create({
  wrap: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 10, borderWidth: 1.5, borderColor: '#E5E7EB' },
  bankLogos: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  bankLogoBox: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  bankLogoText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  grid: { gap: 2 },
  row: { flexDirection: 'row', gap: 2 },
  cell: { width: 20, height: 20, borderRadius: 2 },
  cellBlack: { backgroundColor: '#111' },
  cellWhite: { backgroundColor: '#fff' },
  ownerLabel: { fontSize: 10, color: '#9CA3AF', letterSpacing: 1, fontWeight: '600' },
  ownerName: { fontSize: 14, fontWeight: '800', color: '#111', letterSpacing: 0.5 },
});

export default function QRScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [bankName, setBankName] = useState(user?.bankName || 'MB Bank');
  const [bankAccount, setBankAccount] = useState(user?.bankAccount || '0532 3241 5642');

  const handleSave = () => {
    updateUser({ bankName, bankAccount });
    setEditing(false);
    Alert.alert('Đã lưu', 'Thông tin ngân hàng đã được cập nhật');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `TripMate QR - ${user?.username}\nNgân hàng: ${bankName}\nSố TK: ${bankAccount}`,
        title: 'Chia sẻ thông tin ngân hàng',
      });
    } catch {}
  };

  const handleCopy = () => {
    Clipboard.setString(bankAccount.replace(/\s/g, ''));
    Alert.alert('Đã sao chép', 'Số tài khoản đã được sao chép');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>QR & Số tài khoản</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.backBtn}>
          <Ionicons name={editing ? 'close' : 'pencil'} size={20} color="#1B4F8A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* QR Code */}
        <QRPlaceholder value={(user?.username || 'NGUYEN VU QUANG MINH').toUpperCase()} />

        {/* Bank info card */}
        <View style={styles.bankCard}>
          <View style={styles.bankRow}>
            <View style={styles.bankIcon}>
              <Ionicons name="business-outline" size={20} color="#1B4F8A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankLabel}>BANK</Text>
              {editing ? (
                <TextInput
                  style={styles.bankInput}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Tên ngân hàng"
                />
              ) : (
                <Text style={styles.bankName}>{bankName}</Text>
              )}
            </View>
          </View>
          <View style={styles.bankDivider} />
          <View style={styles.bankRow}>
            <View style={styles.bankIcon}>
              <Ionicons name="card-outline" size={20} color="#1B4F8A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankLabel}>ACCOUNT NUMBER</Text>
              {editing ? (
                <TextInput
                  style={styles.bankInput}
                  value={bankAccount}
                  onChangeText={setBankAccount}
                  placeholder="Số tài khoản"
                  keyboardType="numbers-and-punctuation"
                />
              ) : (
                <Text style={styles.bankAccNum}>{bankAccount}</Text>
              )}
            </View>
            {!editing && (
              <TouchableOpacity onPress={handleCopy}>
                <Ionicons name="copy-outline" size={20} color="#1B4F8A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {editing ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Lưu thông tin</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleShare}>
              <Ionicons name="cloud-download-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Lưu QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#1B4F8A" />
              <Text style={styles.secondaryBtnText}>Chia sẻ QR</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Tip */}
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={16} color="#3B82F6" />
          <Text style={styles.tipText}>
            Bạn bè trong chuyến đi có thể quét QR hoặc sao chép số tài khoản để chuyển tiền cho bạn.
          </Text>
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
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  bankCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  bankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  bankIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  bankLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  bankName: { fontSize: 16, fontWeight: '600', color: '#111' },
  bankAccNum: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: 1 },
  bankInput: { fontSize: 16, color: '#111', borderBottomWidth: 1.5, borderBottomColor: '#1B4F8A', paddingVertical: 4, marginRight: 8 },
  bankDivider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1B4F8A', borderRadius: 14, paddingVertical: 16,
    shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: '#1B4F8A', borderRadius: 14, paddingVertical: 15,
  },
  secondaryBtnText: { color: '#1B4F8A', fontSize: 16, fontWeight: '700' },
  tipBox: {
    flexDirection: 'row', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'flex-start',
  },
  tipText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
});

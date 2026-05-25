import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform, ScrollView, Share, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

// ─── VietQR generator ─────────────────────────────────────────────────────────
// VietQR spec: https://vietqr.io/danh-sach-api/generate-qr/
// Dùng API public của VietQR để tạo QR thật từ số tài khoản + mã ngân hàng

const VIETQR_BASE = 'https://img.vietqr.io/image';

// Danh sách ngân hàng phổ biến VN + bankCode (BIN)
const BANKS = [
  { name: 'MB Bank',         code: 'MB',       bin: '970422', color: '#9B1C1C' },
  { name: 'Vietcombank',     code: 'VCB',      bin: '970436', color: '#006B3D' },
  { name: 'Vietinbank',      code: 'VTB',      bin: '970415', color: '#E31E24' },
  { name: 'BIDV',            code: 'BIDV',     bin: '970418', color: '#005BAA' },
  { name: 'Agribank',        code: 'AGR',      bin: '970405', color: '#009B3A' },
  { name: 'Techcombank',     code: 'TCB',      bin: '970407', color: '#E31837' },
  { name: 'ACB',             code: 'ACB',      bin: '970416', color: '#1B4FBF' },
  { name: 'VPBank',          code: 'VPB',      bin: '970432', color: '#1CAB36' },
  { name: 'TPBank',          code: 'TPB',      bin: '970423', color: '#7B2D8B' },
  { name: 'Sacombank',       code: 'STB',      bin: '970403', color: '#1A6BB5' },
  { name: 'HDBank',          code: 'HDB',      bin: '970437', color: '#FF6B00' },
  { name: 'VIB',             code: 'VIB',      bin: '970441', color: '#1B4FBF' },
  { name: 'SHB',             code: 'SHB',      bin: '970443', color: '#C8161D' },
  { name: 'OCB',             code: 'OCB',      bin: '970448', color: '#0066B3' },
  { name: 'Timo / Bản Việt', code: 'VCCB',     bin: '970454', color: '#FF6600' },
  { name: 'ZaloPay (ZVN)',   code: 'ZALOPAY',  bin: '546034', color: '#0068FF' },
  { name: 'MoMo',            code: 'MOMO',     bin: '970408', color: '#A50064' },
];

function getVietQRUrl(bin: string, accountNo: string, accountName: string, amount?: number) {
  const cleanAccNo = accountNo.replace(/\s/g, '');
  const cleanName  = encodeURIComponent(accountName || 'Nguyen Van A');
  const amtPart    = amount && amount > 0 ? `&amount=${amount}` : '';
  return `${VIETQR_BASE}/${bin}-${cleanAccNo}-compact2.jpg?accountName=${cleanName}${amtPart}&addInfo=TripMate`;
}

// ─── Bank picker modal ────────────────────────────────────────────────────────
function BankPicker({ visible, onSelect, onClose }: {
  visible: boolean;
  onSelect: (bank: typeof BANKS[0]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = BANKS.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );
  if (!visible) return null;
  return (
    <View style={bp.overlay}>
      <View style={bp.sheet}>
        <View style={bp.header}>
          <Text style={bp.title}>Chọn ngân hàng</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={bp.searchWrap}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput style={bp.searchInput} placeholder="Tìm ngân hàng..." placeholderTextColor="#C0C8D0"
            value={search} onChangeText={setSearch} autoFocus />
        </View>
        <ScrollView style={{ maxHeight: 380 }}>
          {filtered.map(b => (
            <TouchableOpacity key={b.code} style={bp.bankRow} onPress={() => { onSelect(b); onClose(); }}>
              <View style={[bp.bankBadge, { backgroundColor: b.color }]}>
                <Text style={bp.bankBadgeText}>{b.code}</Text>
              </View>
              <Text style={bp.bankName}>{b.name}</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const bp = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', zIndex: 100 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, backgroundColor: '#F9FAFB' },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  bankBadge: { width: 52, paddingVertical: 5, borderRadius: 8, alignItems: 'center' },
  bankBadgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  bankName: { flex: 1, fontSize: 14, color: '#111', fontWeight: '500' },
});

// ─── QR Image using VietQR API ────────────────────────────────────────────────
function VietQRImage({ bin, accountNo, accountName }: { bin: string; accountNo: string; accountName: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  const url = getVietQRUrl(bin, accountNo, accountName);

  if (Platform.OS === 'web') {
    // On web, use <img> tag directly
    return (
      <View style={qr.wrap}>
        {!loaded && !error && (
          <View style={qr.loading}>
            <Ionicons name="qr-code-outline" size={60} color="#D1D5DB" />
            <Text style={qr.loadingText}>Đang tạo mã QR...</Text>
          </View>
        )}
        {error && (
          <View style={qr.loading}>
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', marginTop: 6 }}>
              Không tải được QR.{'\n'}Kiểm tra số tài khoản và ngân hàng.
            </Text>
          </View>
        )}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore web-only img tag */}
        <img
          src={url}
          alt="VietQR"
          style={{ width: 200, height: 200, display: loaded && !error ? 'block' : 'none', borderRadius: 12 }}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(false); }}
        />
      </View>
    );
  }

  // Native: use Image component
  const { Image } = require('react-native');
  return (
    <View style={qr.wrap}>
      {!loaded && !error && (
        <View style={[qr.loading, { position: 'absolute' }]}>
          <Ionicons name="qr-code-outline" size={60} color="#D1D5DB" />
          <Text style={qr.loadingText}>Đang tạo mã QR...</Text>
        </View>
      )}
      {error ? (
        <View style={qr.loading}>
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
          <Text style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', marginTop: 6 }}>
            Không tải được QR.{'\n'}Kiểm tra số tài khoản.
          </Text>
        </View>
      ) : (
        <Image source={{ uri: url }} style={qr.img}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)} />
      )}
    </View>
  );
}

const qr = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', width: 220, height: 220 },
  img: { width: 200, height: 200, borderRadius: 12 },
  loading: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200 },
  loadingText: { fontSize: 12, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function QRScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();

  const defaultBank = BANKS.find(b => b.name === (user as any)?.bankName) || BANKS[0];

  const [editing, setEditing]         = useState(false);
  const [showPicker, setShowPicker]   = useState(false);
  const [selectedBank, setSelectedBank] = useState(defaultBank);
  const [accountNo, setAccountNo]     = useState((user as any)?.bankAccount || '');
  const [accountName, setAccountName] = useState((user as any)?.bankAccountName || user?.username || '');
  const [qrKey, setQrKey]             = useState(0); // force re-render QR

  const hasValidInfo = accountNo.trim().length >= 6;

  const handleSave = async () => {
    await updateUser({
      bankName: selectedBank.name,
      bankAccount: accountNo,
      bankAccountName: accountName,
    } as any);
    setEditing(false);
    setQrKey(k => k + 1);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(accountNo.replace(/\s/g, ''));
    if (Platform.OS === 'web') {
      window.alert('Đã sao chép số tài khoản!');
    }
  };

  const handleShare = async () => {
    const msg = `💳 Thông tin chuyển khoản TripMate\n👤 ${accountName}\n🏦 ${selectedBank.name}\n🔢 ${accountNo}`;
    try { await Share.share({ message: msg }); } catch {}
  };

  return (
    <SafeAreaView style={s.safe}>
      <BankPicker visible={showPicker} onClose={() => setShowPicker(false)}
        onSelect={b => { setSelectedBank(b); setQrKey(k => k + 1); }} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/trips' as any)} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>QR & Tài khoản ngân hàng</Text>
        <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} style={s.iconBtn}>
          <Text style={{ color: '#1B4F8A', fontWeight: '700', fontSize: 15 }}>
            {editing ? 'Lưu' : 'Sửa'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* QR Card */}
        <View style={s.qrCard}>
          <View style={[s.qrBankBadge, { backgroundColor: selectedBank.color }]}>
            <Text style={s.qrBankCode}>{selectedBank.code}</Text>
          </View>
          <Text style={s.qrBankName}>{selectedBank.name}</Text>

          {hasValidInfo ? (
            <VietQRImage key={qrKey} bin={selectedBank.bin} accountNo={accountNo} accountName={accountName} />
          ) : (
            <View style={s.qrEmpty}>
              <Ionicons name="qr-code-outline" size={64} color="#D1D5DB" />
              <Text style={s.qrEmptyText}>Nhập số tài khoản để tạo mã QR thật</Text>
            </View>
          )}

          {hasValidInfo && (
            <Text style={s.qrNote}>Quét bằng app ngân hàng bất kỳ để chuyển tiền</Text>
          )}
        </View>

        {/* Bank info form */}
        <View style={s.formCard}>
          {/* Bank selector */}
          <TouchableOpacity style={s.fieldRow} onPress={() => editing && setShowPicker(true)} disabled={!editing}>
            <View style={[s.fieldIcon, { backgroundColor: selectedBank.color + '18' }]}>
              <Ionicons name="business-outline" size={18} color={selectedBank.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>NGÂN HÀNG</Text>
              <Text style={s.fieldValue}>{selectedBank.name}</Text>
            </View>
            {editing && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
          </TouchableOpacity>

          <View style={s.divider} />

          {/* Account number */}
          <View style={s.fieldRow}>
            <View style={s.fieldIcon}>
              <Ionicons name="card-outline" size={18} color="#1B4F8A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>SỐ TÀI KHOẢN</Text>
              {editing ? (
                <TextInput style={s.fieldInput} value={accountNo} onChangeText={setAccountNo}
                  placeholder="VD: 0532324156" placeholderTextColor="#C0C8D0" keyboardType="numeric" />
              ) : (
                <Text style={s.fieldValue}>{accountNo || '—'}</Text>
              )}
            </View>
            {!editing && accountNo ? (
              <TouchableOpacity onPress={handleCopy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="copy-outline" size={20} color="#1B4F8A" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={s.divider} />

          {/* Account name */}
          <View style={s.fieldRow}>
            <View style={s.fieldIcon}>
              <Ionicons name="person-outline" size={18} color="#1B4F8A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>CHỦ TÀI KHOẢN</Text>
              {editing ? (
                <TextInput style={s.fieldInput} value={accountName} onChangeText={setAccountName}
                  placeholder="NGUYEN VAN A" placeholderTextColor="#C0C8D0" autoCapitalize="characters" />
              ) : (
                <Text style={s.fieldValue}>{accountName || '—'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Info box */}
        <View style={s.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
          <Text style={s.infoText}>
            Mã QR được tạo theo chuẩn <Text style={{ fontWeight: '700' }}>VietQR</Text> — quét được bởi tất cả ứng dụng ngân hàng Việt Nam.
          </Text>
        </View>

        {/* Buttons */}
        {!editing && hasValidInfo && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={s.primaryBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={s.primaryBtnText}>Chia sẻ QR & Số tài khoản</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: '#111' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  qrCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  qrBankBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 },
  qrBankCode: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  qrBankName: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  qrEmpty: { width: 200, height: 180, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  qrEmptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 20, lineHeight: 18 },
  qrNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  fieldIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  fieldLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  fieldValue: { fontSize: 16, fontWeight: '600', color: '#111' },
  fieldInput: { fontSize: 16, color: '#111', borderBottomWidth: 1.5, borderBottomColor: '#1B4F8A', paddingVertical: 4 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1B4F8A', borderRadius: 14, paddingVertical: 16, shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const FORMATS = [
  {
    format: 'DD/MM/YYYY',
    example: '25/12/2025',
    label: 'Ngày / Tháng / Năm',
    desc: 'Phổ biến ở Việt Nam và châu Âu',
  },
  {
    format: 'MM/DD/YYYY',
    example: '12/25/2025',
    label: 'Tháng / Ngày / Năm',
    desc: 'Phổ biến ở Hoa Kỳ',
  },
  {
    format: 'YYYY/MM/DD',
    example: '2025/12/25',
    label: 'Năm / Tháng / Ngày',
    desc: 'Tiêu chuẩn ISO 8601, phổ biến ở Nhật Bản & Hàn Quốc',
  },
  {
    format: 'DD-MM-YYYY',
    example: '25-12-2025',
    label: 'Ngày - Tháng - Năm',
    desc: 'Dấu gạch ngang, kiểu châu Âu',
  },
  {
    format: 'YYYY-MM-DD',
    example: '2025-12-25',
    label: 'Năm - Tháng - Ngày',
    desc: 'ISO 8601 thuần, dùng trong hệ thống kỹ thuật',
  },
  {
    format: 'D MMM YYYY',
    example: '25 Dec 2025',
    label: 'Ngày Tháng(viết tắt) Năm',
    desc: 'Dễ đọc, thân thiện',
  },
];

const SEPARATORS = ['/', '-', '.'];

export default function DateFormatScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();
  const current = user?.dateFormat || 'DD/MM/YYYY';

  const handleSelect = (format: string) => {
    updateUser({ dateFormat: format });
    router.back();
  };

  // Live preview of today's date in each format
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = String(today.getFullYear());
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mmm = months[today.getMonth()];
  const d = String(today.getDate());

  const renderPreview = (format: string) => {
    switch (format) {
      case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`;
      case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`;
      case 'YYYY/MM/DD': return `${yyyy}/${mm}/${dd}`;
      case 'DD-MM-YYYY': return `${dd}-${mm}-${yyyy}`;
      case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`;
      case 'D MMM YYYY': return `${d} ${mmm} ${yyyy}`;
      default: return format;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Định dạng ngày</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#1B4F8A" />
          <Text style={styles.infoText}>
            Định dạng này sẽ được áp dụng cho tất cả các ngày trong ứng dụng
          </Text>
        </View>

        <Text style={styles.sectionLabel}>CHỌN ĐỊNH DẠNG</Text>

        <View style={styles.card}>
          {FORMATS.map((item, index) => {
            const selected = item.format === current;
            const isLast = index === FORMATS.length - 1;
            return (
              <React.Fragment key={item.format}>
                <TouchableOpacity
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => handleSelect(item.format)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.previewBox, selected && styles.previewBoxActive]}>
                      <Text style={[styles.previewText, selected && styles.previewTextActive]}>
                        {renderPreview(item.format)}
                      </Text>
                    </View>
                    <View style={styles.labelBlock}>
                      <Text style={[styles.formatLabel, selected && { color: '#1B4F8A' }]}>
                        {item.format}
                      </Text>
                      <Text style={styles.formatDesc} numberOfLines={1}>{item.desc}</Text>
                    </View>
                  </View>
                  {selected
                    ? <Ionicons name="checkmark-circle" size={22} color="#1B4F8A" />
                    : <View style={styles.radio} />
                  }
                </TouchableOpacity>
                {!isLast && <View style={styles.separator} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* Today preview */}
        <View style={styles.todayPreview}>
          <Text style={styles.todayLabel}>Hôm nay hiển thị là:</Text>
          <Text style={styles.todayValue}>{renderPreview(current)}</Text>
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
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF', padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 19 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8,
    marginBottom: 8, marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowSelected: { backgroundColor: '#EFF6FF' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  previewBox: {
    backgroundColor: '#F5F7FA', paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 8, minWidth: 96, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  previewBoxActive: { backgroundColor: '#EFF6FF', borderColor: '#1B4F8A' },
  previewText: { fontSize: 12, fontWeight: '700', color: '#6B7280', fontVariant: ['tabular-nums'] },
  previewTextActive: { color: '#1B4F8A' },
  labelBlock: { flex: 1 },
  formatLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  formatDesc: { fontSize: 11, color: '#9CA3AF' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#D1D5DB',
  },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16 },
  todayPreview: {
    marginTop: 20, backgroundColor: '#fff', borderRadius: 14, padding: 18,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  todayLabel: { fontSize: 13, color: '#6B7280' },
  todayValue: { fontSize: 22, fontWeight: '800', color: '#1B4F8A', fontVariant: ['tabular-nums'] },
});

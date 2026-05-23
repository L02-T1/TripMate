import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SectionList, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const CURRENCIES = [
  // Popular
  { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', flag: '🇻🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
];

const POPULAR = ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'THB', 'SGD'];
const OTHERS = CURRENCIES.filter(c => !POPULAR.includes(c.code));
const POPULAR_LIST = CURRENCIES.filter(c => POPULAR.includes(c.code));

export default function CurrencyScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();
  const [search, setSearch] = useState('');

  const currentCode = user?.currency?.split(' — ')[0] || 'VND';

  const filtered = search.length > 0
    ? CURRENCIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const sections = filtered
    ? [{ title: `Kết quả (${filtered.length})`, data: filtered }]
    : [
        { title: 'Phổ biến', data: POPULAR_LIST },
        { title: 'Tất cả', data: OTHERS },
      ];

  const handleSelect = (c: typeof CURRENCIES[0]) => {
    updateUser({ currency: `${c.code} — ${c.name}` });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn vị tiền tệ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tiền tệ..."
          placeholderTextColor="#C0C8D0"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.code}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const selected = item.code === currentCode;
          return (
            <TouchableOpacity
              style={[
                styles.row,
                isFirst && styles.rowFirst,
                isLast && styles.rowLast,
                selected && styles.rowSelected,
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <View style={styles.rowMid}>
                <Text style={[styles.rowCode, selected && { color: '#1B4F8A' }]}>{item.code}</Text>
                <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.symbol, selected && { color: '#1B4F8A' }]}>{item.symbol}</Text>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color="#1B4F8A" style={{ marginLeft: 8 }} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8,
    marginTop: 18, marginBottom: 6, marginLeft: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  rowSelected: { backgroundColor: '#EFF6FF' },
  flag: { fontSize: 26 },
  rowMid: { flex: 1 },
  rowCode: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  rowName: { fontSize: 12, color: '#6B7280' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  symbol: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 62 },
});

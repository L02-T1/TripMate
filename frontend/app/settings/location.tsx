import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const POPULAR_CITIES = [
  { name: 'TP. Hồ Chí Minh', region: 'Việt Nam', icon: 'business-outline' },
  { name: 'Hà Nội', region: 'Việt Nam', icon: 'business-outline' },
  { name: 'Đà Nẵng', region: 'Việt Nam', icon: 'business-outline' },
  { name: 'Đà Lạt', region: 'Lâm Đồng', icon: 'leaf-outline' },
  { name: 'Phú Quốc', region: 'Kiên Giang', icon: 'sunny-outline' },
  { name: 'Hội An', region: 'Quảng Nam', icon: 'home-outline' },
  { name: 'Nha Trang', region: 'Khánh Hòa', icon: 'water-outline' },
  { name: 'Huế', region: 'Thừa Thiên Huế', icon: 'school-outline' },
  { name: 'Hạ Long', region: 'Quảng Ninh', icon: 'boat-outline' },
  { name: 'Mũi Né', region: 'Bình Thuận', icon: 'partly-sunny-outline' },
  { name: 'Vũng Tàu', region: 'Bà Rịa', icon: 'waves-outline' },
  { name: 'Sapa', region: 'Lào Cai', icon: 'snow-outline' },
];

export default function DefaultLocationScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();
  const [input, setInput] = useState(user?.defaultLocation || '');

  const current = user?.defaultLocation || '';

  const filtered = input.length > 1
    ? POPULAR_CITIES.filter(c =>
        c.name.toLowerCase().includes(input.toLowerCase()) ||
        c.region.toLowerCase().includes(input.toLowerCase())
      )
    : POPULAR_CITIES;

  const handleSave = () => {
    const val = input.trim();
    if (val) {
      updateUser({ defaultLocation: val });
      router.back();
    }
  };

  const handleSelect = (city: typeof POPULAR_CITIES[0]) => {
    updateUser({ defaultLocation: city.name });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Địa điểm mặc định</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={!input.trim()}>
          <Text style={[styles.saveBtnText, !input.trim() && { color: '#C0C8D0' }]}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>THÀNH PHỐ / ĐỊA ĐIỂM</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={18} color="#1B4F8A" />
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập địa điểm của bạn..."
            placeholderTextColor="#C0C8D0"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={() => setInput('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        {current ? (
          <View style={styles.currentRow}>
            <Ionicons name="navigate" size={12} color="#6B7280" />
            <Text style={styles.currentText}>Hiện tại: {current}</Text>
          </View>
        ) : null}
      </View>

      {/* City list */}
      <Text style={styles.sectionLabel}>
        {input.length > 1 ? `Kết quả (${filtered.length})` : 'Địa điểm phổ biến'}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={c => c.name}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={36} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không tìm thấy địa điểm</Text>
            <Text style={styles.emptySubText}>Nhấn "Lưu" để dùng tên bạn đã nhập</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const selected = item.name === current;
          const isFirst = index === 0;
          const isLast = index === filtered.length - 1;
          return (
            <TouchableOpacity
              style={[
                styles.cityRow,
                isFirst && styles.rowFirst,
                isLast && styles.rowLast,
                selected && styles.rowSelected,
              ]}
              onPress={() => handleSelect(item)}
            >
              <View style={[styles.cityIconWrap, selected && { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name={item.icon as any} size={18} color={selected ? '#1B4F8A' : '#9CA3AF'} />
              </View>
              <View style={styles.cityMid}>
                <Text style={[styles.cityName, selected && { color: '#1B4F8A' }]}>{item.name}</Text>
                <Text style={styles.cityRegion}>{item.region}</Text>
              </View>
              {selected && <Ionicons name="checkmark-circle" size={20} color="#1B4F8A" />}
            </TouchableOpacity>
          );
        }}
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
  saveBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#1B4F8A' },
  inputSection: { backgroundColor: '#fff', padding: 16, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F7FA', paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  textInput: { flex: 1, fontSize: 16, color: '#111' },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  currentText: { fontSize: 12, color: '#6B7280' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 62 },
  cityRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 13, gap: 12,
  },
  rowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  rowSelected: { backgroundColor: '#EFF6FF' },
  cityIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center',
  },
  cityMid: { flex: 1 },
  cityName: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 2 },
  cityRegion: { fontSize: 12, color: '#9CA3AF' },
  empty: { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },
});

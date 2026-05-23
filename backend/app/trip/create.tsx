import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const SUGGESTED_DESTINATIONS = ['Đà Lạt', 'Phú Quốc', 'Hội An', 'Huế', 'Sa Pa', 'Hà Nội', 'Nha Trang', 'Đà Nẵng', 'Hạ Long', 'Mũi Né'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Cơ bản', 'Điểm đến', 'Thành viên'];
  return (
    <View style={styles.stepWrap}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, i < current - 1 ? styles.stepDone : i === current - 1 ? styles.stepActive : styles.stepInactive]}>
              {i < current - 1
                ? <Ionicons name="checkmark" size={14} color="#fff" />
                : <Text style={[styles.stepNum, i === current - 1 ? { color: '#fff' } : { color: '#9CA3AF' }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, i === current - 1 && { color: '#1B4F8A', fontWeight: '700' }]}>{labels[i]}</Text>
          </View>
          {i < total - 1 && <View style={[styles.stepLine, i < current - 1 ? styles.stepLineDone : {}]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const formatDate = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateInputWrap}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <TextInput
          style={styles.dateInput}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#C0C8D0"
          value={value}
          onChangeText={v => onChange(formatDate(v))}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
    </View>
  );
}

export default function CreateTripScreen() {
  const router = useRouter();
  const { createTrip } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<any>(null);

  const [basic, setBasic] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destInput, setDestInput] = useState('');
  const [memberPhones, setMemberPhones] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState('');

  const handleNext = async () => {
    if (step === 1) {
      if (!basic.name.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên chuyến đi'); return; }
      if (!basic.startDate || basic.startDate.length < 10) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập ngày bắt đầu đúng định dạng DD/MM/YYYY'); return; }
      if (!basic.endDate || basic.endDate.length < 10) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập ngày kết thúc'); return; }
      setStep(2);
    } else if (step === 2) {
      if (destinations.length === 0) { Alert.alert('Thiếu điểm đến', 'Vui lòng chọn ít nhất 1 điểm đến'); return; }
      setStep(3);
    } else {
      setLoading(true);
      try {
        const trip = await createTrip({ ...basic, destinations, memberPhones });
        setCreatedTrip(trip);
        setSuccess(true);
      } catch { Alert.alert('Lỗi', 'Không thể tạo chuyến đi. Thử lại sau.'); }
      finally { setLoading(false); }
    }
  };

  const addDest = (d: string) => {
    const trimmed = d.trim();
    if (!trimmed || destinations.includes(trimmed)) return;
    setDestinations(prev => [...prev, trimmed]);
    setDestInput('');
  };
  const removeDest = (d: string) => setDestinations(prev => prev.filter(x => x !== d));
  const toggleDest = (d: string) => destinations.includes(d) ? removeDest(d) : addDest(d);

  const addPhone = () => {
    const p = phoneInput.trim();
    if (!p) return;
    if (memberPhones.includes(p)) { Alert.alert('', 'Số điện thoại đã được thêm'); return; }
    setMemberPhones(prev => [...prev, p]);
    setPhoneInput('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} style={styles.iconBtn}>
          <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo chuyến đi</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepIndicator current={step} total={3} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* STEP 1: Basic info */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Tên chuyến đi *</Text>
              <TextInput style={styles.input} placeholder="Da Lat Summer 2025" placeholderTextColor="#C0C8D0"
                value={basic.name} onChangeText={v => setBasic(p => ({ ...p, name: v }))} />

              <View style={styles.row}>
                <DateInput label="Ngày bắt đầu" value={basic.startDate} onChange={v => setBasic(p => ({ ...p, startDate: v }))} />
                <View style={{ width: 12 }} />
                <DateInput label="Ngày kết thúc" value={basic.endDate} onChange={v => setBasic(p => ({ ...p, endDate: v }))} />
              </View>

              <Text style={styles.label}>Mô tả (tùy chọn)</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Chuyến đi hè với những người bạn thân..."
                placeholderTextColor="#C0C8D0" value={basic.description}
                onChangeText={v => setBasic(p => ({ ...p, description: v }))} multiline numberOfLines={3} />
            </View>
          )}

          {/* STEP 2: Destinations */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Tìm điểm đến</Text>
              <View style={styles.searchRow}>
                <View style={styles.searchInputWrap}>
                  <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                  <TextInput style={styles.searchInput} placeholder="Tìm tên địa điểm..."
                    placeholderTextColor="#C0C8D0" value={destInput}
                    onChangeText={setDestInput}
                    onSubmitEditing={() => addDest(destInput)}
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => addDest(destInput)}>
                  <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {destinations.length > 0 && (
                <View style={styles.selectedSection}>
                  <Text style={styles.subLabel}>Đã chọn ({destinations.length})</Text>
                  {destinations.map(d => (
                    <View key={d} style={styles.selectedChip}>
                      <Ionicons name="location" size={16} color="#1B4F8A" />
                      <Text style={styles.selectedChipText}>{d}</Text>
                      <TouchableOpacity onPress={() => removeDest(d)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.subLabel}>Gợi ý phổ biến</Text>
              <View style={styles.suggestGrid}>
                {SUGGESTED_DESTINATIONS.map(d => (
                  <TouchableOpacity key={d}
                    style={[styles.suggestChip, destinations.includes(d) && styles.suggestChipActive]}
                    onPress={() => toggleDest(d)}>
                    {destinations.includes(d) && <Ionicons name="checkmark" size={12} color="#1B4F8A" />}
                    <Text style={[styles.suggestText, destinations.includes(d) && styles.suggestTextActive]}>📍 {d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* STEP 3: Members */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Thêm thành viên qua số điện thoại</Text>
              <View style={styles.searchRow}>
                <View style={styles.searchInputWrap}>
                  <Ionicons name="call-outline" size={16} color="#9CA3AF" />
                  <TextInput style={styles.searchInput} placeholder="0912 345 678"
                    placeholderTextColor="#C0C8D0" value={phoneInput}
                    onChangeText={setPhoneInput} keyboardType="phone-pad"
                    onSubmitEditing={addPhone} returnKeyType="done"
                  />
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={addPhone}>
                  <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {memberPhones.length > 0 ? (
                <View style={styles.membersList}>
                  <Text style={styles.subLabel}>Danh sách mời ({memberPhones.length} người)</Text>
                  {memberPhones.map((p, i) => (
                    <View key={p} style={styles.memberRow}>
                      <View style={styles.memberAv}>
                        <Text style={styles.memberAvText}>{String.fromCharCode(65 + i)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberPhone}>{p}</Text>
                        <Text style={styles.memberRole}>Thành viên</Text>
                      </View>
                      <TouchableOpacity onPress={() => setMemberPhones(prev => prev.filter(x => x !== p))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyMembers}>
                  <Ionicons name="people-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.emptyMembersText}>Bạn có thể thêm thành viên sau khi tạo chuyến đi</Text>
                </View>
              )}

              <View style={styles.inviteBox}>
                <Ionicons name="link-outline" size={18} color="#1B4F8A" />
                <Text style={styles.inviteText} numberOfLines={1}>tripmate.app/invite/abc123</Text>
                <TouchableOpacity style={styles.copyBtn}>
                  <Text style={styles.copyBtnText}>Sao chép</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        {step === 3 && (
          <TouchableOpacity style={styles.skipBtn} onPress={async () => {
            setLoading(true);
            const trip = await createTrip({ ...basic, destinations, memberPhones: [] });
            setCreatedTrip(trip); setLoading(false); setSuccess(true);
          }}>
            <Text style={styles.skipBtnText}>Bỏ qua, tạo ngay</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.nextBtn, loading && { opacity: 0.6 }]} onPress={handleNext} disabled={loading}>
          {loading
            ? <Text style={styles.nextBtnText}>Đang tạo...</Text>
            : <>
                <Text style={styles.nextBtnText}>{step < 3 ? 'Tiếp tục' : 'Tạo chuyến đi'}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
          }
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={success} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Tạo thành công! 🎉</Text>
            <Text style={styles.successDesc}>
              Chuyến đi <Text style={{ fontWeight: '800', color: '#1B4F8A' }}>{basic.name}</Text> đã sẵn sàng lên kế hoạch.
            </Text>
            <View style={styles.successInfoBox}>
              <View style={styles.successInfoRow}><Ionicons name="calendar-outline" size={16} color="#6B7280" /><Text style={styles.successInfoText}>{basic.startDate} – {basic.endDate}</Text></View>
              <View style={styles.successInfoRow}><Ionicons name="location-outline" size={16} color="#6B7280" /><Text style={styles.successInfoText}>{destinations.join(', ')}</Text></View>
              <View style={styles.successInfoRow}><Ionicons name="people-outline" size={16} color="#6B7280" /><Text style={styles.successInfoText}>{1 + memberPhones.length} thành viên</Text></View>
            </View>
            <TouchableOpacity style={styles.dashBtn} onPress={() => { setSuccess(false); router.replace(`/trip/${createdTrip?.id}`); }}>
              <Text style={styles.dashBtnText}>Đến Trip Dashboard →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.laterBtn} onPress={() => { setSuccess(false); router.replace('/(tabs)/trips'); }}>
              <Text style={styles.laterBtnText}>Xem danh sách chuyến đi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  stepWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 24 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepActive: { backgroundColor: '#1B4F8A' },
  stepDone: { backgroundColor: '#10B981' },
  stepInactive: { backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  stepNum: { fontSize: 14, fontWeight: '700' },
  stepLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginBottom: 14, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#10B981' },
  content: { padding: 20, paddingBottom: 100 },
  stepContent: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 4 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#111', backgroundColor: '#F9FAFB' },
  textArea: { height: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  dateInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 13, backgroundColor: '#F9FAFB' },
  dateInput: { flex: 1, fontSize: 15, color: '#111' },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 13, backgroundColor: '#F9FAFB' },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  addBtn: { backgroundColor: '#1B4F8A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  selectedSection: { gap: 8 },
  selectedChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#BFDBFE' },
  selectedChipText: { flex: 1, fontSize: 15, color: '#1D4ED8', fontWeight: '600' },
  suggestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  suggestChipActive: { backgroundColor: '#EFF6FF', borderColor: '#1B4F8A' },
  suggestText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  suggestTextActive: { color: '#1B4F8A', fontWeight: '600' },
  membersList: { gap: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  memberAv: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center' },
  memberAvText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  memberPhone: { fontSize: 14, fontWeight: '600', color: '#111' },
  memberRole: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  emptyMembers: { alignItems: 'center', paddingVertical: 24, gap: 10, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  emptyMembersText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
  inviteBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0F9FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BAE6FD' },
  inviteText: { flex: 1, fontSize: 13, color: '#0369A1' },
  copyBtn: { backgroundColor: '#1B4F8A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  copyBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff', gap: 10 },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { fontSize: 14, color: '#6B7280', textDecorationLine: 'underline' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1B4F8A', borderRadius: 14, paddingVertical: 16, shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successModal: { backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', gap: 14 },
  successIconWrap: { marginBottom: 4 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  successDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  successInfoBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, width: '100%', gap: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  successInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  successInfoText: { fontSize: 14, color: '#374151' },
  dashBtn: { backgroundColor: '#1B4F8A', borderRadius: 14, paddingVertical: 15, paddingHorizontal: 24, width: '100%', alignItems: 'center', shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  dashBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  laterBtn: { paddingVertical: 6 },
  laterBtnText: { fontSize: 14, color: '#6B7280', textDecorationLine: 'underline' },
});

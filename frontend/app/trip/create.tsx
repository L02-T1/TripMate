import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert, Clipboard, KeyboardAvoidingView, Linking, Modal,
  Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { logAction, logWarn, logError, logInfo } from '../../utils/logger';
import api from '../../services/api';

const TAG = 'CreateTrip';

const SUGGESTED_DESTINATIONS = [
  'Đà Lạt', 'Phú Quốc', 'Hội An', 'Huế', 'Sa Pa',
  'Hà Nội', 'Nha Trang', 'Đà Nẵng', 'Hạ Long', 'Mũi Né',
];

// ─── Step indicator ──────────────────────────────────────────────────────────

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

// ─── Date input ───────────────────────────────────────────────────────────────

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

// ─── Maps picker modal ────────────────────────────────────────────────────────

function MapsPickerModal({ visible, onClose, onSelectPlace }: {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (name: string) => void;
}) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simulated place search (in real app, use Google Places API)
  const searchPlaces = async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setIsSearching(true);
    // Filter suggestions from known list + show custom entry
    const matches = SUGGESTED_DESTINATIONS.filter(d =>
      d.toLowerCase().includes(q.toLowerCase())
    );
    // Add the typed text as a custom option if not exact match
    if (!matches.find(m => m.toLowerCase() === q.toLowerCase())) {
      matches.push(q.trim());
    }
    setSuggestions(matches);
    setIsSearching(false);
  };

  const openGoogleMaps = () => {
    const query = searchText.trim() || 'Vietnam';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url).catch(err => {
      logError(TAG, 'Cannot open Google Maps', err);
      Alert.alert('Lỗi', 'Không thể mở Google Maps. Vui lòng kiểm tra ứng dụng.');
    });
    logAction(TAG, 'Open Google Maps', { query });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.mapsModalOverlay}>
        <View style={styles.mapsModal}>
          {/* Header */}
          <View style={styles.mapsHeader}>
            <Text style={styles.mapsTitle}>🗺️ Chọn điểm đến</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.mapsSearchRow}>
            <View style={styles.mapsSearchWrap}>
              <Ionicons name="search-outline" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.mapsSearchInput}
                placeholder="Tìm địa điểm..."
                placeholderTextColor="#C0C8D0"
                value={searchText}
                onChangeText={t => { setSearchText(t); searchPlaces(t); }}
                autoFocus
                returnKeyType="search"
              />
              {isSearching && <ActivityIndicator size="small" color="#1B4F8A" />}
            </View>
          </View>

          {/* Open Google Maps button */}
          <TouchableOpacity style={styles.openMapsBtn} onPress={openGoogleMaps}>
            <Ionicons name="map" size={18} color="#fff" />
            <Text style={styles.openMapsBtnText}>Mở Google Maps để tìm</Text>
            <Ionicons name="open-outline" size={14} color="#fff" />
          </TouchableOpacity>

          {/* Results */}
          <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestRow}
                onPress={() => {
                  logAction(TAG, 'Select place from maps', { place: s });
                  onSelectPlace(s);
                  setSearchText('');
                  setSuggestions([]);
                  onClose();
                }}
              >
                <Ionicons name="location" size={18} color="#1B4F8A" />
                <Text style={styles.suggestRowText}>{s}</Text>
                <Ionicons name="add-circle-outline" size={20} color="#10B981" />
              </TouchableOpacity>
            ))}
            {searchText && suggestions.length === 0 && !isSearching && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>Không tìm thấy. Thêm "{searchText}" thủ công?</Text>
                <TouchableOpacity
                  style={styles.addCustomBtn}
                  onPress={() => {
                    logAction(TAG, 'Add custom place', { place: searchText });
                    onSelectPlace(searchText.trim());
                    setSearchText('');
                    setSuggestions([]);
                    onClose();
                  }}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addCustomBtnText}>Thêm địa điểm này</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Popular */}
          {!searchText && (
            <>
              <Text style={styles.popularLabel}>📍 Phổ biến</Text>
              <View style={styles.popularGrid}>
                {SUGGESTED_DESTINATIONS.slice(0, 6).map(d => (
                  <TouchableOpacity
                    key={d}
                    style={styles.popularChip}
                    onPress={() => {
                      logAction(TAG, 'Select popular place', { place: d });
                      onSelectPlace(d);
                      onClose();
                    }}
                  >
                    <Text style={styles.popularChipText}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Member search modal ──────────────────────────────────────────────────────

function MemberSearchModal({ visible, onClose, onAdd, existingPhones }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (phone: string, name?: string) => void;
  existingPhones: string[];
}) {
  const [query, setQuery] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const searchUser = async () => {
    const q = query.trim();
    if (!q) {
      logWarn(TAG, 'Member search: empty query');
      Alert.alert('', 'Vui lòng nhập số điện thoại hoặc email');
      return;
    }
    setSearching(true);
    setFoundUser(null);
    setNotFound(false);
    logAction(TAG, 'Search member', { query: q });
    try {
      const isEmail = q.includes('@');
      const result = isEmail
        ? await api.users.findByEmail(q)
        : await api.users.findByPhone(q);
      if (result) {
        setFoundUser(result);
        logInfo(TAG, 'Found user', { name: result.name });
      } else {
        setNotFound(true);
        logWarn(TAG, 'User not found', { query: q });
      }
    } catch (err: any) {
      // Offline or user not found — allow adding by phone anyway
      logWarn(TAG, 'Search user API failed, allowing manual add', err?.message);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = (phone: string, name?: string) => {
    if (existingPhones.includes(phone)) {
      logWarn(TAG, 'Member already added', { phone });
      Alert.alert('', 'Số điện thoại này đã được thêm');
      return;
    }
    logAction(TAG, 'Add member', { phone, name });
    onAdd(phone, name);
    setQuery('');
    setFoundUser(null);
    setNotFound(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.mapsModalOverlay}>
        <View style={styles.mapsModal}>
          <View style={styles.mapsHeader}>
            <Text style={styles.mapsTitle}>👤 Tìm thành viên</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          <Text style={styles.memberSearchHint}>Tìm bạn bè qua số điện thoại hoặc email</Text>

          <View style={styles.mapsSearchRow}>
            <View style={[styles.mapsSearchWrap, { flex: 1 }]}>
              <Ionicons name="person-outline" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.mapsSearchInput}
                placeholder="0912 345 678 hoặc email@..."
                placeholderTextColor="#C0C8D0"
                value={query}
                onChangeText={setQuery}
                keyboardType="default"
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={searchUser}
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={searchUser} disabled={searching}>
              {searching
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.addBtnText}>Tìm</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Found user */}
          {foundUser && (
            <View style={styles.foundUserCard}>
              <View style={styles.memberAv}>
                <Text style={styles.memberAvText}>{(foundUser.name || foundUser.username || '?').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberPhone}>{foundUser.name || foundUser.username}</Text>
                <Text style={styles.memberRole}>{foundUser.phone || foundUser.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.inviteUserBtn}
                onPress={() => handleAdd(foundUser.phone || query, foundUser.name)}
              >
                <Ionicons name="person-add" size={16} color="#fff" />
                <Text style={styles.inviteUserBtnText}>Mời</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Not found - allow manual add */}
          {notFound && (
            <View style={styles.notFoundBox}>
              <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.notFoundText}>Không tìm thấy tài khoản với thông tin này.</Text>
                <Text style={styles.notFoundSub}>Bạn vẫn có thể mời qua số điện thoại.</Text>
              </View>
              <TouchableOpacity
                style={[styles.inviteUserBtn, { backgroundColor: '#F59E0B' }]}
                onPress={() => handleAdd(query)}
              >
                <Text style={styles.inviteUserBtnText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CreateTripScreen() {
  const router = useRouter();
  const { createTrip } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<any>(null);
  const [showMapsPicker, setShowMapsPicker] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  const [basic, setBasic] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destInput, setDestInput] = useState('');
  const [members, setMembers] = useState<{ phone: string; name?: string }[]>([]);

  const handleNext = async () => {
    if (step === 1) {
      if (!basic.name.trim()) {
        logWarn(TAG, 'Step 1 validation: missing name');
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên chuyến đi');
        return;
      }
      if (!basic.startDate || basic.startDate.length < 10) {
        logWarn(TAG, 'Step 1 validation: invalid start date');
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập ngày bắt đầu đúng định dạng DD/MM/YYYY');
        return;
      }
      if (!basic.endDate || basic.endDate.length < 10) {
        logWarn(TAG, 'Step 1 validation: missing end date');
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập ngày kết thúc');
        return;
      }
      logAction(TAG, 'Step 1 complete', { name: basic.name });
      setStep(2);
    } else if (step === 2) {
      if (destinations.length === 0) {
        logWarn(TAG, 'Step 2 validation: no destinations');
        Alert.alert('Thiếu điểm đến', 'Vui lòng chọn ít nhất 1 điểm đến');
        return;
      }
      logAction(TAG, 'Step 2 complete', { destinations });
      setStep(3);
    } else {
      await doCreateTrip();
    }
  };

  const doCreateTrip = async (skipMembers = false) => {
    setLoading(true);
    logAction(TAG, 'Creating trip', { name: basic.name, destinations, memberCount: members.length });
    try {
      const memberPhones = skipMembers ? [] : members.map(m => m.phone);
      const trip = await createTrip({ ...basic, destinations, memberPhones });
      setCreatedTrip(trip);
      setSuccess(true);
      logAction(TAG, 'Trip created successfully', { tripId: trip?.id });
    } catch (err: any) {
      logError(TAG, 'Failed to create trip', err);
      Alert.alert('Lỗi', 'Không thể tạo chuyến đi. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const addDest = (d: string) => {
    const trimmed = d.trim();
    if (!trimmed) {
      logWarn(TAG, 'addDest: empty string');
      return;
    }
    if (destinations.includes(trimmed)) {
      logWarn(TAG, 'addDest: already added', { dest: trimmed });
      Alert.alert('', `"${trimmed}" đã được thêm`);
      return;
    }
    logAction(TAG, 'Add destination', { dest: trimmed });
    setDestinations(prev => [...prev, trimmed]);
    setDestInput('');
  };

  const removeDest = (d: string) => {
    logAction(TAG, 'Remove destination', { dest: d });
    setDestinations(prev => prev.filter(x => x !== d));
  };

  const toggleDest = (d: string) => destinations.includes(d) ? removeDest(d) : addDest(d);

  const addMember = (phone: string, name?: string) => {
    if (members.find(m => m.phone === phone)) {
      logWarn(TAG, 'addMember: already added', { phone });
      Alert.alert('', 'Số điện thoại đã được thêm');
      return;
    }
    logAction(TAG, 'Add member', { phone, name });
    setMembers(prev => [...prev, { phone, name }]);
  };

  const inviteLink = `tripmate.app/invite/abc123`;

  const copyInviteLink = () => {
    Clipboard.setString(inviteLink);
    logAction(TAG, 'Copy invite link');
    Alert.alert('', 'Đã sao chép liên kết mời!');
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
          {/* ── STEP 1: Basic info ─────────────────────────────────────────────── */}
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

          {/* ── STEP 2: Destinations ──────────────────────────────────────────── */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Tìm điểm đến</Text>

              {/* Maps picker button */}
              <TouchableOpacity style={styles.mapsPickerBtn} onPress={() => setShowMapsPicker(true)}>
                <Ionicons name="map-outline" size={20} color="#1B4F8A" />
                <Text style={styles.mapsPickerBtnText}>Chọn từ bản đồ</Text>
                <Ionicons name="chevron-forward" size={16} color="#1B4F8A" />
              </TouchableOpacity>

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

          {/* ── STEP 3: Members ───────────────────────────────────────────────── */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Thêm thành viên</Text>
              <Text style={styles.subLabel}>Tìm bạn bè qua số điện thoại hoặc email</Text>

              <TouchableOpacity style={styles.mapsPickerBtn} onPress={() => setShowMemberSearch(true)}>
                <Ionicons name="person-add-outline" size={20} color="#1B4F8A" />
                <Text style={styles.mapsPickerBtnText}>Tìm & thêm thành viên</Text>
                <Ionicons name="chevron-forward" size={16} color="#1B4F8A" />
              </TouchableOpacity>

              {members.length > 0 ? (
                <View style={styles.membersList}>
                  <Text style={styles.subLabel}>Danh sách mời ({members.length} người)</Text>
                  {members.map((m, i) => (
                    <View key={m.phone} style={styles.memberRow}>
                      <View style={styles.memberAv}>
                        <Text style={styles.memberAvText}>{(m.name || String.fromCharCode(65 + i)).charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberPhone}>{m.name || m.phone}</Text>
                        <Text style={styles.memberRole}>{m.name ? m.phone : 'Thành viên'}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          logAction(TAG, 'Remove member', { phone: m.phone });
                          setMembers(prev => prev.filter(x => x.phone !== m.phone));
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
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
                <Text style={styles.inviteText} numberOfLines={1}>{inviteLink}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={copyInviteLink}>
                  <Text style={styles.copyBtnText}>Sao chép</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        {step === 3 && (
          <TouchableOpacity style={styles.skipBtn} onPress={() => doCreateTrip(true)} disabled={loading}>
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

      {/* ── Success Modal ───────────────────────────────────────────────────── */}
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
              <View style={styles.successInfoRow}><Ionicons name="people-outline" size={16} color="#6B7280" /><Text style={styles.successInfoText}>{1 + members.length} thành viên</Text></View>
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

      {/* ── Maps picker modal ───────────────────────────────────────────────── */}
      <MapsPickerModal
        visible={showMapsPicker}
        onClose={() => setShowMapsPicker(false)}
        onSelectPlace={addDest}
      />

      {/* ── Member search modal ─────────────────────────────────────────────── */}
      <MemberSearchModal
        visible={showMemberSearch}
        onClose={() => setShowMemberSearch(false)}
        onAdd={addMember}
        existingPhones={members.map(m => m.phone)}
      />
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
  // Maps picker button
  mapsPickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#BFDBFE' },
  mapsPickerBtnText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1B4F8A' },
  // Maps modal
  mapsModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  mapsModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%', paddingBottom: 40 },
  mapsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mapsTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  mapsSearchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  mapsSearchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#F9FAFB' },
  mapsSearchInput: { flex: 1, fontSize: 15, color: '#111' },
  openMapsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1B4F8A', borderRadius: 12, padding: 14, marginBottom: 12 },
  openMapsBtnText: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14 },
  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  suggestRowText: { flex: 1, fontSize: 15, color: '#111' },
  noResults: { padding: 16, alignItems: 'center', gap: 10 },
  noResultsText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  addCustomBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B981', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addCustomBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  popularLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 8, marginBottom: 8 },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  popularChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  popularChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  // Member search
  memberSearchHint: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  foundUserCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#A7F3D0', marginTop: 8 },
  inviteUserBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1B4F8A', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  inviteUserBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  notFoundBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FDE68A', marginTop: 8 },
  notFoundText: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  notFoundSub: { fontSize: 12, color: '#B45309', marginTop: 2 },
});
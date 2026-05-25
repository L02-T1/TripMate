import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Linking, Modal, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { logAction, logError, logInfo, logWarn } from '../../utils/logger';

const TAG = 'CreateTrip';

// NOTE: Replace with your own Google Places API key
// Get one at: https://console.cloud.google.com → Enable "Places API"
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

const SUGGESTED_DESTINATIONS = [
  'Đà Lạt', 'Phú Quốc', 'Hội An', 'Huế', 'Sa Pa',
  'Hà Nội', 'Nha Trang', 'Đà Nẵng', 'Hạ Long', 'Mũi Né',
];

function formatDateInput(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
  return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
}

/* ── Step indicator ──────────────────────────────────────────────────────────── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Cơ bản', 'Điểm đến', 'Thành viên'];
  return (
    <View style={st.stepWrap}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={st.stepItem}>
            <View style={[st.stepCircle, i < current-1 ? st.stepDone : i === current-1 ? st.stepActive : st.stepInactive]}>
              {i < current-1
                ? <Ionicons name="checkmark" size={14} color="#fff" />
                : <Text style={[st.stepNum, i === current-1 ? { color:'#fff' } : { color:'#9CA3AF' }]}>{i+1}</Text>
              }
            </View>
            <Text style={[st.stepLabel, i === current-1 && { color:'#1B4F8A', fontWeight:'700' }]}>{labels[i]}</Text>
          </View>
          {i < total-1 && <View style={[st.stepLine, i < current-1 ? st.stepLineDone : {}]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

/* ── Google Places Autocomplete Modal ───────────────────────────────────────── */
function PlacesPickerModal({ visible, onClose, onSelectPlace }: {
  visible: boolean;
  onClose: () => void;
  onSelectPlace: (name: string, address: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaces = async (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setPredictions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Google Places Autocomplete API
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&language=vi&components=country:vn&key=${GOOGLE_PLACES_API_KEY}`;
        const res  = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK') {
          setPredictions(data.predictions);
          logDebug(TAG, `Places found: ${data.predictions.length}`, { query: text });
        } else if (data.status === 'REQUEST_DENIED') {
          // API key not set yet — fall back to local suggestions
          logWarn(TAG, 'Places API key not configured, using local suggestions');
          const local = SUGGESTED_DESTINATIONS
            .filter(d => d.toLowerCase().includes(text.toLowerCase()))
            .map(d => ({ place_id: d, description: d, structured_formatting: { main_text: d, secondary_text: 'Việt Nam' } }));
          if (!local.find(x => x.structured_formatting.main_text.toLowerCase() === text.toLowerCase())) {
            local.push({ place_id: '__custom__', description: text, structured_formatting: { main_text: text, secondary_text: 'Địa điểm tùy chọn' } });
          }
          setPredictions(local);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        logWarn(TAG, 'Places API fetch error, using local fallback');
        // Fallback to local list when offline/no key
        const local = SUGGESTED_DESTINATIONS
          .filter(d => d.toLowerCase().includes(text.toLowerCase()))
          .map(d => ({ place_id: d, description: d, structured_formatting: { main_text: d, secondary_text: 'Việt Nam' } }));
        if (!local.find(x => x.structured_formatting.main_text.toLowerCase() === text.toLowerCase())) {
          local.push({ place_id: '__custom__', description: text, structured_formatting: { main_text: text, secondary_text: 'Địa điểm tùy chọn' } });
        }
        setPredictions(local);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (prediction: any) => {
    const name    = prediction.structured_formatting?.main_text || prediction.description;
    const address = prediction.description;
    logAction(TAG, `Selected place: ${name}`, { address });
    onSelectPlace(name, address);
    setQuery('');
    setPredictions([]);
    onClose();
  };

  const openGoogleMaps = () => {
    const q = query.trim() || 'Vietnam';
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`)
      .catch(() => Alert.alert('Lỗi', 'Không thể mở Google Maps'));
    logAction(TAG, 'Open Google Maps', { query: q });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={st.bottomSheet}>
        <View style={st.sheetHandle} />
        <View style={st.sheetHeader}>
          <Text style={st.sheetTitle}>🗺️ Tìm địa điểm</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top:12,bottom:12,left:12,right:12 }}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View style={st.placeSearchRow}>
          <View style={st.placeSearchWrap}>
            <Ionicons name="search-outline" size={17} color="#9CA3AF" />
            <TextInput
              style={st.placeSearchInput}
              placeholder="Nhập tên thành phố, địa điểm..."
              placeholderTextColor="#C0C8D0"
              value={query}
              onChangeText={t => { setQuery(t); searchPlaces(t); }}
              autoFocus
              returnKeyType="search"
            />
            {loading && <ActivityIndicator size="small" color="#1B4F8A" />}
            {!loading && query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setPredictions([]); }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Open in Google Maps */}
        <TouchableOpacity style={st.openMapsBtn} onPress={openGoogleMaps}>
          <Ionicons name="map" size={18} color="#fff" />
          <Text style={st.openMapsBtnText}>Mở Google Maps để tìm kiếm</Text>
          <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
          {/* API results / local suggestions */}
          {predictions.length > 0 && predictions.map((p, i) => (
            <TouchableOpacity key={p.place_id + i} style={st.predictionRow} onPress={() => handleSelect(p)}>
              <View style={st.predIconWrap}>
                <Ionicons name="location" size={18} color="#1B4F8A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.predMain}>{p.structured_formatting?.main_text || p.description}</Text>
                {p.structured_formatting?.secondary_text ? (
                  <Text style={st.predSub} numberOfLines={1}>{p.structured_formatting.secondary_text}</Text>
                ) : null}
              </View>
              <Ionicons name="add-circle-outline" size={22} color="#10B981" />
            </TouchableOpacity>
          ))}

          {/* Popular destinations when empty */}
          {!query && (
            <>
              <Text style={st.sectionHint}>📍 Điểm đến phổ biến</Text>
              <View style={st.popularGrid}>
                {SUGGESTED_DESTINATIONS.map(d => (
                  <TouchableOpacity key={d} style={st.popularChip}
                    onPress={() => { logAction(TAG,'Popular place',{d}); onSelectPlace(d, d + ', Việt Nam'); onClose(); }}>
                    <Text style={st.popularChipText}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ── Member Search Modal ─────────────────────────────────────────────────────── */
function MemberSearchModal({ visible, onClose, onAdd, existingPhones }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (phone: string, name?: string) => void;
  existingPhones: string[];
}) {
  const { findUser } = useApp();
  const [query, setQuery]       = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound]   = useState(false);

  const doSearch = async () => {
    const q = query.trim();
    if (!q) { Alert.alert('', 'Nhập số điện thoại hoặc email'); return; }
    setSearching(true); setFoundUser(null); setNotFound(false);
    try {
      const result = await findUser(q);
      if (result) { setFoundUser(result); logInfo(TAG,'Found user',{name:result.username}); }
      else { setNotFound(true); logWarn(TAG,'User not found',{q}); }
    } catch { setNotFound(true); }
    finally { setSearching(false); }
  };

  const handleAdd = (phone: string, name?: string) => {
    if (existingPhones.includes(phone)) {
      Alert.alert('', `${name || phone} đã được thêm`); return;
    }
    logAction(TAG, 'Add member', { phone, name });
    onAdd(phone, name);
    setQuery(''); setFoundUser(null); setNotFound(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={st.bottomSheet}>
        <View style={st.sheetHandle} />
        <View style={st.sheetHeader}>
          <Text style={st.sheetTitle}>👤 Tìm thành viên</Text>
          <TouchableOpacity onPress={() => { onClose(); setQuery(''); setFoundUser(null); setNotFound(false); }} hitSlop={{top:12,bottom:12,left:12,right:12}}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize:13, color:'#6B7280', marginBottom:14 }}>Tìm qua số điện thoại hoặc email</Text>
        <View style={{ flexDirection:'row', gap:10, marginBottom:12 }}>
          <View style={[st.placeSearchWrap, { flex:1 }]}>
            <Ionicons name="person-outline" size={16} color="#9CA3AF" />
            <TextInput style={st.placeSearchInput} placeholder="0912 345 678 hoặc email@..."
              placeholderTextColor="#C0C8D0" value={query} onChangeText={setQuery}
              autoCapitalize="none" returnKeyType="search" onSubmitEditing={doSearch} autoFocus />
          </View>
          <TouchableOpacity style={st.searchExecBtn} onPress={doSearch} disabled={searching}>
            {searching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={st.searchExecBtnText}>Tìm</Text>}
          </TouchableOpacity>
        </View>
        {foundUser && (
          <View style={st.foundCard}>
            <View style={st.foundAv}><Text style={st.foundAvText}>{(foundUser.username||foundUser.name||'?')[0].toUpperCase()}</Text></View>
            <View style={{flex:1}}>
              <Text style={{fontSize:15,fontWeight:'700',color:'#111'}}>{foundUser.username||foundUser.name}</Text>
              <Text style={{fontSize:12,color:'#6B7280',marginTop:2}}>{foundUser.phone||foundUser.email}</Text>
            </View>
            <TouchableOpacity style={st.addMemberBtn2} onPress={() => handleAdd(foundUser.phone||query, foundUser.username)}>
              <Ionicons name="person-add" size={15} color="#fff" />
              <Text style={{color:'#fff',fontWeight:'700',fontSize:13}}>Mời</Text>
            </TouchableOpacity>
          </View>
        )}
        {notFound && (
          <View style={st.notFoundBox}>
            <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
            <View style={{flex:1}}>
              <Text style={{fontSize:13,color:'#92400E',fontWeight:'600'}}>Không tìm thấy tài khoản</Text>
              <Text style={{fontSize:12,color:'#B45309',marginTop:2}}>Vẫn có thể mời qua số điện thoại</Text>
            </View>
            <TouchableOpacity style={[st.addMemberBtn2,{backgroundColor:'#F59E0B'}]} onPress={() => handleAdd(query.trim())}>
              <Text style={{color:'#fff',fontWeight:'700',fontSize:13}}>Thêm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

/* ── Main create screen ──────────────────────────────────────────────────────── */
export default function CreateTripScreen() {
  const router = useRouter();
  const { createTrip } = useApp();
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [createdTrip, setCreatedTrip] = useState<any>(null);
  const [showPlaces, setShowPlaces]   = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const [basic, setBasic]   = useState({ name:'', startDate:'', endDate:'', description:'' });
  const [destinations, setDestinations] = useState<{name:string;address:string}[]>([]);
  const [destInput, setDestInput]       = useState('');
  const [members, setMembers]           = useState<{phone:string;name?:string}[]>([]);

  const goBack = () => {
    if (step > 1) setStep(s => s-1);
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/trips');
  };

  const addDest = (name: string, address: string) => {
    if (!name.trim()) return;
    if (destinations.find(d => d.name === name)) {
      Alert.alert('', `"${name}" đã được thêm`); return;
    }
    logAction(TAG, 'Add destination', { name });
    setDestinations(prev => [...prev, { name, address }]);
    setDestInput('');
  };

  const removeDest = (name: string) => {
    logAction(TAG, 'Remove destination', { name });
    setDestinations(prev => prev.filter(d => d.name !== name));
  };

  const addMember = (phone: string, name?: string) => {
    if (members.find(m => m.phone === phone)) {
      Alert.alert('', `${name||phone} đã được thêm`); return;
    }
    setMembers(prev => [...prev, { phone, name }]);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!basic.name.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên chuyến đi'); logWarn(TAG,'Missing name'); return; }
      if (!basic.startDate || basic.startDate.length < 10) { Alert.alert('Thiếu thông tin', 'Ngày bắt đầu chưa đúng định dạng DD/MM/YYYY'); return; }
      if (!basic.endDate   || basic.endDate.length < 10)   { Alert.alert('Thiếu thông tin', 'Ngày kết thúc chưa đúng định dạng DD/MM/YYYY'); return; }
      logAction(TAG, 'Step 1 OK', { name: basic.name });
      setStep(2);
    } else if (step === 2) {
      if (destinations.length === 0) { Alert.alert('Thiếu điểm đến', 'Chọn ít nhất 1 điểm đến'); logWarn(TAG,'No destinations'); return; }
      logAction(TAG, 'Step 2 OK', { destinations: destinations.map(d=>d.name) });
      setStep(3);
    } else {
      await doCreate();
    }
  };

  const doCreate = async (skipMembers = false) => {
    setLoading(true);
    try {
      const trip = await createTrip({
        ...basic,
        destinations: destinations.map(d => d.name),
        memberPhones: skipMembers ? [] : members.map(m => m.phone),
      });
      setCreatedTrip(trip);
      setSuccess(true);
      logInfo(TAG, 'Trip created', { id: trip?.id });
    } catch (err: any) {
      logError(TAG, 'Create trip error', err);
      Alert.alert('Lỗi', err.message || 'Không thể tạo chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const inviteLink = `tripmate.app/invite/abc123`;

  return (
    <SafeAreaView style={st.safe}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={goBack} style={st.iconBtn}>
          <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={22} color="#111" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Tạo chuyến đi</Text>
        <View style={{ width:40 }} />
      </View>

      <StepIndicator current={step} total={3} />

      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        <ScrollView contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">

          {/* ── Step 1: Basic info ── */}
          {step === 1 && (
            <View style={st.stepBody}>
              <Text style={st.label}>Tên chuyến đi *</Text>
              <TextInput style={st.input} placeholder="Đà Lạt Summer 2025" placeholderTextColor="#C0C8D0"
                value={basic.name} onChangeText={v => setBasic(p=>({...p,name:v}))} />

              <View style={{flexDirection:'row',gap:12}}>
                <View style={{flex:1}}>
                  <Text style={st.label}>Ngày bắt đầu *</Text>
                  <View style={st.dateWrap}>
                    <Ionicons name="calendar-outline" size={15} color="#6B7280" />
                    <TextInput style={{flex:1,fontSize:15,color:'#111'}} placeholder="DD/MM/YYYY"
                      placeholderTextColor="#C0C8D0" value={basic.startDate} keyboardType="numeric" maxLength={10}
                      onChangeText={v=>setBasic(p=>({...p,startDate:formatDateInput(v)}))} />
                  </View>
                </View>
                <View style={{flex:1}}>
                  <Text style={st.label}>Ngày kết thúc *</Text>
                  <View style={st.dateWrap}>
                    <Ionicons name="calendar-outline" size={15} color="#6B7280" />
                    <TextInput style={{flex:1,fontSize:15,color:'#111'}} placeholder="DD/MM/YYYY"
                      placeholderTextColor="#C0C8D0" value={basic.endDate} keyboardType="numeric" maxLength={10}
                      onChangeText={v=>setBasic(p=>({...p,endDate:formatDateInput(v)}))} />
                  </View>
                </View>
              </View>

              <Text style={st.label}>Mô tả (tùy chọn)</Text>
              <TextInput style={[st.input,{height:88,textAlignVertical:'top'}]}
                placeholder="Chuyến hè cùng những người bạn thân..." placeholderTextColor="#C0C8D0"
                value={basic.description} onChangeText={v=>setBasic(p=>({...p,description:v}))} multiline numberOfLines={3} />
            </View>
          )}

          {/* ── Step 2: Destinations ── */}
          {step === 2 && (
            <View style={st.stepBody}>
              <Text style={st.label}>Điểm đến</Text>

              {/* Google Maps picker button */}
              <TouchableOpacity style={st.mapsBtn} onPress={() => setShowPlaces(true)}>
                <View style={st.mapsBtnIcon}><Ionicons name="map" size={20} color="#fff" /></View>
                <View style={{flex:1}}>
                  <Text style={st.mapsBtnTitle}>Tìm trên Google Maps</Text>
                  <Text style={st.mapsBtnSub}>Gõ tên → chọn địa điểm → tự động thêm về app</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#1B4F8A" />
              </TouchableOpacity>

              {/* Manual input */}
              <View style={st.searchRow}>
                <View style={st.searchInputWrap}>
                  <Ionicons name="location-outline" size={15} color="#9CA3AF" />
                  <TextInput style={st.searchInput} placeholder="Hoặc nhập tay tên địa điểm..."
                    placeholderTextColor="#C0C8D0" value={destInput} onChangeText={setDestInput}
                    returnKeyType="done" onSubmitEditing={() => addDest(destInput, destInput)} />
                </View>
                <TouchableOpacity style={st.addBtn} onPress={() => addDest(destInput, destInput)}>
                  <Text style={st.addBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {/* Selected destinations */}
              {destinations.length > 0 && (
                <View style={st.selectedSection}>
                  <Text style={st.subLabel}>Đã chọn ({destinations.length})</Text>
                  {destinations.map(d => (
                    <View key={d.name} style={st.destChip}>
                      <Ionicons name="location" size={16} color="#1B4F8A" />
                      <View style={{flex:1}}>
                        <Text style={st.destChipName}>{d.name}</Text>
                        {d.address && d.address !== d.name && (
                          <Text style={st.destChipAddr} numberOfLines={1}>{d.address}</Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => removeDest(d.name)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Quick picks */}
              <Text style={st.subLabel}>Gợi ý phổ biến</Text>
              <View style={st.quickGrid}>
                {SUGGESTED_DESTINATIONS.map(d => {
                  const active = !!destinations.find(x => x.name === d);
                  return (
                    <TouchableOpacity key={d} style={[st.quickChip, active && st.quickChipActive]}
                      onPress={() => active ? removeDest(d) : addDest(d, d+', Việt Nam')}>
                      {active && <Ionicons name="checkmark" size={12} color="#1B4F8A" />}
                      <Text style={[st.quickChipText, active && st.quickChipTextActive]}>📍 {d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Step 3: Members ── */}
          {step === 3 && (
            <View style={st.stepBody}>
              <Text style={st.label}>Thêm thành viên</Text>
              <TouchableOpacity style={st.mapsBtn} onPress={() => setShowMembers(true)}>
                <View style={[st.mapsBtnIcon,{backgroundColor:'#10B981'}]}><Ionicons name="person-add" size={18} color="#fff" /></View>
                <View style={{flex:1}}>
                  <Text style={st.mapsBtnTitle}>Tìm & thêm thành viên</Text>
                  <Text style={st.mapsBtnSub}>Tìm qua số điện thoại hoặc email</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#1B4F8A" />
              </TouchableOpacity>

              {members.length > 0 ? (
                <View style={{gap:8,marginTop:4}}>
                  <Text style={st.subLabel}>Danh sách mời ({members.length})</Text>
                  {members.map((m,i) => (
                    <View key={m.phone} style={st.memberRow}>
                      <View style={st.memberAv}><Text style={st.memberAvText}>{(m.name||m.phone)[0].toUpperCase()}</Text></View>
                      <View style={{flex:1}}>
                        <Text style={{fontSize:14,fontWeight:'600',color:'#111'}}>{m.name||m.phone}</Text>
                        {m.name && <Text style={{fontSize:12,color:'#6B7280'}}>{m.phone}</Text>}
                      </View>
                      <TouchableOpacity onPress={() => setMembers(prev=>prev.filter(x=>x.phone!==m.phone))} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={st.emptyMems}>
                  <Ionicons name="people-outline" size={40} color="#D1D5DB" />
                  <Text style={{fontSize:13,color:'#9CA3AF',textAlign:'center'}}>Bạn có thể thêm thành viên sau khi tạo</Text>
                </View>
              )}

              <View style={st.inviteRow}>
                <Ionicons name="link-outline" size={16} color="#1B4F8A" />
                <Text style={st.inviteText} numberOfLines={1}>{inviteLink}</Text>
                <TouchableOpacity style={st.copyBtn} onPress={async () => { await Clipboard.setStringAsync(inviteLink); Alert.alert('','Đã sao chép link mời!'); }}>
                  <Text style={st.copyBtnText}>Sao chép</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom bar */}
      <View style={st.bottomBar}>
        {step === 3 && (
          <TouchableOpacity style={st.skipBtn} onPress={() => doCreate(true)} disabled={loading}>
            <Text style={st.skipBtnText}>Bỏ qua, tạo ngay</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[st.nextBtn, loading && {opacity:0.6}]} onPress={handleNext} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={st.nextBtnText}>{step < 3 ? 'Tiếp tục' : 'Tạo chuyến đi 🎉'}</Text>
                {step < 3 && <Ionicons name="arrow-forward" size={18} color="#fff" />}
              </>
          }
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      <Modal visible={success} transparent animationType="fade">
        <View style={st.successOverlay}>
          <View style={st.successModal}>
            <Ionicons name="checkmark-circle" size={72} color="#10B981" />
            <Text style={st.successTitle}>Tạo thành công! 🎉</Text>
            <Text style={st.successDesc}>
              Chuyến đi <Text style={{fontWeight:'800',color:'#1B4F8A'}}>{basic.name}</Text> đã sẵn sàng!
            </Text>
            <View style={st.successInfo}>
              <Text style={st.successInfoRow}>📅 {basic.startDate} – {basic.endDate}</Text>
              <Text style={st.successInfoRow}>📍 {destinations.map(d=>d.name).join(', ')}</Text>
              <Text style={st.successInfoRow}>👥 {1+members.length} thành viên</Text>
            </View>
            <TouchableOpacity style={st.successBtn}
              onPress={() => { setSuccess(false); router.replace(`/trip/${createdTrip?.id}` as any); }}>
              <Text style={st.successBtnText}>Đến Trip Dashboard →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSuccess(false); router.replace('/(tabs)/trips'); }}>
              <Text style={{fontSize:14,color:'#9CA3AF',textDecorationLine:'underline',marginTop:10}}>Xem danh sách chuyến đi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Google Places picker */}
      <PlacesPickerModal visible={showPlaces} onClose={() => setShowPlaces(false)} onSelectPlace={addDest} />

      {/* Member search */}
      <MemberSearchModal visible={showMembers} onClose={() => setShowMembers(false)} onAdd={addMember} existingPhones={members.map(m=>m.phone)} />
    </SafeAreaView>
  );
}

function logDebug(tag: string, msg: string, data?: any) {
  if (__DEV__) console.log(`🔍 [${tag}] ${msg}`, data ?? '');
}

const st = StyleSheet.create({
  safe: { flex:1, backgroundColor:'#fff' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#F3F4F6' },
  iconBtn: { width:40, height:40, justifyContent:'center', alignItems:'center' },
  headerTitle: { fontSize:18, fontWeight:'700', color:'#111' },
  stepWrap: { flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:20, paddingHorizontal:24 },
  stepItem: { alignItems:'center', gap:4 },
  stepCircle: { width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center' },
  stepActive: { backgroundColor:'#1B4F8A' },
  stepDone: { backgroundColor:'#10B981' },
  stepInactive: { backgroundColor:'#F3F4F6', borderWidth:1.5, borderColor:'#E5E7EB' },
  stepNum: { fontSize:14, fontWeight:'700' },
  stepLabel: { fontSize:11, color:'#9CA3AF', fontWeight:'500' },
  stepLine: { flex:1, height:2, backgroundColor:'#E5E7EB', marginBottom:14, marginHorizontal:4 },
  stepLineDone: { backgroundColor:'#10B981' },
  content: { padding:20, paddingBottom:100 },
  stepBody: { gap:16 },
  label: { fontSize:14, fontWeight:'600', color:'#374151' },
  subLabel: { fontSize:13, fontWeight:'600', color:'#6B7280' },
  input: { borderWidth:1.5, borderColor:'#E5E7EB', borderRadius:12, paddingHorizontal:14, paddingVertical:13, fontSize:15, color:'#111', backgroundColor:'#F9FAFB' },
  dateWrap: { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderColor:'#E5E7EB', borderRadius:12, paddingHorizontal:12, paddingVertical:12, backgroundColor:'#F9FAFB' },
  mapsBtn: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#F0F9FF', borderRadius:14, padding:14, borderWidth:1.5, borderColor:'#BFDBFE' },
  mapsBtnIcon: { width:40, height:40, borderRadius:20, backgroundColor:'#1B4F8A', justifyContent:'center', alignItems:'center' },
  mapsBtnTitle: { fontSize:14, fontWeight:'700', color:'#1B4F8A' },
  mapsBtnSub: { fontSize:12, color:'#64B5F6', marginTop:2 },
  searchRow: { flexDirection:'row', gap:10, alignItems:'center' },
  searchInputWrap: { flex:1, flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderColor:'#E5E7EB', borderRadius:12, paddingHorizontal:12, paddingVertical:12, backgroundColor:'#F9FAFB' },
  searchInput: { flex:1, fontSize:15, color:'#111' },
  addBtn: { backgroundColor:'#1B4F8A', borderRadius:12, paddingHorizontal:16, paddingVertical:14 },
  addBtnText: { color:'#fff', fontWeight:'700', fontSize:14 },
  selectedSection: { gap:8 },
  destChip: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#EFF6FF', borderRadius:12, padding:12, borderWidth:1.5, borderColor:'#BFDBFE' },
  destChipName: { fontSize:14, fontWeight:'700', color:'#1D4ED8' },
  destChipAddr: { fontSize:12, color:'#93C5FD', marginTop:1 },
  quickGrid: { flexDirection:'row', flexWrap:'wrap', gap:8 },
  quickChip: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:12, paddingVertical:8, borderRadius:20, backgroundColor:'#F3F4F6', borderWidth:1.5, borderColor:'#E5E7EB' },
  quickChipActive: { backgroundColor:'#EFF6FF', borderColor:'#1B4F8A' },
  quickChipText: { fontSize:13, color:'#6B7280', fontWeight:'500' },
  quickChipTextActive: { color:'#1B4F8A', fontWeight:'700' },
  memberRow: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#F9FAFB', borderRadius:12, padding:12, borderWidth:1, borderColor:'#E5E7EB' },
  memberAv: { width:40, height:40, borderRadius:20, backgroundColor:'#1B4F8A', justifyContent:'center', alignItems:'center' },
  memberAvText: { color:'#fff', fontWeight:'700', fontSize:15 },
  emptyMems: { alignItems:'center', paddingVertical:24, gap:10, backgroundColor:'#F9FAFB', borderRadius:12, borderWidth:1.5, borderColor:'#E5E7EB', borderStyle:'dashed' },
  inviteRow: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F0F9FF', borderRadius:12, padding:14, borderWidth:1, borderColor:'#BAE6FD' },
  inviteText: { flex:1, fontSize:13, color:'#0369A1' },
  copyBtn: { backgroundColor:'#1B4F8A', borderRadius:8, paddingHorizontal:12, paddingVertical:6 },
  copyBtnText: { color:'#fff', fontSize:12, fontWeight:'700' },
  bottomBar: { padding:16, borderTopWidth:1, borderTopColor:'#F3F4F6', backgroundColor:'#fff', gap:10 },
  skipBtn: { alignItems:'center', paddingVertical:8 },
  skipBtnText: { fontSize:14, color:'#9CA3AF', textDecorationLine:'underline' },
  nextBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:'#1B4F8A', borderRadius:14, paddingVertical:16, shadowColor:'#1B4F8A', shadowOpacity:0.3, shadowRadius:8, elevation:4 },
  nextBtnText: { color:'#fff', fontSize:16, fontWeight:'700' },
  successOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', alignItems:'center', padding:24 },
  successModal: { backgroundColor:'#fff', borderRadius:24, padding:28, alignItems:'center', width:'100%', gap:12 },
  successTitle: { fontSize:26, fontWeight:'800', color:'#111' },
  successDesc: { fontSize:14, color:'#6B7280', textAlign:'center', lineHeight:20 },
  successInfo: { backgroundColor:'#F9FAFB', borderRadius:14, padding:16, width:'100%', gap:8, borderWidth:1, borderColor:'#E5E7EB' },
  successInfoRow: { fontSize:14, color:'#374151' },
  successBtn: { backgroundColor:'#1B4F8A', borderRadius:14, paddingVertical:15, paddingHorizontal:24, width:'100%', alignItems:'center' },
  successBtnText: { color:'#fff', fontWeight:'700', fontSize:15 },
  // Bottom sheet / modal
  bottomSheet: { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'#fff', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:40, maxHeight:'85%' },
  sheetHandle: { width:40, height:4, backgroundColor:'#E5E7EB', borderRadius:2, alignSelf:'center', marginBottom:16 },
  sheetHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  sheetTitle: { fontSize:18, fontWeight:'700', color:'#111' },
  placeSearchRow: { marginBottom:12 },
  placeSearchWrap: { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderColor:'#E5E7EB', borderRadius:12, paddingHorizontal:12, paddingVertical:12, backgroundColor:'#F9FAFB' },
  placeSearchInput: { flex:1, fontSize:15, color:'#111' },
  openMapsBtn: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#1B4F8A', borderRadius:12, padding:13, marginBottom:12 },
  openMapsBtnText: { flex:1, color:'#fff', fontWeight:'600', fontSize:14 },
  predictionRow: { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#F9FAFB' },
  predIconWrap: { width:36, height:36, borderRadius:18, backgroundColor:'#EFF6FF', justifyContent:'center', alignItems:'center' },
  predMain: { fontSize:15, fontWeight:'600', color:'#111' },
  predSub: { fontSize:12, color:'#9CA3AF', marginTop:1 },
  sectionHint: { fontSize:13, fontWeight:'600', color:'#6B7280', marginTop:12, marginBottom:8 },
  popularGrid: { flexDirection:'row', flexWrap:'wrap', gap:8 },
  popularChip: { paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'#F3F4F6', borderWidth:1, borderColor:'#E5E7EB' },
  popularChipText: { fontSize:13, color:'#374151', fontWeight:'500' },
  searchExecBtn: { backgroundColor:'#1B4F8A', borderRadius:12, paddingHorizontal:18, paddingVertical:14, justifyContent:'center', alignItems:'center' },
  searchExecBtnText: { color:'#fff', fontWeight:'700', fontSize:14 },
  foundCard: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#ECFDF5', borderRadius:12, padding:14, borderWidth:1.5, borderColor:'#A7F3D0', marginBottom:10 },
  foundAv: { width:42, height:42, borderRadius:21, backgroundColor:'#1B4F8A', justifyContent:'center', alignItems:'center' },
  foundAvText: { color:'#fff', fontWeight:'800', fontSize:16 },
  notFoundBox: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#FFFBEB', borderRadius:12, padding:14, borderWidth:1, borderColor:'#FDE68A', marginBottom:10 },
  addMemberBtn2: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#1B4F8A', borderRadius:10, paddingHorizontal:12, paddingVertical:8 },
});
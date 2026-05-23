import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const CODE_LENGTH = 6;

export default function JoinTripScreen() {
  const router = useRouter();
  const { joinTrip } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const formatted = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

  const handleJoin = async () => {
    if (formatted.length < CODE_LENGTH) {
      setError('Vui lòng nhập đầy đủ mã gồm 6 ký tự');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const found = await joinTrip(formatted);
      setLoading(false);

      if (found) {
        Alert.alert(
          'Tìm thấy chuyến đi!',
          `Bạn có muốn tham gia "${found.name}" không?`,
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Tham gia',
              onPress: () => { router.replace(`/trip/${found.id}`); },
            },
          ]
        );
      } else {
        setError('Mã mời không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.');
      }
    } catch (e: any) {
      setLoading(false);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const cells = Array.from({ length: CODE_LENGTH });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tham gia chuyến đi</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Illustration */}
          <View style={styles.illustrationWrap}>
            <View style={styles.illustrationCircle}>
              <Ionicons name="people" size={44} color="#1B4F8A" />
            </View>
            <Text style={styles.illustrationTitle}>Nhập mã mời</Text>
            <Text style={styles.illustrationSub}>
              Yêu cầu trưởng nhóm chia sẻ mã 6 ký tự để tham gia chuyến đi
            </Text>
          </View>

          {/* Code input */}
          <TouchableOpacity style={styles.cellsRow} onPress={() => inputRef.current?.focus()} activeOpacity={1}>
            {cells.map((_, i) => {
              const char = formatted[i] || '';
              const isCurrent = i === formatted.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    char ? styles.cellFilled : null,
                    isCurrent && styles.cellActive,
                  ]}
                >
                  <Text style={styles.cellText}>{char}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Hidden input */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={formatted}
            onChangeText={v => {
              setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH));
              setError('');
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={CODE_LENGTH}
            keyboardType="default"
            autoFocus
          />

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Join button */}
          <TouchableOpacity
            style={[
              styles.joinBtn,
              (formatted.length < CODE_LENGTH || loading) && styles.joinBtnDisabled,
            ]}
            onPress={handleJoin}
            disabled={formatted.length < CODE_LENGTH || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.joinBtnText}>Tham gia ngay</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Nếu bạn chưa có mã, hãy liên hệ trưởng nhóm của chuyến đi để được cấp mã mời.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },

  illustrationWrap: { alignItems: 'center', marginTop: 32, marginBottom: 40 },
  illustrationCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#1B4F8A', shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  illustrationTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8 },
  illustrationSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

  cellsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  cell: { width: 48, height: 58, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  cellActive: { borderColor: '#1B4F8A', backgroundColor: '#EFF6FF' },
  cellFilled: { borderColor: '#1B4F8A', backgroundColor: '#fff' },
  cellText: { fontSize: 22, fontWeight: '800', color: '#1B4F8A', letterSpacing: 1 },
  hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 12 },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },

  joinBtn: { backgroundColor: '#1B4F8A', borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 8, shadowColor: '#1B4F8A', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  joinBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  joinBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  hint: { marginTop: 20, fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
});

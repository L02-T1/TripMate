import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();
  const [selected, setSelected] = useState(user?.language || 'Tiếng Việt');

  const handleSelect = (label: string) => {
    setSelected(label);
    updateUser({ language: label });
    setTimeout(() => router.back(), 300);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.sectionTitle}>CHOOSE LANGUAGE</Text>

      <View style={styles.card}>
        {LANGUAGES.map((lang, i) => (
          <React.Fragment key={lang.code}>
            <TouchableOpacity style={styles.langRow} onPress={() => handleSelect(lang.label)}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={styles.langLabel}>{lang.label}</Text>
              {selected === lang.label && (
                <Ionicons name="checkmark-circle" size={22} color="#1B4F8A" />
              )}
            </TouchableOpacity>
            {i < LANGUAGES.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, margin: 20, marginBottom: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  langRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  flag: { fontSize: 22 },
  langLabel: { flex: 1, fontSize: 16, color: '#111', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 56 },
});

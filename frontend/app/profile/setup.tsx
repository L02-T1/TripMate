import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const GENDERS = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
] as const;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateUser } = useApp();

  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    birthday: user?.birthday || '',
    gender: user?.gender || 'male',
    job: user?.job || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.username.trim()) {
      Alert.alert('Lỗi', 'Username không được để trống');
      return;
    }

    try {
      setLoading(true);

      await updateUser({
        username: form.username,
        bio: form.bio,
        location: form.location,
        birthday: form.birthday,
        gender: form.gender as 'male' | 'female' | 'other',
        job: form.job,
      });

      Alert.alert(
        'Thành công',
        'Thông tin đã được cập nhật',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: 'username',
      label: 'Username',
      placeholder: 'Alex Nguyen',
    },
    {
      key: 'bio',
      label: 'Bio',
      placeholder:
        'I am passionate about empathetic UX and delightful visual design.',
      multiline: true,
    },
    {
      key: 'location',
      label: 'Location',
      placeholder: 'Dong Hoa, Ho Chi Minh',
    },
    {
      key: 'birthday',
      label: 'Birthday',
      placeholder: 'MM/DD/YYYY',
      keyboardType: 'numbers-and-punctuation',
    },
    {
      key: 'job',
      label: 'Job',
      placeholder: 'Software engineer',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title}>Profile setup</Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.hint}>
            Setup your profile in the best way you would like to be addressed.
          </Text>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarArea}>
            <View style={styles.avatarBig}>
              <Text style={styles.avatarText}>
                {form.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>

            <View style={styles.editBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          {fields.map((f) => (
            <View key={f.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{f.label}</Text>

              <TextInput
                style={[
                  styles.input,
                  f.multiline && styles.textArea,
                ]}
                placeholder={f.placeholder}
                placeholderTextColor="#C0C8D0"
                value={form[f.key as keyof typeof form] as string}
                onChangeText={(v) =>
                  setForm((p) => ({
                    ...p,
                    [f.key]: v,
                  }))
                }
                multiline={f.multiline}
                numberOfLines={f.multiline ? 3 : 1}
                keyboardType={(f.keyboardType as any) || 'default'}
              />
            </View>
          ))}

          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Gender</Text>

            <View style={styles.genderRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.genderChip,
                    form.gender === g.value &&
                      styles.genderChipActive,
                  ]}
                  onPress={() =>
                    setForm((p) => ({
                      ...p,
                      gender: g.value,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.genderText,
                      form.gender === g.value &&
                        styles.genderTextActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              loading && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            <Ionicons
              name="cloud-download-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.saveBtnText}>
              {loading ? 'Đang lưu...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },

  hint: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
  },

  avatarArea: {
    alignSelf: 'center',
    position: 'relative',
    marginVertical: 8,
  },

  avatarBig: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1B4F8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },

  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1B4F8A',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  fieldGroup: {
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#F9FAFB',
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },

  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  genderChipActive: {
    borderColor: '#1B4F8A',
    backgroundColor: '#EFF6FF',
  },

  genderText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  genderTextActive: {
    color: '#1B4F8A',
    fontWeight: '700',
  },

  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#1B4F8A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
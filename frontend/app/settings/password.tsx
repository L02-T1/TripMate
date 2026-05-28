import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { logError, formatErrorForAlert } from '../../utils/logger';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const { changePassword } = useApp();

  const [form, setForm] = useState({
    current: '',
    newPwd: '',
    confirm: '',
  });

  const [show, setShow] = useState({
    current: false,
    newPwd: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (
      !form.current ||
      !form.newPwd ||
      !form.confirm
    ) {
      return 'Vui lòng điền đầy đủ thông tin';
    }

    if (form.newPwd.length < 9) {
      return 'Mật khẩu mới phải có ít nhất 9 ký tự';
    }

    if (!/[A-Z]/.test(form.newPwd)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }

    if (!/[0-9]/.test(form.newPwd)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }

    if (form.newPwd !== form.confirm) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return null;
  };

  const handleSave = async () => {
    try {
      const err = validate();

      if (err) {
        Alert.alert('Lỗi', err);
        return;
      }

      setLoading(true);

      const result = await changePassword(
        form.current,
        form.newPwd
      );

      console.log('Change password result:', result);

      setLoading(false);

      if (result.success) {
        Alert.alert(
          'Thành công',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Lỗi',
          result.message
        );
      }
    } catch (error: any) {
      logError('Password', 'changePassword error', error);
      setLoading(false);
      Alert.alert('Lỗi đổi mật khẩu', formatErrorForAlert(error));
    }
  };

  const rules = [
    {
      label: 'At least 9 characters',
      ok: form.newPwd.length >= 9,
    },
    {
      label: '1 uppercase',
      ok: /[A-Z]/.test(form.newPwd),
    },
    {
      label: '1 number',
      ok: /[0-9]/.test(form.newPwd),
    },
  ];

  const fields = [
    {
      key: 'current',
      label: 'Current password',
      placeholder: 'password-d123',
    },
    {
      key: 'newPwd',
      label: 'New password',
      placeholder: 'Enter new password...',
    },
    {
      key: 'confirm',
      label: 'Confirm new password',
      placeholder: 'Confirm new password...',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#111"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Change password
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.hint}>
            Your new password must be at least
            9 characters and contain a number.
          </Text>

          {fields.map(f => (
            <View
              key={f.key}
              style={styles.fieldGroup}
            >
              <Text style={styles.label}>
                {f.label}
              </Text>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor="#C0C8D0"
                  value={
                    form[
                      f.key as keyof typeof form
                    ]
                  }
                  onChangeText={v =>
                    setForm(p => ({
                      ...p,
                      [f.key]: v.trim(),
                    }))
                  }
                  secureTextEntry={
                    !show[
                      f.key as keyof typeof show
                    ]
                  }
                />

                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() =>
                    setShow(p => ({
                      ...p,
                      [f.key]:
                        !p[
                          f.key as keyof typeof show
                        ],
                    }))
                  }
                >
                  <Ionicons
                    name={
                      show[
                        f.key as keyof typeof show
                      ]
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* RULES */}
          {form.newPwd.length > 0 && (
            <View style={styles.rulesBox}>
              {rules.map(r => (
                <View
                  key={r.label}
                  style={styles.ruleRow}
                >
                  <Ionicons
                    name={
                      r.ok
                        ? 'checkmark-circle'
                        : 'ellipse-outline'
                    }
                    size={16}
                    color={
                      r.ok
                        ? '#10B981'
                        : '#9CA3AF'
                    }
                  />

                  <Text
                    style={[
                      styles.ruleText,
                      r.ok &&
                        styles.ruleTextOk,
                    ]}
                  >
                    {r.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* BUTTON */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              loading && {
                opacity: 0.6,
              },
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>
              {loading
                ? 'Đang lưu...'
                : 'Save new password'}
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
    flex: 1,
    padding: 20,
    gap: 16,
  },

  hint: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  fieldGroup: {
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  inputWrap: {
    position: 'relative',
  },

  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111',
    paddingRight: 44,
    backgroundColor: '#F9FAFB',
  },

  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 13,
  },

  rulesBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ruleText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  ruleTextOk: {
    color: '#10B981',
    fontWeight: '600',
  },

  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  saveBtn: {
    backgroundColor: '#1B4F8A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { isValidEmail, isValidPassword, isValidPhone } from '../../utils/helpers';
import { logError, formatErrorForAlert } from '../../utils/logger';

type FormKey = 'email' | 'username' | 'phone' | 'password' | 'confirm';
type FormErrors = Partial<Record<FormKey, string>>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <View style={styles.fieldErrorRow}>
      <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
      <Text style={styles.fieldErrorText}>{msg}</Text>
    </View>
  );
}

function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const score = [pwd.length >= 6, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh'];
  return (
    <View style={styles.pwdStrengthRow}>
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={[styles.pwdBar, { backgroundColor: i < score ? colors[score - 1] : '#E5E7EB' }]}
        />
      ))}
      <Text style={[styles.pwdLabel, { color: colors[score - 1] || '#9CA3AF' }]}>
        {pwd.length > 0 ? labels[score - 1] ?? labels[0] : ''}
      </Text>
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useApp();

  const [form, setForm] = useState<Record<FormKey, string>>({
    email: '', username: '', phone: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const refs = {
    username: useRef<TextInput>(null),
    phone: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    confirm: useRef<TextInput>(null),
  };

  const set = (key: FormKey, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.email.trim()) {
      e.email = 'Vui lòng nhập email';
      console.warn('[SignUp] email is empty');
    } else if (!isValidEmail(form.email)) {
      e.email = 'Email không hợp lệ';
      console.warn('[SignUp] invalid email:', form.email);
    }

    if (!form.username.trim()) {
      e.username = 'Vui lòng nhập tên người dùng';
      console.warn('[SignUp] username is empty');
    } else if (form.username.trim().length < 2) {
      e.username = 'Tên phải có ít nhất 2 ký tự';
    }

    if (!form.phone.trim()) {
      e.phone = 'Vui lòng nhập số điện thoại';
      console.warn('[SignUp] phone is empty');
    } else if (!isValidPhone(form.phone)) {
      e.phone = 'Số điện thoại không hợp lệ';
      console.warn('[SignUp] invalid phone:', form.phone);
    }

    if (!form.password) {
      e.password = 'Vui lòng nhập mật khẩu';
      console.warn('[SignUp] password is empty');
    } else if (!isValidPassword(form.password)) {
      e.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!form.confirm) {
      e.confirm = 'Vui lòng xác nhận mật khẩu';
    } else if (form.password !== form.confirm) {
      e.confirm = 'Mật khẩu không khớp';
      console.warn('[SignUp] passwords do not match');
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    console.log('[SignUp] Registering:', form.email);

    try {
      const ok = await signUp(form.email.trim(), form.username.trim(), form.phone.trim(), form.password);
      if (ok) {
        console.log('[SignUp] Registration successful');
        router.replace('/(tabs)/trips');
      } else {
        console.warn('[SignUp] Registration failed – duplicate email/phone');
        setErrors({ email: 'Email hoặc số điện thoại đã được sử dụng' });
      }
    } catch (e: any) {
      logError('SignUp', 'Unexpected error', e);
      Alert.alert('Lỗi đăng ký', formatErrorForAlert(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="navigate" size={34} color="#1B4F8A" />
            </View>
            <Text style={styles.appName}>TripMate</Text>
            <Text style={styles.tagline}>TRAVEL SMART, SPEND WISELY</Text>
          </View>

          <View style={styles.form}>
            {/* Email */}
            <View>
              <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#C0C8D0"
                  value={form.email}
                  onChangeText={v => set('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => refs.username.current?.focus()}
                />
              </View>
              <FieldError msg={errors.email} />
            </View>

            {/* Username */}
            <View>
              <View style={[styles.inputWrap, errors.username ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={refs.username}
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#C0C8D0"
                  value={form.username}
                  onChangeText={v => set('username', v)}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => refs.phone.current?.focus()}
                />
              </View>
              <FieldError msg={errors.username} />
            </View>

            {/* Phone */}
            <View>
              <View style={[styles.inputWrap, errors.phone ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={refs.phone}
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#C0C8D0"
                  value={form.phone}
                  onChangeText={v => set('phone', v)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => refs.password.current?.focus()}
                />
              </View>
              <FieldError msg={errors.phone} />
            </View>

            {/* Password */}
            <View>
              <View style={[styles.inputWrap, errors.password ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={refs.password}
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#C0C8D0"
                  value={form.password}
                  onChangeText={v => set('password', v)}
                  secureTextEntry={!showPwd}
                  returnKeyType="next"
                  onSubmitEditing={() => refs.confirm.current?.focus()}
                />
                <TouchableOpacity onPress={() => setShowPwd(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <PasswordStrength pwd={form.password} />
              <FieldError msg={errors.password} />
            </View>

            {/* Confirm password */}
            <View>
              <View style={[styles.inputWrap, errors.confirm ? styles.inputError : null]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  ref={refs.confirm}
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#C0C8D0"
                  value={form.confirm}
                  onChangeText={v => set('confirm', v)}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                {form.confirm.length > 0 && (
                  <Ionicons
                    name={form.password === form.confirm ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={form.password === form.confirm ? '#10B981' : '#EF4444'}
                  />
                )}
              </View>
              <FieldError msg={errors.confirm} />
            </View>

            {/* Sign up button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? 'Đang tạo tài khoản...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signinRow}>
              <Text style={styles.grayText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: 28, paddingTop: 28, paddingBottom: 24,
  },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1B4F8A', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  appName: { fontSize: 26, fontWeight: '800', color: '#1B4F8A', letterSpacing: 1 },
  tagline: { fontSize: 10, color: '#9CA3AF', letterSpacing: 2.5, marginTop: 3, fontWeight: '600' },

  form: { width: '100%', gap: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: '#F9FAFB',
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#111', padding: 0 },

  fieldErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, paddingLeft: 2 },
  fieldErrorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },

  pwdStrengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 2 },
  pwdBar: { flex: 1, height: 3, borderRadius: 2 },
  pwdLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4, minWidth: 56 },

  btn: {
    backgroundColor: '#1B4F8A', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 4,
    shadowColor: '#1B4F8A', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  signinRow: { flexDirection: 'row', justifyContent: 'center' },
  grayText: { fontSize: 14, color: '#6B7280' },
  linkText: { fontSize: 14, color: '#1B4F8A', fontWeight: '700' },
});
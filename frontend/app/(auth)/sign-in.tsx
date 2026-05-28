import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { isValidEmail, isValidPhone } from '../../utils/helpers';
import { formatErrorForAlert, logError } from '../../utils/logger';

// ─── Inline field error component ────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <View style={styles.fieldErrorRow}>
      <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
      <Text style={styles.fieldErrorText}>{msg}</Text>
    </View>
  );
}

// ─── TripMate logo ────────────────────────────────────────────────────────────
function Logo() {
  return (
    <View style={styles.logoArea}>
      <Image 
        source={require('../../assets/icon.png')} // Đường dẫn tới file ảnh của bạn
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.appName}>TripMate</Text>
      <Text style={styles.tagline}>TRAVEL SMART, SPEND WISELY</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useApp();

  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [errors, setErrors] = useState<{ emailOrPhone?: string; password?: string }>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    // clear field error on type
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!form.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Vui lòng nhập email hoặc số điện thoại';
      console.warn('[SignIn] Validation: email/phone is empty');
    } else if (
      !isValidEmail(form.emailOrPhone) &&
      !isValidPhone(form.emailOrPhone)
    ) {
      newErrors.emailOrPhone = 'Email hoặc số điện thoại không hợp lệ';
      console.warn('[SignIn] Validation: invalid email/phone:', form.emailOrPhone);
    }

    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      console.warn('[SignIn] Validation: password is empty');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    console.log('[SignIn] Attempting login:', form.emailOrPhone);

    try {
      const ok = await signIn(form.emailOrPhone.trim(), form.password);
      if (ok) {
        console.log('[SignIn] Login successful');
        router.replace('/(tabs)/trips');
      } else {
        console.warn('[SignIn] Login failed – invalid credentials');
        setErrors({ emailOrPhone: 'Email/số điện thoại hoặc mật khẩu không đúng' });
      }
    } catch (e: any) {
      logError('SignIn', 'Unexpected error', e);
      Alert.alert('Lỗi đăng nhập', formatErrorForAlert(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo />

          <View style={styles.form}>
            {/* Email / Phone */}
            <View>
              <View style={[
                styles.inputWrap,
                errors.emailOrPhone ? styles.inputError : null,
              ]}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email or Phone Number"
                  placeholderTextColor="#C0C8D0"
                  value={form.emailOrPhone}
                  onChangeText={v => set('emailOrPhone', v)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
              <FieldError msg={errors.emailOrPhone} />
            </View>

            {/* Password */}
            <View>
              <View style={[
                styles.inputWrap,
                errors.password ? styles.inputError : null,
              ]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#C0C8D0"
                  value={form.password}
                  onChangeText={v => set('password', v)}
                  secureTextEntry={!showPwd}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd(p => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <FieldError msg={errors.password} />
            </View>

            <TouchableOpacity style={styles.forgotRow} onPress={() => console.log('[SignIn] Forgot password tapped')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign in button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <Text style={styles.btnText}>Đang đăng nhập...</Text>
                : <Text style={styles.btnText}>Sign In</Text>
              }
            </TouchableOpacity>

            {/* Demo hint */}
            <View style={styles.demoBox}>
              <Ionicons name="information-circle-outline" size={14} color="#92400E" />
              <Text style={styles.demoText}>Demo: demo@tripmate.app / Demo@123</Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.grayText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={styles.linkText}>Sign Up</Text>
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
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // Logo
  logoArea: { alignItems: 'center', marginBottom: 44 },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1B4F8A', shadowOpacity: 0.12, shadowRadius: 14, elevation: 4,
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#1B4F8A', letterSpacing: 1 },
  tagline: { fontSize: 10, color: '#9CA3AF', letterSpacing: 2.5, marginTop: 4, fontWeight: '600' },
logoImage: {
    width: 80,   // Điều chỉnh kích thước tùy ý
    height: 80,
    marginBottom: 10,
  },
  // Form
  form: { width: '100%', gap: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#F9FAFB',
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    padding: 0,
  },
  eyeBtn: { padding: 2 },

  fieldErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, paddingLeft: 2 },
  fieldErrorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },

  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: 13, color: '#1B4F8A', fontWeight: '600' },

  btn: {
    backgroundColor: '#1B4F8A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#1B4F8A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  demoText: { fontSize: 12, color: '#92400E', fontWeight: '500' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  grayText: { fontSize: 14, color: '#6B7280' },
  linkText: { fontSize: 14, color: '#1B4F8A', fontWeight: '700' },
});
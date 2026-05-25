import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const SettingRow = ({
  icon,
  label,
  value,
  onPress,
  danger,
  right,
  colors,
}: any) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.rowLeft}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? '#EF4444' : colors.subtext}
      />

      <View>
        <Text
          style={[
            styles.rowLabel,
            {
              color: danger ? '#EF4444' : colors.text,
            },
          ]}
        >
          {label}
        </Text>

        {value ? (
          <Text
            style={[
              styles.rowValue,
              { color: colors.subtext },
            ]}
          >
            {value}
          </Text>
        ) : null}
      </View>
    </View>

    {right || (
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.subtext}
      />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();

  const {
    user,
    updateUser,
    deleteAccount,
  } = useApp();

  const [darkMode, setDarkMode] = React.useState(
  user?.darkMode ?? false
);

React.useEffect(() => {
  setDarkMode(user?.darkMode ?? false);
}, [user?.darkMode]);

  const [deleting, setDeleting] = useState(false);

  const isDark = darkMode;

  const colors = {
    background: isDark ? '#111827' : '#F5F7FA',
    card: isDark ? '#1F2937' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#111827',
    subtext: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#F3F4F6',
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Xoá tài khoản',
      'Bạn có chắc muốn xoá tài khoản? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              const ok = await deleteAccount();

              setDeleting(false);

              if (ok) {
                Alert.alert(
                  'Thành công',
                  'Tài khoản đã được xoá'
                );

                router.replace('/(auth)/sign-in');
              } else {
                Alert.alert(
                  'Lỗi',
                  'Không thể xoá tài khoản'
                );
              }
            } catch (error) {
              console.log(error);

              setDeleting(false);

              Alert.alert(
                'Lỗi',
                'Có lỗi xảy ra khi xoá tài khoản'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/settings');
  }
}}
          style={styles.backBtn}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Settings
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* USER CARD */}
      <View
        style={[
          styles.userCard,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigText}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>

        <View>
          <Text
            style={[
              styles.userName,
              {
                color: colors.text,
              },
            ]}
          >
            {user?.username || 'Người dùng'}
          </Text>

          <Text
            style={[
              styles.userEmail,
              {
                color: colors.subtext,
              },
            ]}
          >
            {user?.email || ''}
          </Text>
        </View>
      </View>

      {/* GENERAL */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.subtext,
            },
          ]}
        >
          GENERAL
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <SettingRow
            icon="language-outline"
            label="Language"
            value={user?.language || 'Tiếng Việt'}
            onPress={() =>
              router.push('/settings/language')
            }
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <SettingRow
            icon="cash-outline"
            label="Currency"
            value={
              user?.currency ||
              'VND — Vietnamese Đồng'
            }
            onPress={() =>
              router.push('/settings/currency')
            }
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <SettingRow
            icon="location-outline"
            label="Default location"
            value={
              user?.defaultLocation ||
              'Hồ Chí Minh'
            }
            onPress={() =>
              router.push('/settings/location')
            }
            colors={colors}
          />
        </View>
      </View>

      {/* APPEARANCE */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.subtext,
            },
          ]}
        >
          APPEARANCE
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="moon-outline"
                size={20}
                color={colors.subtext}
              />

              <Text
                style={[
                  styles.rowLabel,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Dark mode
              </Text>
            </View>

            <Switch
              value={darkMode}
              onValueChange={async v => {
  try {
    setDarkMode(v);

    await updateUser({
      darkMode: v,
    });

    console.log(
      'Dark mode updated:',
      v
    );
  } catch (error) {
    console.log(
      'Dark mode update error:',
      error
    );
  }
}}
              trackColor={{
                false: '#E5E7EB',
                true: '#1B4F8A',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <SettingRow
            icon="calendar-outline"
            label="Trip date format"
            value={
              user?.dateFormat || 'DD/MM/YYYY'
            }
            onPress={() =>
              router.push('/settings/dateformat')
            }
            colors={colors}
          />
        </View>
      </View>

      {/* SECURITY */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.subtext,
            },
          ]}
        >
          SECURITY
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <SettingRow
            icon="lock-closed-outline"
            label="Change password"
            onPress={() =>
              router.push('/settings/password')
            }
            colors={colors}
          />
        </View>
      </View>

      {/* DELETE BUTTON */}
      <TouchableOpacity
        style={[
          styles.deleteBtn,
          deleting && {
            opacity: 0.6,
          },
        ]}
        onPress={handleDeleteAccount}
        disabled={deleting}
      >
        <Text style={styles.deleteBtnText}>
          {deleting
            ? 'Đang xoá tài khoản...'
            : 'Delete account'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
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
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderBottomWidth: 1,
  },

  avatarBig: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B4F8A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarBigText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  userName: {
    fontSize: 17,
    fontWeight: '700',
  },

  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  rowValue: {
    fontSize: 12,
    marginTop: 1,
  },

  divider: {
    height: 1,
    marginLeft: 50,
  },

  deleteBtn: {
    marginHorizontal: 16,
    marginTop: 28,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },

  deleteBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
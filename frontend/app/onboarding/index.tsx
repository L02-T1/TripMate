import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    bg: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=85',
    icon: 'airplane',
    accentColor: '#4FC3F7',
    title: 'Chào mừng đến với\nTripMate!',
    desc: 'Lên kế hoạch du lịch và quản lý chi phí dễ dàng cùng nhóm bạn.',
  },
  {
    id: '2',
    bg: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=85',
    icon: 'people',
    accentColor: '#A5D6A7',
    title: 'Mời bạn bè tham gia\nchuyến đi',
    desc: 'Thêm đồng hành của bạn vào chuyến đi và quản lý chi tiêu chung.',
  },
  {
    id: '3',
    bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=85',
    icon: 'wallet',
    accentColor: '#FFCC80',
    title: 'Ghi chép mọi chi phí\ntiện lợi',
    desc: 'Tự động tính toán ai nợ ai bao nhiêu, chia đều hoặc theo tỷ lệ.',
  },
  {
    id: '4',
    bg: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=85',
    icon: 'calendar',
    accentColor: '#CE93D8',
    title: 'Lập kế hoạch chi tiết\nvà nhanh chóng',
    desc: 'Tạo lịch trình, đặt ngân sách và theo dõi tiến độ chuyến đi.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);
  const slide = SLIDES[current];

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    } else {
      AsyncStorage.setItem('tripmate_onboarding_done', 'true');
      router.replace('/(auth)/sign-in');
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx >= 0 && idx < SLIDES.length) setCurrent(idx);
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen swipeable slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={s => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={StyleSheet.absoluteFill}
        renderItem={({ item }) => (
          <ImageBackground
            source={{ uri: item.bg }}
            style={[styles.slide, { width }]}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            {/* Centered icon */}
            <View style={styles.iconArea}>
              <View style={[styles.iconRing, { borderColor: item.accentColor + '55' }]}>
                <View style={[styles.iconCircle, { backgroundColor: item.accentColor + '22' }]}>
                  <Ionicons name={item.icon as any} size={54} color={item.accentColor} />
                </View>
              </View>
            </View>
          </ImageBackground>
        )}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: statusBarHeight + 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoMini}>
            <Ionicons name="airplane" size={15} color="#fff" />
          </View>
          <Text style={styles.logoText}>TripMate</Text>
        </View>
        <TouchableOpacity
          style={styles.skipPill}
          onPress={() => { AsyncStorage.setItem('tripmate_onboarding_done', 'true'); router.replace('/(auth)/sign-in'); }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom content card */}
      <View style={styles.card}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === current
                  ? { width: 28, backgroundColor: '#fff' }
                  : { width: 8, backgroundColor: 'rgba(255,255,255,0.35)' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.accentColor }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {current < SLIDES.length - 1 ? '> Tiếp tục' : '> Bắt đầu'}
          </Text>
        </TouchableOpacity>

        <View style={styles.authRow}>
          <Text style={styles.authGray}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={[styles.authLink, { color: slide.accentColor }]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1B2A' },

  slide: { height, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.40)' },

  iconArea: {
    position: 'absolute',
    top: height * 0.26,
    alignSelf: 'center',
  },
  iconRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.4 },
  skipPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
  },
  skipText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,24,40,0.93)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },

  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  dot: { height: 8, borderRadius: 4 },

  title: {
    fontSize: 26, fontWeight: '800', color: '#fff',
    lineHeight: 34, marginBottom: 10, letterSpacing: 0.2,
  },
  desc: {
    fontSize: 15, color: 'rgba(255,255,255,0.68)',
    lineHeight: 22, marginBottom: 26,
  },

  nextBtn: {
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  authRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  authGray: { fontSize: 14, color: 'rgba(255,255,255,0.45)' },
  authLink: { fontSize: 14, fontWeight: '700' },
});

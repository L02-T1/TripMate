import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
  Animated, Dimensions, FlatList, ImageBackground,
  Platform, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: '1',
    bg: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=90',
    overlay: 'rgba(10,26,50,0.55)',
    accent: '#4FC3F7',
    accentDark: '#0277BD',
    icon: 'airplane' as const,
    badge: '✈️  DU LỊCH DỄ DÀNG HƠN',
    title: 'Chào mừng đến\nvới TripMate',
    desc: 'Ứng dụng lên kế hoạch du lịch và quản lý chi phí dành cho những chuyến đi nhóm hoàn hảo.',
    layout: 'center' as const,
    features: ['Lên kế hoạch chi tiết', 'Quản lý chi phí', 'Chia sẻ với bạn bè'],
  },
  {
    id: '2',
    bg: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&q=90',
    overlay: 'rgba(5,46,22,0.60)',
    accent: '#69F0AE',
    accentDark: '#00695C',
    icon: 'people' as const,
    badge: '👥  DU LỊCH CÙNG NHÓM',
    title: 'Kết nối &\nmời bạn đồng hành',
    desc: 'Tìm bạn bè qua số điện thoại hoặc email, chia sẻ link mời và cùng nhau lên kế hoạch.',
    layout: 'left' as const,
    stats: [
      { val: '1 giây', label: 'Mời thành viên' },
      { val: 'Realtime', label: 'Đồng bộ nhóm' },
      { val: 'Không giới hạn', label: 'Số thành viên' },
    ],
  },
  {
    id: '3',
    bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=90',
    overlay: 'rgba(50,20,5,0.62)',
    accent: '#FFD54F',
    accentDark: '#E65100',
    icon: 'wallet' as const,
    badge: '💰  QUẢN LÝ CHI PHÍ',
    title: 'Chia tiền\nchính xác & nhanh',
    desc: 'Ghi lại mọi khoản chi, tự động tính toán ai nợ ai bao nhiêu. Minh bạch 100%, không ai thiệt.',
    layout: 'right' as const,
    expense: {
      total: '4.800.000đ',
      items: [
        { name: '🍜 Bữa trưa', amount: '480.000đ', pct: 0.1 },
        { name: '🏨 Khách sạn', amount: '2.400.000đ', pct: 0.5 },
        { name: '🚌 Di chuyển', amount: '960.000đ', pct: 0.2 },
        { name: '🎡 Vui chơi', amount: '960.000đ', pct: 0.2 },
      ],
    },
  },
  {
    id: '4',
    bg: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=90',
    overlay: 'rgba(30,10,50,0.62)',
    accent: '#E040FB',
    accentDark: '#6A1B9A',
    icon: 'calendar' as const,
    badge: '📅  KẾ HOẠCH CHI TIẾT',
    title: 'Lịch trình\nhoàn hảo từng giờ',
    desc: 'Tạo lịch trình theo ngày, gán người phụ trách, đặt nhắc nhở. Chuyến đi được tổ chức như chuyên gia.',
    layout: 'timeline' as const,
    timeline: [
      { time: '07:00', name: 'Khởi hành từ TP.HCM', icon: 'airplane-outline', color: '#4FC3F7' },
      { time: '10:30', name: 'Check-in khách sạn', icon: 'home-outline', color: '#69F0AE' },
      { time: '14:00', name: 'Tham quan Hồ Xuân Hương', icon: 'camera-outline', color: '#FFD54F' },
      { time: '19:00', name: 'Ăn tối tại Trúc Lâm', icon: 'restaurant-outline', color: '#E040FB' },
    ],
  },
];

// ─── Slide 1: Center — hero welcome ──────────────────────────────────────────

function Slide1Content({ slide, anim }: { slide: typeof SLIDES[0]; anim: Animated.Value }) {
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const opacity = anim;
  return (
    <Animated.View style={[s1.wrap, { opacity, transform: [{ translateY }] }]}>
      {/* Giant icon ring */}
      <View style={[s1.ringOuter, { borderColor: slide.accent + '30' }]}>
        <View style={[s1.ringInner, { borderColor: slide.accent + '50' }]}>
          <View style={[s1.iconCircle, { backgroundColor: slide.accent + '20' }]}>
            <Ionicons name={slide.icon} size={60} color={slide.accent} />
          </View>
        </View>
      </View>
      {/* Feature pills */}
      <View style={s1.pillsRow}>
        {slide.features!.map((f, i) => (
          <View key={i} style={[s1.pill, { backgroundColor: slide.accent + '18', borderColor: slide.accent + '40' }]}>
            <Ionicons name="checkmark-circle" size={14} color={slide.accent} />
            <Text style={[s1.pillText, { color: slide.accent }]}>{f}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Slide 2: Left — group/member visual ─────────────────────────────────────

function Slide2Content({ slide, anim }: { slide: typeof SLIDES[1]; anim: Animated.Value }) {
  const opacity = anim;
  const names = ['Alex', 'Bảo', 'Cô', 'Minh', 'Lan'];
  const colors = ['#4FC3F7', '#69F0AE', '#FFD54F', '#E040FB', '#FF7043'];
  return (
    <Animated.View style={[s2.wrap, { opacity }]}>
      {/* Avatar cluster */}
      <View style={s2.avatarCluster}>
        {/* Center avatar */}
        <View style={[s2.avatarMain, { borderColor: slide.accent }]}>
          <Ionicons name="person" size={32} color="#fff" />
          <View style={[s2.avatarMainBadge, { backgroundColor: slide.accent }]}>
            <Ionicons name="star" size={10} color="#000" />
          </View>
        </View>
        {/* Surrounding avatars */}
        {names.slice(0, 4).map((n, i) => {
          const angles = [-60, 60, -120, 120];
          const radii = [70, 70, 70, 70];
          const angle = (angles[i] * Math.PI) / 180;
          const x = Math.cos(angle) * radii[i];
          const y = Math.sin(angle) * radii[i] * 0.55;
          return (
            <View key={n} style={[s2.avatarSm, {
              backgroundColor: colors[i] + '25',
              borderColor: colors[i],
              transform: [{ translateX: x }, { translateY: y }],
              position: 'absolute',
            }]}>
              <Text style={[s2.avatarSmText, { color: colors[i] }]}>{n[0]}</Text>
            </View>
          );
        })}
        {/* Invite ring pulse */}
        <View style={[s2.pulseRing, { borderColor: slide.accent + '25' }]} />
        <View style={[s2.pulseRing2, { borderColor: slide.accent + '12' }]} />
      </View>
      {/* Stats */}
      <View style={s2.statsRow}>
        {slide.stats!.map((st, i) => (
          <View key={i} style={[s2.statBox, { borderColor: slide.accent + '30', backgroundColor: slide.accent + '08' }]}>
            <Text style={[s2.statVal, { color: slide.accent }]}>{st.val}</Text>
            <Text style={s2.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Slide 3: Right — expense breakdown ──────────────────────────────────────

function Slide3Content({ slide, anim }: { slide: typeof SLIDES[2]; anim: Animated.Value }) {
  const opacity = anim;
  const [barAnims] = useState(() => slide.expense!.items.map(() => new Animated.Value(0)));

  useEffect(() => {
    const animations = barAnims.map((a, i) =>
      Animated.timing(a, {
        toValue: slide.expense!.items[i].pct,
        duration: 700,
        delay: i * 120 + 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <Animated.View style={[s3.wrap, { opacity }]}>
      {/* Card */}
      <View style={[s3.card, { borderColor: slide.accent + '25', backgroundColor: 'rgba(255,255,255,0.06)' }]}>
        <View style={s3.cardHeader}>
          <Text style={s3.cardTitle}>Tổng chi phí</Text>
          <Text style={[s3.cardTotal, { color: slide.accent }]}>{slide.expense!.total}</Text>
        </View>
        {slide.expense!.items.map((item, i) => (
          <View key={i} style={s3.expRow}>
            <Text style={s3.expName}>{item.name}</Text>
            <View style={s3.expBarWrap}>
              <Animated.View style={[s3.expBar, {
                width: barAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                backgroundColor: slide.accent,
                opacity: 0.7 + (i * 0.075),
              }]} />
            </View>
            <Text style={[s3.expAmt, { color: slide.accent }]}>{item.amount}</Text>
          </View>
        ))}
      </View>
      {/* Per person badge */}
      <View style={[s3.perPersonBadge, { backgroundColor: slide.accent + '15', borderColor: slide.accent + '40' }]}>
        <Ionicons name="people-outline" size={16} color={slide.accent} />
        <Text style={[s3.perPersonText, { color: slide.accent }]}>
          Mỗi người: <Text style={{ fontWeight: '900' }}>1.200.000đ</Text>
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Slide 4: Timeline ────────────────────────────────────────────────────────

function Slide4Content({ slide, anim }: { slide: typeof SLIDES[3]; anim: Animated.Value }) {
  const opacity = anim;
  const rowAnims = slide.timeline!.map((_, i) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [30 + i * 10, 0] })
  );
  return (
    <Animated.View style={[s4.wrap, { opacity }]}>
      {slide.timeline!.map((item, i) => (
        <Animated.View key={i} style={[s4.row, { transform: [{ translateY: rowAnims[i] }] }]}>
          {/* Time */}
          <Text style={s4.time}>{item.time}</Text>
          {/* Spine */}
          <View style={s4.spine}>
            <View style={[s4.spineDot, { backgroundColor: item.color }]} />
            {i < slide.timeline!.length - 1 && <View style={[s4.spineLine, { backgroundColor: item.color + '40' }]} />}
          </View>
          {/* Card */}
          <View style={[s4.itemCard, { borderColor: item.color + '35', backgroundColor: item.color + '10' }]}>
            <View style={[s4.itemIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
            </View>
            <Text style={[s4.itemName, { color: '#fff' }]}>{item.name}</Text>
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);
  const contentAnim = useRef(new Animated.Value(1)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[current];
  const statusBarH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

  // Animate content in on slide change
  const animateIn = () => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1, duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => { animateIn(); }, [current]);

  const pressBtnIn  = () => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start();
  const pressBtnOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

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

  const skipAll = () => {
    AsyncStorage.setItem('tripmate_onboarding_done', 'true');
    router.replace('/(auth)/sign-in');
  };

  const onMomentumScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx >= 0 && idx < SLIDES.length && idx !== current) setCurrent(idx);
  };

  const renderSlideContent = (s: typeof SLIDES[number]) => {
    switch (s.id) {
      case '1': return <Slide1Content slide={s as any} anim={contentAnim} />;
      case '2': return <Slide2Content slide={s as any} anim={contentAnim} />;
      case '3': return <Slide3Content slide={s as any} anim={contentAnim} />;
      case '4': return <Slide4Content slide={s as any} anim={contentAnim} />;
      default:  return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fullscreen swipeable backgrounds */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={s => s.id}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={StyleSheet.absoluteFill}
        renderItem={({ item }) => (
          <ImageBackground source={{ uri: item.bg }} style={[styles.slide, { width }]} resizeMode="cover">
            <View style={[styles.overlay, { backgroundColor: item.overlay }]} />
            {/* Mid-screen visual zone */}
            <View style={styles.visualZone}>
              {item.id === current + 1 + '' ? renderSlideContent(item) : null}
            </View>
          </ImageBackground>
        )}
      />

      {/* Active slide visual (positioned absolutely so it renders on top) */}
      <View style={styles.visualZoneAbs} pointerEvents="none">
        {renderSlideContent(slide)}
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: statusBarH + 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="airplane" size={14} color="#fff" />
          </View>
          <Text style={styles.logoText}>TripMate</Text>
        </View>
        <TouchableOpacity style={styles.skipPill} onPress={skipAll}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar (thin line style) */}
      <View style={[styles.progressBarWrap, { top: statusBarH + 60 }]}>
        {SLIDES.map((_, i) => (
          <View key={i} style={styles.progressSegmentWrap}>
            <View style={[
              styles.progressSegment,
              {
                backgroundColor: i <= current
                  ? slide.accent
                  : 'rgba(255,255,255,0.25)',
                opacity: i === current ? 1 : i < current ? 0.7 : 0.35,
              },
            ]} />
          </View>
        ))}
      </View>

      {/* Bottom card */}
      <View style={styles.card}>
        {/* Badge */}
        <Animated.View style={[styles.badge, {
          backgroundColor: slide.accent + '18',
          borderColor: slide.accent + '40',
          opacity: contentAnim,
        }]}>
          <Text style={[styles.badgeText, { color: slide.accent }]}>{slide.badge}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, {
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }]}>
          {slide.title}
        </Animated.Text>

        {/* Desc */}
        <Animated.Text style={[styles.desc, {
          opacity: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.72] }),
        }]}>
          {slide.desc}
        </Animated.Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => {
              listRef.current?.scrollToIndex({ index: i, animated: true });
              setCurrent(i);
            }}>
              <Animated.View style={[
                styles.dot,
                {
                  width: i === current ? 28 : 8,
                  backgroundColor: i === current ? slide.accent : 'rgba(255,255,255,0.3)',
                },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Start button */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.accent }]}
            onPress={goNext}
            onPressIn={pressBtnIn}
            onPressOut={pressBtnOut}
            activeOpacity={1}
          >
            <Text style={[styles.nextBtnText, { color: current === SLIDES.length - 1 ? '#000' : '#000' }]}>
              {current < SLIDES.length - 1 ? 'Tiếp tục →' : 'Bắt đầu ngay 🚀'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sign in link */}
        <View style={styles.signInRow}>
          <Text style={styles.signInGray}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
            <Text style={[styles.signInLink, { color: slide.accent }]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Slide-specific styles ────────────────────────────────────────────────────

const s1 = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 24 },
  ringOuter: { width: 160, height: 160, borderRadius: 80, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  ringInner: { width: 136, height: 136, borderRadius: 68, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  pillsRow: { gap: 8, alignItems: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: '600' },
});

const s2 = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 24 },
  avatarCluster: { width: 200, height: 160, justifyContent: 'center', alignItems: 'center' },
  avatarMain: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  avatarMainBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  avatarSm: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  avatarSmText: { fontSize: 15, fontWeight: '800' },
  pulseRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1 },
  pulseRing2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, gap: 3 },
  statVal: { fontSize: 13, fontWeight: '900' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
});

const s3 = StyleSheet.create({
  wrap: { width: width - 64, gap: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.5 },
  cardTotal: { fontSize: 18, fontWeight: '900' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expName: { fontSize: 13, color: 'rgba(255,255,255,0.85)', width: 96 },
  expBarWrap: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  expBar: { height: '100%', borderRadius: 3 },
  expAmt: { fontSize: 12, fontWeight: '700', width: 88, textAlign: 'right' },
  perPersonBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  perPersonText: { fontSize: 13 },
});

const s4 = StyleSheet.create({
  wrap: { width: width - 64, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  time: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '700', width: 44, marginTop: 10 },
  spine: { alignItems: 'center', paddingTop: 10, width: 20 },
  spineDot: { width: 10, height: 10, borderRadius: 5 },
  spineLine: { width: 2, flex: 1, minHeight: 20, marginTop: 3 },
  itemCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 10, borderWidth: 1, marginBottom: 6 },
  itemIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  itemName: { flex: 1, fontSize: 13, fontWeight: '600' },
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050D1A' },
  slide: { height, justifyContent: 'flex-start' },
  overlay: { ...StyleSheet.absoluteFillObject },
  visualZone: { position: 'absolute', top: height * 0.16, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 32 },
  visualZoneAbs: { position: 'absolute', top: height * 0.16, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 32 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 8, zIndex: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 },
  skipPill: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  skipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  progressBarWrap: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', gap: 5, zIndex: 10 },
  progressSegmentWrap: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressSegment: { flex: 1, height: '100%', borderRadius: 2 },
  card: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(5,13,26,0.94)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 42 : 26,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 14,
  },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 35, letterSpacing: 0.1 },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 7, borderRadius: 4 },
  nextBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  nextBtnText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 0.3 },
  signInRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signInGray: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  signInLink: { fontSize: 14, fontWeight: '700' },
});
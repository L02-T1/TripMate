import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const CATEGORY_COLORS: Record<string, string> = {
  'Chỗ ở': '#8B5CF6', 'Di chuyển': '#3B82F6', 'Ăn uống': '#EF4444',
  'Vui chơi': '#F59E0B', 'Mua sắm': '#10B981', 'Khác': '#6B7280',
};
const CATEGORY_ICONS: Record<string, any> = {
  'Chỗ ở': 'home', 'Di chuyển': 'car', 'Ăn uống': 'restaurant',
  'Vui chơi': 'game-controller', 'Mua sắm': 'bag-handle', 'Khác': 'pricetag',
};

function fmt(n: number) {
  if (!Number.isFinite(n)) return '—';
  return Math.abs(n).toLocaleString('vi-VN') + ' đ';
}

export default function ExpenseReportScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { getTrip } = useApp();
  const trip = getTrip(tripId!);

  if (!trip) return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
        <Text style={{ color: '#1B4F8A' }}>← Quay lại</Text>
      </TouchableOpacity>
      <Text style={{ textAlign: 'center', marginTop: 40, color: '#6B7280' }}>Không tìm thấy chuyến đi</Text>
    </SafeAreaView>
  );

  const total = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = trip.members.length > 0 ? total / trip.members.length : 0;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  trip.expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCats[0]?.[1] || 1;

  // Per member balance
  const memberBalance: Record<string, number> = {};
  const memberPaid: Record<string, number> = {};
  trip.members.forEach(m => { memberBalance[m.name.split(' ')[0]] = 0; memberPaid[m.name.split(' ')[0]] = 0; });

  trip.expenses.forEach(exp => {
    // paidBy có thể là firstName hoặc id — chuẩn hoá về firstName
    const paidByName = (() => {
      if (!exp.paidBy) return null;
      // Nếu là UUID (không có space, dài > 10 ký tự) → tìm theo id
      const byId = trip.members.find((m: any) => m.id === exp.paidBy || m._id === exp.paidBy);
      if (byId) return byId.name.split(' ')[0];
      // Nếu đã là firstName
      const byName = trip.members.find((m: any) => m.name.split(' ')[0] === exp.paidBy || m.name === exp.paidBy);
      if (byName) return byName.name.split(' ')[0];
      return exp.paidBy; // fallback
    })();

    if (!paidByName || !memberBalance.hasOwnProperty(paidByName)) return; // skip nếu không tìm thấy

    const parts = exp.participants?.length || trip.members.length;
    const share = exp.amount / Math.max(1, parts);

    memberBalance[paidByName] = (memberBalance[paidByName] || 0) + exp.amount;
    memberPaid[paidByName] = (memberPaid[paidByName] || 0) + exp.amount;

    // participants: chuẩn hoá về firstName, lọc bỏ null
    const participantNames: string[] = exp.participants?.length
      ? exp.participants
          .map((id: string) => {
            const byId = trip.members.find((m: any) => m.id === id || m._id === id);
            if (byId) return byId.name.split(' ')[0];
            const byName = trip.members.find((m: any) => m.name.split(' ')[0] === id || m.name === id);
            if (byName) return byName.name.split(' ')[0];
            return null;
          })
          .filter((n: string | null): n is string => !!n && memberBalance.hasOwnProperty(n))
      : trip.members.map((m: any) => m.name.split(' ')[0]);

    participantNames.forEach((name: string) => {
      memberBalance[name] = (memberBalance[name] || 0) - share;
    });
  });

  // Settlements via greedy matching
  const creds = Object.entries(memberBalance).filter(([, v]) => v > 0.5).map(([n, v]) => ({ name: n, val: v })).sort((a, b) => b.val - a.val);
  const debts = Object.entries(memberBalance).filter(([, v]) => v < -0.5).map(([n, v]) => ({ name: n, val: -v })).sort((a, b) => b.val - a.val);
  const settlements: { from: string; to: string; amount: number }[] = [];
  let ci = 0, di = 0;
  while (ci < creds.length && di < debts.length) {
    const amt = Math.min(creds[ci].val, debts[di].val);
    if (amt > 0.5) settlements.push({ from: debts[di].name, to: creds[ci].name, amount: Math.round(amt) });
    creds[ci].val -= amt; debts[di].val -= amt;
    if (creds[ci].val < 0.5) ci++;
    if (debts[di].val < 0.5) di++;
  }

  const handleShare = async () => {
    let text = `📊 TỔNG KẾT CHI PHÍ: ${trip.name}\n`;
    text += `──────────────────\n`;
    text += `💰 Tổng: ${fmt(total)}\n`;
    text += `👤 Mỗi người: ${fmt(Math.round(perPerson))}\n\n`;
    if (settlements.length > 0) {
      text += `💸 GIAO DỊCH CẦN THỰC HIỆN:\n`;
      settlements.forEach(st => {
        text += `  ${st.from} → ${st.to}: ${fmt(st.amount)}\n`;
      });
    } else {
      text += `✅ Không có khoản nợ nào!\n`;
    }
    await Share.share({ message: text, title: `TripMate: ${trip.name}` });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={s.title}>Tổng kết chia tiền</Text>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color="#1B4F8A" />
          <Text style={s.shareBtnText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Hero total */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>TỔNG CHI PHÍ CHUYẾN ĐI</Text>
          <Text style={s.totalAmount}>{fmt(total)}</Text>
          <View style={s.totalMeta}>
            <View style={s.totalMetaChip}>
              <Ionicons name="people-outline" size={13} color="#93C5FD" />
              <Text style={s.totalMetaText}>{trip.members.length} thành viên</Text>
            </View>
            <View style={s.totalMetaChip}>
              <Ionicons name="receipt-outline" size={13} color="#93C5FD" />
              <Text style={s.totalMetaText}>{trip.expenses.length} khoản chi</Text>
            </View>
          </View>
          <View style={s.perPersonBox}>
            <Text style={s.perPersonLabel}>Trung bình mỗi người</Text>
            <Text style={s.perPersonAmt}>{fmt(Math.round(perPerson))}</Text>
          </View>
        </View>

        {/* Category breakdown */}
        {sortedCats.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>BIỂU ĐỒ DANH MỤC</Text>
            {sortedCats.map(([cat, amt]) => (
              <View key={cat} style={s.catRow}>
                <View style={[s.catIconWrap, { backgroundColor: (CATEGORY_COLORS[cat] || '#6B7280') + '18' }]}>
                  <Ionicons name={CATEGORY_ICONS[cat] || 'pricetag'} size={14} color={CATEGORY_COLORS[cat] || '#6B7280'} />
                </View>
                <Text style={s.catName}>{cat}</Text>
                <View style={s.catBarWrap}>
                  <View style={[s.catBar, {
                    width: `${Math.round((amt / maxCat) * 100)}%` as any,
                    backgroundColor: CATEGORY_COLORS[cat] || '#6B7280',
                  }]} />
                </View>
                <Text style={s.catAmt}>{fmt(amt)}</Text>
                <Text style={s.catPct}>{Math.round(amt / total * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Per-member detail */}
        <View style={s.card}>
          <Text style={s.cardTitle}>CHI TIẾT TỪNG NGƯỜI</Text>
          {Object.entries(memberBalance).sort((a, b) => b[1] - a[1]).map(([name, bal]) => (
            <View key={name} style={s.memberBalRow}>
              <View style={[s.memberAv, bal > 0 ? s.memberAvPos : bal < -0.5 ? s.memberAvNeg : {}]}>
                <Text style={s.memberAvText}>{name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.memberBalName}>{name}</Text>
                <Text style={s.memberBalPaid}>Đã trả: {fmt(memberPaid[name] || 0)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.memberBalAmt, { color: !Number.isFinite(bal) ? '#9CA3AF' : bal >= 0 ? '#10B981' : '#EF4444' }]}>
                  {!Number.isFinite(bal) ? '—' : (bal >= 0 ? '+' : '') + fmt(Math.round(bal))}
                </Text>
                <Text style={s.memberBalStatus}>
                  {!Number.isFinite(bal) ? '—' : Math.abs(bal) < 0.5 ? '✅ Cân bằng' : bal > 0 ? '💚 Được nhận' : '🔴 Cần trả'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settlements */}
        {settlements.length > 0 ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>GIAO DỊCH CẦN THỰC HIỆN</Text>
            <Text style={s.cardSub}>Số giao dịch tối thiểu để cân bằng tất cả</Text>
            {settlements.map((st, i) => (
              <View key={i} style={s.settleRow}>
                <View style={[s.memberAv, s.memberAvNeg]}><Text style={s.memberAvText}>{st.from[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.settleName}><Text style={{ fontWeight: '700' }}>{st.from}</Text> trả cho <Text style={{ fontWeight: '700' }}>{st.to}</Text></Text>
                </View>
                <Text style={s.settleAmt}>{fmt(st.amount)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.settledCard}>
            <View style={s.settledIconWrap}>
              <Ionicons name="checkmark-circle" size={44} color="#10B981" />
            </View>
            <Text style={s.settledTitle}>Tất cả đã cân bằng!</Text>
            <Text style={s.settledSub}>Không có khoản nợ nào cần giải quyết.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#EFF6FF', borderRadius: 10 },
  shareBtnText: { fontSize: 13, color: '#1B4F8A', fontWeight: '700' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  totalCard: { backgroundColor: '#1B4F8A', borderRadius: 18, padding: 20, alignItems: 'center', gap: 8 },
  totalLabel: { fontSize: 10, color: '#93C5FD', fontWeight: '700', letterSpacing: 1.2 },
  totalAmount: { fontSize: 30, fontWeight: '900', color: '#fff' },
  totalMeta: { flexDirection: 'row', gap: 12 },
  totalMetaChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  totalMetaText: { fontSize: 12, color: '#93C5FD' },
  perPersonBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center', gap: 3, width: '100%' },
  perPersonLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  perPersonAmt: { fontSize: 18, fontWeight: '800', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1 },
  cardSub: { fontSize: 12, color: '#9CA3AF', marginTop: -6 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIconWrap: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catName: { width: 64, fontSize: 12, color: '#374151', fontWeight: '500' },
  catBarWrap: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: 5, minWidth: 4 },
  catAmt: { width: 80, fontSize: 11, color: '#6B7280', textAlign: 'right', fontWeight: '600' },
  catPct: { width: 30, fontSize: 11, color: '#9CA3AF', textAlign: 'right' },
  memberBalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  memberAv: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center' },
  memberAvPos: { backgroundColor: '#10B981' },
  memberAvNeg: { backgroundColor: '#EF4444' },
  memberAvText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  memberBalName: { fontSize: 14, fontWeight: '700', color: '#111' },
  memberBalPaid: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  memberBalAmt: { fontSize: 14, fontWeight: '800' },
  memberBalStatus: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  settleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  settleName: { fontSize: 13, color: '#374151' },
  settleAmt: { fontSize: 15, fontWeight: '800', color: '#EF4444' },
  settledCard: { alignItems: 'center', gap: 10, paddingVertical: 30, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  settledIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  settledTitle: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  settledSub: { fontSize: 13, color: '#6B7280' },
});
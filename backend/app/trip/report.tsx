import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';

const CATEGORY_COLORS: Record<string, string> = {
  'Chỗ ở': '#8B5CF6', 'Di chuyển': '#3B82F6', 'Ăn uống': '#EF4444',
  'Vui chơi': '#F59E0B', 'Mua sắm': '#10B981', 'Khác': '#6B7280',
};

function fmtMoney(n: number) {
  return Math.abs(n).toLocaleString('vi-VN') + 'k';
}

export default function ExpenseReportScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { getTrip } = useApp();
  const trip = getTrip(tripId!);

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
          <Text style={{ color: '#1B4F8A' }}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#6B7280' }}>Không tìm thấy chuyến đi</Text>
      </SafeAreaView>
    );
  }

  const total = trip.expenses.reduce((s, e) => s + e.amount, 0);

  // Category totals
  const categoryTotals: Record<string, number> = {};
  trip.expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Per member balance
  const memberBalance: Record<string, number> = {};
  trip.members.forEach(m => { memberBalance[m.name.split(' ')[0]] = 0; });

  trip.expenses.forEach(exp => {
    const parts = exp.participants?.length || trip.members.length;
    const share = exp.amount / Math.max(1, parts);
    // Payer gets credit
    memberBalance[exp.paidBy] = (memberBalance[exp.paidBy] || 0) + exp.amount;
    // Each participant owes share
    const participantNames = exp.participants?.length
      ? exp.participants.map(id => trip.members.find(m => m.id === id)?.name.split(' ')[0] || id)
      : trip.members.map(m => m.name.split(' ')[0]);
    participantNames.forEach(name => {
      memberBalance[name] = (memberBalance[name] || 0) - share;
    });
  });

  // Compute settlements
  const creditors = Object.entries(memberBalance).filter(([, v]) => v > 0.5).sort((a, b) => b[1] - a[1]);
  const debtors = Object.entries(memberBalance).filter(([, v]) => v < -0.5).sort((a, b) => a[1] - b[1]);

  const settlements: { from: string; to: string; amount: number }[] = [];
  const creds = creditors.map(([n, v]) => ({ name: n, val: v }));
  const debts = debtors.map(([n, v]) => ({ name: n, val: -v }));

  let ci = 0, di = 0;
  while (ci < creds.length && di < debts.length) {
    const amt = Math.min(creds[ci].val, debts[di].val);
    settlements.push({ from: debts[di].name, to: creds[ci].name, amount: Math.round(amt) });
    creds[ci].val -= amt;
    debts[di].val -= amt;
    if (creds[ci].val < 0.5) ci++;
    if (debts[di].val < 0.5) di++;
  }

  const maxCat = sortedCats[0]?.[1] || 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Tổng kết chia tiền</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportText}>Xuất</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Tổng chi phí chuyến đi</Text>
          <Text style={styles.totalAmount}>{total.toLocaleString('vi-VN')} đ</Text>
          <Text style={styles.totalSub}>
            {trip.members.length} thành viên · {trip.expenses.length} khoản chi
          </Text>
        </View>

        {/* Category chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BIỂU ĐỒ DANH MỤC</Text>
          {sortedCats.map(([cat, amt]) => (
            <View key={cat} style={styles.catRow}>
              <View style={styles.catLeft}>
                <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[cat] || '#6B7280' }]} />
                <Text style={styles.catName}>{cat}</Text>
              </View>
              <View style={styles.catBarWrap}>
                <View style={[styles.catBar, {
                  width: `${(amt / maxCat) * 100}%`,
                  backgroundColor: CATEGORY_COLORS[cat] || '#6B7280',
                }]} />
              </View>
              <Text style={styles.catAmt}>{fmtMoney(amt / 1000)}</Text>
            </View>
          ))}
        </View>

        {/* Per member balance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CHI TIẾT TỪNG NGƯỜI</Text>
          {Object.entries(memberBalance)
            .sort((a, b) => b[1] - a[1])
            .map(([name, bal]) => (
              <View key={name} style={styles.memberBalRow}>
                <View style={styles.memberAvSmall}>
                  <Text style={styles.memberAvText}>{name[0]}</Text>
                </View>
                <Text style={styles.memberBalName}>{name}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberBalPaid}>
                    Đã trả: {trip.expenses
                      .filter(e => e.paidBy === name)
                      .reduce((s, e) => s + e.amount, 0)
                      .toLocaleString('vi-VN')} đ
                  </Text>
                </View>
                <Text style={[
                  styles.memberBalAmt,
                  { color: bal >= 0 ? '#10B981' : '#EF4444' },
                ]}>
                  {bal >= 0 ? '+' : ''}{Math.round(bal).toLocaleString('vi-VN')} đ
                </Text>
              </View>
            ))}
        </View>

        {/* Settlements */}
        {settlements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>GIAO DỊCH CẦN THỰC HIỆN</Text>
            {settlements.map((s, i) => (
              <View key={i} style={styles.settlementRow}>
                <View style={styles.memberAvSmall}>
                  <Text style={styles.memberAvText}>{s.from[0]}</Text>
                </View>
                <Text style={styles.settleName}>{s.from}</Text>
                <Ionicons name="arrow-forward" size={16} color="#1B4F8A" />
                <View style={[styles.memberAvSmall, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.memberAvText}>{s.to[0]}</Text>
                </View>
                <Text style={styles.settleName}>{s.to}</Text>
                <Text style={styles.settleAmt}>{s.amount.toLocaleString('vi-VN')} đ</Text>
              </View>
            ))}
          </View>
        )}

        {settlements.length === 0 && (
          <View style={styles.settledCard}>
            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            <Text style={styles.settledTitle}>Tất cả đã thanh toán!</Text>
            <Text style={styles.settledSub}>Không có khoản nợ nào cần giải quyết.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  exportBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EFF6FF', borderRadius: 8 },
  exportText: { fontSize: 14, color: '#1B4F8A', fontWeight: '700' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  totalCard: {
    backgroundColor: '#1B4F8A', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6,
  },
  totalLabel: { fontSize: 12, color: '#93C5FD', fontWeight: '600', letterSpacing: 0.5 },
  totalAmount: { fontSize: 28, fontWeight: '800', color: '#fff' },
  totalSub: { fontSize: 13, color: '#CBD5E1' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 12, color: '#374151', fontWeight: '500' },
  catBarWrap: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: 5, minWidth: 4 },
  catAmt: { width: 52, fontSize: 12, color: '#6B7280', textAlign: 'right', fontWeight: '600' },
  memberBalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  memberAvSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center' },
  memberAvText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  memberBalName: { fontSize: 13, fontWeight: '600', color: '#111', width: 48 },
  memberBalPaid: { fontSize: 11, color: '#9CA3AF' },
  memberBalAmt: { fontSize: 14, fontWeight: '700' },
  settlementRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  settleName: { fontSize: 13, fontWeight: '600', color: '#111' },
  settleAmt: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '700', color: '#EF4444' },
  settledCard: { alignItems: 'center', gap: 8, paddingVertical: 24, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  settledTitle: { fontSize: 18, fontWeight: '700', color: '#10B981' },
  settledSub: { fontSize: 14, color: '#6B7280' },
});

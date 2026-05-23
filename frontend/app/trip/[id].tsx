import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, FlatList, Image, Modal, ScrollView,
  Share, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Activity, ChecklistItem, Expense, Member } from '../../types';

const TABS = ['Kế hoạch', 'Checklist', 'Chi phí', 'Nhóm'];

const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống': '#EF4444', 'Di chuyển': '#3B82F6', 'Chỗ ở': '#8B5CF6',
  'Vui chơi': '#F59E0B', 'Mua sắm': '#10B981', 'Khác': '#6B7280',
};
const CATEGORY_ICONS: Record<string, any> = {
  'Ăn uống': 'restaurant', 'Di chuyển': 'car', 'Chỗ ở': 'home',
  'Vui chơi': 'game-controller', 'Mua sắm': 'bag-handle', 'Khác': 'pricetag',
};
const ACT_TYPE_COLOR: Record<string, string> = {
  'Tham quan': '#3B82F6', 'Ăn uống': '#EF4444', 'Chỗ ở': '#8B5CF6',
  'Di chuyển': '#F59E0B', 'Mua sắm': '#10B981', 'Vui chơi': '#F97316',
};
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING: { label: 'SẮP TỚI',   color: '#F59E0B', bg: '#FEF3C7' },
  ONGOING:  { label: 'ĐANG ĐI',   color: '#3B82F6', bg: '#EFF6FF' },
  DONE:     { label: 'HOÀN THÀNH', color: '#10B981', bg: '#ECFDF5' },
};

function fmtMoney(n: number) { return Math.abs(n).toLocaleString('vi-VN') + ' đ'; }

/* ──────────────────── PLAN TAB ──────────────────── */
function PlanTab({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { getTrip, deleteActivity } = useApp();
  const trip = getTrip(tripId)!;

  const sorted = [...trip.activities].sort((a, b) => {
    const da = a.date.split('/').reverse().join('') + a.time;
    const db = b.date.split('/').reverse().join('') + b.time;
    return da.localeCompare(db);
  });

  const grouped: Record<string, Activity[]> = {};
  sorted.forEach(a => { (grouped[a.date] = grouped[a.date] || []).push(a); });
  const dates = Object.keys(grouped);

  if (!dates.length) return (
    <View style={s.emptyFull}>
      <View style={s.emptyIcon}><Ionicons name="calendar-outline" size={40} color="#9CA3AF" /></View>
      <Text style={s.emptyTitle}>Chưa có hoạt động nào</Text>
      <Text style={s.emptySub}>Nhấn + để thêm hoạt động đầu tiên</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      {dates.map(date => (
        <View key={date} style={{ marginBottom: 16 }}>
          <View style={s.dateBadge}>
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text style={s.dateHeader}>{date}</Text>
          </View>
          {grouped[date].map((act, i) => (
            <TouchableOpacity
              key={act.id}
              style={[s.actCard, i > 0 && { marginTop: 8 }]}
              onPress={() => router.push({ pathname: '/activity/[id]', params: { id: act.id, tripId, type: 'activity' } })}
              onLongPress={() => Alert.alert('Hoạt động', act.name, [
                { text: 'Sửa', onPress: () => router.push({ pathname: '/activity/[id]', params: { id: act.id, tripId, type: 'activity' } }) },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteActivity(tripId, act.id) },
                { text: 'Hủy', style: 'cancel' },
              ])}
            >
              <View style={s.actTimeBlock}>
                <Text style={s.actTime}>{act.time || '--:--'}</Text>
                <View style={[s.actDot, { backgroundColor: ACT_TYPE_COLOR[act.type?.[0]] || '#6B7280' }]} />
              </View>
              <View style={s.actBody}>
                <Text style={s.actName}>{act.name}</Text>
                {act.location ? (
                  <View style={s.actLocRow}>
                    <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                    <Text style={s.actLoc}>{act.location}</Text>
                  </View>
                ) : null}
                <View style={s.actTagsRow}>
                  {act.type?.map(t => (
                    <View key={t} style={[s.actTag, { backgroundColor: (ACT_TYPE_COLOR[t] || '#6B7280') + '18' }]}>
                      <Text style={[s.actTagText, { color: ACT_TYPE_COLOR[t] || '#6B7280' }]}>{t}</Text>
                    </View>
                  ))}
                  {act.participants?.length > 0 && (
                    <View style={s.actParticipants}>
                      <Ionicons name="people-outline" size={11} color="#9CA3AF" />
                      <Text style={s.actParticipantsText}>{act.participants.length}</Text>
                    </View>
                  )}
                </View>
                {act.note ? <Text style={s.actNote} numberOfLines={2}>{act.note}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

/* ──────────────────── CHECKLIST TAB ──────────────────── */
function ChecklistTab({ tripId }: { tripId: string }) {
  const { getTrip, updateChecklistItem, deleteChecklistItem } = useApp();
  const router = useRouter();
  const trip = getTrip(tripId)!;
  const [filter, setFilter] = useState<'all'|'shared'|'personal'|'todo'>('all');

  const all = trip.checklist;
  const items = filter === 'all' ? all : all.filter(c => c.category === filter);
  const done = all.filter(c => c.completed).length;
  const pct  = all.length ? Math.round(done / all.length * 100) : 0;

  const FILTERS = [
    { key: 'all',      label: `Tất cả (${all.length})` },
    { key: 'shared',   label: '🎒 Đồ chung' },
    { key: 'personal', label: '👤 Cá nhân' },
    { key: 'todo',     label: '✅ Việc làm' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={s.clTopBar}>
        <View style={s.clProgressRow}>
          <Text style={s.clProgressLabel}>
            Hoàn thành <Text style={{ color: '#1B4F8A', fontWeight: '700' }}>{done}/{all.length}</Text>
          </Text>
          <Text style={s.clPct}>{pct}%</Text>
        </View>
        <View style={s.clBarBg}><View style={[s.clBarFill, { width: `${pct}%` as any }]} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f.key}
                style={[s.filterChip, filter === f.key && s.filterChipActive]}
                onPress={() => setFilter(f.key as any)}>
                <Text style={[s.filterChipText, filter === f.key && s.filterChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <FlatList
        data={items} keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 8 }}
        ListEmptyComponent={
          <View style={s.emptyFull}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyTitle}>Không có mục nào</Text>
          </View>
        }
        renderItem={({ item }: { item: ChecklistItem }) => (
          <TouchableOpacity
            style={[s.clItem, item.completed && s.clItemDone]}
            onPress={() => router.push({ pathname: '/activity/[id]', params: { id: item.id, tripId, type: 'checklist' } })}
            onLongPress={() => Alert.alert(item.name, 'Chọn hành động', [
              { text: 'Xóa mục', style: 'destructive', onPress: () => deleteChecklistItem(tripId, item.id) },
              { text: 'Hủy', style: 'cancel' },
            ])}
          >
            <TouchableOpacity
              style={[s.clCheck, item.completed && s.clCheckDone]}
              onPress={() => updateChecklistItem(tripId, item.id, { completed: !item.completed })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[s.clName, item.completed && s.clNameDone]}>{item.name}</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                {item.assignee ? <Text style={s.clMetaText}>{item.assignee}</Text> : null}
                {item.dueDate  ? <Text style={s.clMetaText}>· {item.dueDate}</Text>  : null}
              </View>
            </View>
            <View style={[s.clCatBadge, {
              backgroundColor: item.category === 'shared' ? '#FEE2E2' : item.category === 'personal' ? '#DBEAFE' : '#D1FAE5',
            }]}>
              <Text style={[s.clCatText, {
                color: item.category === 'shared' ? '#DC2626' : item.category === 'personal' ? '#2563EB' : '#059669',
              }]}>
                {item.category === 'shared' ? 'Chung' : item.category === 'personal' ? 'Cá nhân' : 'Việc làm'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ──────────────────── EXPENSES TAB ──────────────────── */
function ExpensesTab({ tripId }: { tripId: string }) {
  const { getTrip, deleteExpense } = useApp();
  const router = useRouter();
  const trip = getTrip(tripId)!;
  const total     = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = trip.members.length > 0 ? total / trip.members.length : 0;

  const grouped: Record<string, Expense[]> = {};
  [...trip.expenses].sort((a, b) => b.date.localeCompare(a.date))
    .forEach(e => { (grouped[e.date] = grouped[e.date] || []).push(e); });

  return (
    <View style={{ flex: 1 }}>
      <View style={s.expTopBar}>
        <TouchableOpacity style={s.reportBtn}
          onPress={() => router.push({ pathname: '/trip/report', params: { tripId } })}>
          <Ionicons name="bar-chart-outline" size={16} color="#1B4F8A" />
          <Text style={s.reportBtnText}>Xem tổng kết & chia tiền</Text>
          <Ionicons name="chevron-forward" size={14} color="#1B4F8A" />
        </TouchableOpacity>
        <View style={s.expSummary}>
          <View style={s.expSummaryItem}>
            <Text style={s.expSummaryVal}>{fmtMoney(total)}</Text>
            <Text style={s.expSummaryLabel}>Tổng chi phí</Text>
          </View>
          <View style={s.expSummaryDivider} />
          <View style={s.expSummaryItem}>
            <Text style={s.expSummaryVal}>{fmtMoney(Math.round(perPerson))}</Text>
            <Text style={s.expSummaryLabel}>Mỗi người</Text>
          </View>
          <View style={s.expSummaryDivider} />
          <View style={s.expSummaryItem}>
            <Text style={s.expSummaryVal}>{trip.expenses.length}</Text>
            <Text style={s.expSummaryLabel}>Khoản chi</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {trip.expenses.length === 0 ? (
          <View style={s.emptyFull}>
            <Ionicons name="wallet-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyTitle}>Chưa có khoản chi nào</Text>
            <Text style={s.emptySub}>Nhấn + để thêm chi phí</Text>
          </View>
        ) : Object.entries(grouped).map(([date, exps]) => (
          <View key={date} style={{ marginBottom: 12 }}>
            <View style={s.dateBadge}>
              <Ionicons name="calendar-outline" size={13} color="#6B7280" />
              <Text style={s.dateHeader}>{date}</Text>
            </View>
            {exps.map((item, i) => (
              <TouchableOpacity key={item.id}
                style={[s.expCard, i > 0 && { marginTop: 8 }]}
                onPress={() => router.push({ pathname: '/activity/[id]', params: { id: item.id, tripId, type: 'expense' } })}
                onLongPress={() => Alert.alert(item.name, fmtMoney(item.amount), [
                  { text: 'Xóa', style: 'destructive', onPress: () => deleteExpense(tripId, item.id) },
                  { text: 'Hủy', style: 'cancel' },
                ])}>
                <View style={[s.expIconWrap, { backgroundColor: (CATEGORY_COLORS[item.category] || '#6B7280') + '18' }]}>
                  <Ionicons name={CATEGORY_ICONS[item.category] || 'pricetag'} size={20} color={CATEGORY_COLORS[item.category] || '#6B7280'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expName}>{item.name}</Text>
                  <Text style={s.expMeta}>{item.paidBy} · {item.splitType === 'equal' ? `Chia đều ${item.participants?.length || trip.members.length} người` : 'Chi tiết'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.expAmt}>-{fmtMoney(item.amount)}</Text>
                  <Text style={s.expPerPerson}>{fmtMoney(Math.round(item.amount / Math.max(1, item.participants?.length || trip.members.length)))}/người</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ──────────────────── MEMBERS TAB ──────────────────── */
function MembersTab({ tripId }: { tripId: string }) {
  const { getTrip, removeMember, promoteMember } = useApp();
  const router = useRouter();
  const trip = getTrip(tripId)!;
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteCode = (trip as any).inviteCode || tripId.slice(-6).toUpperCase();
  const inviteLink = `tripmate.app/join/${inviteCode}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleShare = async () => {
    await Share.share({
      message: `Tham gia chuyến đi "${trip.name}" cùng tôi trên TripMate!\nMã mời: ${inviteCode}\nLink: ${inviteLink}`,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Invite banner */}
      <View style={s.inviteBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ gap: 3 }}>
            <Text style={s.inviteTitleText}>MÃ MỜI CHUYẾN ĐI</Text>
            <Text style={s.inviteCodeText}>{inviteCode}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={s.inviteActionBtn} onPress={handleCopy}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={15} color={copied ? '#10B981' : '#fff'} />
              <Text style={[s.inviteActionTxt, copied && { color: '#10B981' }]}>{copied ? 'Đã sao chép' : 'Sao chép'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.inviteActionBtn, s.inviteShareBtn]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={15} color="#1B4F8A" />
              <Text style={s.inviteShareTxt}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={s.inviteHint}>Chia sẻ mã này để mời thêm thành viên tham gia</Text>
      </View>

      {/* Members header */}
      <View style={s.membersTopBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.membersTripName}>{trip.name}</Text>
          <Text style={s.membersMeta}>{trip.members.length} thành viên · {trip.startDate} – {trip.endDate}</Text>
        </View>
        <TouchableOpacity style={s.addMemberBtn}
          onPress={() => router.push({ pathname: '/activity/[id]', params: { id: 'new', tripId, type: 'member' } })}>
          <Ionicons name="person-add-outline" size={16} color="#1B4F8A" />
          <Text style={s.addMemberTxt}>Thêm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trip.members} keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={s.emptyFull}>
            <Ionicons name="people-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyTitle}>Chưa có thành viên</Text>
          </View>
        }
        renderItem={({ item }: { item: Member }) => {
          const paid = trip.expenses
            .filter(e => e.paidBy === item.name.split(' ')[0] || (e as any).paidById === item.id)
            .reduce((sum, e) => sum + e.amount, 0);
          return (
            <TouchableOpacity style={s.memberCard} onPress={() => setSelectedMember(item)} activeOpacity={0.8}>
              <View style={[s.memberAvatar, item.role === 'leader' && s.memberAvatarLeader]}>
                <Text style={s.memberAvatarText}>{item.initials.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <Text style={s.memberName}>{item.name}</Text>
                  {item.role === 'leader' && (
                    <View style={s.leaderBadge}>
                      <Ionicons name="star" size={9} color="#92400E" />
                      <Text style={s.leaderBadgeText}>Trưởng nhóm</Text>
                    </View>
                  )}
                </View>
                <Text style={s.memberPhone}>{item.phone}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.memberPaidAmt}>{paid > 0 ? fmtMoney(paid) : '—'}</Text>
                <Text style={s.memberPaidLabel}>đã trả</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Action sheet */}
      <Modal visible={!!selectedMember} transparent animationType="slide" onRequestClose={() => setSelectedMember(null)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setSelectedMember(null)}>
          <View style={s.actionSheet}>
            {selectedMember && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 16 }}>
                  <View style={[s.memberAvatar, selectedMember.role === 'leader' && s.memberAvatarLeader]}>
                    <Text style={s.memberAvatarText}>{selectedMember.initials.slice(0, 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#111' }}>{selectedMember.name}</Text>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{selectedMember.phone}</Text>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 }} />
                {selectedMember.role !== 'leader' && (
                  <TouchableOpacity style={s.sheetItem} onPress={() => { promoteMember(tripId, selectedMember.id); setSelectedMember(null); }}>
                    <View style={[s.sheetIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="star-outline" size={18} color="#F59E0B" /></View>
                    <Text style={s.sheetLabel}>Đặt làm trưởng nhóm</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={s.sheetItem} onPress={() => {
                  setSelectedMember(null);
                  setTimeout(() => Share.share({ message: `Mời ${selectedMember.name} vào chuyến "${trip.name}"!\nLink: ${inviteLink}` }), 300);
                }}>
                  <View style={[s.sheetIcon, { backgroundColor: '#F0F9FF' }]}><Ionicons name="share-social-outline" size={18} color="#0284C7" /></View>
                  <Text style={s.sheetLabel}>Gửi link mời</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.sheetItem} onPress={() => {
                  Alert.alert('Xác nhận', `Xoá ${selectedMember.name} khỏi nhóm?`, [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xoá', style: 'destructive', onPress: () => { removeMember(tripId, selectedMember.id); setSelectedMember(null); } },
                  ]);
                }}>
                  <View style={[s.sheetIcon, { backgroundColor: '#FEE2E2' }]}><Ionicons name="person-remove-outline" size={18} color="#EF4444" /></View>
                  <Text style={[s.sheetLabel, { color: '#EF4444' }]}>Xoá khỏi nhóm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.sheetCancel} onPress={() => setSelectedMember(null)}>
                  <Text style={{ fontSize: 15, color: '#374151', fontWeight: '600' }}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ──────────────────── MAIN SCREEN ──────────────────── */
export default function TripDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTrip, deleteTrip, refreshTrips } = useApp();
  const [tab, setTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const trip = getTrip(id!);

  if (!trip) return (
    <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
      <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
      <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>Không tìm thấy chuyến đi</Text>
      <TouchableOpacity onPress={() => router.back()}
        style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#1B4F8A', borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Quay lại</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const statusCfg  = STATUS_CONFIG[trip.status] || STATUS_CONFIG.UPCOMING;
  const totalCost  = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const doneCheck  = trip.checklist.filter(c => c.completed).length;

  const handleFab = () => {
    const types = ['activity', 'checklist', 'expense', 'member'];
    router.push({ pathname: '/activity/[id]', params: { id: 'new', tripId: id, type: types[tab] } });
  };

  const handleMenu = () => Alert.alert(trip.name, 'Chọn hành động', [
    { text: '🔄 Làm mới dữ liệu', onPress: async () => { setRefreshing(true); await refreshTrips(); setRefreshing(false); } },
    { text: '🗑 Xóa chuyến đi', style: 'destructive', onPress: () =>
        Alert.alert('Xác nhận xóa', 'Dữ liệu sẽ bị xóa vĩnh viễn. Tiếp tục?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: () => { deleteTrip(id!); router.replace('/(tabs)/trips'); } },
        ]) },
    { text: 'Hủy', style: 'cancel' },
  ]);

  return (
    <View style={s.safe}>
      {/* ── Hero banner ── */}
      <View style={s.hero}>
        <Image source={{ uri: trip.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' }}
          style={s.heroImg} resizeMode="cover" />
        <View style={s.heroOverlay} />
        <SafeAreaView style={s.heroTopBar} edges={['top']}>
          <TouchableOpacity style={s.heroBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.heroBtn} onPress={handleMenu}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={s.heroContent}>
          <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[s.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          <Text style={s.heroTitle} numberOfLines={2}>{trip.name}</Text>
          <View style={{ gap: 4, marginBottom: 12 }}>
            <View style={s.heroMetaItem}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={s.heroMetaText}>{trip.startDate} – {trip.endDate}</Text>
            </View>
            <View style={s.heroMetaItem}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={s.heroMetaText}>{trip.destinations?.join(', ') || 'Chưa xác định'}</Text>
            </View>
          </View>
          <View style={s.heroStats}>
            {[
              { val: fmtMoney(totalCost), lbl: 'Tổng chi' },
              { val: String(trip.members.length), lbl: 'Thành viên' },
              { val: String(trip.activities.length), lbl: 'Hoạt động' },
              { val: `${doneCheck}/${trip.checklist.length}`, lbl: 'Checklist' },
            ].map((item, i, arr) => (
              <React.Fragment key={item.lbl}>
                <View style={s.heroStatItem}>
                  <Text style={s.heroStatVal} numberOfLines={1}>{item.val}</Text>
                  <Text style={s.heroStatLabel}>{item.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={s.heroStatDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[s.tabItem, tab === i && s.tabItemActive]} onPress={() => setTab(i)}>
            <Text style={[s.tabText, tab === i && s.tabTextActive]}>{t}</Text>
            {i === 1 && trip.checklist.length > 0 && (
              <View style={[s.tabBadge, { backgroundColor: doneCheck === trip.checklist.length ? '#10B981' : '#F59E0B' }]}>
                <Text style={s.tabBadgeText}>{doneCheck}/{trip.checklist.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1 }}>
        {tab === 0 && <PlanTab       tripId={id!} />}
        {tab === 1 && <ChecklistTab  tripId={id!} />}
        {tab === 2 && <ExpensesTab   tripId={id!} />}
        {tab === 3 && <MembersTab    tripId={id!} />}
      </View>

      {/* ── FAB ── */}
      <TouchableOpacity style={s.fab} onPress={handleFab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────── STYLES ──────────────────── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  hero: { height: 260, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroTopBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 12, padding: 10 },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 12, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tabItem: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent', position: 'relative' },
  tabItemActive: { borderBottomColor: '#1B4F8A' },
  tabText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  tabTextActive: { color: '#1B4F8A', fontWeight: '700' },
  tabBadge: { position: 'absolute', top: 6, right: 2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center', shadowColor: '#1B4F8A', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  // Plan
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  dateHeader: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  actCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  actTimeBlock: { alignItems: 'center', gap: 6, width: 44 },
  actTime: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  actDot: { width: 8, height: 8, borderRadius: 4 },
  actBody: { flex: 1, gap: 4 },
  actName: { fontSize: 15, fontWeight: '700', color: '#111' },
  actLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actLoc: { fontSize: 12, color: '#9CA3AF', flex: 1 },
  actTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  actTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  actTagText: { fontSize: 11, fontWeight: '600' },
  actParticipants: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#F3F4F6', borderRadius: 8 },
  actParticipantsText: { fontSize: 11, color: '#9CA3AF' },
  actNote: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 },
  // Checklist
  clTopBar: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10 },
  clProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clProgressLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  clPct: { fontSize: 16, fontWeight: '800', color: '#1B4F8A' },
  clBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  clBarFill: { height: '100%', backgroundColor: '#1B4F8A', borderRadius: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#1B4F8A' },
  filterChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterChipTextActive: { color: '#1B4F8A', fontWeight: '700' },
  clItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  clItemDone: { opacity: 0.65 },
  clCheck: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  clCheckDone: { backgroundColor: '#1B4F8A', borderColor: '#1B4F8A' },
  clName: { fontSize: 14, fontWeight: '600', color: '#111' },
  clNameDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  clMetaText: { fontSize: 12, color: '#9CA3AF' },
  clCatBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  clCatText: { fontSize: 11, fontWeight: '700' },
  // Expenses
  expTopBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', padding: 16, gap: 12 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#BFDBFE' },
  reportBtnText: { flex: 1, fontSize: 14, color: '#1B4F8A', fontWeight: '600' },
  expSummary: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  expSummaryItem: { flex: 1, alignItems: 'center' },
  expSummaryVal: { fontSize: 13, fontWeight: '800', color: '#1B4F8A' },
  expSummaryLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  expSummaryDivider: { width: 1, backgroundColor: '#E5E7EB' },
  expCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  expIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  expName: { fontSize: 14, fontWeight: '700', color: '#111' },
  expMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  expAmt: { fontSize: 15, fontWeight: '800', color: '#EF4444' },
  expPerPerson: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  // Members
  inviteBanner: { backgroundColor: '#1B4F8A', padding: 16, gap: 8 },
  inviteTitleText: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 1 },
  inviteCodeText: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 5 },
  inviteActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10 },
  inviteActionTxt: { fontSize: 12, color: '#fff', fontWeight: '600' },
  inviteShareBtn: { backgroundColor: '#fff' },
  inviteShareTxt: { fontSize: 12, color: '#1B4F8A', fontWeight: '700' },
  inviteHint: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  membersTopBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  membersTripName: { fontSize: 15, fontWeight: '700', color: '#111' },
  membersMeta: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#BFDBFE' },
  addMemberTxt: { fontSize: 13, color: '#1B4F8A', fontWeight: '700' },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  memberAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1B4F8A', justifyContent: 'center', alignItems: 'center' },
  memberAvatarLeader: { backgroundColor: '#F59E0B' },
  memberAvatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#111' },
  leaderBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  leaderBadgeText: { fontSize: 10, color: '#92400E', fontWeight: '600' },
  memberPhone: { fontSize: 12, color: '#6B7280' },
  memberPaidAmt: { fontSize: 13, fontWeight: '700', color: '#1B4F8A' },
  memberPaidLabel: { fontSize: 10, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  actionSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, gap: 2 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  sheetIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sheetLabel: { fontSize: 15, color: '#111', fontWeight: '500' },
  sheetCancel: { marginTop: 8, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  // Empty states
  emptyFull: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  emptySub: { fontSize: 13, color: '#9CA3AF' },
});

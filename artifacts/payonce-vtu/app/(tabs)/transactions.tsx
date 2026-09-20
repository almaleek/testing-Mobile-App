import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, Header, TransactionItem } from '@/src/components/UI';
import { useApp } from '@/src/context/AppContext';
import { TransactionStatus } from '@/src/types';
import colors from '@/constants/colors';
const C = colors.light;
const tabs: Array<{ label: string; value: TransactionStatus | 'all' }> = [{ label: 'All', value: 'all' }, { label: 'Successful', value: 'successful' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }];

export default function TransactionsScreen() {
  const { transactions } = useApp();
  const [filter, setFilter] = useState<TransactionStatus | 'all'>('all');
  const visible = filter === 'all' ? transactions : transactions.filter((item) => item.status === filter);
  return <Screen style={styles.screen}><Header title="Activity" subtitle={`${transactions.length} transactions`} right={<Pressable style={styles.search}><Text>⌕</Text></Pressable>} /><View style={styles.tabs}>{tabs.map((tab) => <Pressable key={tab.value} onPress={() => setFilter(tab.value)} style={[styles.tab, filter === tab.value && styles.activeTab]}><Text style={[styles.tabText, filter === tab.value && styles.activeTabText]}>{tab.label}</Text></Pressable>)}</View>{visible.length ? visible.map((item) => <TransactionItem key={item.id} item={item} onPress={() => router.push(`/transaction/${item.id}`)} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>No {filter} transactions</Text><Text style={styles.emptyBody}>Your activity will appear here when you make a payment.</Text></View>}</Screen>;
}
const styles = StyleSheet.create({ screen: { paddingHorizontal: 20 }, search: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }, tabs: { backgroundColor: C.muted, borderRadius: 14, padding: 4, flexDirection: 'row', marginBottom: 20 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 }, activeTab: { backgroundColor: C.card }, tabText: { color: C.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 }, activeTabText: { color: C.primary, fontFamily: 'Inter_700Bold' }, empty: { alignItems: 'center', paddingTop: 100 }, emptyTitle: { fontFamily: 'Inter_700Bold', color: C.foreground, fontSize: 17 }, emptyBody: { color: C.mutedForeground, textAlign: 'center', maxWidth: 240, lineHeight: 20, marginTop: 8, fontFamily: 'Inter_400Regular', fontSize: 13 } });
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Header, Screen } from '@/src/components/UI';
import { useApp } from '@/src/context/AppContext';
import colors from '@/constants/colors';
const C = colors.light;
const tones = { green: '#188B62', blue: C.primary, orange: '#B4770B' };

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useApp();
  return <Screen><Header title="Notifications" onBack={() => router.back()} right={<Pressable onPress={() => notifications.forEach((item) => markNotificationRead(item.id))}><Text style={styles.mark}>Mark all read</Text></Pressable>} />{notifications.map((item) => <Pressable key={item.id} onPress={() => markNotificationRead(item.id)} style={[styles.item, !item.read && styles.unread]}><View style={[styles.icon, { backgroundColor: `${tones[item.tone]}18` }]}><Feather name={item.icon as keyof typeof Feather.glyphMap} size={18} color={tones[item.tone]} /></View><View style={styles.copy}><View style={styles.titleRow}><Text style={styles.title}>{item.title}</Text>{!item.read ? <View style={styles.dot} /> : null}</View><Text style={styles.body}>{item.body}</Text><Text style={styles.time}>{item.time}</Text></View></Pressable>)}</Screen>;
}
const styles = StyleSheet.create({ mark: { color: C.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 }, item: { padding: 15, borderRadius: 18, backgroundColor: C.card, flexDirection: 'row', marginBottom: 10, borderWidth: 1, borderColor: '#F0F3F7' }, unread: { backgroundColor: '#F5F8FF', borderColor: '#E3ECFF' }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, marginLeft: 12 }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, title: { color: C.foreground, fontFamily: 'Inter_700Bold', fontSize: 13 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }, body: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 18, fontSize: 12, marginTop: 5 }, time: { color: '#A7B1C0', fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 8 } });
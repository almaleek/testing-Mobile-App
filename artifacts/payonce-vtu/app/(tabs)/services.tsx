import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, Header, ServiceIcon } from '@/src/components/UI';
import { serviceMeta } from '@/src/data';
import { ServiceType } from '@/src/types';
import colors from '@/constants/colors';
const C = colors.light;
const serviceTypes: ServiceType[] = ['airtime', 'data', 'electricity', 'tv', 'education'];

export default function ServicesScreen() {
  return <Screen style={styles.screen}><Header title="Services" subtitle="What would you like to do?" right={<View style={styles.demo}><Text style={styles.demoText}>Demo</Text></View>} /><Text style={styles.intro}>Everything you need to stay connected and on top of your bills.</Text><View style={styles.list}>{serviceTypes.map((type) => { const item = serviceMeta[type]; return <Pressable key={type} onPress={() => router.push(`/service/${type}`)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><ServiceIcon type={type} size={54} /><View style={styles.copy}><Text style={styles.label}>{item.label}</Text><Text style={styles.description}>{item.description}</Text></View><View style={styles.arrow}><Text style={styles.arrowText}>›</Text></View></Pressable>; })}</View><Text style={styles.note}>Prototype data only. No real bills or payments will be processed.</Text></Screen>;
}
const styles = StyleSheet.create({ screen: { paddingHorizontal: 20 }, intro: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 21, fontSize: 14, marginBottom: 22 }, list: { gap: 12 }, card: { backgroundColor: C.card, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F3F7' }, copy: { flex: 1, marginLeft: 14 }, label: { color: C.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }, description: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 4, maxWidth: 220 }, arrow: { width: 28, height: 28, borderRadius: 10, backgroundColor: C.muted, alignItems: 'center', justifyContent: 'center' }, arrowText: { color: C.primary, fontSize: 22, lineHeight: 24 }, pressed: { opacity: .74 }, demo: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: C.secondary }, demoText: { color: C.primary, fontSize: 10, fontFamily: 'Inter_700Bold' }, note: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', marginTop: 25, lineHeight: 17 } });
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/src/context/AppContext';
import { Button } from '@/src/components/UI';
import colors from '@/constants/colors';

const C = colors.light;
const slides = [
  { eyebrow: 'PAY BILLS. LIVE EASY.', title: 'Your everyday payments, simplified.', body: 'Airtime, data, electricity and more — all in one secure wallet.', icon: 'zap' as const },
  { eyebrow: 'BUILT FOR YOU', title: 'Everything you need, right here.', body: 'Top up your line or settle bills in a few taps, whenever you need it.', icon: 'grid' as const },
  { eyebrow: 'ALWAYS IN CONTROL', title: 'See every naira at a glance.', body: 'Track your spending, fund your wallet and stay on top of your transactions.', icon: 'bar-chart-2' as const },
];

export default function IntroScreen() {
  const { hasSeenIntro, setHasSeenIntro } = useApp();
  const [page, setPage] = useState<number>(hasSeenIntro ? 2 : 0);
  const insets = useSafeAreaInsets();
  const slide = slides[page];
  const finish = () => { setHasSeenIntro(true); router.replace('/login'); };
  return <View style={[styles.container, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 18 }]}>
    <View style={styles.top}><View style={styles.brand}><View style={styles.logo}><Feather name="zap" color="#fff" size={16} /></View><Text style={styles.brandText}>payonce</Text></View><Pressable onPress={finish}><Text style={styles.skip}>Skip</Text></Pressable></View>
    <View style={styles.illustration}><View style={styles.orbitOne} /><View style={styles.orbitTwo} /><View style={styles.illustrationCore}><Feather name={slide.icon} size={66} color={C.primary} /></View><View style={styles.sparkOne}><Feather name="star" size={18} color="#F4A340" /></View><View style={styles.sparkTwo}><Feather name="plus" size={21} color="#24A88A" /></View></View>
    <View style={styles.copy}><Text style={styles.eyebrow}>{slide.eyebrow}</Text><Text style={styles.title}>{slide.title}</Text><Text style={styles.body}>{slide.body}</Text></View>
    <View><View style={styles.dots}>{slides.map((_, index) => <View key={index} style={[styles.dot, page === index && styles.activeDot]} />)}</View><Button label={page === slides.length - 1 ? 'Get started' : 'Continue'} onPress={() => page === slides.length - 1 ? finish() : setPage((current) => current + 1)} /><Pressable onPress={() => router.replace('/(tabs)')} style={styles.demoLink}><Text style={styles.demoText}>Explore demo</Text><Feather name="arrow-up-right" size={15} color={C.primary} /></Pressable></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logo: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary }, brandText: { color: C.foreground, fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 }, skip: { color: C.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 13 },
  illustration: { height: 290, alignItems: 'center', justifyContent: 'center', position: 'relative' }, orbitOne: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: '#DCE8FF' }, orbitTwo: { position: 'absolute', width: 166, height: 166, borderRadius: 83, borderWidth: 1, borderColor: '#E8F0FF' }, illustrationCore: { width: 120, height: 120, borderRadius: 38, backgroundColor: '#E8F0FF', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] }, sparkOne: { position: 'absolute', top: 40, right: 42 }, sparkTwo: { position: 'absolute', bottom: 38, left: 42 }, copy: { alignItems: 'center', paddingHorizontal: 8, marginBottom: 20 }, eyebrow: { color: C.primary, fontSize: 11, letterSpacing: 1.6, fontFamily: 'Inter_700Bold', marginBottom: 12 }, title: { color: C.foreground, fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, textAlign: 'center', letterSpacing: -1 }, body: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 15, maxWidth: 300 }, dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 22 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D9E1EC' }, activeDot: { width: 22, backgroundColor: C.primary }, demoLink: { height: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }, demoText: { color: C.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
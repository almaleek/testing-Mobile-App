import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/src/context/AppContext';
import { formatNaira, serviceMeta } from '@/src/data';
import { PromotionModal, Screen, SectionTitle, ServiceIcon, TransactionItem, UrgentMessage, WalletCard } from '@/src/components/UI';
import colors from '@/constants/colors';
const C = colors.light;

const quickServices = [
  { type: 'airtime' as const, label: 'Airtime' },
  { type: 'data' as const, label: 'Data' },
  { type: 'electricity' as const, label: 'Electricity' },
  { type: 'tv' as const, label: 'TV' },
  { type: 'education' as const, label: 'Education' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { balance, balanceVisible, toggleBalance, transactions, unreadCount } = useApp();
  const [promotionVisible, setPromotionVisible] = React.useState<boolean>(true);
  return <Screen style={{ paddingTop: insets.top + 10 }}>
    <View style={styles.top}><View><Text style={styles.greeting}>Good morning,</Text><Text style={styles.name}>Sodiq <Text style={styles.wave}>✦</Text></Text></View><View style={styles.topActions}><Pressable onPress={() => router.push('/notifications')} style={styles.action}><Feather name="bell" size={20} color={C.foreground} />{unreadCount > 0 ? <View style={styles.badge} /> : null}</Pressable><Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}><Text style={styles.avatarText}>AS</Text></Pressable></View></View>
    <WalletCard balance={balance} visible={balanceVisible} onToggle={toggleBalance} onFund={() => router.push('/fund-wallet')} />
    <UrgentMessage title="Electricity payments may take longer today" body="AEDC maintenance could delay token delivery. We'll keep you updated." onPress={() => Alert.alert('Provider maintenance', 'AEDC payments may take longer than usual today. Your wallet will be updated if a payment is delayed.')} />
    <SectionTitle title="Quick services" action="See all" onAction={() => router.push('/(tabs)/services')} />
    <View style={styles.serviceGrid}>{quickServices.map((service) => <Pressable key={service.type} onPress={() => router.push(`/service/${service.type}`)} style={({ pressed }) => [styles.quickItem, pressed && styles.pressed]}><ServiceIcon type={service.type} size={46} /><Text style={styles.quickLabel}>{service.label}</Text></Pressable>) }<Pressable onPress={() => router.push('/(tabs)/services')} style={styles.quickItem}><View style={styles.moreIcon}><Feather name="more-horizontal" size={22} color={C.mutedForeground} /></View><Text style={styles.quickLabel}>More</Text></Pressable></View>
    <View style={styles.promo}><View style={styles.promoCopy}><Text style={styles.promoEyebrow}>PAYONCE PERKS</Text><Text style={styles.promoTitle}>Get 5% back on your next data purchase.</Text><Pressable onPress={() => router.push('/service/data')}><Text style={styles.promoLink}>Buy data <Feather name="arrow-up-right" size={13} color="#fff" /></Text></Pressable></View><View style={styles.promoShape}><Feather name="wifi" size={52} color="#BFD3FF" /></View></View>
    <SectionTitle title="Recent transactions" action="View all" onAction={() => router.push('/(tabs)/transactions')} />
    {transactions.slice(0, 4).map((item) => <TransactionItem key={item.id} item={item} onPress={() => router.push(`/transaction/${item.id}`)} />)}
    <PromotionModal visible={promotionVisible} onClose={() => setPromotionVisible(false)} onAction={() => { setPromotionVisible(false); router.push('/service/data'); }} />
  </Screen>;
}
const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, greeting: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }, name: { color: C.foreground, fontFamily: 'Inter_700Bold', fontSize: 25, marginTop: 5 }, wave: { color: '#F4A340', fontSize: 18 }, topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 }, action: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', position: 'relative' }, badge: { position: 'absolute', right: 11, top: 10, width: 7, height: 7, backgroundColor: '#E7474B', borderRadius: 4, borderWidth: 1, borderColor: C.card }, avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#DCE8FF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: C.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }, serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 26 }, quickItem: { width: '16%', alignItems: 'center', minWidth: 52 }, quickLabel: { color: C.foreground, fontFamily: 'Inter_500Medium', fontSize: 10, marginTop: 8, textAlign: 'center' }, moreIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: C.muted, alignItems: 'center', justifyContent: 'center' }, promo: { height: 132, backgroundColor: C.primary, borderRadius: 22, marginBottom: 27, padding: 18, overflow: 'hidden', flexDirection: 'row' }, promoCopy: { flex: 1 }, promoEyebrow: { color: '#BFD3FF', letterSpacing: 1.2, fontSize: 9, fontFamily: 'Inter_700Bold' }, promoTitle: { color: '#fff', fontSize: 16, lineHeight: 21, fontFamily: 'Inter_700Bold', maxWidth: 190, marginTop: 9 }, promoLink: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 10 }, promoShape: { width: 98, height: 98, borderRadius: 49, backgroundColor: '#255FDC', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', transform: [{ rotate: '-15deg' }] }, pressed: { opacity: .72 } });

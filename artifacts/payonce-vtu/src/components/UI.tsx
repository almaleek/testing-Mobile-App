import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { formatNaira, serviceMeta } from '../data';
import { ServiceType, Transaction } from '../types';

const C = colors.light;

export function Screen({ children, scroll = true, style }: { children: React.ReactNode; scroll?: boolean; style?: object }) {
  const insets = useSafeAreaInsets();
  const Wrapper = scroll ? require('react-native').ScrollView : View;
  return <Wrapper style={[styles.screen, style]} contentContainerStyle={scroll ? { paddingBottom: insets.bottom + 28 } : undefined} showsVerticalScrollIndicator={false}>{children}</Wrapper>;
}

export function Header({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  return <View style={styles.header}>
    {onBack ? <Pressable onPress={onBack} style={styles.iconButton} accessibilityLabel="Go back"><Feather name="arrow-left" size={21} color={C.foreground} /></Pressable> : <View style={{ width: 42 }} />}
    <View style={styles.headerCopy}><Text style={styles.headerTitle}>{title}</Text>{subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}</View>
    {right || <View style={{ width: 42 }} />}
  </View>;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, icon }: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; loading?: boolean; icon?: keyof typeof Feather.glyphMap }) {
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, variant === 'secondary' && styles.secondaryButton, variant === 'ghost' && styles.ghostButton, (disabled || loading) && styles.disabledButton, pressed && styles.pressed]} testID={`button-${label}`}>
    {loading ? <ActivityIndicator color={variant === 'primary' ? C.primaryForeground : C.primary} /> : <>{icon ? <Feather name={icon} size={17} color={variant === 'primary' ? C.primaryForeground : C.primary} /> : null}<Text style={[styles.buttonText, variant !== 'primary' && styles.secondaryButtonText]}>{label}</Text></>}
  </Pressable>;
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} placeholderTextColor={C.mutedForeground} style={[styles.field, props.multiline && { minHeight: 104, textAlignVertical: 'top' }, error && styles.fieldError]} /><>{error ? <Text style={styles.errorText}>{error}</Text> : null}</></View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionHeading}>{title}</Text>{action ? <Pressable onPress={onAction}><Text style={styles.linkText}>{action}</Text></Pressable> : null}</View>;
}

export function ServiceIcon({ type, size = 44 }: { type: ServiceType | string; size?: number }) {
  const meta = serviceMeta[type as ServiceType] || { icon: 'circle', color: C.primary };
  return <View style={[styles.serviceIcon, { width: size, height: size, borderRadius: size / 3, backgroundColor: `${meta.color}18` }]}><Feather name={meta.icon as keyof typeof Feather.glyphMap} size={size * .45} color={meta.color} /></View>;
}

export function WalletCard({ balance, visible, onToggle, onFund }: { balance: number; visible: boolean; onToggle: () => void; onFund: () => void }) {
  return <View style={styles.walletCard}>
    <View style={styles.walletTop}><View><Text style={styles.walletLabel}>Wallet balance</Text><View style={styles.balanceLine}><Text style={styles.balance}>{visible ? formatNaira(balance) : '••••••••'}</Text><Pressable onPress={onToggle} style={styles.eyeButton} accessibilityLabel="Toggle wallet balance"><Feather name={visible ? 'eye' : 'eye-off'} size={18} color="#C7D7FF" /></Pressable></View></View><View style={styles.walletMark}><Feather name="zap" size={18} color={C.primary} /></View></View>
    <View style={styles.walletBottom}><Text style={styles.walletHint}>Available to spend</Text><Pressable onPress={onFund} style={styles.fundButton}><Feather name="plus" size={14} color={C.primary} /><Text style={styles.fundText}>Fund wallet</Text></Pressable></View>
  </View>;
}

export function TransactionItem({ item, onPress }: { item: Transaction; onPress?: () => void }) {
  const statusColor = item.status === 'successful' ? '#188B62' : item.status === 'pending' ? '#B4770B' : C.destructive;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.transactionItem, pressed && styles.pressed]}><ServiceIcon type={item.icon} size={40} /><View style={styles.transactionMiddle}><Text style={styles.transactionName}>{item.service}</Text><Text style={styles.transactionMeta}>{item.description} · {item.time}</Text></View><View style={styles.transactionRight}><Text style={styles.transactionAmount}>-{formatNaira(item.amount)}</Text><Text style={[styles.status, { color: statusColor }]}>{item.status}</Text></View></Pressable>;
}

export function ResultCard({ status, title, body, reference, onDone }: { status: 'successful' | 'pending' | 'failed'; title: string; body: string; reference: string; onDone: () => void }) {
  const isSuccess = status === 'successful';
  const color = isSuccess ? '#188B62' : status === 'pending' ? '#B4770B' : C.destructive;
  const icon = isSuccess ? 'check' : status === 'pending' ? 'clock' : 'x';
  return <Screen scroll={false} style={styles.resultScreen}><View style={styles.resultContent}><View style={[styles.resultIcon, { backgroundColor: `${color}18` }]}><Feather name={icon} size={42} color={color} /></View><Text style={styles.resultTitle}>{title}</Text><Text style={styles.resultBody}>{body}</Text><View style={styles.reference}><Text style={styles.referenceLabel}>Transaction reference</Text><Text style={styles.referenceValue}>{reference}</Text></View></View><View style={styles.resultActions}><Button label="Done" onPress={onDone} /><Button label="Share receipt" onPress={() => {}} variant="secondary" icon="share-2" /></View></Screen>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background, paddingHorizontal: 20 },
  header: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { flex: 1, alignItems: 'center' }, headerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: C.foreground }, headerSubtitle: { color: C.mutedForeground, fontSize: 12, marginTop: 3, fontFamily: 'Inter_400Regular' },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card }, pressed: { opacity: .72 }, 
  button: { minHeight: 54, borderRadius: 17, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 20 }, buttonText: { color: C.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }, secondaryButton: { backgroundColor: C.secondary }, secondaryButtonText: { color: C.primary }, ghostButton: { backgroundColor: 'transparent' }, disabledButton: { opacity: .45 },
  fieldWrap: { marginBottom: 18 }, fieldLabel: { color: C.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 8 }, field: { height: 52, backgroundColor: C.card, borderColor: C.input, borderWidth: 1, borderRadius: 15, paddingHorizontal: 16, fontFamily: 'Inter_400Regular', color: C.foreground, fontSize: 15 }, fieldError: { borderColor: C.destructive }, errorText: { color: C.destructive, fontSize: 12, marginTop: 6, fontFamily: 'Inter_500Medium' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, sectionHeading: { fontFamily: 'Inter_700Bold', color: C.foreground, fontSize: 17 }, linkText: { color: C.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  walletCard: { backgroundColor: C.primary, borderRadius: 25, padding: 21, marginBottom: 26, shadowColor: C.primary, shadowOpacity: .18, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5 }, walletTop: { flexDirection: 'row', justifyContent: 'space-between' }, walletLabel: { color: '#C7D7FF', fontFamily: 'Inter_500Medium', fontSize: 12 }, balanceLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }, balance: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 27 }, eyeButton: { padding: 4 }, walletMark: { width: 38, height: 38, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, walletBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 }, walletHint: { color: '#C7D7FF', fontFamily: 'Inter_400Regular', fontSize: 12 }, fundButton: { backgroundColor: '#fff', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', gap: 5, alignItems: 'center' }, fundText: { color: C.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  serviceIcon: { alignItems: 'center', justifyContent: 'center' }, transactionItem: { backgroundColor: C.card, borderRadius: 17, padding: 13, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F3F7' }, transactionMiddle: { flex: 1, marginLeft: 12 }, transactionName: { color: C.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 }, transactionMeta: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 }, transactionRight: { alignItems: 'flex-end' }, transactionAmount: { color: C.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 12 }, status: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 4, textTransform: 'capitalize' },
  resultScreen: { justifyContent: 'space-between', paddingTop: 70, paddingBottom: 30 }, resultContent: { alignItems: 'center' }, resultIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, resultTitle: { color: C.foreground, fontFamily: 'Inter_700Bold', fontSize: 26, textAlign: 'center' }, resultBody: { color: C.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 290, marginTop: 10 }, reference: { backgroundColor: C.card, borderRadius: 16, padding: 17, width: '100%', alignItems: 'center', marginTop: 32 }, referenceLabel: { color: C.mutedForeground, fontSize: 11, fontFamily: 'Inter_400Regular' }, referenceValue: { color: C.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 6 }, resultActions: { gap: 10 },
});
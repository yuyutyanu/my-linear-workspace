import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useAppStore } from '@/stores/appStore';

export default function DetailsScreen() {
  const visits = useAppStore((state) => state.visits);
  const params = useLocalSearchParams();
  const qrParams = Object.entries(params).filter(([, value]) => typeof value === 'string' && value);

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Details</Text>
        <Text style={styles.description}>
          This route demonstrates file-based navigation from src/app/index.tsx to
          src/app/details.tsx.
        </Text>
        <Text style={styles.counter}>Zustand visits: {visits}</Text>
        {qrParams.length > 0 ? (
          <View style={styles.payloadCard}>
            <Text style={styles.payloadTitle}>QR payload</Text>
            {qrParams.map(([key, value]) => (
              <Text key={key} style={styles.payloadText}>
                {key}: {value}
              </Text>
            ))}
          </View>
        ) : null}
        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Back home</Text>
          </Pressable>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
  },
  description: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  counter: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  payloadCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    gap: 6,
    padding: 16,
  },
  payloadTitle: {
    color: '#075985',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  payloadText: {
    color: '#0f172a',
    fontSize: 14,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

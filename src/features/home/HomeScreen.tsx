import { Link } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useAppStore } from '@/stores/appStore';

export function HomeScreen() {
  const { data } = useHealthCheck();
  const visits = useAppStore((state) => state.visits);
  const incrementVisits = useAppStore((state) => state.incrementVisits);

  useEffect(() => {
    incrementVisits();
  }, [incrementVisits]);

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Expo Router + TypeScript</Text>
        <Text style={styles.title}>Chanu app foundation</Text>
        <Text style={styles.description}>
          Core tooling is configured with Expo Router, TypeScript, ESLint, Prettier, Zustand,
          TanStack Query, and EXPO_PUBLIC environment variables.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>API URL: {data?.apiUrl}</Text>
          <Text style={styles.cardText}>App visits in store: {visits}</Text>
        </View>
        <View style={styles.actions}>
          <Link href="/scan" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Scan app QR code</Text>
            </Pressable>
          </Link>
          <Link href="/details" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Go to details</Text>
            </Pressable>
          </Link>
        </View>
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
  eyebrow: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    gap: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  cardText: {
    color: '#334155',
    fontSize: 14,
  },
  actions: {
    gap: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#2563eb',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
});

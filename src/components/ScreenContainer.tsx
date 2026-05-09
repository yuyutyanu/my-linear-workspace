import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export function ScreenContainer({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
});

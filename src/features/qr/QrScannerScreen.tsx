import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { parseQrPayload } from '@/lib/qrPayload';

type ScanStatus =
  | {
      type: 'idle';
      message: string;
    }
  | {
      type: 'success';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

export function QrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanPaused, setIsScanPaused] = useState(false);
  const [status, setStatus] = useState<ScanStatus>({
    type: 'idle',
    message: 'QRコードを枠内に合わせてください。',
  });

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (isScanPaused) {
      return;
    }

    setIsScanPaused(true);
    const parseResult = parseQrPayload(data);

    if (!parseResult.ok) {
      setStatus({ type: 'error', message: parseResult.message });
      return;
    }

    setStatus({
      type: 'success',
      message: `QRコードを読み取りました。${parseResult.value.displayTarget} に移動します。`,
    });
    router.push(parseResult.value.href);
  };

  const retryScan = () => {
    setStatus({ type: 'idle', message: 'QRコードを枠内に合わせてください。' });
    setIsScanPaused(false);
  };

  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContent}>
          <Text style={styles.lightTitle}>カメラを準備しています</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContent}>
          <Text style={styles.lightTitle}>カメラ権限が必要です</Text>
          <Text style={styles.lightDescription}>
            QRコードを読み取るためにカメラへのアクセスを許可してください。
          </Text>
          <Pressable style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>カメラを許可する</Text>
          </Pressable>
          <Link href="/" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>ホームへ戻る</Text>
            </Pressable>
          </Link>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        facing="back"
        onBarcodeScanned={isScanPaused ? undefined : handleBarcodeScanned}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>QRコードをスキャン</Text>
          <Text style={styles.description}>
            アプリ用Deep LinkまたはJSON Payloadを含むQRコードを読み取ります。
          </Text>
        </View>
        <View style={styles.scanFrame} />
        <View style={[styles.statusCard, statusStyles[status.type]]}>
          <Text style={styles.statusText}>{status.message}</Text>
          {isScanPaused ? (
            <Pressable style={styles.primaryButton} onPress={retryScan}>
              <Text style={styles.primaryButtonText}>もう一度スキャンする</Text>
            </Pressable>
          ) : null}
          <Link href="/" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>キャンセル</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const statusStyles: Record<ScanStatus['type'], { backgroundColor: string }> = {
  idle: { backgroundColor: 'rgba(37, 99, 235, 0.9)' },
  success: { backgroundColor: 'rgba(22, 163, 74, 0.92)' },
  error: { backgroundColor: 'rgba(220, 38, 38, 0.92)' },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#020617',
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 40,
    paddingTop: 64,
  },
  centeredContent: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.84)',
    borderRadius: 20,
    gap: 8,
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  lightTitle: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    color: '#dbeafe',
    fontSize: 15,
    lineHeight: 22,
  },
  lightDescription: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
  },
  scanFrame: {
    alignSelf: 'center',
    borderColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 4,
    height: 260,
    width: 260,
  },
  statusCard: {
    borderRadius: 20,
    gap: 12,
    padding: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

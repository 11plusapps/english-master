import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '../context/SubscriptionContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

export default function DevSettingsScreen({ navigation }) {
  const { isPremium, unlockPremium, lockPremium } = useSubscription();

  const togglePremium = async (value) => {
    if (value) {
      await unlockPremium();
      Alert.alert('Premium Unlocked! 🎉', 'All premium features are now available for testing.');
    } else {
      await lockPremium();
      Alert.alert('Premium Locked 🔒', 'Premium features are now locked for testing the free experience.');
    }
  };

  const clearAllProgress = async () => {
    Alert.alert(
      'Clear All Progress?',
      'This will reset all learned words and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success!', 'All progress has been cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear progress: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const viewStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      
      let dataString = 'Storage Data:\n\n';
      items.forEach(([key, value]) => {
        dataString += `${key}: ${value}\n`;
      });
      
      Alert.alert('AsyncStorage Data', dataString);
    } catch (error) {
      Alert.alert('Error', 'Failed to read storage: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.home} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>⚙️ Developer Settings</Text>
              <Text style={styles.subtitle}>Testing & Debug Tools</Text>
            </View>

            {/* Premium Status Card */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Premium Status</Text>
                <View style={[styles.badge, isPremium ? styles.badgePremium : styles.badgeFree]}>
                  <Text style={styles.badgeText}>
                    {isPremium ? '👑 Premium' : '🆓 Free'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable Premium Features</Text>
                <Switch
                  value={isPremium}
                  onValueChange={togglePremium}
                  trackColor={{ false: colors.gray300, true: colors.success }}
                  thumbColor={isPremium ? colors.white : colors.gray400}
                />
              </View>

              <Text style={styles.helpText}>
                Toggle this to test premium vs free user experience
              </Text>
            </Card>

            {/* Current Access Card */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Current Access</Text>
              
              <View style={styles.accessList}>
                <View style={styles.accessItem}>
                  <Text style={styles.accessIcon}>📚</Text>
                  <Text style={styles.accessText}>
                    Learning Categories: {isPremium ? 'All Unlocked' : '1 Free + Rest Locked'}
                  </Text>
                </View>

                <View style={styles.accessItem}>
                  <Text style={styles.accessIcon}>🎯</Text>
                  <Text style={styles.accessText}>
                    Practice Categories: {isPremium ? 'All Unlocked' : '1 Free + Rest Locked'}
                  </Text>
                </View>

                <View style={styles.accessItem}>
                  <Text style={styles.accessIcon}>🎲</Text>
                  <Text style={styles.accessText}>
                    Mixed Practice: {isPremium ? '✅ Unlocked' : '🔒 Locked'}
                  </Text>
                </View>

                <View style={styles.accessItem}>
                  <Text style={styles.accessIcon}>🎮</Text>
                  <Text style={styles.accessText}>
                    Fun Games: {isPremium ? '✅ Unlocked' : '🔒 Locked'}
                  </Text>
                </View>

                <View style={styles.accessItem}>
                  <Text style={styles.accessIcon}>🎓</Text>
                  <Text style={styles.accessText}>
                    Mock Tests: {isPremium ? '✅ Unlocked' : '🔒 Locked'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Debug Tools Card */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Debug Tools</Text>
              
              <Button
                variant="primary"
                onPress={viewStorageData}
                style={styles.debugButton}
              >
                📊 View Storage Data
              </Button>

              <Button
                variant="error"
                onPress={clearAllProgress}
                style={styles.debugButton}
              >
                🗑️ Clear All Progress
              </Button>
            </Card>

            {/* Info Card */}
            <Card style={[styles.card, styles.infoCard]}>
              <Text style={styles.infoTitle}>ℹ️ Testing Tips</Text>
              <Text style={styles.infoText}>
                • Toggle premium ON to test all features{'\n'}
                • Toggle premium OFF to test free user flow{'\n'}
                • Clear progress to test fresh install{'\n'}
                • View storage to debug data issues{'\n'}
                • Remember to set premium to FALSE before production!
              </Text>
            </Card>

            {/* Warning Card */}
            <Card style={[styles.card, styles.warningCard]}>
              <Text style={styles.warningTitle}>⚠️ Important</Text>
              <Text style={styles.warningText}>
                This screen is for development/testing only. Remove this screen before releasing to production!
              </Text>
            </Card>

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  badgePremium: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  badgeFree: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray300,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  switchLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
  },
  helpText: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    fontStyle: 'italic',
  },
  accessList: {
    gap: spacing.sm,
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  accessIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  accessText: {
    fontSize: fontSize.base,
    color: colors.gray700,
    flex: 1,
  },
  debugButton: {
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.base,
    color: colors.gray700,
    lineHeight: 24,
  },
  warningCard: {
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fb923c',
  },
  warningTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ea580c',
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.base,
    color: colors.gray700,
    lineHeight: 24,
  },
});

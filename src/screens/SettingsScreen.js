import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Card from '../components/Card';
import Button from '../components/Button';
import { storage } from '../utils/storage';
import { useSubscription } from '../context/SubscriptionContext';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

export default function SettingsScreen({ navigation }) {
  const { isPremium } = useSubscription();
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [autoPlayVoiceover, setAutoPlayVoiceover] = useState(true);
  const [timedQuizSeconds, setTimedQuizSeconds] = useState(30);
  const [mockTestMinutes, setMockTestMinutes] = useState(15);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storage.getSettings();
      
      if (settings.voiceoverEnabled !== undefined) {
        setVoiceoverEnabled(settings.voiceoverEnabled);
      }
      if (settings.autoPlayVoiceover !== undefined) {
        setAutoPlayVoiceover(settings.autoPlayVoiceover);
      }
      if (settings.timedQuizSeconds !== undefined) {
        setTimedQuizSeconds(settings.timedQuizSeconds);
      }
      if (settings.mockTestMinutes !== undefined) {
        setMockTestMinutes(settings.mockTestMinutes);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handlePremiumToggle = (value) => {
    if (value && !isPremium) {
      // Navigate to subscription screen
      navigation.navigate('Subscription');
    }
  };

  const handleVoiceoverToggle = async (value) => {
    setVoiceoverEnabled(value);
    
    const settings = await storage.getSettings();
    settings.voiceoverEnabled = value;
    await storage.saveSettings(settings);
    
    // If turning off, also stop any current speech
    if (!value) {
      Speech.stop();
    }
  };

  const handleAutoPlayToggle = async (value) => {
    setAutoPlayVoiceover(value);
    
    const settings = await storage.getSettings();
    settings.autoPlayVoiceover = value;
    await storage.saveSettings(settings);
  };

  const handleTimedQuizSecondsChange = async (value) => {
    setTimedQuizSeconds(value);
    
    const settings = await storage.getSettings();
    settings.timedQuizSeconds = value;
    await storage.saveSettings(settings);
  };

  const handleMockTestMinutesChange = async (value) => {
    setMockTestMinutes(value);
    
    const settings = await storage.getSettings();
    settings.mockTestMinutes = value;
    await storage.saveSettings(settings);
  };

  const testVoiceover = () => {
    if (voiceoverEnabled) {
      Speech.speak('This is a test of the voiceover feature', {
        language: 'en-AU',
        pitch: 1.0,
        rate: 0.9,
      });
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
              <Text style={styles.emoji}>⚙️</Text>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>Customize your learning experience</Text>
            </View>

            {/* Subscription Status Card */}
            <Card style={styles.settingsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Subscription</Text>
                <View style={[styles.badge, isPremium ? styles.badgePremium : styles.badgeFree]}>
                  <Text style={styles.badgeText}>
                    {isPremium ? '👑 Premium' : '🆓 Free'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Premium Access</Text>
                  <Text style={styles.settingDescription}>
                    {isPremium ? 'You have full access to all features' : 'Upgrade to unlock all features'}
                  </Text>
                </View>
                <Switch
                  value={isPremium}
                  onValueChange={handlePremiumToggle}
                  trackColor={{ false: colors.gray300, true: colors.success }}
                  thumbColor={isPremium ? colors.white : colors.gray400}
                  disabled={isPremium}
                />
              </View>

              {!isPremium && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.upgradeButtonGradient}
                  >
                    <Text style={styles.upgradeButtonText}>🚀 Upgrade to Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Card>

            {/* Audio Settings Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>🔊 Audio Settings</Text>
              
              {/* Voiceover Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Voiceover</Text>
                  <Text style={styles.settingDescription}>
                    Turn on/off voice pronunciation for words
                  </Text>
                </View>
                <Switch
                  value={voiceoverEnabled}
                  onValueChange={handleVoiceoverToggle}
                  trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                  thumbColor={voiceoverEnabled ? colors.primary : colors.gray400}
                />
              </View>

              {/* Auto-Play Voiceover Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-Play Voiceover</Text>
                  <Text style={styles.settingDescription}>
                    Automatically play pronunciation when viewing flashcards
                  </Text>
                </View>
                <Switch
                  value={autoPlayVoiceover}
                  onValueChange={handleAutoPlayToggle}
                  trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                  thumbColor={autoPlayVoiceover ? colors.primary : colors.gray400}
                  disabled={!voiceoverEnabled}
                />
              </View>

              {/* Test Button */}
              {voiceoverEnabled && (
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={testVoiceover}
                >
                  <Text style={styles.testButtonText}>🎤 Test Voiceover</Text>
                </TouchableOpacity>
              )}
            </Card>

            {/* Quiz Settings Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>⏰ Quiz Settings</Text>
              
              {/* Time Per Question (Timed Quiz) */}
              <View style={styles.settingColumn}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Time Per Question (Timed Quiz)</Text>
                  <Text style={styles.settingDescription}>
                    Set the number of seconds for each question in Timed Quiz
                  </Text>
                </View>
                
                <View style={styles.timeOptionsContainer}>
                  {[10, 15, 20, 25, 30, 60].map((seconds) => (
                    <TouchableOpacity
                      key={seconds}
                      style={[
                        styles.timeOption,
                        timedQuizSeconds === seconds && styles.timeOptionSelected
                      ]}
                      onPress={() => handleTimedQuizSecondsChange(seconds)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        timedQuizSeconds === seconds && styles.timeOptionTextSelected
                      ]}>
                        {seconds}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Mock Test Time Limit */}
              <View style={styles.settingColumn}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Mock Test Time Limit</Text>
                  <Text style={styles.settingDescription}>
                    Set the total time limit for Mock Tests
                  </Text>
                </View>
                
                <View style={styles.timeOptionsContainer}>
                  {[10, 15, 20, 30].map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.timeOption,
                        mockTestMinutes === minutes && styles.timeOptionSelected
                      ]}
                      onPress={() => handleMockTestMinutesChange(minutes)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        mockTestMinutes === minutes && styles.timeOptionTextSelected
                      ]}>
                        {minutes} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

            {/* Current Access Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>Current Access</Text>
              
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

                <View style={styles.accessItem}>
                  <Text style={styles.accessIcon}>🔤</Text>
                  <Text style={styles.accessText}>
                    A-Z Word Browser: {isPremium ? '✅ Unlocked' : '🔒 Locked'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Data & Progress Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>💾 Data & Progress</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📱</Text>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Device Storage</Text>
                  <Text style={styles.infoDescription}>
                    Your progress is saved locally on this device only. Progress is not synced across devices.
                  </Text>
                </View>
              </View>
            </Card>

            {/* App Information Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>📱 App Information</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>10.0</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Words</Text>
                <Text style={styles.infoValue}>2500+</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Categories</Text>
                <Text style={styles.infoValue}>100+</Text>
              </View>
            </Card>

            {/* About Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>ℹ️ About</Text>
              <Text style={styles.aboutText}>
                11+ Vocab Master helps students prepare for grammar school entrance exams with comprehensive vocabulary practice, engaging games, and mock tests.
              </Text>
            </Card>

            {/* Company Card */}
            <Card style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>🏢 Company</Text>
              <View style={styles.companyContainer}>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>11 Plus Apps Ltd.</Text>
                  <Text style={styles.companyDescription}>
                    © Developed and managed by 11 Plus Apps Ltd, dedicated to helping students excel in their 11+ entrance exams.
                  </Text>
                </View>
              </View>
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
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.95,
  },
  settingsCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  settingColumn: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    lineHeight: 18,
  },
  upgradeButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
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
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  timeOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  timeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  timeOptionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray700,
  },
  timeOptionTextSelected: {
    color: colors.primary,
  },
  testButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.base,
    color: colors.gray700,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  infoDescription: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    lineHeight: 18,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
  },
  aboutText: {
    fontSize: fontSize.sm,
    color: colors.gray700,
    lineHeight: 20,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  companyDescription: {
    fontSize: fontSize.sm,
    color: colors.gray700,
    lineHeight: 20,
  },
});
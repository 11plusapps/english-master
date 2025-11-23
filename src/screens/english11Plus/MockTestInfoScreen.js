import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { english11PlusMockTests } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';

export default function MockTestInfoScreen({ route, navigation }) {
  const { testId } = route.params;
  const test = english11PlusMockTests.find(t => t.id === testId);

  const handleStartTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Start Mock Test',
      `You are about to start ${test.name}. This is a timed ${test.duration}-minute test. Make sure you have enough time to complete it.\n\nAre you ready?`,
      [
        {
          text: 'Not Yet',
          style: 'cancel'
        },
        {
          text: 'Start Now',
          onPress: () => {
            Alert.alert(
              'Mock Test Feature',
              'Full mock test implementation with timer and all sections will be available in the complete version. For now, you can practice individual question types!',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      ]
    );
  };

  if (!test) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#f093fb', '#f5576c']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{test.emoji}</Text>
          <Text style={styles.title}>{test.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{test.duration} min</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Marks</Text>
              <Text style={styles.infoValue}>{test.totalMarks}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionsCard}>
          <Text style={styles.sectionsTitle}>📋 Test Sections</Text>
          {test.sections.map((section, index) => (
            <View key={index} style={styles.sectionItem}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionNumber}>{index + 1}</Text>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  <Text style={styles.sectionMarks}>{section.marks} marks</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📝 Instructions</Text>
          <Text style={styles.instructionItem}>
            • You have {test.duration} minutes to complete all sections
          </Text>
          <Text style={styles.instructionItem}>
            • Answer all questions to the best of your ability
          </Text>
          <Text style={styles.instructionItem}>
            • The test must be completed in one sitting
          </Text>
          <Text style={styles.instructionItem}>
            • You can review your answers before submitting
          </Text>
          <Text style={styles.instructionItem}>
            • Find a quiet place with no distractions
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartTest}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Test Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.pink[600],
  },
  sectionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  sectionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  sectionItem: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    backgroundColor: colors.pink[100],
    borderRadius: 16,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.pink[600],
    textAlign: 'center',
    lineHeight: 32,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[800],
  },
  sectionMarks: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  instructionItem: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.large,
  },
  startButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

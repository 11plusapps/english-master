import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { english11PlusMockTests } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';

export default function MockTestSelectionScreen({ navigation }) {
  const handleTestSelect = (test) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('English11PlusMockTestInfo', { testId: test.id });
  };

  return (
    <LinearGradient
      colors={['#f093fb', '#f5576c', '#4facfe']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎯 Mock Tests</Text>
          <Text style={styles.subtitle}>
            Full 11+ English practice exams
          </Text>
        </View>

        <View style={styles.testsContainer}>
          {english11PlusMockTests.map((test, index) => (
            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => handleTestSelect(test)}
              activeOpacity={0.8}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testEmoji}>{test.emoji}</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{test.duration} min</Text>
                </View>
              </View>

              <Text style={styles.testTitle}>{test.name}</Text>

              <View style={styles.testInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Marks:</Text>
                  <Text style={styles.infoValue}>{test.totalMarks}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Sections:</Text>
                  <Text style={styles.infoValue}>{test.sections.length}</Text>
                </View>
              </View>

              <View style={styles.sectionsPreview}>
                <Text style={styles.sectionsTitle}>Sections:</Text>
                {test.sections.map((section, idx) => (
                  <Text key={idx} style={styles.sectionItem}>
                    • {section.name} ({section.marks} marks)
                  </Text>
                ))}
              </View>

              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Start Test →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📝 Mock Test Tips</Text>
          <Text style={styles.tipText}>• Find a quiet place to take the test</Text>
          <Text style={styles.tipText}>• You'll have {english11PlusMockTests[0].duration} minutes to complete</Text>
          <Text style={styles.tipText}>• All sections must be completed in one sitting</Text>
          <Text style={styles.tipText}>• Try to simulate real exam conditions</Text>
        </View>
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
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  testsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  testCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.large,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  testEmoji: {
    fontSize: 40,
  },
  durationBadge: {
    backgroundColor: colors.pink[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  durationText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.pink[600],
  },
  testTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  testInfo: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  sectionsPreview: {
    marginBottom: spacing.md,
  },
  sectionsTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  sectionItem: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  tipsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
});

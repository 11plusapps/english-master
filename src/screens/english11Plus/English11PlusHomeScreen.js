import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { english11PlusSets } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';
import { storage } from '../../utils/storage';

export default function English11PlusHomeScreen({ navigation }) {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [stats, setStats] = useState({
    totalPracticed: 0,
    bestScore: 0,
  });

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    loadStats();
  }, []);

  const loadStats = async () => {
    // Load practice statistics
    const attempts = await storage.getPracticeAttempts();
    if (attempts) {
      const totalPracticed = Object.keys(attempts).length;
      const scores = Object.values(attempts).map(a => a.score);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      setStats({ totalPracticed, bestScore });
    }
  };

  const handleCategoryPress = (category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (category.id) {
      case 201: // Comprehension
        navigation.navigate('English11PlusComprehensionSelection', { setId: category.id });
        break;
      case 202: // Cloze Test
        navigation.navigate('English11PlusCloseTestSelection', { setId: category.id });
        break;
      case 203: // Grammar
        navigation.navigate('English11PlusGrammarPractice', { setId: category.id });
        break;
      case 204: // Punctuation
        navigation.navigate('English11PlusPunctuationPractice', { setId: category.id });
        break;
      case 205: // Sentence Structure
        navigation.navigate('English11PlusSentenceStructurePractice', { setId: category.id });
        break;
      case 206: // Verbal Reasoning
        navigation.navigate('English11PlusVerbalReasoningPractice', { setId: category.id });
        break;
      case 207: // Spelling
        navigation.navigate('English11PlusSpellingPractice', { setId: category.id });
        break;
      case 208: // Creative Writing
        navigation.navigate('English11PlusCreativeWritingSelection', { setId: category.id });
        break;
      default:
        break;
    }
  };

  const handleMockTestPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('English11PlusMockTestSelection');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[
            styles.headerCard,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.title}>📚 11+ English Master</Text>
          <Text style={styles.subtitle}>
            Master all English skills for the 11+ exam
          </Text>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalPracticed}</Text>
            <Text style={styles.statLabel}>Practices</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.bestScore}%</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>

        {/* Practice Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📖 Practice by Topic</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {english11PlusSets.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.gradient}
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mock Tests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📝 Full Practice Exams</Text>
        </View>

        <TouchableOpacity
          style={styles.mockTestCard}
          onPress={handleMockTestPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.mockTestGradient}
          >
            <Text style={styles.mockTestEmoji}>🎯</Text>
            <Text style={styles.mockTestTitle}>Full Mock Tests</Text>
            <Text style={styles.mockTestDescription}>
              Complete 50-minute practice exams with all question types
            </Text>
            <View style={styles.mockTestBadge}>
              <Text style={styles.mockTestBadgeText}>Exam Simulation</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Exam Tips</Text>
          <Text style={styles.tipText}>• Read questions carefully before answering</Text>
          <Text style={styles.tipText}>• Manage your time wisely in timed tests</Text>
          <Text style={styles.tipText}>• Practice all question types regularly</Text>
          <Text style={styles.tipText}>• Review your mistakes to improve</Text>
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
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.medium,
  },
  statNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.purple[600],
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  categoryGradient: {
    padding: spacing.lg,
    minHeight: 140,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: fontSize.xs,
    color: colors.white,
    opacity: 0.9,
  },
  mockTestCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.large,
  },
  mockTestGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  mockTestEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  mockTestTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  mockTestDescription: {
    fontSize: fontSize.base,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  mockTestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  mockTestBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
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

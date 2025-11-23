import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vocabularySets } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { useSubscription } from '../context/SubscriptionContext';
import { storage } from '../utils/storage';
import Card from '../components/Card';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius, commonStyles } from '../styles/theme';

// Animated Progress Card Component
const AnimatedStatCard = ({ emoji, number, label, color, delay = 0 }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          backgroundColor: color,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// Progress Bar Component
const ProgressBar = ({ percentage, color }) => {
  const [widthAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View 
        style={[
          styles.progressBarFill,
          { 
            width,
            backgroundColor: color,
          }
        ]}
      />
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const { getSetProgress, loading, progress } = useProgress();
  const { areMockTestsLocked, isPremium } = useSubscription();
  
  const [stats, setStats] = useState({
    totalWordsLearned: 0,
    learningCompleted: 0,
    practiceCompleted: 0,
    bestGameScore: 0,
    bestMockScore: 0,
    overallProgress: 0,
  });

  useEffect(() => {
    loadStats();
  }, [progress]);

  const loadStats = async () => {
    try {
      // Calculate total words learned
      let totalWords = 0;
      let completedLearning = 0;
      
      vocabularySets.forEach(set => {
        const setProgress = getSetProgress(set.id, set.words.length);
        totalWords += setProgress.learned;
        if (setProgress.percentage === 100) {
          completedLearning++;
        }
      });

      // Calculate total possible words
      const totalPossibleWords = vocabularySets.reduce((sum, set) => sum + set.words.length, 0);
      const overallProgress = Math.round((totalWords / totalPossibleWords) * 100);

      // Load best fun game score
      const funGameAttempts = await storage.getFunGameAttempts();
      let bestGame = 0;
      Object.values(funGameAttempts).forEach(attempts => {
        attempts.forEach(attempt => {
          if (attempt.score > bestGame) bestGame = attempt.score;
        });
      });

      // Load best mock test score
      const mockTestAttempts = await storage.getMockTestAttempts();
      let bestMock = 0;
      Object.values(mockTestAttempts).forEach(attempts => {
        attempts.forEach(attempt => {
          if (attempt.percentage > bestMock) bestMock = attempt.percentage;
        });
      });

      setStats({
        totalWordsLearned: totalWords,
        learningCompleted: completedLearning,
        practiceCompleted: completedLearning, // Using same for now
        bestGameScore: bestGame,
        bestMockScore: bestMock,
        overallProgress,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFeaturePress = (route) => {
    if (route === 'MockTests' && areMockTestsLocked()) {
      // Navigate to Subscription screen in SettingsTab
      navigation.navigate('SettingsTab', { screen: 'Subscription' });
    } else {
      navigation.navigate(route);
    }
  };

  const features = [
    {
      id: 1,
      title: '11+ English Master',
      emoji: '📚',
      description: 'Complete 11+ English exam practice: Comprehension, Grammar, Punctuation & More',
      variant: 'blue',
      route: 'English11PlusHome',
      isNew: true,
    },
    {
      id: 2,
      title: 'Learning Zone',
      emoji: '📖',
      description: 'Master 11+ vocabulary with Flashcards for Verbal Reasoning and English',
      variant: 'green',
      route: 'LearningPortal',
    },
    {
      id: 3,
      title: 'Practice Zone',
      emoji: '🎯',
      description: '11+ exam practice: Timed Quiz, Spelling, Fill Gap & More',
      variant: 'purple',
      route: 'CategoryPractice',
    },
    {
      id: 4,
      title: 'Fun Games',
      emoji: '🎮',
      description: 'Learn 11+ words through Word Challenge & More fun games',
      variant: 'orange',
      route: 'CategoryFunGames',
    },
    {
      id: 5,
      title: 'Mock Tests',
      emoji: '🎓',
      description: 'Unlimited 11+ vocabulary mock tests to build your confidence',
      variant: 'blue',
      route: 'MockTests',
    },
  ];

  // Get achievement badge based on progress
  const getAchievementBadge = () => {
    if (stats.overallProgress >= 90) return { emoji: '🏆', text: 'Champion!', color: '#fbbf24' };
    if (stats.overallProgress >= 70) return { emoji: '🌟', text: 'Superstar!', color: '#a78bfa' };
    if (stats.overallProgress >= 50) return { emoji: '⭐', text: 'Rising Star!', color: '#60a5fa' };
    if (stats.overallProgress >= 25) return { emoji: '🚀', text: 'Getting There!', color: '#34d399' };
    return { emoji: '🌱', text: 'Keep Going!', color: '#fbbf24' };
  };

  const achievement = getAchievementBadge();

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
              <TouchableOpacity 
                onLongPress={() => navigation.navigate('DevSettings')}
                delayLongPress={1000}
              >
                <Text style={styles.title}>11+ Vocab Master</Text>
              </TouchableOpacity>
              <Text style={styles.subtitle}>2500+ Words - Build Your Vocab for 11+ Exam! 🚀</Text>
            </View>

            {/* Feature Cards */}
            <View style={styles.featuresContainer}>
              {features.map((feature) => {
                const isLocked = 
                  (feature.route === 'MockTests' && areMockTestsLocked());
                
                return (
                  <Card
                    key={feature.id}
                    variant={feature.variant}
                    onPress={() => handleFeaturePress(feature.route)}
                    style={styles.featureCard}
                  >
                    {isLocked && (
                      <View style={commonStyles.lockIconContainer}>
                        <Text style={commonStyles.lockIcon}>🔒</Text>
                      </View>
                    )}
                    <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                    {isLocked ? (
                      <View style={commonStyles.premiumBadge}>
                        <Text style={commonStyles.premiumText}>👑 Premium</Text>
                      </View>
                    ) : (
                      <View style={[styles.featureCta, styles[`cta${feature.variant}`]]}>
                        <Text style={styles.featureCtaText}>Start Now →</Text>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>

            {/* Enhanced Progress Section */}
            <LinearGradient
              colors={['#fef3c7', '#fde68a']}
              style={styles.progressContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Header with Achievement Badge */}
              <View style={styles.progressHeader}>
                <Text style={styles.progressEmoji}>🏆</Text>
                <View>
                  <Text style={styles.progressTitle}>My Progress</Text>
                  <View style={[styles.achievementBadge, { backgroundColor: achievement.color }]}>
                    <Text style={styles.achievementText}>{achievement.emoji} {achievement.text}</Text>
                  </View>
                </View>
              </View>

              {/* Overall Progress Bar */}
              <View style={styles.overallProgressSection}>
                <View style={styles.overallProgressHeader}>
                  <Text style={styles.overallProgressLabel}>Overall Progress</Text>
                  <Text style={styles.overallProgressPercentage}>{stats.overallProgress}%</Text>
                </View>
                <ProgressBar percentage={stats.overallProgress} color="#f59e0b" />
                <Text style={styles.wordsLearnedText}>
                  🎯 {stats.totalWordsLearned} words mastered!
                </Text>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <AnimatedStatCard
                  emoji="📚"
                  number={stats.learningCompleted}
                  label="Sets Completed"
                  color="#dbeafe"
                  delay={0}
                />
                
                <AnimatedStatCard
                  emoji="💯"
                  number={stats.totalWordsLearned}
                  label="Words Learned"
                  color="#d1fae5"
                  delay={100}
                />

                <AnimatedStatCard
                  emoji="🎮"
                  number={stats.bestGameScore || '—'}
                  label="Best Game Score"
                  color="#e9d5ff"
                  delay={200}
                />

                <AnimatedStatCard
                  emoji="🎓"
                  number={stats.bestMockScore ? `${stats.bestMockScore}%` : '—'}
                  label="Best Mock Test"
                  color="#fed7aa"
                  delay={300}
                />
              </View>

              {/* Motivational Message */}
              <View style={styles.motivationSection}>
                <Text style={styles.motivationText}>
                  {stats.overallProgress < 25 && "🌟 Great start! Keep practicing every day!"}
                  {stats.overallProgress >= 25 && stats.overallProgress < 50 && "🚀 You're making amazing progress!"}
                  {stats.overallProgress >= 50 && stats.overallProgress < 70 && "⭐ Fantastic work! You're halfway there!"}
                  {stats.overallProgress >= 70 && stats.overallProgress < 90 && "🌟 Outstanding! You're almost an expert!"}
                  {stats.overallProgress >= 90 && "🏆 WOW! You're a vocabulary champion!"}
                </Text>
              </View>
            </LinearGradient>
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
  settingsButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  settingsText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  featureCta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  ctablue: {
    backgroundColor: '#dbeafe',
  },
  ctagreen: {
    backgroundColor: '#d1fae5',
  },
  ctapurple: {
    backgroundColor: '#f3e8ff',
  },
  ctaorange: {
    backgroundColor: '#ffedd5',
  },
  featureCtaText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  progressContainer: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 4,
    borderColor: '#fbbf24',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  progressTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  achievementBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  achievementText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  overallProgressSection: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overallProgressLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  overallProgressPercentage: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  wordsLearnedText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray700,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gray700,
    textAlign: 'center',
  },
  motivationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
  },
  // My Difficult Words Section
  difficultWordsContainer: {
    marginBottom: spacing.lg,
  },
  difficultWordsGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 4,
    borderColor: '#a855f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  difficultWordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  difficultWordsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultWordsEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  difficultWordsTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  difficultWordsSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray600,
    marginTop: spacing.xs / 2,
  },
  emptyDifficultWords: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  emptyDifficultWordsEmoji: {
    fontSize: 64,
    marginBottom: spacing.xs,
  },
  emptyDifficultWordsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.sm,
  },
  emptyDifficultWordsText: {
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addWordsButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addWordsButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  difficultWordsList: {
    marginBottom: spacing.md,
  },
  difficultWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#e9d5ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  difficultWordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  difficultWordEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  difficultWordInfo: {
    flex: 1,
  },
  difficultWordText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  difficultWordDefinition: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  removeWordButton: {
    backgroundColor: '#fee2e2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  removeWordIcon: {
    fontSize: 24,
    color: '#ef4444',
    fontWeight: fontWeight.bold,
  },
  difficultWordsActions: {
    gap: spacing.sm,
  },
  difficultWordsActionButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: spacing.sm,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceButton: {
    backgroundColor: '#10b981',
  },
  gamesButton: {
    backgroundColor: '#3b82f6',
  },
  addMoreButton: {
    backgroundColor: '#a855f7',
  },
  difficultWordsActionEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  difficultWordsActionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  // A-Z Browser Section
  azBrowserContainer: {
    marginBottom: spacing.lg,
  },
  azBrowserCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  azBrowserContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  azEmojiContainer: {
    marginRight: spacing.md,
  },
  azEmoji: {
    fontSize: 48,
  },
  azInfo: {
    flex: 1,
  },
  azTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  azDescription: {
    fontSize: fontSize.base,
    color: colors.gray600,
    fontWeight: fontWeight.semibold,
  },
  azArrowContainer: {
    marginLeft: spacing.sm,
  },
  azArrow: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
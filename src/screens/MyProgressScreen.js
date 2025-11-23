import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vocabularySets } from '../data/vocabulary';
import { useProgress } from '../hooks/useProgress';
import { storage } from '../utils/storage';
import BackButton from '../components/BackButton';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

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

export default function MyProgressScreen({ navigation }) {
  const { getSetProgress, loading, progress } = useProgress();
  
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
        practiceCompleted: completedLearning,
        bestGameScore: bestGame,
        bestMockScore: bestMock,
        overallProgress,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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
      <LinearGradient 
        colors={['#f50be9ff', '#d97706', '#fbbe2478']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>📊</Text>
              <View>
                <Text style={styles.title}>My Progress</Text>
                <Text style={styles.subtitle}>Track your learning journey</Text>
              </View>
            </View>

            {/* Progress Content */}
            <LinearGradient
              colors={['#fef3c7', '#fde68a']}
              style={styles.progressContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Achievement Badge */}
              <View style={styles.progressHeader}>
                <Text style={styles.progressEmoji}>🏆</Text>
                <View>
                  <Text style={styles.progressTitle}>Achievement</Text>
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
                  🎯 {stats.totalWordsLearned} words mastered out of 2500+
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
                  {stats.overallProgress >= 50 && stats.overallProgress < 70 && "⭐ Halfway there! Keep up the excellent work!"}
                  {stats.overallProgress >= 70 && stats.overallProgress < 90 && "🌟 Outstanding! You're almost a master!"}
                  {stats.overallProgress >= 90 && "🏆 Incredible! You're a vocabulary champion!"}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerEmoji: {
    fontSize: 56,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
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
    fontSize: 48,
    marginRight: spacing.md,
  },
  progressTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  achievementBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  achievementText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  overallProgressSection: {
    marginBottom: spacing.md,
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
    fontSize: fontSize.xl,
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
    marginBottom: spacing.sm,
  },
  statCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
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
});
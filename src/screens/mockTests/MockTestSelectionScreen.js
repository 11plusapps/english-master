import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

// Header Component (no animation)
const Header = () => {
  return (
    <View style={styles.badgeContainer}>
      <View style={styles.glowEffect} />
      <LinearGradient
        colors={['#06b6d4', '#010e12ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBadge}
      >
        <Text style={styles.headerBadgeText}>🎓 MOCK TESTS ZONE</Text>
      </LinearGradient>
    </View>
  );
};

export default function MockTestSelectionScreen({ navigation, mockTestAttempts, onStartTest, onViewDetailedResults }) {
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  const mockTests = [
    { id: 1, name: 'Mock Test 1', emoji: '🚀', color: '#3b82f6', description: 'Blast off with 11+ vocabulary!' },
    { id: 2, name: 'Mock Test 2', emoji: '🌞', color: '#f59e0b', description: 'Your 11+ vocabulary victory starts here!' },
    { id: 3, name: 'Mock Test 3', emoji: '🎯', color: '#8b5cf6', description: 'Your 11+ vocabulary, Supercharged!'  },
    { id: 4, name: 'Mock Test 4', emoji: '💪', color: '#ec4899', description: '11+ vocabulary excellence, every day!' },
    { id: 5, name: 'Mock Test 5', emoji: '👑', color: '#10b981', description: '11+ Vocabulary confidence, unlocked!' },
    { id: 'random', name: 'Generate New Test', emoji: '🏆', color: '#64748b', description: 'Create unlimited brand new Mock Tests!' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#3306d4ff', '#b208a9ff', '#ced7d9ff']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            {/* Header Section - ENHANCED */}
            <View style={styles.headerSection}>
              <Header />
              
              {/* Instructions Card */}
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>🎯 How Mock Tests Work:</Text>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Choose a Test or generate a new one</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Answer all challenging questions</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>Get detailed results and track progress!</Text>
                </View>
              </View>
            </View>

            <View style={styles.testsGrid}>
              {mockTests.map((test) => {
                const attempts = mockTestAttempts[test.id] || [];
                const lastAttempt = attempts[0];
                const isRandomTest = test.id === 'random';
                
                return (
                  <TouchableOpacity key={test.id} onPress={() => onStartTest(test.id)}>
                    {isRandomTest ? (
                      // Special styling for Generate New Test
                      <View style={styles.randomTestWrapper}>
                        <View style={styles.randomTestGlow} />
                        <LinearGradient
                          colors={['#fbbf24', '#f59e0b', '#ea580c']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.randomTestGradient}
                        >
                          <Card style={styles.randomTestCard}>
                            {/* Unlimited Tests Badge */}
                            <LinearGradient
                              colors={['#37e1a8ff', '#053d2bff']}
                              style={styles.unlimitedBadge}
                            >
                              <Text style={styles.unlimitedBadgeText}>🕵 UNLIMITED</Text>
                            </LinearGradient>
                            
                            <Text style={styles.randomTestEmoji}>{test.emoji}</Text>
                            <Text style={styles.randomTestTitle}>{test.name}</Text>
                            <Text style={styles.randomTestSubtitle}>
                              🎯 Unlimited 11+ Vocabulary Mock Tests
                            </Text>
                            <Text style={styles.randomTestDescription}>
                              Create as many unique practice tests as you want! Every test is different with fresh questions to master your 11+ vocabulary.
                            </Text>
                            
                            {/* Highlighted Button */}
                            <LinearGradient
                              colors={['#dc2626', '#b91c1c']}
                              style={styles.randomTestButton}
                            >
                              <Text style={styles.randomTestButtonText}>
                                🚀 Create New Mock Test
                              </Text>
                            </LinearGradient>
                            
                            {/* Features List */}
                            <View style={styles.featuresList}>
                              <View style={styles.featureItem}>
                                <Text style={styles.featureIcon}>✅</Text>
                                <Text style={styles.featureText}>Fresh questions every time</Text>
                              </View>
                              <View style={styles.featureItem}>
                                <Text style={styles.featureIcon}>✅</Text>
                                <Text style={styles.featureText}>Practice without limits</Text>
                              </View>
                              <View style={styles.featureItem}>
                                <Text style={styles.featureIcon}>✅</Text>
                                <Text style={styles.featureText}>Build confidence daily</Text>
                              </View>
                            </View>
                          </Card>
                        </LinearGradient>
                      </View>
                    ) : (
                      // Regular test card styling
                      <Card style={[styles.testCard, { borderColor: test.color, borderWidth: 3 }]}>
                        <View style={[styles.testNumberBadge, { backgroundColor: test.color }]}>
                          <Text style={styles.testNumberText}>Test {test.id}</Text>
                        </View>
                        
                        <Text style={styles.testEmoji}>{test.emoji}</Text>
                        <Text style={styles.testTitle}>{test.name}</Text>
                        <Text style={styles.testDescription}>{test.description}</Text>
                        
                        {lastAttempt && (
                          <View style={styles.lastAttemptContainer}>
                            <Text style={styles.lastAttemptTitle}>📊 Recent Attempts (tap to view):</Text>
                            {attempts.slice(0, 3).map((attempt, index) => (
                              <TouchableOpacity 
                                key={index} 
                                style={styles.attemptRow}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  if (attempt.questions && attempt.answers) {
                                    onViewDetailedResults(attempt, test.id);
                                  } else {
                                    Alert.alert('Not Available', 'Detailed results are only available for tests taken after this update.');
                                  }
                                }}
                              >
                                <Text style={styles.attemptScore}>
                                  {attempt.score}/{attempt.totalQuestions} correct ({attempt.percentage}%)
                                </Text>
                                <Text style={styles.attemptDate}>{formatDate(attempt.date)}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        
                        <View style={[styles.startBadge, { backgroundColor: test.color }]}>
                          <Text style={styles.startBadgeText}>Start Mock Test →</Text>
                        </View>
                      </Card>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { 
    padding: spacing.md, 
    paddingBottom: spacing.xl 
  },
  backButton: { 
    alignSelf: 'flex-start', 
    marginBottom: spacing.md 
  },
  
  // Header Section - ENHANCED
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  glowEffect: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 28,
    backgroundColor: 'rgba(234, 88, 12, 0.3)',
    opacity: 0.6,
  },
  headerBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  // Instructions Card
  instructionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f50b90ff',
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    lineHeight: 32,
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.gray700,
    fontWeight: fontWeight.medium,
  },
  
  testsGrid: { marginBottom: spacing.lg },
  testCard: { 
    marginBottom: spacing.lg, 
    padding: spacing.xl, 
    alignItems: 'center', 
    position: 'relative' 
  },
  testNumberBadge: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.xs, 
    borderRadius: borderRadius.full, 
    zIndex: 10 
  },
  testNumberText: { 
    fontSize: fontSize.xs, 
    fontWeight: fontWeight.bold, 
    color: colors.white 
  },
  testEmoji: { fontSize: 64, marginBottom: spacing.md },
  testTitle: { 
    fontSize: fontSize.xxl, 
    fontWeight: fontWeight.bold, 
    color: colors.gray800, 
    marginBottom: spacing.sm 
  },
  testDescription: { 
    fontSize: fontSize.md, 
    color: colors.gray600, 
    textAlign: 'center', 
    marginBottom: spacing.lg 
  },
  lastAttemptContainer: { 
    width: '100%', 
    backgroundColor: colors.gray50, 
    padding: spacing.md, 
    borderRadius: borderRadius.md, 
    marginBottom: spacing.md 
  },
  lastAttemptTitle: { 
    fontSize: fontSize.sm, 
    fontWeight: fontWeight.bold, 
    color: colors.gray700, 
    marginBottom: spacing.xs 
  },
  attemptRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: spacing.xs / 2, 
    backgroundColor: colors.white, 
    padding: spacing.sm, 
    borderRadius: borderRadius.sm, 
    borderWidth: 1, 
    borderColor: colors.gray200 
  },
  attemptScore: { 
    fontSize: fontSize.md, 
    fontWeight: fontWeight.bold, 
    color: colors.primary 
  },
  attemptDate: { 
    fontSize: fontSize.xs, 
    color: colors.gray500 
  },
  startBadge: { 
    marginTop: spacing.md, 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.full 
  },
  startBadgeText: { 
    fontSize: fontSize.md, 
    fontWeight: fontWeight.bold, 
    color: colors.white, 
    textAlign: 'center' 
  },
  
  // Random Test Special Styling
  randomTestWrapper: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  randomTestGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 26,
    backgroundColor: 'rgba(251, 191, 36, 0.4)',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  randomTestGradient: {
    borderRadius: 20,
    padding: 4,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  randomTestCard: {
    padding: spacing.xl,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.white,
  },
  unlimitedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  unlimitedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  randomTestEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  randomTestTitle: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  randomTestSubtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#f59e0b',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  randomTestDescription: {
    fontSize: fontSize.md,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  randomTestButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  randomTestButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  featuresList: {
    width: '100%',
    backgroundColor: '#fef3c7',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  featureText: {
    fontSize: fontSize.md,
    color: colors.gray700,
    fontWeight: fontWeight.medium,
  },
});
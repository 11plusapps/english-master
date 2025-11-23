import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { vocabularySets } from '../../data/vocabulary';
import { useSubscription } from '../../context/SubscriptionContext';
import { storage } from '../../utils/storage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius, commonStyles } from '../../styles/theme';

const CATEGORIES_PER_PAGE = 20;

// Animated Header Component
const AnimatedHeader = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.badgeContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
          }
        ]} 
      />
      <LinearGradient
        colors={['#7c3aed', '#c026d3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBadge}
      >
        <Text style={styles.headerBadgeText}>🎯 PRACTICE ZONE</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Animated Card Component
const AnimatedCategoryCard = ({ children, delay = 0 }) => {
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

export default function CategoryPracticeScreen({ navigation }) {
  const { isCategoryLocked, isMixedLocked } = useSubscription();
  const [practiceAttempts, setPracticeAttempts] = useState({});
  const [practiceListCount, setPracticeListCount] = useState(0);
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  useFocusEffect(
    React.useCallback(() => {
      loadPracticeAttempts();
      loadPracticeListCount();
    }, [])
  );

  const loadPracticeAttempts = async () => {
    const attempts = await storage.getPracticeAttempts();
    setPracticeAttempts(attempts);
  };

  const loadPracticeListCount = async () => {
    const practiceList = await storage.getPracticeList();
    setPracticeListCount(practiceList.length);
  };

  const getLastResult = (setId) => {
    // Get all practice attempts for this category across all practice types
    const practiceTypes = ['definition', 'spelling', 'fillGap', 'missingWord'];
    let mostRecentAttempt = null;
    let mostRecentDate = null;

    practiceTypes.forEach(type => {
      const key = `${type}-${setId}`;
      const attempts = practiceAttempts[key];
      if (attempts && attempts.length > 0) {
        const attempt = attempts[0];
        const attemptDate = new Date(attempt.date);
        if (!mostRecentDate || attemptDate > mostRecentDate) {
          mostRecentDate = attemptDate;
          mostRecentAttempt = attempt;
        }
      }
    });

    if (mostRecentAttempt) {
      return `${mostRecentAttempt.score}/${mostRecentAttempt.totalQuestions}`;
    }
    return null;
  };

  // Separate free, mixed, and other categories
  const freeCategory = vocabularySets.find(set => set.id === 1);
  const regularCategories = vocabularySets.filter(set => set.id !== 1 && set.id !== 0 && !set.isMixed);
  
  const totalPages = Math.ceil(regularCategories.length / CATEGORIES_PER_PAGE);
  const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
  const endIndex = startIndex + CATEGORIES_PER_PAGE;
  const currentCategories = regularCategories.slice(startIndex, endIndex);

  const handleCategoryPress = (setId) => {
    if (setId === 'mixed') {
      if (isMixedLocked()) {
        navigation.navigate('SettingsTab', { screen: 'Subscription' });
      } else {
        navigation.navigate('Practice', { setId: 'mixed' });
      }
    } else {
      const isLocked = isCategoryLocked(setId, 'practice');
      
      if (isLocked) {
        navigation.navigate('SettingsTab', { screen: 'Subscription' });
      } else {
        navigation.navigate('Practice', { setId });
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const mixedLocked = isMixedLocked();
  const mixedLastResult = getLastResult('mixed');

  const renderCategoryCard = (set, index) => {
    const isLocked = isCategoryLocked(set.id, 'practice');
    const lastResult = getLastResult(set.id);
    
    const cardColor = set.color === 'blue' ? '#eff6ff' : '#ecfeff';
    const borderColor = set.color === 'blue' ? colors.primaryLight : colors.cyanLight;
    
    return (
      <AnimatedCategoryCard key={set.id} delay={index * 50}>
        <TouchableOpacity 
          onPress={() => handleCategoryPress(set.id)}
          activeOpacity={0.7}
        >
          <Card style={[styles.categoryCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.cardContent}>
              {/* Emoji Badge */}
              <View style={commonStyles.emojiContainer}>
                <Text style={commonStyles.categoryEmoji}>{set.emoji}</Text>
              </View>
              
              {/* Category Info */}
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{set.name}</Text>
                <View style={styles.wordsContainer}>
                  <Text style={styles.practiceIcon}>📝</Text>
                  <Text style={styles.categoryWords}>
                    {set.words.length} words to practice
                  </Text>
                </View>
                {lastResult && !isLocked && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreIcon}>⭐</Text>
                    <Text style={styles.lastScoreText}>Last score: {lastResult}</Text>
                  </View>
                )}
              </View>
              
              {/* Lock/Arrow Indicator */}
              <View style={commonStyles.actionIndicator}>
                {isLocked ? (
                  <View style={commonStyles.lockContainer}>
                    <Text style={commonStyles.lockInlineIcon}>🔒</Text>
                  </View>
                ) : (
                  <View style={commonStyles.arrowContainer}>
                    <Text style={commonStyles.categoryArrow}>→</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Premium Badge */}
            {isLocked && (
              <View style={styles.premiumBadgeContainer}>
                <View style={commonStyles.premiumBadge}>
                  <Text style={commonStyles.premiumText}>👑 Premium </Text>
                </View>
              </View>
            )}
          </Card>
        </TouchableOpacity>
      </AnimatedCategoryCard>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.learning} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          
            {/* Header Section - ENHANCED WITH ANIMATION */}
            <View style={styles.headerSection}>
              <AnimatedHeader />
              
              {/* Instructions Card */}
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>🎯 How to Practice:</Text>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Select a category below</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Choose a practice type</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>Test yourself and track progress!</Text>
                </View>
              </View>
            </View>

            {/* Special Categories Section - Only on Page 1 */}
            {currentPage === 1 && (
              <View style={styles.specialSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⭐ Quick Practice</Text>
                </View>

                {/* Free Category */}
                {freeCategory && renderCategoryCard(freeCategory, 0)}

                {/* Mixed Categories */}
                <AnimatedCategoryCard delay={100}>
                  <TouchableOpacity
                    onPress={() => handleCategoryPress('mixed')}
                    activeOpacity={0.7}
                  >
                    <Card style={[styles.mixedCard, mixedLocked && styles.lockedCard]}>
                      <View style={styles.cardContent}>
                        <View style={commonStyles.emojiContainer}>
                          <Text style={commonStyles.categoryEmoji}>🎲</Text>
                        </View>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.mixedName}>Mixed Categories</Text>
                          <Text style={styles.mixedDescription}>
                            🎲 10 random words from 2500+ vocabulary
                          </Text>
                          {mixedLastResult && !mixedLocked && (
                            <View style={styles.scoreContainer}>
                              <Text style={styles.scoreIcon}>⭐</Text>
                              <Text style={styles.lastScoreText}>Last score: {mixedLastResult}</Text>
                            </View>
                          )}
                        </View>
                        {mixedLocked ? (
                          <View style={commonStyles.lockContainer}>
                            <Text style={commonStyles.lockInlineIcon}>🔒</Text>
                          </View>
                        ) : (
                          <View style={commonStyles.arrowContainer}>
                            <Text style={commonStyles.categoryArrow}>→</Text>
                          </View>
                        )}
                      </View>
                      {mixedLocked && (
              <View style={styles.premiumBadgeContainer}>
                <View style={commonStyles.premiumBadge}>
                  <Text style={commonStyles.premiumText}>👑 Premium </Text>
                </View>
              </View>
                      )}
                    </Card>
                  </TouchableOpacity>
                </AnimatedCategoryCard>
              </View>
            )}

            {/* All Categories Section */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {currentPage === 1 ? '📚 All Practice Categories' : '📚 More Categories'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Choose any category to start practicing
                </Text>
              </View>
              
              <View style={styles.categoriesGrid}>
                {currentCategories.map((set, index) => renderCategoryCard(set, index))}
              </View>
            </View>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={styles.paginationButton}
                >
                  ← Previous
                </Button>
                
                <View style={styles.pageInfo}>
                  <Text style={styles.pageText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>

                <Button
                  variant="secondary"
                  size="small"
                  onPress={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={styles.paginationButton}
                >
                  Next →
                </Button>
              </View>
            )}

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.motivationCard}>
                <Text style={styles.motivationEmoji}>💪</Text>
                <Text style={styles.motivationText}>
                  Practice makes perfect! Keep going to ace your 11+ exam!
                </Text>
              </View>
            </View>
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
    backgroundColor: 'rgba(192, 38, 211, 0.4)',
  },
  headerBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#c026d3',
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
  title: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fontSize.xl,
    color: colors.white,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    marginBottom: spacing.lg,
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
    backgroundColor: '#7c3aed',
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
  
  // Section Headers
  specialSection: {
    marginBottom: spacing.xl,
  },
  categoriesSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionSubtitle: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: fontWeight.medium,
  },
  
  // Category Cards
  categoriesGrid: {
  },
  categoryCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  wordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  practiceIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryWords: {
    fontSize: fontSize.md,
    color: colors.gray600,
    fontWeight: fontWeight.semibold,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs / 2,
  },
  scoreIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  lastScoreText: {
    fontSize: fontSize.sm,
    color: '#059669', // Green color for scores
    fontWeight: fontWeight.bold,
  },
  
  // Premium Badge Container
  premiumBadgeContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  
  // Practice List Card
  practiceListCard: {
    backgroundColor: '#f3e8ff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.purple,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  practiceListName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  practiceListDescription: {
    fontSize: fontSize.md,
    color: colors.gray600,
    fontWeight: fontWeight.semibold,
  },
  
  // Mixed Category Card
  mixedCard: {
    backgroundColor: '#fafec7ff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: '#fbbf24',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lockedCard: {
    opacity: 1,
  },
  mixedName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  mixedDescription: {
    fontSize: fontSize.md,
    color: colors.gray600,
    fontWeight: fontWeight.semibold,
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  pageInfo: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pageText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  
  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  motivationEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  motivationText: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
  },
  bottomBackButton: {
    alignSelf: 'center',
  },
});
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { vocabularySets } from '../../data/vocabulary';
import { useProgress } from '../../hooks/useProgress';
import { useSubscription } from '../../context/SubscriptionContext';
import { storage } from '../../utils/storage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius, commonStyles } from '../../styles/theme';

const CATEGORIES_PER_PAGE = 20;

// Header Component (no animation)
const Header = () => {
  return (
    <View style={styles.badgeContainer}>
      <View style={styles.glowEffect} />
      <LinearGradient
        colors={['#f009b2ff', '#100ce7ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBadge}
      >
        <Text style={styles.headerBadgeText}>📖 LEARNING ZONE</Text>
      </LinearGradient>
    </View>
  );
};

// Animated Card Component with longer, more noticeable bounce
const AnimatedCategoryCard = ({ children, delay = 0 }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      tension: 40,  // Lower tension for more bounce
      friction: 6,   // Lower friction for longer bounce
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {children}
    </Animated.View>
  );
};

export default function LearningPortalScreen({ navigation }) {
  const { getSetProgress } = useProgress();
  const { isCategoryLocked, isPremium } = useSubscription();
  
  // A-Z Browser is premium only
  const isAZBrowserLocked = () => !isPremium;
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [practiceListCount, setPracticeListCount] = useState(0);
  const [progressData, setProgressData] = useState({});

  // Reload all data when screen comes into focus - this ensures fresh progress
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        // Load practice list count
        const practiceList = await storage.getPracticeList();
        setPracticeListCount(practiceList.length);
        
        // Load fresh progress data from storage
        const freshProgress = await storage.getProgress();
        setProgressData(freshProgress);
      };
      
      loadData();
    }, [])
  );

  // Helper function to get progress for a set
  const getProgress = (setId, totalWords) => {
    const learned = progressData[setId]?.length || 0;
    const percentage = Math.round((learned / totalWords) * 100);
    return { learned, total: totalWords, percentage };
  };

  // Separate free, mixed, and other categories
  const freeCategory = vocabularySets.find(set => set.id === 1);
  const mixedCategories = vocabularySets.filter(set => set.isMixed || set.id === 0);
  const regularCategories = vocabularySets.filter(set => set.id !== 1 && set.id !== 0 && !set.isMixed);
  
  const totalPages = Math.ceil(regularCategories.length / CATEGORIES_PER_PAGE);
  const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
  const endIndex = startIndex + CATEGORIES_PER_PAGE;
  const currentCategories = regularCategories.slice(startIndex, endIndex);

  const handleCategoryPress = (setId) => {
    const isLocked = isCategoryLocked(setId, 'learning');
    
    if (isLocked) {
      navigation.navigate('SettingsTab', { screen: 'Subscription' });
    } else {
      navigation.navigate('Flashcard', { setId });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderCategoryCard = (set, index) => {
    const progress = getProgress(set.id, set.words.length);
    const isLocked = isCategoryLocked(set.id, 'learning');
    
    const cardColor = set.color === 'blue' ? '#eff6ff' : '#ecfeff';
    const borderColor = set.color === 'blue' ? colors.primaryLight : colors.cyanLight;
    
    return (
      <AnimatedCategoryCard key={set.id} delay={index * 100}>
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
                  <Text style={styles.flashcardIcon}>📚</Text>
                  <Text style={styles.categoryWords}>
                    {set.words.length} Flashcards to learn
                  </Text>
                </View>
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
            
            {/* Progress Section */}
            {!isLocked && (
              <View style={styles.progressSection}>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
                  </View>
                  <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>
                    ✨ {progress.learned} of {progress.total} words learned
                  </Text>
                </View>
              </View>
            )}
            
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

            {/* Header Section - ENHANCED */}
            <View style={styles.headerSection}>
              <Header />
              
              {/* Instructions Card */}
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>🎯 How to Start Learning:</Text>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>1</Text>
                  <Text style={styles.stepText}>Choose a category below</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={styles.stepText}>Learn with fun Flashcards</Text>
                </View>
                <View style={styles.instructionStep}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={styles.stepText}>Mark difficult words, Track progress!</Text>
                </View>
              </View>
            </View>

            {/* Special Categories Section - Only on Page 1 */}
            {currentPage === 1 && (
              <View style={styles.specialSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⭐ Start Here</Text>
                </View>

                {/* Free Category */}
                {freeCategory && renderCategoryCard(freeCategory, 0)}

                {/* Mixed Categories */}
                {mixedCategories.map((set, index) => {
                  const isLocked = isCategoryLocked(set.id, 'learning');
                  
                  return (
                    <AnimatedCategoryCard key={set.id} delay={200 + (index * 100)}>
                      <TouchableOpacity
                        onPress={() => handleCategoryPress(set.id)}
                        activeOpacity={0.7}
                      >
                        <Card style={[styles.mixedCard, isLocked && styles.lockedCard]}>
                          <View style={styles.cardContent}>
                            <View style={commonStyles.emojiContainer}>
                              <Text style={commonStyles.categoryEmoji}>{set.emoji}</Text>
                            </View>
                            <View style={styles.categoryInfo}>
                              <Text style={styles.mixedName}>{set.name}</Text>
                              <Text style={styles.mixedDescription}>
                                🎲 10 random words from 2500+ vocabulary
                              </Text>
                            </View>
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
                          
                          {/* Premium Badge */}
                            {isLocked && (
                              <View style={styles.premiumBadgeContainer}>
                                <View style={commonStyles.premiumBadge}>
                                  <Text style={commonStyles.premiumText}>👑 Premium</Text>
                                </View>
                              </View>
                          )}
                        </Card>
                      </TouchableOpacity>
                    </AnimatedCategoryCard>
                  );
                })}
              </View>
            )}

            {/* All Categories Section */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {currentPage === 1 ? '📚 All Categories' : '📚 More Categories'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Select any category to begin learning
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
                <Text style={styles.motivationEmoji}>🚀</Text>
                <Text style={styles.motivationText}>
                  Keep learning every day to ace your 11+ exam!
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
    backgroundColor: 'rgba(237, 30, 121, 0.3)',
    opacity: 0.6,
  },
  headerBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#ED1E79',
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
    fontSize: fontSize.lg,
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
    backgroundColor: '#f009a7ff',
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
    marginBottom: spacing.lg,
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
  },
  flashcardIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryWords: {
    fontSize: fontSize.md,
    color: colors.gray600,
    fontWeight: fontWeight.semibold,
  },
  
  // Progress Section
  progressSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
  },
  progressPercentage: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    minWidth: 45,
    textAlign: 'right',
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.gray700,
    fontWeight: fontWeight.semibold,
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
    backgroundColor: '#fef9c7ff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: '#fbbf24',
    marginBottom: spacing.md,
    shadowColor: '#fcfcfcff',
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
  
  // A-Z Browser Card
  azBrowserCard: {
    backgroundColor: '#eff6ff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: '#3b82f6',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  azBrowserName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  azBrowserDescription: {
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
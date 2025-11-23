import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import BackButton from '../../components/BackButton';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function GamesSelectionScreen({ route, navigation }) {
  const { setId } = route.params;
  const [funGameAttempts, setFunGameAttempts] = useState({});
  const [practiceListWords, setPracticeListWords] = useState([]);
  const [isLoadingPracticeList, setIsLoadingPracticeList] = useState(false);

  // Get category info
  const isPracticeList = setId === 'practice-list';
  const isMixed = setId === 'mixed';
  const foundSet = vocabularySets.find(s => s.id === setId);
  const categoryName = isPracticeList ? 'My Difficult Words' : (isMixed ? '11+ Mixed Practice' : (foundSet?.name || 'Fun Games'));
  const categoryEmoji = isPracticeList ? '📌' : (isMixed ? '🎲' : (foundSet?.emoji || '🎮'));

  // Load practice list if needed
  useEffect(() => {
    if (setId === 'practice-list') {
      setIsLoadingPracticeList(true);
      loadPracticeList();
    }
  }, [setId]);

  const loadPracticeList = async () => {
    try {
      const practiceList = await storage.getPracticeList();
      setPracticeListWords(practiceList);
      setIsLoadingPracticeList(false);
    } catch (error) {
      console.error('Error loading practice list:', error);
      setIsLoadingPracticeList(false);
    }
  };

  // Get words from selected category or mixed
  const allWords = React.useMemo(() => {
    if (setId === 'practice-list') {
      return practiceListWords;
    }
    if (setId === 'mixed') {
      const allCategoryWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words);
      return [...allCategoryWords].sort(() => Math.random() - 0.5).slice(0, 10);
    } else {
      const foundSet = vocabularySets.find(s => s.id === setId);
      return foundSet ? foundSet.words : [];
    }
  }, [setId, practiceListWords]);

  useFocusEffect(
    React.useCallback(() => {
      loadFunGameAttempts();
    }, [])
  );

  const loadFunGameAttempts = async () => {
    const attempts = await storage.getFunGameAttempts();
    setFunGameAttempts(attempts);
  };

  // Show loading state
  if (isLoadingPracticeList) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.funGames} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.content}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Check if practice list is empty
  if (setId === 'practice-list' && allWords.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.funGames} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
              
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyTitle}>No Difficult Words Yet</Text>
                <Text style={styles.emptyMessage}>
                  Add words to your practice list during practice sessions by tapping the bookmark icon.
                </Text>
                <Button
                  variant="primary"
                  onPress={() => navigation.goBack()}
                  style={styles.emptyButton}
                >
                  Browse Categories
                </Button>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const games = [
    { 
      id: 'speedmatch', 
      emoji: '⚡', 
      title: 'Speed Match', 
      description: 'Quick-fire true/false word matching - 5 seconds!',
      color: 'purple',
      bgGradient: ['#a855f7', '#c084fc'],
      screen: 'SpeedMatchGame'
    },
    { 
      id: 'challenge', 
      emoji: '🧠', 
      title: 'Word Challenge', 
      description: 'Beat the clock with multiple choice questions!',
      color: 'green',
      bgGradient: ['#10b981', '#34d399'],
      screen: 'WordChallengeGame'
    },
    { 
      id: 'wordbuilder', 
      emoji: '🔤', 
      title: 'Word Builder', 
      description: 'Unscramble letters to build the word!',
      color: 'blue',
      bgGradient: ['#3b82f6', '#60a5fa'],
      screen: 'WordBuilderGame'
    },
    // { 
    //   id: 'treasure', 
    //   emoji: '🏴‍☠️', 
    //   title: 'Treasure Hunt', 
    //   description: 'Find secret words with clever clues!',
    //   color: 'orange',
    //   bgGradient: ['#f59e0b', '#fbbf24'],
    //   screen: 'TreasureHuntGame'
    // },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.funGames} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{categoryEmoji} {categoryName}</Text>
              <Text style={styles.subtitle}>Select a Fun Game below</Text>
            </View>

            {/* Game Cards */}
            <View style={styles.gamesGrid}>
              {games.map((game) => {
                const key = `${game.id}-${setId}`;
                const attempts = funGameAttempts[key] || [];
                const lastAttempt = attempts[0];
                
                return (
                  <TouchableOpacity 
                    key={game.id} 
                    onPress={() => navigation.navigate(game.screen, { setId })} 
                    style={styles.gameCardWrapper}
                  >
                    <LinearGradient colors={game.bgGradient} style={styles.gameCardGradient}>
                      <View style={styles.gameCardContent}>
                        <View style={styles.gameEmojiContainer}>
                          <Text style={styles.gameEmoji}>{game.emoji}</Text>
                        </View>
                        <Text style={styles.gameTitle}>{game.title}</Text>
                        <Text style={styles.gameDescription}>{game.description}</Text>
                        
                        {lastAttempt && (
                          <View style={styles.gameAttemptsContainer}>
                            <Text style={styles.gameAttemptsTitle}>🏆 High Scores:</Text>
                            {attempts.slice(0, 2).map((attempt, index) => (
                              <View key={index} style={styles.gameAttemptRow}>
                                <Text style={styles.gameAttemptScore}>⭐ {attempt.score} pts</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        
                        <View style={styles.playButtonContainer}>
                          <Text style={styles.playButtonText}>▶ PLAY NOW!</Text>
                        </View>
                      </View>
                    </LinearGradient>
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
    fontSize: 30,
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
  gamesGrid: {
    marginTop: spacing.sm,
  },
  gameCardWrapper: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gameCardGradient: {
    borderRadius: borderRadius.xl,
    padding: 4,
  },
  gameCardContent: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  gameEmojiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 60,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gameEmoji: {
    fontSize: 56,
  },
  gameTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  gameAttemptsContainer: {
    width: '100%',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gameAttemptsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gray700,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  gameAttemptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  gameAttemptScore: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  playButtonContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  loadingText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 400,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.9,
  },
  emptyButton: {
    minWidth: 200,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vocabularySets } from '../../data/vocabulary';
import { useSubscription } from '../../context/SubscriptionContext';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

const WORDS_PER_PAGE = 30;

// Get all words for a specific letter
const getWordsForLetter = (letter) => {
  const allWords = vocabularySets
    .filter(set => set.id !== 0 && !set.isMixed)
    .flatMap(set => set.words.map(word => ({
      ...word,
      setId: set.id,
      categoryName: set.name,
      categoryEmoji: set.emoji
    })));
  
  return allWords
    .filter(word => word.word.charAt(0).toUpperCase() === letter)
    .sort((a, b) => a.word.localeCompare(b.word));
};

// Animated Word Card Component
const AnimatedWordCard = ({ word, onPress, delay }) => {
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
        styles.wordCardContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.wordCard}
        onPress={() => onPress(word)}
        activeOpacity={0.7}
      >
        <View style={styles.wordCardContent}>
          <View style={styles.wordEmojiContainer}>
            <Text style={styles.wordEmoji}>{word.emoji || '💬'}</Text>
          </View>
          <View style={styles.wordInfo}>
            <Text style={styles.wordText}>{word.word}</Text>
            <Text style={styles.wordDefinition} numberOfLines={2}>
              {word.definition}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {word.categoryEmoji} {word.categoryName}
              </Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AZWordListScreen({ route, navigation }) {
  const { letter } = route.params;
  const { isPremium } = useSubscription();
  const [allWords, setAllWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayedWords, setDisplayedWords] = useState([]);
  const scrollViewRef = React.useRef(null);

  // Check subscription on mount
  useEffect(() => {
    if (!isPremium) {
      // Navigate to parent (Main) then to SettingsTab -> Subscription
      navigation.getParent()?.navigate('SettingsTab', { screen: 'Subscription' });
      return;
    }
  }, [isPremium]);

  useEffect(() => {
    const words = getWordsForLetter(letter);
    setAllWords(words);
    setTotalPages(Math.ceil(words.length / WORDS_PER_PAGE));
  }, [letter]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * WORDS_PER_PAGE;
    const endIndex = startIndex + WORDS_PER_PAGE;
    setDisplayedWords(allWords.slice(startIndex, endIndex));
  }, [currentPage, allWords]);

  const handleWordPress = (word) => {
    navigation.navigate('Flashcard', { 
      setId: `az-${letter}`,
      initialWord: word.word,
      letter: letter
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
            {/* Back Button */}
           <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />  

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.badgeContainer}>
                <View style={styles.glowEffect} />
                <LinearGradient
                  colors={['#0a23e148', '#f30b7bff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.headerBadge}
                >
                  <Text style={styles.headerBadgeText}>
                    🔤 LETTER - {letter}
                  </Text>
                </LinearGradient>
              </View>

              {/* Stats Card */}
              <View style={styles.statsCard}>
                <Text style={styles.statsText}>
                  📚 {allWords.length} {allWords.length === 1 ? 'word' : 'words'} found
                </Text>
                {totalPages > 1 && (
                  <Text style={styles.statsSubText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                )}
              </View>
            </View>

            {/* Words List */}
            <View style={styles.wordsList}>
              {displayedWords.map((word, index) => (
                <AnimatedWordCard
                  key={`${word.word}-${word.setId}`}
                  word={word}
                  onPress={handleWordPress}
                  delay={index * 20}
                />
              ))}
            </View>

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <Button
                  variant="secondary"
                  onPress={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                >
                  <Text style={styles.paginationButtonText}>← Previous</Text>
                </Button>
                
                <View style={styles.pageInfo}>
                  <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
                </View>
                
                <Button
                  variant="secondary"
                  onPress={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                >
                  <Text style={styles.paginationButtonText}>Next →</Text>
                </Button>
              </View>
            )}

            {/* Bottom Back Button */}
            <View style={styles.bottomSection}>
              <Button
                variant="secondary"
                onPress={() => navigation.goBack()}
                style={styles.bottomBackButton}
              >
                <Text style={styles.bottomBackButtonText}>← Back to Letters</Text>
              </Button>
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
    backgroundColor: colors.white,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    width: 200,
    height: 50,
    backgroundColor: '#3b82f6',
    opacity: 0.3,
    borderRadius: 25,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  headerBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBadgeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  statsSubText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray600,
  },
  wordsList: {
    marginBottom: spacing.lg,
  },
  wordCardContainer: {
    marginBottom: spacing.md,
  },
  wordCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    borderColor: '#dbeafe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  wordEmojiContainer: {
    marginRight: spacing.md,
  },
  wordEmoji: {
    fontSize: 40,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  wordDefinition: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#2563eb',
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
  arrowText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: '#3b82f6',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  paginationButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
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
  bottomSection: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bottomBackButton: {
    width: '100%',
  },
  bottomBackButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
});

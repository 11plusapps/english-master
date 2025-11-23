import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function WordBuilderGame({ route, navigation }) {
  const { setId } = route.params;
  
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [askedWords, setAskedWords] = useState([]);
  const [scrambledWord, setScrambledWord] = useState(null);
  const [userBuiltWord, setUserBuiltWord] = useState('');
  const [builderHintsShown, setBuilderHintsShown] = useState(0);
  const [builderSubmitted, setBuilderSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameMode, setGameMode] = useState('playing');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const feedbackRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Get words from selected category
  const allWords = React.useMemo(() => {
    if (setId === 'mixed') {
      const allCategoryWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words);
      return [...allCategoryWords].sort(() => Math.random() - 0.5).slice(0, 10);
    } else {
      const foundSet = vocabularySets.find(s => s.id === setId);
      return foundSet ? foundSet.words : [];
    }
  }, [setId]);

  // Start game on mount
  useEffect(() => {
    nextWordBuilderQuestion();
  }, []);

  // Keyboard visibility listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const nextWordBuilderQuestion = () => {
    if (questionsAsked >= 10) {
      saveGameResult();
      setGameMode('results');
      return;
    }

    const availableWords = allWords.filter(w => !askedWords.includes(w.word) && w.word.length >= 4);
    if (availableWords.length === 0) {
      saveGameResult();
      setGameMode('results');
      return;
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setAskedWords([...askedWords, randomWord.word]);
    
    const scrambled = randomWord.word.split('').sort(() => Math.random() - 0.5).join('');
    setScrambledWord({ ...randomWord, scrambled });
    setUserBuiltWord('');
    setFeedback('');
    setBuilderHintsShown(0);
    setBuilderSubmitted(false);
    setQuestionsAsked(questionsAsked + 1);
  };

  const showBuilderHint = () => {
    if (builderHintsShown < 2) {
      setBuilderHintsShown(builderHintsShown + 1);
    }
  };

  const handleWordBuilderSubmit = () => {
    setBuilderSubmitted(true);
    const isCorrect = userBuiltWord.toLowerCase().trim() === scrambledWord.word.toLowerCase();
    
    if (isCorrect) {
      let points = 15;
      if (builderHintsShown >= 1) points -= 3;
      if (builderHintsShown >= 2) points -= 3;
      points = Math.max(5, points);
      
      setScore(score + points);
      setFeedback(`correct:${points}`);
      
      // Scroll to feedback after a brief delay
      setTimeout(() => {
        if (feedbackRef.current && scrollViewRef.current) {
          feedbackRef.current.measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
            },
            () => {}
          );
        }
      }, 100);
      
      setTimeout(() => {
        nextWordBuilderQuestion();
      }, 1500);
    } else {
      setScore(Math.max(0, score - 5));
      setFeedback('wrong');
      
      // Scroll to feedback after a brief delay
      setTimeout(() => {
        if (feedbackRef.current && scrollViewRef.current) {
          feedbackRef.current.measureLayout(
            scrollViewRef.current,
            (x, y) => {
              scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
            },
            () => {}
          );
        }
      }, 100);
      
      setTimeout(() => {
        nextWordBuilderQuestion();
      }, 2000);
    }
  };

  const handleQuitGame = () => {
    Alert.alert(
      'Quit Game?',
      'Are you sure you want to quit this game? Your current progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit Game', onPress: () => navigation.goBack(), style: 'destructive' }
      ]
    );
  };

  const saveGameResult = async () => {
    await storage.saveFunGameAttempt('wordbuilder', setId, score);
  };

  const restartGame = () => {
    setScore(0);
    setQuestionsAsked(0);
    setAskedWords([]);
    setGameMode('playing');
    nextWordBuilderQuestion();
  };

  if (gameMode === 'results') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.funGames} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsEmoji}>🏆</Text>
              <Text style={styles.resultsTitle}>Game Complete!</Text>
              <Text style={styles.resultsScore}>Final Score: {score}</Text>

              <View style={styles.resultsActions}>
                <Button
                  variant="primary"
                  onPress={restartGame}
                  style={styles.resultButton}
                >
                  🔄 Play Again
                </Button>

                <Button
                  variant="secondary"
                  onPress={() => navigation.goBack()}
                  style={styles.resultButton}
                >
                  🏠 Back to Games
                </Button>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.funGames} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {!isKeyboardVisible && (
            <View style={styles.gameHeader}>
              <Text style={styles.headerTitle}>🔤 Word Builder</Text>
              <View style={styles.gameStats}>
                <Text style={styles.scoreText}>Score: {score}</Text>
                <Text style={styles.questionCounter}>Q {questionsAsked}/10</Text>
              </View>
            </View>
          )}

          {scrambledWord && (
            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollView} 
              contentContainerStyle={[
                styles.challengeContent,
                isKeyboardVisible && styles.challengeContentKeyboardVisible
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Card style={styles.challengeCard}>
                {scrambledWord.emoji && !isKeyboardVisible && (
                  <Text style={styles.challengeEmoji}>{scrambledWord.emoji}</Text>
                )}
                <Text style={styles.challengeQuestion}>Unscramble these letters:</Text>
                
                <View style={styles.scrambledContainer}>
                  <Text style={styles.scrambledText} numberOfLines={1} adjustsFontSizeToFit>{scrambledWord.scrambled}</Text>
                </View>

                <View style={styles.hintBox}>
                  <Text style={styles.hintLabel}>💡 Hint 1 - Definition:</Text>
                  <Text style={styles.hintText}>{scrambledWord.definition}</Text>
                </View>

                {builderHintsShown >= 1 && (
                  <View style={[styles.hintBox, styles.hintBoxGreen]}>
                    <Text style={styles.hintLabel}>✅ Hint 2 - Synonyms:</Text>
                    <Text style={styles.hintText}>{scrambledWord.synonyms.join(', ')}</Text>
                  </View>
                )}

                {builderHintsShown >= 2 && (
                  <View style={[styles.hintBox, styles.hintBoxRed]}>
                    <Text style={styles.hintLabel}>❌ Hint 3 - Antonyms:</Text>
                    <Text style={styles.hintText}>{scrambledWord.antonyms.join(', ')}</Text>
                  </View>
                )}

                {builderHintsShown < 2 && (
                  <Button
                    variant="secondary"
                    onPress={showBuilderHint}
                    style={styles.hintButton}
                  >
                    Show Me Another Hint 🔍
                  </Button>
                )}

                <TextInput
                  style={styles.wordBuilderInput}
                  value={userBuiltWord}
                  onChangeText={setUserBuiltWord}
                  placeholder="Type your answer..."
                  placeholderTextColor={colors.gray400}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                />

                <Button
                  variant="primary"
                  onPress={handleWordBuilderSubmit}
                  disabled={!userBuiltWord.trim() || builderSubmitted}
                  style={styles.submitButton}
                >
                  Check Answer ✓
                </Button>
              </Card>

              {/* Feedback */}
              {feedback && (
                <View ref={feedbackRef} collapsable={false}>
                  <Card style={styles.feedbackCard}>
                    {feedback.startsWith('correct:') && (
                      <>
                        <Text style={styles.feedbackEmoji}>✅</Text>
                        <Text style={styles.feedbackTitle}>
                          Perfect! +{feedback.split(':')[1]} pts
                        </Text>
                      </>
                    )}
                    {feedback === 'wrong' && (
                      <>
                        <Text style={styles.feedbackEmoji}>❌</Text>
                        <Text style={styles.feedbackTitle}>Wrong! -5 pts</Text>
                        <Text style={styles.feedbackCorrect}>
                          The word was: {scrambledWord.word}
                        </Text>
                      </>
                    )}
                  </Card>
                </View>
              )}

              <Button
                variant="secondary"
                onPress={handleQuitGame}
                style={styles.quitButton}
              >
                ❌ Quit Game
              </Button>
            </ScrollView>
          )}
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
  scrollView: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  gameStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  questionCounter: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  challengeContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  challengeContentKeyboardVisible: {
    paddingTop: spacing.xs,
  },
  challengeCard: {
    padding: spacing.md,
    flex: 1,
  },
  challengeEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  challengeQuestion: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  scrambledContainer: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  scrambledText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 8,
  },
  hintBox: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  hintBoxGreen: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  hintBoxRed: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  hintLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  hintText: {
    fontSize: fontSize.md,
    color: colors.gray700,
  },
  hintButton: {
    marginBottom: spacing.xs,
  },
  wordBuilderInput: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.xl,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  // Feedback - matching WordChallengeGame style
  feedbackCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  feedbackEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  feedbackTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
  },
  feedbackCorrect: {
    fontSize: fontSize.base,
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  quitButton: {
    marginTop: spacing.lg,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  resultsEmoji: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  resultsScore: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xl,
  },
  resultsActions: {
    width: '100%',
  },
  resultButton: {
    marginBottom: spacing.md,
  },
});
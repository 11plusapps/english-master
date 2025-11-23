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

export default function TreasureHuntGame({ route, navigation }) {
  const { setId } = route.params;
  
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [askedWords, setAskedWords] = useState([]);
  const [treasureWord, setTreasureWord] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [hintsShown, setHintsShown] = useState(0);
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
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    setTreasureWord(randomWord);
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

  const handleTreasureGuess = () => {
    const guess = guessInput.toLowerCase().trim();
    const correct = treasureWord.word.toLowerCase();

    if (guess === correct) {
      setScore(score + (guessesLeft * 10));
      setFeedback('correct');
      
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
        setFeedback('');
        if (questionsAsked >= 4) {
          saveGameResult();
          setGameMode('results');
        } else {
          setQuestionsAsked(questionsAsked + 1);
          const nextWord = allWords[Math.floor(Math.random() * allWords.length)];
          setTreasureWord(nextWord);
          setGuessInput('');
          setGuessesLeft(3);
          setHintsShown(0);
        }
      }, 1500);
    } else {
      setGuessesLeft(guessesLeft - 1);
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
      
      setTimeout(() => setFeedback(''), 1000);
      
      if (guessesLeft <= 1) {
        setTimeout(() => {
          if (questionsAsked >= 4) {
            saveGameResult();
            setGameMode('results');
          } else {
            setQuestionsAsked(questionsAsked + 1);
            const nextWord = allWords[Math.floor(Math.random() * allWords.length)];
            setTreasureWord(nextWord);
            setGuessInput('');
            setGuessesLeft(3);
            setHintsShown(0);
            setFeedback('');
          }
        }, 1500);
      }
    }
  };

  const showNextHint = () => {
    if (hintsShown < 2) {
      setHintsShown(hintsShown + 1);
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
    await storage.saveFunGameAttempt('treasure', setId, score);
  };

  const restartGame = () => {
    setScore(0);
    setQuestionsAsked(0);
    setAskedWords([]);
    setGameMode('playing');
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    setTreasureWord(randomWord);
    setGuessInput('');
    setGuessesLeft(3);
    setHintsShown(0);
    setFeedback('');
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

  if (!treasureWord) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.funGames} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {!isKeyboardVisible && (
            <View style={styles.gameHeader}>
              <Text style={styles.headerTitle}>🏴‍☠️ Treasure Hunt</Text>
              <Text style={styles.scoreText}>Score: {score}</Text>
            </View>
          )}

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView} 
            contentContainerStyle={[
              styles.treasureContent,
              isKeyboardVisible && styles.treasureContentKeyboardVisible
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.treasureCard}>
              <Text style={styles.treasureTitle}>Find the Hidden Word!</Text>
              <View style={styles.heartsContainer}>
                {[...Array(3)].map((_, index) => (
                  <Text key={index} style={styles.heartIcon}>
                    {index < guessesLeft ? '❤️' : '🖤'}
                  </Text>
                ))}
              </View>

              <View style={styles.hintsContainer}>
                {hintsShown >= 0 && (
                  <View style={styles.hintBox}>
                    <Text style={styles.hintLabel}>🔍 Hint 1 - Definition:</Text>
                    <Text style={styles.hintText}>{treasureWord.definition}</Text>
                  </View>
                )}

                {hintsShown >= 1 && (
                  <View style={[styles.hintBox, styles.hintBoxGreen]}>
                    <Text style={styles.hintLabel}>✅ Hint 2 - Synonyms:</Text>
                    <Text style={styles.hintText}>{treasureWord.synonyms.join(', ')}</Text>
                  </View>
                )}

                {hintsShown >= 2 && (
                  <View style={[styles.hintBox, styles.hintBoxRed]}>
                    <Text style={styles.hintLabel}>❌ Hint 3 - Antonyms:</Text>
                    <Text style={styles.hintText}>{treasureWord.antonyms.join(', ')}</Text>
                  </View>
                )}
              </View>

              {hintsShown < 2 && guessesLeft > 0 && (
                <Button
                  variant="secondary"
                  onPress={showNextHint}
                  style={styles.hintButton}
                >
                  Show Hint 🔍
                </Button>
              )}

              <TextInput
                style={styles.input}
                value={guessInput}
                onChangeText={setGuessInput}
                placeholder="Type your guess..."
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
              />

              <Button
                variant="primary"
                onPress={handleTreasureGuess}
                disabled={!guessInput.trim() || feedback !== ''}
              >
                Submit Guess
              </Button>
            </Card>

            {/* Feedback */}
            {feedback !== '' && (
              <View ref={feedbackRef} collapsable={false}>
                <Card style={styles.feedbackCard}>
                  {feedback === 'correct' && (
                    <>
                      <Text style={styles.feedbackEmoji}>✅</Text>
                      <Text style={styles.feedbackTitle}>Correct! +{guessesLeft * 10} pts</Text>
                    </>
                  )}
                  {feedback === 'wrong' && (
                    <>
                      <Text style={styles.feedbackEmoji}>❌</Text>
                      <Text style={styles.feedbackTitle}>Try Again!</Text>
                      <Text style={styles.feedbackSubtext}>{guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} left</Text>
                    </>
                  )}
                </Card>
              </View>
            )}

            <Button
              variant="secondary"
              onPress={handleQuitGame}
              style={styles.bottomButton}
            >
              ❌ Quit Game
            </Button>
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
  scrollView: {
    flex: 1,
  },
  treasureContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  treasureContentKeyboardVisible: {
    paddingTop: spacing.xs,
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
  scoreText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  treasureCard: {
    padding: spacing.md,
    flex: 1,
  },
  treasureTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heartsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  heartIcon: {
    fontSize: 40,
  },
  hintsContainer: {
    marginBottom: spacing.sm,
  },
  hintBox: {
    backgroundColor: colors.gray50,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
  feedbackSubtext: {
    fontSize: fontSize.base,
    color: colors.gray700,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  bottomButton: {
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
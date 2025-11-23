import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function DefinitionPracticeScreen({ route, navigation }) {
  const { setId } = route.params;
  const foundSet = vocabularySets.find(s => s.id === setId);
  const [practiceListWords, setPracticeListWords] = useState([]);
  const [isLoadingPracticeList, setIsLoadingPracticeList] = useState(setId === 'practice-list');
  
  const scrollViewRef = useRef(null);
  const feedbackRef = useRef(null);
  
  // Load practice list if needed
  useEffect(() => {
    if (setId === 'practice-list') {
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

  // Generate mixed words if it's a mixed category, or use practice list
  const currentSet = React.useMemo(() => {
    if (setId === 'practice-list') {
      return { 
        id: 'practice-list', 
        name: 'My Difficult Words', 
        words: practiceListWords,
        emoji: '📚',
        color: 'purple'
      };
    }
    if (setId === 'mixed' || (foundSet && foundSet.isMixed)) {
      // Get 10 random words from all categories (excluding mixed itself)
      const allWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words);
      const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, 10);
      return { ...foundSet, words: shuffled };
    }
    return foundSet;
  }, [setId, practiceListWords]);
  
  const [gameState, setGameState] = useState('playing'); // playing, results
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); // Start as null, will be set from settings
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [askedWords, setAskedWords] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [timedQuizSeconds, setTimedQuizSeconds] = useState(null); // Start as null, will be set from settings
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const totalQuestions = currentSet && currentSet.words ? Math.min(10, currentSet.words.length) : 10;

  // Load settings on mount - THIS MUST RUN FIRST
  useEffect(() => {
    loadSettings();
  }, []);

  // Start game only after settings are loaded
  useEffect(() => {
    if (!isLoadingSettings && currentSet && currentSet.words && currentSet.words.length > 0 && gameState === 'playing' && questionsAsked === 0) {
      generateQuestion();
    }
  }, [currentSet, isLoadingPracticeList, isLoadingSettings]);

  const loadSettings = async () => {
    try {
      const settings = await storage.getSettings();
      if (settings.voiceoverEnabled !== undefined) {
        setVoiceoverEnabled(settings.voiceoverEnabled);
      }
      if (settings.timedQuizSeconds !== undefined) {
        setTimedQuizSeconds(settings.timedQuizSeconds);
        setTimeLeft(settings.timedQuizSeconds); // Set initial time
      }
      setIsLoadingSettings(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to default if error
      setTimedQuizSeconds(30);
      setTimeLeft(30);
      setIsLoadingSettings(false);
    }
  };

  const speakWord = (word) => {
    if (!voiceoverEnabled) {
      return; // Silently skip if voiceover is disabled
    }
    setIsSpeaking(true);
    Speech.speak(word, {
      language: 'en-AU',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
  }, [timeLeft, isAnswered, gameState]);

  // Save practice attempt when results are shown
  useEffect(() => {
    if (gameState === 'results') {
      storage.savePracticeAttempt('definition', setId, correctAnswers, totalQuestions);
    }
  }, [gameState, correctAnswers, totalQuestions, setId]);

  const startGame = () => {
    setGameState('playing');
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setQuestionsAsked(0);
    setAskedWords([]);
    generateQuestion();
  };

  const generateQuestion = useCallback(() => {
    if (!currentSet || !currentSet.words || currentSet.words.length === 0 || timedQuizSeconds === null) {
      return;
    }

    const availableWords = currentSet.words.filter(
      w => !askedWords.includes(w.word)
    );
    
    if (availableWords.length === 0 || questionsAsked >= totalQuestions) {
      setGameState('results');
      return;
    }

    const correctWord = availableWords[Math.floor(Math.random() * availableWords.length)];

    // Only ask definition questions
    const question = `What does "${correctWord.word}" mean?`;
    const correctAnswer = correctWord.definition;
    const otherWords = currentSet.words.filter(w => w.word !== correctWord.word);
    
    // Handle cases with few words - need at least 3 wrong options
    let wrongOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.definition);
    
    // If we don't have enough wrong options, get from all vocabulary
    if (wrongOptions.length < 3) {
      const allWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words)
        .filter(w => w.word !== correctWord.word);
      
      const additionalOptions = allWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - wrongOptions.length)
        .map(w => w.definition);
      
      wrongOptions = [...wrongOptions, ...additionalOptions];
    }
    
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      question,
      correctAnswer,
      options,
      word: correctWord
    });
    setTimeLeft(timedQuizSeconds); // Use setting from storage
    setIsAnswered(false);
    setSelectedAnswer(null);
    setFeedback('');
    
    // Scroll to top for new question
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    
    // Animate new question entrance
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSet, askedWords, questionsAsked, timedQuizSeconds, fadeAnim, scaleAnim]);

  const handleAnswer = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer === currentQuestion.correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback('correct');
      
      // Scroll to feedback section for correct answer
      setTimeout(() => {
        feedbackRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 100);
      
      // Auto-advance to next question after showing feedback
      setTimeout(() => {
        if (questionsAsked + 1 >= totalQuestions) {
          setGameState('results');
        } else {
          generateQuestion();
        }
      }, 1500); // 1500ms delay to show green feedback and allow scrolling
    } else {
      setWrongAnswers(wrongAnswers + 1);
      setFeedback('wrong');
      
      // Scroll to feedback section after a brief delay
      setTimeout(() => {
        feedbackRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 100);
    }

    setAskedWords([...askedWords, currentQuestion.word.word]);
    setQuestionsAsked(questionsAsked + 1);
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    setWrongAnswers(wrongAnswers + 1);
    setFeedback('timeout');
    setAskedWords([...askedWords, currentQuestion.word.word]);
    setQuestionsAsked(questionsAsked + 1);
    
    // Scroll to feedback section after a brief delay
    setTimeout(() => {
      feedbackRef.current?.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }, 100);
  };

  const nextQuestion = () => {
    if (questionsAsked >= totalQuestions) {
      setGameState('results');
    } else {
      generateQuestion();
    }
  };

  // Show loading state while loading practice list or settings
  if (isLoadingPracticeList || isLoadingSettings) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.learning} style={styles.gradient}>
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
  if (setId === 'practice-list' && (!currentSet || !currentSet.words || currentSet.words.length === 0)) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.learning} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Button
                variant="secondary"
                size="small"
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                ← Back
              </Button>
              
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

  if (gameState === 'results') {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#ec4899', '#be185d']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.resultsContent}>
              <Text style={styles.resultsEmoji}>🏆</Text>
              <Text style={styles.resultsTitle}>Practice Complete!</Text>
              
              <Card style={styles.resultsCard}>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>✅ Correct:</Text>
                  <Text style={styles.resultsCorrect}>{correctAnswers}</Text>
                </View>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>❌ Wrong:</Text>
                  <Text style={styles.resultsWrong}>{wrongAnswers}</Text>
                </View>
                <View style={[styles.resultsRow, styles.resultsTotalRow]}>
                  <Text style={styles.resultsTotal}>Total: {correctAnswers}/{totalQuestions}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.percentageText}>{percentage}% Correct</Text>
              </Card>

              <View style={styles.buttonRow}>
                <Button
                  variant="pink"
                  onPress={startGame}
                  style={styles.resultButton}
                >
                  🔄 Practice Again
                </Button>
                <Button
                  variant="primary"
                  onPress={() => navigation.goBack()}
                  style={styles.resultButton}
                >
                  🏠 Back to Practice Zone
                </Button>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#ec4899', '#be185d']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.content}>
              <Text style={styles.loadingText}>Loading question...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#ec4899', '#be185d']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Timer */}
            <View style={styles.gameHeader}>
              <Text style={styles.progressText}>
                Question {questionsAsked + 1}/{totalQuestions}
              </Text>
              <View style={styles.timerBadge}>
                <Text style={styles.timerIcon}>⏱️</Text>
                <Text style={styles.timerText}>{timeLeft}s</Text>
              </View>
              <Text style={styles.scoreTextPlaying}>✅ {correctAnswers}</Text>
            </View>

            {/* Question Card */}
            {currentQuestion && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}
              >
                <Card style={styles.questionCard}>
                  <Text style={styles.questionEmoji}>{currentQuestion.word.emoji || '📖'}</Text>
                  <Text style={styles.questionText}>{currentQuestion.question}</Text>
                  <TouchableOpacity
                    onPress={() => speakWord(currentQuestion.word.word)}
                    style={styles.speakerButton}
                  >
                    <Text style={styles.speakerIcon}>🔊</Text>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            )}

            {/* Options */}
            <Animated.View
              style={{
                opacity: fadeAnim,
              }}
            >
              <View style={styles.optionsContainer}>
                {currentQuestion?.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAnswer(option)}
                    disabled={isAnswered}
                    style={[
                      styles.optionButton,
                      selectedAnswer === option && feedback === 'correct' && styles.optionCorrect,
                      selectedAnswer === option && (feedback === 'wrong' || feedback === 'timeout') && styles.optionWrong,
                      isAnswered && option === currentQuestion.correctAnswer && styles.optionCorrect,
                    ]}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Feedback */}
            {isAnswered && (
              <View ref={feedbackRef} collapsable={false}>
                <Card style={styles.feedbackCard}>
                  {feedback === 'correct' ? (
                    <>
                      <Text style={styles.feedbackEmoji}>✅</Text>
                      <Text style={styles.feedbackTitle}>Correct!</Text>
                    </>
                  ) : feedback === 'timeout' ? (
                    <>
                      <Text style={styles.feedbackEmoji}>⏰</Text>
                      <Text style={styles.feedbackTitle}>Time's Up!</Text>
                      <Text style={styles.feedbackCorrect}>
                        Correct answer: {currentQuestion.correctAnswer}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.feedbackEmoji}>❌</Text>
                      <Text style={styles.feedbackTitle}>Incorrect</Text>
                      <Text style={styles.feedbackCorrect}>
                        Correct answer: {currentQuestion.correctAnswer}
                      </Text>
                    </>
                  )}
                  
                  {/* Only show Next button for wrong answers and timeout - correct answers auto-advance */}
                  {feedback !== 'correct' && (
                    <Button
                      variant="pink"
                      onPress={nextQuestion}
                      style={styles.nextButton}
                    >
                      {questionsAsked >= totalQuestions ? 'See Results →' : 'Next Question →'}
                    </Button>
                  )}
                </Card>
              </View>
            )}

            {/* End Practice Button */}
            <Button
              variant="error"
              size="small"
              onPress={() => {
                Alert.alert(
                  'End Practice?',
                  'Are you sure you want to end this practice session? Your current progress will be shown.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End Practice', onPress: () => setGameState('results'), style: 'destructive' }
                  ]
                );
              }}
              style={styles.endButton}
            >
              End Practice
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  timerIcon: {
    fontSize: 18,
  },
  timerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#ec4899',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  scoreTextPlaying: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  endButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  questionCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    textAlign: 'center',
  },
  speakerButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  speakerIcon: {
    fontSize: 32,
  },
  optionsContainer: {
    marginBottom: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray300,
  },
  optionCorrect: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  optionText: {
    fontSize: fontSize.lg,
    color: colors.gray800,
    textAlign: 'center',
  },
  feedbackCard: {
    alignItems: 'center',
  },
  feedbackEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  feedbackTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.sm,
  },
  feedbackCorrect: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  nextButton: {
    width: '100%',
  },
  resultsContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  resultsEmoji: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  resultsCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  resultsTotalRow: {
    borderBottomWidth: 0,
    paddingTop: spacing.md,
  },
  resultsLabel: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    fontWeight: fontWeight.semibold,
  },
  resultsCorrect: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  resultsWrong: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
  resultsTotal: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  percentageText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray700,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  resultButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
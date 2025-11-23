import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function SpellingPracticeScreen({ route, navigation }) {
  const { setId } = route.params;
  const foundSet = vocabularySets.find(s => s.id === setId);
  const [practiceListWords, setPracticeListWords] = useState([]);
  const [isLoadingPracticeList, setIsLoadingPracticeList] = useState(setId === 'practice-list');
  
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
  
  // Generate mixed words if it's a mixed category
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
      const allWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words);
      const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, 10);
      return { ...foundSet, words: shuffled };
    }
    return foundSet;
  }, [setId, practiceListWords]);
  
  const [gameState, setGameState] = useState('ready');
  const [currentWord, setCurrentWord] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [askedWords, setAskedWords] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Refs for scrolling
  const scrollViewRef = useRef(null);
  const feedbackRef = useRef(null);

  const totalQuestions = currentSet && currentSet.words ? Math.min(10, currentSet.words.length) : 10;

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Save practice attempt when results are shown
  useEffect(() => {
    if (gameState === 'results') {
      storage.savePracticeAttempt('spelling', setId, correctAnswers, totalQuestions);
    }
  }, [gameState, correctAnswers, totalQuestions, setId]);

  const loadSettings = async () => {
    try {
      const settings = await storage.getSettings();
      if (settings.voiceoverEnabled !== undefined) {
        setVoiceoverEnabled(settings.voiceoverEnabled);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setQuestionsAsked(0);
    setAskedWords([]);
    generateQuestion();
  };

  const speakWord = (word) => {
    if (!voiceoverEnabled) return;
    setIsSpeaking(true);
    Speech.speak(word, {
      language: 'en-AU',
      pitch: 1.0,
      rate: 0.8,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const generateQuestion = useCallback(() => {
    const availableWords = currentSet.words.filter(
      w => !askedWords.includes(w.word)
    );
    
    if (availableWords.length === 0 || questionsAsked >= totalQuestions) {
      setGameState('results');
      return;
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(word);
    setAnswer('');
    setIsAnswered(false);
    setFeedback('');
    
    // Scroll to top for new question
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    
    // Automatically speak the word
    setTimeout(() => speakWord(word.word), 500);
  }, [currentSet, askedWords, questionsAsked]);

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert('Empty Answer', 'Please type your answer before submitting.');
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();

    setIsAnswered(true);
    
    const normalizedAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentWord.word.toLowerCase();
    
    if (normalizedAnswer === correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback('correct');
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

    setAskedWords([...askedWords, currentWord.word]);
    setQuestionsAsked(questionsAsked + 1);
  };

  const nextQuestion = () => {
    if (questionsAsked >= totalQuestions) {
      setGameState('results');
    } else {
      generateQuestion();
    }
  };

  // Show loading state while loading practice list
  if (isLoadingPracticeList) {
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

  if (gameState === 'ready') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#3b82f6', '#1e40af']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.content}>
              <Button
                variant="blue"
                size="small"
                onPress={() => navigation.goBack()}
                icon="◀"
                style={styles.backButton}
              >
                Back
              </Button>
              
              <Text style={styles.emoji}>✏️</Text>
              <Text style={styles.title}>11+ Spell It Right</Text>
              <Text style={styles.subtitle}>{currentSet.emoji} {currentSet.name}</Text>
              
              <Card style={styles.infoCard}>
                <Text style={styles.infoText}>🔊 Turn your sound on!</Text>
                <Text style={styles.infoText}>🎧 Listen to the word</Text>
                <Text style={styles.infoText}>✏️ Type the correct spelling</Text>
                <Text style={styles.infoText}>✅ Practice makes perfect!</Text>
              </Card>

              <Button
                variant="purple"
                size="large"
                onPress={startGame}
                style={styles.startButton}
              >
                Start Practice! 🚀
              </Button>
            </View>
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
        <LinearGradient colors={['#3b82f6', '#1e40af']} style={styles.gradient}>
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
                  variant="blue"
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

  // Playing state
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#3b82f6', '#1e40af']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.scrollContent,
                isKeyboardVisible && styles.scrollContentWithKeyboard
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header - Hide when keyboard is visible */}
              {!isKeyboardVisible && (
                <View style={styles.gameHeader}>
                  <View style={styles.headerCenter}>
                    <Text style={styles.headerCategory}>{currentSet.emoji} {currentSet.name}</Text>
                  </View>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {questionsAsked + 1}/{totalQuestions}
                    </Text>
                  </View>
                </View>
              )}

              {/* Question Card */}
              {currentWord && (
                <Card style={styles.questionCard}>
                  {/* Show compact progress when keyboard is visible */}
                  {isKeyboardVisible && (
                    <Text style={styles.compactProgress}>
                      Question {questionsAsked + 1}/{totalQuestions}
                    </Text>
                  )}
                  
                  <Text style={[
                    styles.questionEmoji,
                    isKeyboardVisible && styles.questionEmojiSmall
                  ]}>
                    {currentWord.emoji}
                  </Text>
                  
                  {/* Hide instruction and speak button when keyboard is visible */}
                  {!isKeyboardVisible && (
                    <>
                      <Text style={styles.instructionText}>
                        Listen and spell the word correctly
                      </Text>
                      
                    </>
                  )}
                      <Button
                        variant="blue"
                        onPress={() => speakWord(currentWord.word)}
                        disabled={isSpeaking}
                        style={styles.speakButton}
                      >
                        {isSpeaking ? '🔊 Speaking...' : '🔊 Play Word'}
                      </Button>

                  {!isAnswered && (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={answer}
                        onChangeText={setAnswer}
                        placeholder="Type your answer..."
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        spellCheck={false}
                        editable={!isAnswered}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                      />
                      
                      <Button
                        variant="blue"
                        onPress={handleSubmit}
                        style={styles.submitButton}
                      >
                        Submit Answer
                      </Button>
                    </View>
                  )}
                </Card>
              )}

              {/* Feedback - Only show when not typing */}
              {isAnswered && !isKeyboardVisible && (
                <View 
                  ref={feedbackRef}
                  collapsable={false}
                >
                  <Card style={styles.feedbackCard}>
                    {feedback === 'correct' ? (
                      <>
                        <Text style={styles.feedbackEmoji}>✅</Text>
                        <Text style={styles.feedbackTitle}>Perfect!</Text>
                        <Text style={styles.yourAnswer}>
                          Your answer: <Text style={styles.correctText}>{answer}</Text>
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.feedbackEmoji}>❌</Text>
                        <Text style={styles.feedbackTitle}>Incorrect</Text>
                        <Text style={styles.yourAnswer}>
                          Your answer: <Text style={styles.wrongText}>{answer}</Text>
                        </Text>
                        <Text style={styles.correctAnswer}>
                          Correct spelling: <Text style={styles.correctText}>{currentWord.word}</Text>
                        </Text>
                      </>
                    )}
                    
                    <Button
                      variant="blue"
                      onPress={nextQuestion}
                      style={styles.nextButton}
                    >
                      {questionsAsked >= totalQuestions ? 'See Results →' : 'Next Word →'}
                    </Button>
                  </Card>
                </View>
              )}
              
              {/* End Practice Button - Hide when keyboard is visible */}
              {!isKeyboardVisible && (
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
              )}
              
            </ScrollView>
          </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  scrollContentWithKeyboard: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  resultsContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.xl,
    color: colors.white,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
  },
  gameHeader: {
    marginBottom: spacing.lg,
  },
  headerCenter: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  headerCategory: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  endButton: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  questionCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  compactProgress: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray600,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  questionEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  questionEmojiSmall: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  speakButton: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.xl,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  submitButton: {
    width: '100%',
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
  yourAnswer: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  correctAnswer: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    marginBottom: spacing.lg,
  },
  correctText: {
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  wrongText: {
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
  nextButton: {
    width: '100%',
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
    paddingVertical: spacing.xl,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  resultsTotalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.gray300,
    marginTop: spacing.md,
    paddingTop: spacing.lg,
  },
  resultsLabel: {
    fontSize: fontSize.xl,
    color: colors.gray700,
    fontWeight: fontWeight.medium,
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
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
  },
  progressBar: {
    width: '100%',
    height: 24,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
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
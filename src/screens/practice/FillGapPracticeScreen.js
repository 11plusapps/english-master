import React, { useState, useCallback, useRef, useEffect } from 'react';
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

export default function FillGapPracticeScreen({ route, navigation }) {
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
  
  const [gameState, setGameState] = useState('playing');
  const [currentWord, setCurrentWord] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [letterInputs, setLetterInputs] = useState({});
  const [missingPositions, setMissingPositions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [askedWords, setAskedWords] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRefs = useRef({});
  const scrollViewRef = useRef(null);
  const feedbackRef = useRef(null);
  const wordContainerRef = useRef(null);

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

  // Start game automatically
  useEffect(() => {
    if (currentSet && currentSet.words && currentSet.words.length > 0 && gameState === 'playing' && !currentWord) {
      generateQuestion();
    }
  }, [currentSet, gameState]);

  // Save practice attempt when results are shown
  useEffect(() => {
    if (gameState === 'results') {
      storage.savePracticeAttempt('fillGap', setId, correctAnswers, totalQuestions);
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

  const speakWord = (word) => {
    if (!voiceoverEnabled) return;
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

  const startGame = () => {
    setGameState('playing');
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setQuestionsAsked(0);
    setAskedWords([]);
    generateQuestion();
  };

  const generateQuestion = useCallback(() => {
    if (!currentSet || !currentSet.words || currentSet.words.length === 0) {
      setGameState('results');
      return;
    }

    const availableWords = currentSet.words.filter(
      w => !askedWords.includes(w.word)
    );
    
    if (availableWords.length === 0 || questionsAsked >= totalQuestions) {
      setGameState('results');
      return;
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Generate 2-4 random missing positions
    const numMissing = Math.min(Math.floor(word.word.length * 0.4), 4);
    const positions = [];
    while (positions.length < numMissing) {
      const pos = Math.floor(Math.random() * word.word.length);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    positions.sort((a, b) => a - b);
    
    setCurrentWord(word);
    setMissingPositions(positions);
    setLetterInputs({});
    setIsAnswered(false);
    setFeedback('');
    setHasStartedTyping(false);
    
    // Scroll to top for new question
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, [currentSet, askedWords, questionsAsked]);

  const handleInputFocus = () => {
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
      setTimeout(() => {
        wordContainerRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
          },
          () => {}
        );
      }, 300);
    }
  };

  const handleLetterChange = (position, value) => {
    const newInputs = { ...letterInputs };
    
    if (value.length <= 1) {
      newInputs[position] = value.toLowerCase();
      setLetterInputs(newInputs);
      
      if (value && missingPositions.indexOf(position) < missingPositions.length - 1) {
        const nextPos = missingPositions[missingPositions.indexOf(position) + 1];
        inputRefs.current[nextPos]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const allFilled = missingPositions.every(pos => letterInputs[pos]);
    
    if (!allFilled) {
      Alert.alert('Incomplete Answer', 'Please fill in all missing letters.');
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();

    setIsAnswered(true);
    
    const allCorrect = missingPositions.every(
      pos => letterInputs[pos] === currentWord.word[pos].toLowerCase()
    );
    
    if (allCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback('correct');
      
      // Auto-advance to next question after 1.5 seconds
      setTimeout(() => {
        if (questionsAsked + 1 >= totalQuestions) {
          setGameState('results');
        } else {
          generateQuestion();
        }
      }, 1500);
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

  const renderWord = () => {
    if (!currentWord) return null;

    return (
      <View 
        ref={wordContainerRef}
        collapsable={false}
        style={styles.wordContainer}
      >
        {currentWord.word.split('').map((letter, index) => {
          const isMissing = missingPositions.includes(index);
          
          if (isMissing) {
            const userLetter = letterInputs[index] || '';
            const isCorrect = isAnswered && userLetter === letter.toLowerCase();
            const isWrong = isAnswered && userLetter !== letter.toLowerCase();
            
            return (
              <View key={index} style={styles.letterContainer}>
                <TextInput
                  ref={ref => inputRefs.current[index] = ref}
                  style={[
                    styles.letterInput,
                    isCorrect && styles.letterCorrect,
                    isWrong && styles.letterWrong,
                  ]}
                  value={isAnswered ? letter : userLetter}
                  onChangeText={(value) => handleLetterChange(index, value)}
                  onFocus={handleInputFocus}
                  maxLength={1}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isAnswered}
                />
              </View>
            );
          }
          
          return (
            <View key={index} style={styles.letterContainer}>
              <Text style={styles.letterText}>{letter}</Text>
            </View>
          );
        })}
      </View>
    );
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


  if (gameState === 'results') {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#f97316', '#c2410c']} style={styles.gradient}>
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
                  variant="orange"
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
      <LinearGradient colors={['#f97316', '#c2410c']} style={styles.gradient}>
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
                    <Text style={styles.headerCategory}> {currentSet.name}</Text>
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
                
                {/* Hide emoji when keyboard is visible */}
                {!isKeyboardVisible && (
                  <Text style={styles.questionEmoji}>
                    {currentWord.emoji || '🔤'}
                  </Text>
                )}
                
                {/* Always show instruction and hint */}
                <Text style={styles.instructionText}>
                  Complete the word by filling in the missing letters
                </Text>
                <Text style={styles.hintText}>
                  <Text style={styles.hintLabel}>Definition: </Text>
                    {currentWord.definition}
                </Text>
                
                <Button
                  variant="orange"
                  size="small"
                  onPress={() => speakWord(currentWord.word)}
                  disabled={isSpeaking}
                  style={styles.speakerButton}
                >
                  {isSpeaking ? '🔊 Speaking...' : '🔊 Listen'}
                </Button>

                {renderWord()}

                {!isAnswered && (
                  <Button
                    variant="orange"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                  >
                    Submit Answer
                  </Button>
                )}
              </Card>
            )}

            {/* Feedback - Only show when not typing */}
            {isAnswered && !isKeyboardVisible && (
              <View ref={feedbackRef} collapsable={false}>
                <Card style={styles.feedbackCard}>
                  {feedback === 'correct' ? (
                    <>
                      <Text style={styles.feedbackEmoji}>✅</Text>
                      <Text style={styles.feedbackTitle}>Perfect!</Text>
                      <Text style={styles.correctWord}>
                        Word: <Text style={styles.boldText}>{currentWord.word}</Text>
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.feedbackEmoji}>❌</Text>
                      <Text style={styles.feedbackTitle}>Try Again Next Time!</Text>
                      <Text style={styles.correctWord}>
                        Correct word: <Text style={styles.boldText}>{currentWord.word}</Text>
                      </Text>
                    </>
                  )}
                  
                  <Button
                    variant="orange"
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
  gameHeader: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.sm,
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
  instructionText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  hintText: {
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  speakerButton: {
    marginBottom: spacing.md,
  },
  wordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  letterContainer: {
    marginHorizontal: 2,
    marginVertical: 4,
  },
  letterText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    width: 26,
    height: 46,
    textAlign: 'center',
    lineHeight: 46,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  letterInput: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    width: 36,
    height: 46,
    textAlign: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: '#ffc107',
    padding: 0,
  },
  letterCorrect: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  letterWrong: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  submitButton: {
    width: '100%',
  },
  feedbackCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  correctWord: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: fontWeight.bold,
    color: colors.gray900,
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
    backgroundColor: '#f97316',
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
  hintLabel: {
  fontWeight: fontWeight.bold,
}

});
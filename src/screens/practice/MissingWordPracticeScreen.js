import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function MissingWordPracticeScreen({ route, navigation }) {
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
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [askedWords, setAskedWords] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const scrollViewRef = useRef(null);
  const feedbackRef = useRef(null);

  const totalQuestions = currentSet && currentSet.words ? Math.min(10, currentSet.words.length) : 10;

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Start game automatically
  useEffect(() => {
    if (currentSet && currentSet.words && currentSet.words.length > 0 && gameState === 'playing' && !currentQuestion) {
      generateQuestion();
    }
  }, [currentSet, gameState]);

  // Save practice attempt when results are shown
  useEffect(() => {
    if (gameState === 'results') {
      storage.savePracticeAttempt('missingWord', setId, correctAnswers, totalQuestions);
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
      w => !askedWords.includes(w.word) && w.example
    );
    
    if (availableWords.length === 0 || questionsAsked >= totalQuestions) {
      setGameState('results');
      return;
    }

    let correctWord = null;
    let sentence =null;
    let attempts = 0;
    const maxAttempts = availableWords.length;
    
    while (attempts < maxAttempts) {
      correctWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      const regex = new RegExp(`\\b${correctWord.word}\\b`, 'gi');
      sentence = correctWord.example.replace(regex, '______');
      
      if (sentence.includes('______')) {
        break;
      }
      
      const index = availableWords.indexOf(correctWord);
      if (index > -1) {
        availableWords.splice(index, 1);
      }
      attempts++;
    }
    
    if (!sentence?.includes('______')) {
      setGameState('results');
      return;
    }
    
    const otherWords = currentSet.words.filter(
      w => w.word !== correctWord.word && w.example
    );
    
    // Handle cases with few words - need at least 3 wrong options
    let wrongOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.word);
    
    // If we don't have enough wrong options, get from all vocabulary
    if (wrongOptions.length < 3) {
      const allWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words)
        .filter(w => w.word !== correctWord.word && w.example);
      
      const additionalOptions = allWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - wrongOptions.length)
        .map(w => w.word);
      
      wrongOptions = [...wrongOptions, ...additionalOptions];
    }
    
    const options = [correctWord.word, ...wrongOptions].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      sentence,
      correctAnswer: correctWord.word,
      options,
      word: correctWord,
      emoji: correctWord.emoji || '📝'
    });
    setIsAnswered(false);
    setSelectedAnswer(null);
    setFeedback('');
  }, [currentSet, askedWords, questionsAsked]);

  const handleAnswer = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer === currentQuestion.correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback('correct');
      
      // Scroll to feedback after a brief delay
      setTimeout(() => {
        feedbackRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
          },
          () => {}
        );
      }, 100);
      
      // Auto-advance after showing feedback for correct answers
      setTimeout(() => {
        if (questionsAsked >= totalQuestions) {
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

    setAskedWords([...askedWords, currentQuestion.word.word]);
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


  if (gameState === 'results') {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#a855f7', '#7e22ce']} style={styles.gradient}>
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
                  variant="purple"
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
      <LinearGradient colors={['#a855f7', '#7e22ce']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
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

            {/* Question Card */}
            {currentQuestion && (
              <Card style={styles.questionCard}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.questionEmoji}>{currentQuestion.emoji}</Text>
                </View>
                <Text style={styles.instructionText}>Fill in the missing word</Text>
                <View style={styles.sentenceBox}>
                  <Text style={styles.sentenceText}>{currentQuestion.sentence}</Text>
                </View>

                <View style={styles.optionsContainer}>
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const showCorrect = isAnswered && isCorrect;
                    const showWrong = isAnswered && isSelected && !isCorrect;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          showCorrect && styles.optionCorrect,
                          showWrong && styles.optionWrong,
                        ]}
                        onPress={() => handleAnswer(option)}
                        disabled={isAnswered}
                      >
                        <Text style={[
                          styles.optionText,
                          (showCorrect || showWrong) && styles.optionTextBold
                        ]} numberOfLines={1} adjustsFontSizeToFit>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {isAnswered && (
                  <View ref={feedbackRef} collapsable={false}>
                    <View style={styles.feedbackCard}>
                      {feedback === 'correct' ? (
                        <>
                          <Text style={styles.feedbackEmoji}>🎉</Text>
                          <Text style={styles.feedbackTitle}>Excellent!</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.feedbackEmoji}>💭</Text>
                          <Text style={styles.feedbackTitle}>Keep Learning!</Text>
                        </>
                      )}
                      
                      {feedback === 'wrong' && (
                        <View style={styles.answerBox}>
                          <Text style={styles.answerLabel}>
                            <Text style={styles.answerLabelBold}>Correct Answer: </Text>
                            {currentQuestion.correctAnswer}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.definitionBox}>
                        <Text style={styles.definitionLabel}>💡 Definition:</Text>
                        <Text style={styles.definitionText}>
                          {currentQuestion.word.definition}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Only show Next button for wrong answers - correct answers auto-advance */}
                    {feedback === 'wrong' && (
                      <Button
                        variant="purple"
                        onPress={nextQuestion}
                        style={styles.nextButton}
                      >
                        {questionsAsked >= totalQuestions ? 'See Results →' : 'Next Question →'}
                      </Button>
                    )}
                  </View>
                )}
              </Card>
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
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionEmoji: {
    fontSize: 48,
  },
  instructionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  speakerButton: {
    marginBottom: spacing.md,
  },
  sentenceBox: {
    backgroundColor: '#f3e8ff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#e9d5ff',
    width: '100%',
    marginBottom: spacing.sm,
  },
  sentenceText: {
    fontSize: fontSize.xl,
    color: colors.gray800,
    lineHeight: 25,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#e9d5ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  optionTextBold: {
    fontWeight: fontWeight.bold,
  },
  feedbackCard: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  feedbackEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  feedbackTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.md,
  },
  answerBox: {
    backgroundColor: '#fef3c7',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  answerLabel: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    textAlign: 'center',
  },
  answerLabelBold: {
    fontWeight: fontWeight.bold,
  },
  correctAnswerText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    textAlign: 'center',
  },
  definitionBox: {
    backgroundColor: '#f3e8ff',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  definitionLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  definitionText: {
    fontSize: fontSize.base,
    color: colors.gray700,
    lineHeight: 24,
  },
  nextButton: {
    alignItems: 'center',
    textAlign: 'center',
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
    backgroundColor: '#a855f7',
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
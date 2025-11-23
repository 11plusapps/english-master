import React, { useState, useEffect, useRef } from 'react';
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

export default function AntonymPracticeScreen({ route, navigation }) {
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

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (currentSet && currentSet.words && currentSet.words.length > 0 && gameState === 'playing' && questionsAsked === 0) {
      generateQuestion();
    }
  }, [currentSet]);

  useEffect(() => {
    if (gameState === 'results') {
      saveProgress();
    }
  }, [gameState]);

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

  const saveProgress = async () => {
    try {
      const practiceId = 'antonyms';
      await storage.savePracticeAttempt(practiceId, setId, correctAnswers, totalQuestions);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const speakWord = (word) => {
    if (!voiceoverEnabled) return;
    setIsSpeaking(true);
    Speech.speak(word, {
      language: 'en-AU',
      pitch: 1.0,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const generateQuestion = () => {
    if (!currentSet || !currentSet.words || currentSet.words.length === 0) {
      setGameState('results');
      return;
    }

    if (questionsAsked >= totalQuestions) {
      setGameState('results');
      return;
    }

    const availableWords = currentSet.words.filter(w => !askedWords.includes(w.word));
    
    if (availableWords.length === 0) {
      setGameState('results');
      return;
    }

    const targetWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    if (!targetWord.antonyms || targetWord.antonyms.length === 0) {
      setAskedWords([...askedWords, targetWord.word]);
      generateQuestion();
      return;
    }

    const correctAnswer = targetWord.antonyms[0];
    const wrongOptions = [];
    
    // First try to get wrong options from current set
    const otherWords = currentSet.words
      .filter(w => w.word !== targetWord.word && w.synonyms && w.synonyms.length > 0);
    
    while (wrongOptions.length < 3 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      const wrongOption = randomWord.synonyms[Math.floor(Math.random() * randomWord.synonyms.length)];
      
      if (!wrongOptions.includes(wrongOption) && wrongOption !== correctAnswer) {
        wrongOptions.push(wrongOption);
      }
      
      otherWords.splice(otherWords.indexOf(randomWord), 1);
    }
    
    // If we don't have enough wrong options, get from all vocabulary
    if (wrongOptions.length < 3) {
      const allWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words)
        .filter(w => w.word !== targetWord.word && w.synonyms && w.synonyms.length > 0);
      
      const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
      
      for (const word of shuffledWords) {
        if (wrongOptions.length >= 3) break;
        const wrongOption = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
        if (!wrongOptions.includes(wrongOption) && wrongOption !== correctAnswer) {
          wrongOptions.push(wrongOption);
        }
      }
    }

    const allOptions = [...wrongOptions, correctAnswer]
      .sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      word: targetWord.word,
      definition: targetWord.definition,
      emoji: targetWord.emoji || '📝',
      correctAnswer: correctAnswer,
      options: allOptions,
    });

    setAskedWords([...askedWords, targetWord.word]);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setFeedback('');
  };

  const handleAnswer = (answer) => {
    if (isAnswered) return;

    stopSpeaking();
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setFeedback('correct');
      if (voiceoverEnabled) {
        Speech.speak('Correct!', { language: 'en-AU', rate: 0.9 });
      }
      
      // Auto-advance to next question after correct answer
      setTimeout(() => {
        if (questionsAsked + 1 >= totalQuestions) {
          setGameState('results');
        } else {
          generateQuestion();
        }
      }, 800); // 800ms delay to show green feedback
    } else {
      setWrongAnswers(wrongAnswers + 1);
      setFeedback('wrong');
      if (voiceoverEnabled) {
        Speech.speak(`Incorrect. The correct answer is ${currentQuestion.correctAnswer}`, {
          language: 'en-AU',
          rate: 0.85,
        });
      }
      
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

    setQuestionsAsked(questionsAsked + 1);
  };

  const handleNextQuestion = () => {
    stopSpeaking();
    if (questionsAsked >= totalQuestions) {
      setGameState('results');
    } else {
      generateQuestion();
    }
  };

  const handleRestart = () => {
    stopSpeaking();
    setGameState('playing');
    setQuestionsAsked(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setAskedWords([]);
    generateQuestion();
  };

  const handleExit = () => {
    stopSpeaking();
    navigation.goBack();
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


  if (!currentSet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No vocabulary set found</Text>
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
            <ScrollView
              contentContainerStyle={styles.resultsContent}
              showsVerticalScrollIndicator={false}
            >
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
                  onPress={handleRestart}
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
            {/* Header */}
            <View style={styles.gameHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Question {questionsAsked + 1}/{totalQuestions}
                </Text>
                <Text style={styles.scoreTextPlaying}>✅ {correctAnswers} Correct</Text>
              </View>
            </View>

            {/* Question Card */}
            {currentQuestion && (
              <Card style={styles.questionCard}>
                <Text style={styles.questionEmoji}>{currentQuestion.emoji}</Text>
                <Text style={styles.questionText}>
                  Which word means the opposite of "{currentQuestion.word}"?
                </Text>
                <TouchableOpacity
                  onPress={() => speakWord(currentQuestion.word)}
                  style={styles.speakerButton}
                >
                  <Text style={styles.speakerIcon}>🔊</Text>
                </TouchableOpacity>
              </Card>
            )}

            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion?.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswer(option)}
                  disabled={isAnswered}
                  style={[
                    styles.optionButton,
                    selectedAnswer === option && feedback === 'correct' && styles.optionCorrect,
                    selectedAnswer === option && feedback === 'wrong' && styles.optionWrong,
                    isAnswered && option === currentQuestion.correctAnswer && styles.optionCorrect,
                  ]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback */}
            {isAnswered && (
              <View ref={feedbackRef} collapsable={false}>
                <Card style={styles.feedbackCard}>
                  {feedback === 'correct' ? (
                    <>
                      <Text style={styles.feedbackEmoji}>✅</Text>
                      <Text style={styles.feedbackTitle}>Correct!</Text>
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
                  
                  {/* Only show Next button for wrong answers - correct answers auto-advance */}
                  {feedback === 'wrong' && (
                    <Button
                      variant="pink"
                      onPress={handleNextQuestion}
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
  gameHeader: {
    marginBottom: spacing.lg,
  },
  endButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  errorText: {
    fontSize: fontSize.xl,
    color: colors.error,
    textAlign: 'center',
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

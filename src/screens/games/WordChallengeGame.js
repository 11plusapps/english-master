import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function WordChallengeGame({ route, navigation }) {
  const { setId } = route.params;
  
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [askedWords, setAskedWords] = useState([]);
  const [challengeQuestion, setChallengeQuestion] = useState(null);
  const [challengeOptions, setChallengeOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedChallengeAnswer, setSelectedChallengeAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [gameMode, setGameMode] = useState('playing');

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

  const totalQuestions = 10;

  // Start game on mount
  useEffect(() => {
    nextChallengeQuestion();
  }, []);

  // Timer
  useEffect(() => {
    if (gameMode === 'playing' && !isAnswered && timeLeft > 0 && challengeQuestion) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameMode === 'playing' && timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
  }, [gameMode, timeLeft, isAnswered, challengeQuestion]);

  const handleTimeout = () => {
    setScore(Math.max(0, score - 5));
    setFeedback('timeout');
    setIsAnswered(true);
    
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
  };

  const nextChallengeQuestion = () => {
    if (questionsAsked >= totalQuestions) {
      saveGameResult();
      setGameMode('results');
      return;
    }

    const availableWords = allWords.filter(w => !askedWords.includes(w.word));
    if (availableWords.length === 0) {
      saveGameResult();
      setGameMode('results');
      return;
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setAskedWords([...askedWords, randomWord.word]);

    const questionTypes = [
      { type: 'definition', question: `What is the definition of "${randomWord.word}"?`, answer: randomWord.definition },
      { type: 'synonym', question: `Which word is a SYNONYM of "${randomWord.word}"?`, answer: randomWord.synonyms[0] },
      { type: 'antonym', question: `Which word is an ANTONYM of "${randomWord.word}"?`, answer: randomWord.antonyms[0] },
    ];

    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let correctAnswer = questionType.answer;
    const wrongWords = allWords.filter(w => w.word !== randomWord.word);
    
    let options = [];
    if (questionType.type === 'definition') {
      const wrongOptions = wrongWords.sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.definition);
      options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    } else if (questionType.type === 'synonym') {
      const wrongOptions = wrongWords.sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.synonyms[0]);
      options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    } else {
      const wrongOptions = wrongWords.sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.antonyms[0]);
      options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    }

    setChallengeQuestion({ 
      word: randomWord, 
      type: questionType.type, 
      question: questionType.question, 
      correctAnswer 
    });
    setChallengeOptions(options);
    setTimeLeft(10);
    setIsAnswered(false);
    setSelectedChallengeAnswer(null);
    setFeedback('');
    setQuestionsAsked(questionsAsked + 1);
    
    // Scroll to top when new question loads
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, 100);
  };

  const handleChallengeAnswer = (selectedAnswer) => {
    if (isAnswered) return;

    setSelectedChallengeAnswer(selectedAnswer);
    setIsAnswered(true);
    const isCorrect = selectedAnswer === challengeQuestion.correctAnswer;

    if (isCorrect) {
      const points = timeLeft;
      setScore(score + points);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback('correct');
      
      // Scroll to feedback first for correct answers
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
      
      // Auto-advance after showing feedback
      setTimeout(() => {
        if (questionsAsked >= totalQuestions) {
          saveGameResult();
          setGameMode('results');
        } else {
          nextChallengeQuestion();
        }
      }, 1500);
    } else {
      setScore(Math.max(0, score - 3));
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
    }
  };

  const handleNextQuestion = () => {
    if (questionsAsked >= totalQuestions) {
      saveGameResult();
      setGameMode('results');
    } else {
      nextChallengeQuestion();
    }
  };

  const handleQuitGame = () => {
    Alert.alert(
      'End Game?',
      'Are you sure you want to end this game? Your current progress will be shown.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Game', onPress: () => { saveGameResult(); setGameMode('results'); }, style: 'destructive' }
      ]
    );
  };

  const saveGameResult = async () => {
    await storage.saveFunGameAttempt('challenge', setId, score);
  };

  const restartGame = () => {
    setScore(0);
    setQuestionsAsked(0);
    setCorrectAnswers(0);
    setAskedWords([]);
    setGameMode('playing');
    nextChallengeQuestion();
  };

  // Function to render question with highlighted words
  const renderQuestion = () => {
    if (!challengeQuestion) return null;
    
    const question = challengeQuestion.question;
    const word = challengeQuestion.word.word;
    const type = challengeQuestion.type;
    
    const wordMatch = question.match(/"([^"]+)"/);
    const quotedWord = wordMatch ? wordMatch[1] : word;
    
    let parts = [question];
    let highlights = [];
    
    if (question.includes(`"${quotedWord}"`)) {
      parts = question.split(`"${quotedWord}"`);
      highlights.push({ text: quotedWord, type: 'word' });
    }
    
    const questionParts = [];
    let partIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let remainingPart = part;
      
      const keywords = [
        { word: 'SYNONYM', key: 'synonym' },
        { word: 'synonym', key: 'synonym' },
        { word: 'ANTONYM', key: 'antonym' },
        { word: 'antonym', key: 'antonym' },
        { word: 'definition', key: 'definition' },
      ];
      
      let foundKeyword = false;
      for (const kw of keywords) {
        if (remainingPart.includes(kw.word)) {
          const kwParts = remainingPart.split(kw.word);
          questionParts.push(
            <Text key={`part-${partIndex++}`} style={styles.questionTextNormal}>
              {kwParts[0]}
            </Text>
          );
          questionParts.push(
            <Text key={`kw-${partIndex++}`} style={styles.questionTextKeyword}>
              {kw.word}
            </Text>
          );
          remainingPart = kwParts.slice(1).join(kw.word);
          foundKeyword = true;
          break;
        }
      }
      
      if (!foundKeyword && remainingPart) {
        questionParts.push(
          <Text key={`part-${partIndex++}`} style={styles.questionTextNormal}>
            {remainingPart}
          </Text>
        );
      } else if (foundKeyword && remainingPart) {
        questionParts.push(
          <Text key={`part-${partIndex++}`} style={styles.questionTextNormal}>
            {remainingPart}
          </Text>
        );
      }
      
      if (i < parts.length - 1) {
        questionParts.push(
          <Text key={`highlight-${partIndex++}`} style={styles.questionTextHighlight}>
            {quotedWord}
          </Text>
        );
      }
    }
    
    return <Text style={styles.questionText}>{questionParts}</Text>;
  };

  // Results Screen
  if (gameMode === 'results') {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const getResultEmoji = () => {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '🌟';
      if (percentage >= 40) return '👍';
      return '💪';
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.funGames} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.resultsContent}>
              <Text style={styles.resultsEmoji}>{getResultEmoji()}</Text>
              <Text style={styles.resultsTitle}>Challenge Complete!</Text>

              <Card style={styles.resultsCard}>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Final Score:</Text>
                  <Text style={styles.resultsTotal}>{score} pts</Text>
                </View>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Correct Answers:</Text>
                  <Text style={styles.resultsTotal}>{correctAnswers}/{totalQuestions}</Text>
                </View>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Success Rate:</Text>
                  <Text style={styles.resultsTotal}>{percentage}%</Text>
                </View>
              </Card>

              <View style={styles.buttonRow}>
                <Button
                  variant="primary"
                  onPress={restartGame}
                  style={styles.resultButton}
                >
                  🔄 Try Again
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => navigation.goBack()}
                  style={styles.resultButton}
                >
                  🏠 Back
                </Button>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Playing Screen
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.funGames} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header with Timer */}
              <View style={styles.gameHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>Q {questionsAsked}/{totalQuestions}</Text>
                  <Text style={styles.progressText}>🔥 Word Challenge</Text>
                  <Text style={styles.scoreTextPlaying}>⭐ {score} pts</Text>
                </View>
                
                {/* Timer Center */}
                <View style={styles.timerContainer}>
                  <View style={[
                    styles.timerCircle,
                    timeLeft <= 3 && styles.timerWarning
                  ]}>
                    <Text style={[
                      styles.timerText,
                      timeLeft <= 3 && styles.timerTextWarning
                    ]}>
                      {timeLeft}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Question Card */}
              {challengeQuestion && (
                <Card style={styles.questionCard}>
                  {challengeQuestion.word.emoji && (
                    <Text style={styles.questionEmoji}>{challengeQuestion.word.emoji}</Text>
                  )}
                  
                  <View style={styles.questionTextContainer}>
                    {renderQuestion()}
                  </View>
                </Card>
              )}

              {/* Options */}
              <View style={styles.optionsContainer}>
                {challengeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleChallengeAnswer(option)}
                    disabled={isAnswered}
                    style={[
                      styles.optionButton,
                      isAnswered && option === challengeQuestion.correctAnswer && styles.optionCorrect,
                      isAnswered && option === selectedChallengeAnswer && option !== challengeQuestion.correctAnswer && styles.optionWrong,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionText} numberOfLines={2} adjustsFontSizeToFit>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Feedback */}
              {isAnswered && feedback !== '' && (
                <View ref={feedbackRef} collapsable={false}>
                  <Card style={styles.feedbackCard}>
                    {feedback === 'correct' && (
                      <>
                        <Text style={styles.feedbackEmoji}>✅</Text>
                        <Text style={styles.feedbackTitle}>Excellent! +{timeLeft} pts</Text>
                      </>
                    )}
                    {feedback === 'wrong' && (
                      <>
                        <Text style={styles.feedbackEmoji}>❌</Text>
                        <Text style={styles.feedbackTitle}>Incorrect! -3 pts</Text>
                        <Text style={styles.feedbackCorrect}>
                          Correct answer: {challengeQuestion.correctAnswer}
                        </Text>
                        <Button
                          variant="primary"
                          onPress={handleNextQuestion}
                          style={styles.nextButton}
                        >
                          {questionsAsked >= totalQuestions ? 'See Results →' : 'Next Question →'}
                        </Button>
                      </>
                    )}
                    {feedback === 'timeout' && (
                      <>
                        <Text style={styles.feedbackEmoji}>⏰</Text>
                        <Text style={styles.feedbackTitle}>Time's Up! -5 pts</Text>
                        <Text style={styles.feedbackCorrect}>
                          Correct answer: {challengeQuestion.correctAnswer}
                        </Text>
                        <Button
                          variant="primary"
                          onPress={handleNextQuestion}
                          style={styles.nextButton}
                        >
                          {questionsAsked >= totalQuestions ? 'See Results →' : 'Next Question →'}
                        </Button>
                      </>
                    )}
                  </Card>
                </View>
              )}

              {/* Quit Button */}
              <Button
                variant="error"
                size="small"
                onPress={handleQuitGame}
                style={styles.endButton}
              >
                Quit Game Early
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
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  
  // Header
  gameHeader: {
    marginBottom: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
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
  
  // Timer Center
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  timerCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fbbf24',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  timerWarning: {
    borderColor: colors.error,
    backgroundColor: '#fee2e2',
  },
  timerText: {
    fontSize: 30,
    fontWeight: fontWeight.bold,
    color: '#fbbf24',
  },
  timerTextWarning: {
    color: colors.error,
  },
  timerLabel: {
    fontSize: fontSize.xs,
    color: colors.white,
    marginTop: spacing.xs,
    fontWeight: fontWeight.semibold,
  },

  // Question Card
  questionCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  questionTextContainer: {
    width: '100%',
  },
  questionText: {
    fontSize: fontSize.xl,
    textAlign: 'center',
    lineHeight: fontSize.xl * 1.5,
  },
  questionTextNormal: {
    color: colors.gray700,
    fontWeight: fontWeight.medium,
  },
  questionTextHighlight: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xxl,
  },
  questionTextKeyword: {
    color: '#a855f7',
    fontWeight: fontWeight.bold,
    fontStyle: 'italic',
  },

  // Options
  optionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 60,
    justifyContent: 'center',
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
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray800,
    textAlign: 'center',
  },

  // Feedback
  feedbackCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
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
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
  },
  nextButton: {
    width: '100%',
    marginTop: spacing.sm,
  },

  // End Button
  endButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },

  // Results
  resultsContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
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
    marginBottom: spacing.xl,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  resultsLabel: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    fontWeight: fontWeight.semibold,
  },
  resultsTotal: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  resultButton: {
    flex: 1,
  },
});








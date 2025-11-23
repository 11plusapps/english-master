import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function SpeedMatchGame({ route, navigation }) {
  const { setId } = route.params;
  
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [askedWords, setAskedWords] = useState([]);
  const [speedMatchTime, setSpeedMatchTime] = useState(10);
  const [speedMatchQuestion, setSpeedMatchQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [gameMode, setGameMode] = useState('playing');
  
  // Ref for feedback section
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

  const totalQuestions = 15;

  // Start game on mount
  useEffect(() => {
    nextSpeedMatchQuestion();
  }, []);

  // Timer
  useEffect(() => {
    if (gameMode === 'playing' && speedMatchQuestion && feedback === '') {
      if (speedMatchTime > 0) {
        const timer = setTimeout(() => {
          setSpeedMatchTime(speedMatchTime - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (speedMatchTime === 0) {
        handleTimeout();
      }
    }
  }, [gameMode, speedMatchTime, feedback, speedMatchQuestion]);

  const handleTimeout = () => {
    setScore(Math.max(0, score - 3));
    setFeedback('timeout');
    setQuestionsAsked(questionsAsked + 1);
    
    setTimeout(() => {
      if (questionsAsked + 1 >= totalQuestions) {
        saveGameResult();
        setGameMode('results');
      } else {
        nextSpeedMatchQuestion();
      }
    }, 1500);
  };

  const nextSpeedMatchQuestion = () => {
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

    const types = ['definition', 'synonym', 'antonym'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    let question, correctAnswer;
    if (randomType === 'definition') {
      question = `Is this the definition of "${randomWord.word}"?`;
      correctAnswer = randomWord.definition;
    } else if (randomType === 'synonym') {
      question = `Is this a synonym of "${randomWord.word}"?`;
      correctAnswer = randomWord.synonyms[0];
    } else {
      question = `Is this an antonym of "${randomWord.word}"?`;
      correctAnswer = randomWord.antonyms[0];
    }

    const showCorrect = Math.random() < 0.5;
    let displayedAnswer;
    
    if (showCorrect) {
      displayedAnswer = correctAnswer;
    } else {
      const wrongWords = allWords.filter(w => w.word !== randomWord.word);
      const wrongWord = wrongWords[Math.floor(Math.random() * wrongWords.length)];
      if (randomType === 'definition') {
        displayedAnswer = wrongWord.definition;
      } else if (randomType === 'synonym') {
        displayedAnswer = wrongWord.synonyms[0];
      } else {
        displayedAnswer = wrongWord.antonyms[0];
      }
    }

    setSpeedMatchQuestion({
      word: randomWord,
      type: randomType,
      question,
      displayedAnswer,
      isCorrect: showCorrect,
    });
    setSpeedMatchTime(10);
    setFeedback('');
  };

  const handleSpeedMatchAnswer = (userSaysYes) => {
    if (feedback !== '') return;
    
    const isCorrect = userSaysYes === speedMatchQuestion.isCorrect;
    
    if (isCorrect) {
      const points = speedMatchTime;
      setScore(score + points);
      setFeedback('correct');
    } else {
      setScore(Math.max(0, score - 3));
      setFeedback('wrong');
    }
    
    setQuestionsAsked(questionsAsked + 1);

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
      if (questionsAsked + 1 >= totalQuestions) {
        saveGameResult();
        setGameMode('results');
      } else {
        nextSpeedMatchQuestion();
      }
    }, 1500);
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
    await storage.saveFunGameAttempt('speedmatch', setId, score);
  };

  const restartGame = () => {
    setScore(0);
    setQuestionsAsked(0);
    setAskedWords([]);
    setGameMode('playing');
    nextSpeedMatchQuestion();
  };

  // Function to render question with highlighted words
  const renderQuestion = () => {
    if (!speedMatchQuestion) return null;
    
    const question = speedMatchQuestion.question;
    const word = speedMatchQuestion.word.word;
    const type = speedMatchQuestion.type;
    
    // Find the word in quotes
    const wordMatch = question.match(/"([^"]+)"/);
    const quotedWord = wordMatch ? wordMatch[1] : word;
    
    // Split question by the quoted word and type keywords
    let parts = [question];
    let highlights = [];
    
    // First, split by the quoted word
    if (question.includes(`"${quotedWord}"`)) {
      parts = question.split(`"${quotedWord}"`);
      highlights.push({ text: quotedWord, type: 'word' });
    }
    
    // Build the question components
    const questionParts = [];
    let partIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Check if this part contains "synonym", "antonym", or "definition"
      let remainingPart = part;
      let subParts = [];
      
      // Check for keywords in order
      const keywords = [
        { word: 'synonym', key: 'synonym' },
        { word: 'SYNONYM', key: 'synonym' },
        { word: 'antonym', key: 'antonym' },
        { word: 'ANTONYM', key: 'antonym' },
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
      
      // Add the highlighted word between parts
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
    const percentage = Math.round((score / (totalQuestions * 10)) * 100);
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
              <Text style={styles.resultsTitle}>Game Complete!</Text>

              <Card style={styles.resultsCard}>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Total Score:</Text>
                  <Text style={styles.resultsTotal}>{score} pts</Text>
                </View>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Questions:</Text>
                  <Text style={styles.resultsTotal}>{questionsAsked}/{totalQuestions}</Text>
                </View>
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsLabel}>Percentage:</Text>
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

  // Playing Screen - Everything fits on one screen
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
            {/* Header */}
            <View style={styles.gameHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>Q {questionsAsked + 1}/{totalQuestions}</Text>
                <Text style={styles.progressText}>🚀 Speed Match</Text>
                <Text style={styles.scoreTextPlaying}>Score: {score}</Text>
              </View>
              
              {/* Timer */}
              <View style={styles.timerContainer}>
                <View style={[
                  styles.timerCircle,
                  speedMatchTime <= 3 && styles.timerWarning
                ]}>
                  <Text style={[
                    styles.timerText,
                    speedMatchTime <= 3 && styles.timerTextWarning
                  ]}>
                    {speedMatchTime}
                  </Text>
                </View>
                <Text style={styles.timerLabel}>seconds left</Text>
              </View>
            </View>

            {/* Question Card with Answer inside */}
            {speedMatchQuestion && (
              <Card style={styles.questionCard}>
                {speedMatchQuestion.word.emoji && (
                  <Text style={styles.questionEmoji}>{speedMatchQuestion.word.emoji}</Text>
                )}
                
                <View style={styles.questionTextContainer}>
                  {renderQuestion()}
                </View>
                
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>Answer:</Text>
                  <View style={styles.answerBox}>
                    <Text style={styles.answerText} numberOfLines={3} adjustsFontSizeToFit>
                      {speedMatchQuestion.displayedAnswer}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Yes/No Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => handleSpeedMatchAnswer(false)}
                style={[
                  styles.answerButton,
                  styles.noButton,
                  feedback === 'wrong' && !speedMatchQuestion.isCorrect && styles.correctButton,
                  feedback === 'correct' && speedMatchQuestion.isCorrect && styles.wrongButton,
                ]}
                disabled={feedback !== ''}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>❌ NO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSpeedMatchAnswer(true)}
                style={[
                  styles.answerButton,
                  styles.yesButton,
                  feedback === 'correct' && speedMatchQuestion.isCorrect && styles.correctButton,
                  feedback === 'wrong' && !speedMatchQuestion.isCorrect && styles.wrongButton,
                ]}
                disabled={feedback !== ''}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>✅ YES</Text>
              </TouchableOpacity>
            </View>

            {/* Feedback */}
            {feedback !== '' && (
              <View ref={feedbackRef} collapsable={false}>
                <Card style={styles.feedbackCard}>
                {feedback === 'correct' && (
                  <>
                    <Text style={styles.feedbackEmoji}>✅</Text>
                    <Text style={styles.feedbackTitle}>Correct! +{speedMatchTime} pts</Text>
                  </>
                )}
                {feedback === 'wrong' && (
                  <>
                    <Text style={styles.feedbackEmoji}>❌</Text>
                    <Text style={styles.feedbackTitle}>Wrong! -3 pts</Text>
                  </>
                )}
                {feedback === 'timeout' && (
                  <>
                    <Text style={styles.feedbackEmoji}>⏰</Text>
                    <Text style={styles.feedbackTitle}>Time's Up! -3 pts</Text>
                  </>
                )}
              </Card>
              </View>
            )}

            {/* End Game Button */}
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
    marginBottom: spacing.xs,
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
  
  // Timer
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  timerWarning: {
    borderColor: colors.error,
    backgroundColor: '#fee2e2',
  },
  timerText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  timerTextWarning: {
    color: colors.error,
  },
  timerLabel: {
    fontSize: fontSize.sm,
    color: colors.white,
    marginTop: spacing.xs,
    fontWeight: fontWeight.semibold,
  },

  // Question Card
  questionCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  questionEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  questionTextContainer: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  questionText: {
    fontSize: fontSize.xl,
    textAlign: 'center',
    lineHeight: fontSize.xl * 1.4,
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
    color: colors.purple,
    fontWeight: fontWeight.semibold,
    fontStyle: 'italic',
  },
  answerSection: {
    width: '100%',
  },
  answerLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.gray700,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  answerBox: {
    backgroundColor: '#fef3c7',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: '#fbbf24',
    minHeight: 70,
    justifyContent: 'center',
  },
  answerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray800,
    textAlign: 'center',
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  answerButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  noButton: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  yesButton: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  correctButton: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  wrongButton: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  buttonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },

  // Feedback
  feedbackCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  feedbackEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  feedbackTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },

  // End Button
  endButton: {
    alignSelf: 'center',
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
    paddingVertical: spacing.sm,
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { english11PlusSets } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';
import { storage } from '../../utils/storage';

export default function ComprehensionPracticeScreen({ route, navigation }) {
  const { setId, passageId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);
  const passage = set?.passages?.find(p => p.id === passageId) || set?.passages?.[0];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const currentQuestion = passage?.questions[currentQuestionIndex];
  const totalQuestions = passage?.questions.length || 0;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        scaleAnim.setValue(0);
      } else {
        calculateResults();
      }
    }, 1500);
  };

  const calculateResults = () => {
    const correctCount = Object.keys(answers).reduce((count, key) => {
      const questionIndex = parseInt(key);
      const userAnswer = answers[key];
      const correctAnswer = passage.questions[questionIndex].correctAnswer;
      return userAnswer === correctAnswer ? count + 1 : count;
    }, 0);

    // Include the last answer if answered
    const finalCorrect = selectedAnswer === currentQuestion.correctAnswer
      ? correctCount + 1
      : correctCount;

    // Save attempt
    storage.savePracticeAttempt('comprehension', setId, finalCorrect, totalQuestions);

    setShowResults(true);
  };

  const getCorrectCount = () => {
    let correctCount = Object.keys(answers).reduce((count, key) => {
      const questionIndex = parseInt(key);
      const userAnswer = answers[key];
      const correctAnswer = passage.questions[questionIndex].correctAnswer;
      return userAnswer === correctAnswer ? count + 1 : count;
    }, 0);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      correctCount += 1;
    }

    return correctCount;
  };

  const getAnswerStyle = (option) => {
    if (!isAnswered) {
      return styles.option;
    }

    if (option === currentQuestion.correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return [styles.option, styles.wrongOption];
    }

    return [styles.option, styles.dimmedOption];
  };

  if (showResults) {
    const correctCount = getCorrectCount();
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <LinearGradient colors={set.gradient} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>📚 Comprehension Complete!</Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreText}>
                {correctCount} out of {totalQuestions} correct
              </Text>
            </View>

            <View style={styles.performanceBox}>
              {percentage >= 80 && (
                <Text style={styles.performanceText}>🌟 Excellent! Outstanding comprehension skills!</Text>
              )}
              {percentage >= 60 && percentage < 80 && (
                <Text style={styles.performanceText}>👏 Good work! Keep practicing to improve!</Text>
              )}
              {percentage < 60 && (
                <Text style={styles.performanceText}>💪 Keep trying! Read the passage carefully!</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={set?.gradient || ['#3b82f6', '#2563eb']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{passage?.title}</Text>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>

        {/* Passage (shown on first question only) */}
        {currentQuestionIndex === 0 && (
          <View style={styles.passageCard}>
            <Text style={styles.passageTitle}>📖 Read the passage carefully:</Text>
            <Text style={styles.passageText}>{passage?.passage}</Text>
          </View>
        )}

        {/* Current Question */}
        <Animated.View
          style={[
            styles.questionCard,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.questionText}>
            {currentQuestion?.question}
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getAnswerStyle(option)}
                onPress={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                <Text style={styles.optionText}>{option}</Text>
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                  <Text style={styles.crossmark}>✗</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Show passage reference button after first question */}
        {currentQuestionIndex > 0 && (
          <TouchableOpacity
            style={styles.referenceButton}
            onPress={() => {
              // Could navigate to a separate passage view or show modal
              alert(passage.passage);
            }}
          >
            <Text style={styles.referenceButtonText}>📖 View Passage Again</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: fontSize.base,
    color: colors.white,
    opacity: 0.9,
  },
  passageCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  passageTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  passageText: {
    fontSize: fontSize.base,
    lineHeight: 24,
    color: colors.gray[700],
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[800],
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  wrongOption: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  dimmedOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.gray[800],
    flex: 1,
  },
  checkmark: {
    fontSize: fontSize.xl,
    color: colors.success,
    fontWeight: fontWeight.bold,
  },
  crossmark: {
    fontSize: fontSize.xl,
    color: colors.error,
    fontWeight: fontWeight.bold,
  },
  referenceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  referenceButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  resultsContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  resultsTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
    ...shadows.large,
  },
  scorePercentage: {
    fontSize: 64,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  scoreText: {
    fontSize: fontSize.lg,
    color: colors.gray[600],
    marginTop: spacing.sm,
  },
  performanceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
  },
  performanceText: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    fontWeight: fontWeight.semibold,
  },
  button: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});

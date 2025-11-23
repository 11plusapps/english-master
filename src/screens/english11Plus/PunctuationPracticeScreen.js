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

export default function PunctuationPracticeScreen({ route, navigation }) {
  const { setId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);
  const questions = set?.questions || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

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

    if (answer === currentQuestion.correctAnswer) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setShowExplanation(true);

    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowExplanation(false);
        scaleAnim.setValue(0);
      } else {
        const finalCorrect = answer === currentQuestion.correctAnswer
          ? correctAnswers + 1
          : correctAnswers;
        storage.savePracticeAttempt('punctuation', setId, finalCorrect, totalQuestions);
        setShowResults(true);
      }
    }, 3000);
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
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <LinearGradient colors={set.gradient} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>❗ Punctuation Complete!</Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreText}>
                {correctAnswers} out of {totalQuestions} correct
              </Text>
            </View>

            <View style={styles.performanceBox}>
              {percentage >= 80 && (
                <Text style={styles.performanceText}>🌟 Perfect punctuation! Excellent work!</Text>
              )}
              {percentage >= 60 && percentage < 80 && (
                <Text style={styles.performanceText}>👏 Good effort! Keep practicing!</Text>
              )}
              {percentage < 60 && (
                <Text style={styles.performanceText}>💪 Review punctuation rules and try again!</Text>
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
    <LinearGradient colors={set?.gradient || ['#f59e0b', '#d97706']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>❗ Punctuation</Text>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>

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

          {showExplanation && currentQuestion?.explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>💡 Explanation:</Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.scoreTracker}>
          <Text style={styles.scoreTrackerText}>
            ✓ Correct: {correctAnswers} | Questions: {currentQuestionIndex + 1}/{totalQuestions}
          </Text>
        </View>
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
  explanationBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.orange[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  explanationTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  explanationText: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    lineHeight: 20,
  },
  scoreTracker: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  scoreTrackerText: {
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
    color: colors.warning,
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
    color: colors.warning,
  },
});

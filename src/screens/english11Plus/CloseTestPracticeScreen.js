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

export default function CloseTestPracticeScreen({ route, navigation }) {
  const { setId, exerciseId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);
  const exercise = set?.exercises?.find(e => e.id === exerciseId) || set?.exercises?.[0];

  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const currentBlank = exercise?.blanks[currentBlankIndex];
  const totalBlanks = exercise?.blanks.length || 0;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [currentBlankIndex]);

  const renderTextWithBlanks = () => {
    const text = exercise?.text || '';
    const parts = text.split('_____');

    return (
      <Text style={styles.passageText}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <Text>{part}</Text>
            {index < parts.length - 1 && (
              <Text style={[
                styles.blank,
                index === currentBlankIndex && styles.currentBlank
              ]}>
                {answers[index] || '_____'}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setAnswers({
      ...answers,
      [currentBlankIndex]: answer
    });

    setTimeout(() => {
      if (currentBlankIndex < totalBlanks - 1) {
        setCurrentBlankIndex(currentBlankIndex + 1);
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
      const blankIndex = parseInt(key);
      const userAnswer = answers[key];
      const correctAnswer = exercise.blanks[blankIndex].correctAnswer;
      return userAnswer === correctAnswer ? count + 1 : count;
    }, 0);

    const finalCorrect = selectedAnswer === currentBlank.correctAnswer
      ? correctCount + 1
      : correctCount;

    storage.savePracticeAttempt('cloze', setId, finalCorrect, totalBlanks);
    setShowResults(true);
  };

  const getCorrectCount = () => {
    let correctCount = Object.keys(answers).reduce((count, key) => {
      const blankIndex = parseInt(key);
      const userAnswer = answers[key];
      const correctAnswer = exercise.blanks[blankIndex].correctAnswer;
      return userAnswer === correctAnswer ? count + 1 : count;
    }, 0);

    if (selectedAnswer === currentBlank.correctAnswer) {
      correctCount += 1;
    }

    return correctCount;
  };

  const getAnswerStyle = (option) => {
    if (!isAnswered) {
      return styles.option;
    }

    if (option === currentBlank.correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (option === selectedAnswer && option !== currentBlank.correctAnswer) {
      return [styles.option, styles.wrongOption];
    }

    return [styles.option, styles.dimmedOption];
  };

  if (showResults) {
    const correctCount = getCorrectCount();
    const percentage = Math.round((correctCount / totalBlanks) * 100);

    return (
      <LinearGradient colors={set.gradient} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>📝 Cloze Test Complete!</Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreText}>
                {correctCount} out of {totalBlanks} correct
              </Text>
            </View>

            <View style={styles.performanceBox}>
              {percentage >= 80 && (
                <Text style={styles.performanceText}>🌟 Excellent! You have great vocabulary skills!</Text>
              )}
              {percentage >= 60 && percentage < 80 && (
                <Text style={styles.performanceText}>👏 Good work! Keep practicing!</Text>
              )}
              {percentage < 60 && (
                <Text style={styles.performanceText}>💪 Keep trying! Read the context carefully!</Text>
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
    <LinearGradient colors={set?.gradient || ['#10b981', '#059669']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{exercise?.title}</Text>
          <Text style={styles.progressText}>
            Blank {currentBlankIndex + 1} of {totalBlanks}
          </Text>
        </View>

        {/* Passage with blanks */}
        <View style={styles.passageCard}>
          <Text style={styles.passageTitle}>📖 Fill in the blanks:</Text>
          {renderTextWithBlanks()}
        </View>

        {/* Current Question */}
        <Animated.View
          style={[
            styles.questionCard,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.questionText}>
            Choose the best word for blank {currentBlankIndex + 1}:
          </Text>

          <View style={styles.optionsContainer}>
            {currentBlank?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getAnswerStyle(option)}
                onPress={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                <Text style={styles.optionText}>{option}</Text>
                {isAnswered && option === currentBlank.correctAnswer && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {isAnswered && option === selectedAnswer && option !== currentBlank.correctAnswer && (
                  <Text style={styles.crossmark}>✗</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
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
    lineHeight: 28,
    color: colors.gray[700],
  },
  blank: {
    fontWeight: fontWeight.bold,
    color: colors.gray[400],
    textDecorationLine: 'underline',
  },
  currentBlank: {
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
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
    color: colors.success,
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
    color: colors.success,
  },
});

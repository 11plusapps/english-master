import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { english11PlusSets } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';
import { storage } from '../../utils/storage';

export default function SpellingPracticeScreen({ route, navigation }) {
  const { setId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);
  const words = set?.words || [];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [isCorrect, setIsCorrect] = useState(false);

  const currentWord = words[currentWordIndex];
  const totalWords = words.length;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Speak the word when it loads
    speakWord();
  }, [currentWordIndex]);

  const speakWord = () => {
    if (currentWord?.word) {
      Speech.speak(currentWord.word, {
        language: 'en-GB',
        rate: 0.8,
      });
    }
  };

  const handleSubmit = () => {
    if (isAnswered || !userInput.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnswered(true);

    const correct = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setTimeout(() => {
      if (currentWordIndex < totalWords - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput('');
        setIsAnswered(false);
        setIsCorrect(false);
        scaleAnim.setValue(0);
      } else {
        const finalCorrect = correct ? correctAnswers + 1 : correctAnswers;
        storage.savePracticeAttempt('spelling', setId, finalCorrect, totalWords);
        setShowResults(true);
      }
    }, 2000);
  };

  if (showResults) {
    const percentage = Math.round((correctAnswers / totalWords) * 100);

    return (
      <LinearGradient colors={set.gradient} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>✍️ Spelling Complete!</Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scorePercentage}>{percentage}%</Text>
              <Text style={styles.scoreText}>
                {correctAnswers} out of {totalWords} correct
              </Text>
            </View>

            <View style={styles.performanceBox}>
              {percentage >= 80 && (
                <Text style={styles.performanceText}>🌟 Perfect spelling! Outstanding work!</Text>
              )}
              {percentage >= 60 && percentage < 80 && (
                <Text style={styles.performanceText}>👏 Good effort! Keep practicing!</Text>
              )}
              {percentage < 60 && (
                <Text style={styles.performanceText}>💪 Keep practicing! Review spelling rules!</Text>
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
    <LinearGradient colors={set?.gradient || ['#ec4899', '#db2777']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✍️ Spelling Practice</Text>
          <Text style={styles.progressText}>
            Word {currentWordIndex + 1} of {totalWords}
          </Text>
          {currentWord?.difficulty && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {currentWord.difficulty.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.questionCard,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.soundSection}>
            <Text style={styles.instructionText}>
              Listen and spell the word:
            </Text>
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={speakWord}
            >
              <Text style={styles.speakerIcon}>🔊</Text>
              <Text style={styles.speakerText}>Play Word</Text>
            </TouchableOpacity>
          </View>

          {currentWord?.category && (
            <Text style={styles.categoryHint}>
              Category: {currentWord.category}
            </Text>
          )}

          <TextInput
            style={[
              styles.input,
              isAnswered && (isCorrect ? styles.inputCorrect : styles.inputWrong)
            ]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type the word here..."
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isAnswered}
          />

          {isAnswered && (
            <View style={[
              styles.feedbackBox,
              isCorrect ? styles.correctBox : styles.wrongBox
            ]}>
              {isCorrect ? (
                <>
                  <Text style={styles.feedbackIcon}>✓</Text>
                  <Text style={styles.feedbackText}>Correct! Well done!</Text>
                </>
              ) : (
                <>
                  <Text style={styles.feedbackIcon}>✗</Text>
                  <Text style={styles.feedbackText}>
                    The correct spelling is: <Text style={styles.correctWord}>{currentWord.word}</Text>
                  </Text>
                </>
              )}
            </View>
          )}

          {!isAnswered && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Check Spelling</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={styles.scoreTracker}>
          <Text style={styles.scoreTrackerText}>
            ✓ Correct: {correctAnswers} | Words: {currentWordIndex + 1}/{totalWords}
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
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  difficultyText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  soundSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  instructionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  speakerButton: {
    backgroundColor: colors.pink[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.small,
  },
  speakerIcon: {
    fontSize: fontSize.xxl,
  },
  speakerText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  categoryHint: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.xl,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: fontWeight.semibold,
  },
  inputCorrect: {
    borderColor: colors.success,
    backgroundColor: '#d1fae5',
  },
  inputWrong: {
    borderColor: colors.error,
    backgroundColor: '#fee2e2',
  },
  feedbackBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  correctBox: {
    backgroundColor: '#d1fae5',
  },
  wrongBox: {
    backgroundColor: '#fee2e2',
  },
  feedbackIcon: {
    fontSize: fontSize.xxxl,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: fontSize.base,
    color: colors.gray[800],
    textAlign: 'center',
  },
  correctWord: {
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
  submitButton: {
    backgroundColor: colors.pink[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
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
    color: colors.pink[500],
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
    color: colors.pink[500],
  },
});

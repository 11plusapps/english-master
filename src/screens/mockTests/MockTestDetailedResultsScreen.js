import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import Card from '../../components/Card';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function MockTestDetailedResultsScreen({ route, navigation }) {
  const { attemptData, testNumber } = route.params;
  const scrollViewRef = useRef(null);
  const questionRefs = useRef({});

  if (!attemptData || !attemptData.questions) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.mockTest} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorEmoji}>😕</Text>
              <Text style={styles.errorText}>No test data found</Text>
              <Button variant="primary" onPress={() => navigation.goBack()}>
                Go Back
              </Button>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const { questions, answers, score, totalQuestions, percentage, date } = attemptData;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if answer is correct
  const isAnswerCorrect = (question, userAnswer) => {
    if (!userAnswer) return false;

    if (question.type === 'missing') {
      if (typeof userAnswer === 'object') {
        return question.missingPositions.every(pos => 
          userAnswer[pos] && userAnswer[pos].toLowerCase() === question.word.word[pos].toLowerCase()
        );
      } else {
        return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase();
      }
    } else if (question.type === 'spelling') {
      return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase();
    } else {
      return userAnswer === question.correctAnswer;
    }
  };

  // Get user's answer display text
  const getUserAnswerDisplay = (question, userAnswer) => {
    if (!userAnswer) return 'No answer';

    if (question.type === 'missing' && typeof userAnswer === 'object') {
      return question.word.word.split('').map((letter, idx) => 
        question.missingPositions?.includes(idx) ? (userAnswer[idx] || '_') : letter
      ).join('');
    }

    return userAnswer;
  };

  // Scroll to specific question
  const scrollToQuestion = (questionIndex) => {
    const yPosition = questionRefs.current[questionIndex];
    if (yPosition !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition - 20, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.mockTest} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
           <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />          

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>📋</Text>
              <Text style={styles.headerTitle}>Full Test Results</Text>
              <Text style={styles.headerSubtitle}>Mock Test {testNumber}</Text>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>

            {/* Summary Card */}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Score:</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{percentage}%</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Correct:</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>{score}/{totalQuestions}</Text>
              </View>
            </Card>

            {/* Quick Navigation */}
            <View style={styles.quickNavContainer}>
              <Text style={styles.quickNavTitle}>⚡ Jump to Question</Text>
              <Text style={styles.quickNavSubtitle}>
                Green = Correct • Red = Wrong
              </Text>
              <View style={styles.quickNavGrid}>
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = isAnswerCorrect(question, userAnswer);
                  
                  return (
                    <TouchableOpacity
                      key={question.id}
                      onPress={() => scrollToQuestion(index)}
                      style={[
                        styles.quickNavButton,
                        isCorrect ? styles.quickNavCorrect : styles.quickNavWrong
                      ]}
                    >
                      <Text style={styles.quickNavText}>{index + 1}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Questions List */}
            <Text style={styles.sectionTitle}>🔍 Question by Question Review</Text>
            
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = isAnswerCorrect(question, userAnswer);
              const userAnswerDisplay = getUserAnswerDisplay(question, userAnswer);
              
              return (
                <View
                  key={question.id}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    questionRefs.current[index] = y;
                  }}
                >
                  <Card style={[
                    styles.questionCard,
                    isCorrect ? styles.questionCardCorrect : styles.questionCardWrong
                  ]}>
                    {/* Question Header */}
                    <View style={styles.questionHeader}>
                      <View style={styles.questionNumberContainer}>
                        <Text style={styles.questionNumber}>Q{index + 1}</Text>
                      </View>
                      <View style={styles.questionTypeContainer}>
                        <Text style={styles.questionType}>
                          {question.type === 'quiz' ? '📝' : 
                           question.type === 'sentence' ? '📚' : 
                           question.type === 'missing' ? '🧩' : '✏️'}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        isCorrect ? styles.statusBadgeCorrect : styles.statusBadgeWrong
                      ]}>
                        <Text style={styles.statusText}>
                          {isCorrect ? '✓ Correct' : '✗ Wrong'}
                        </Text>
                      </View>
                    </View>

                    {/* Question Text */}
                    <View style={styles.questionContent}>
                      <Text style={styles.questionEmoji}>{question.word.emoji}</Text>
                      <Text style={styles.questionText}>{question.question}</Text>
                    </View>

                    {/* Answers Section */}
                    <View style={styles.answersSection}>
                      {/* Your Answer */}
                      <View style={[
                        styles.answerBox,
                        isCorrect ? styles.answerBoxCorrect : styles.answerBoxWrong
                      ]}>
                        <Text style={styles.answerLabel}>
                          {isCorrect ? '🥇 Your Answer:' : '🫣 Your Answer:'}
                        </Text>
                        <Text style={[
                          styles.answerText,
                          isCorrect ? styles.answerTextCorrect : styles.answerTextWrong
                        ]}>
                          {userAnswerDisplay}
                        </Text>
                      </View>

                      {/* Correct Answer (only show if wrong) */}
                      {!isCorrect && (
                        <View style={styles.correctAnswerBox}>
                          <Text style={styles.correctAnswerLabel}>✅️ Correct Answer:</Text>
                          <Text style={styles.correctAnswerText}>{question.correctAnswer}</Text>
                        </View>
                      )}
                    </View>

                    {/* Word Definition (helpful reminder) */}
                    <View style={styles.definitionBox}>
                      <Text style={styles.definitionLabel}>💡 Remember:</Text>
                      <Text style={styles.definitionText}>
                        <Text style={styles.definitionWord}>{question.word.word}</Text> means {question.word.definition}
                      </Text>
                    </View>
                  </Card>
                </View>
              );
            })}

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <Button
                variant="green"
                onPress={() => navigation.navigate('MockTests')}
                style={styles.actionButton}
              >
                🔄 Try Another Test
              </Button>
              <Button
                variant="primary"
                onPress={() => navigation.navigate('Main')}
                style={styles.actionButton}
              >
                🏠 Back to Home
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.xl,
    color: colors.white,
    marginBottom: spacing.xl,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.lg,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },

  // Summary Card
  summaryCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    fontWeight: fontWeight.semibold,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },

  // Quick Navigation
  quickNavContainer: {
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(76, 4, 84, 0.67)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  quickNavTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  quickNavSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  quickNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickNavButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  quickNavCorrect: {
    backgroundColor: colors.success,
  },
  quickNavWrong: {
    backgroundColor: colors.error,
  },
  quickNavText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },

  // Section Title
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  // Question Card
  questionCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
  },
  questionCardCorrect: {
    borderLeftColor: colors.success,
    backgroundColor: '#f0fdf4',
  },
  questionCardWrong: {
    borderLeftColor: colors.error,
    backgroundColor: '#fef2f2',
  },

  // Question Header
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  questionNumberContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  questionNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  questionTypeContainer: {
    flex: 1,
  },
  questionType: {
    fontSize: 20,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeCorrect: {
    backgroundColor: colors.success,
  },
  statusBadgeWrong: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },

  // Question Content
  questionContent: {
    marginBottom: spacing.md,
  },
  questionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontSize: fontSize.lg,
    color: colors.gray800,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },

  // Answers Section
  answersSection: {
    marginBottom: spacing.md,
  },
  answerBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  answerBoxCorrect: {
    backgroundColor: '#d1fae5',
    borderColor: colors.success,
  },
  answerBoxWrong: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
  },
  answerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  answerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  answerTextCorrect: {
    color: colors.success,
  },
  answerTextWrong: {
    color: colors.error,
  },

  correctAnswerBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  correctAnswerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs / 2,
  },
  correctAnswerText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  // Definition Box
  definitionBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  definitionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#92400e',
    marginBottom: spacing.xs / 2,
  },
  definitionText: {
    fontSize: fontSize.md,
    color: '#92400e',
    lineHeight: 20,
  },
  definitionWord: {
    fontWeight: fontWeight.bold,
    color: '#78350f',
  },

  // Bottom Actions
  bottomActions: {
    marginTop: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
});

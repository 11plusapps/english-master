import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function MockTestQuestionsScreen({ 
  questions, 
  currentIndex, 
  answers, 
  timeLeft,
  testNumber,
  onSubmitAnswer,
  onNavigate,
  onFinishTest
}) {
  const inputRefs = useRef({});
  const spellingInputRef = useRef(null);
  const currentQ = questions[currentIndex];
  const progress = Object.keys(answers).length;

  // Get test name from testNumber
  const getTestName = (testNum) => {
    if (testNum === 'random') {
      return 'Random Test';
    }
    return `Mock Test ${testNum}`;
  };

  // Auto-focus keyboard when question changes
  useEffect(() => {
    if (currentQ.type === 'spelling') {
      // Focus spelling input after a short delay
      setTimeout(() => {
        spellingInputRef.current?.focus();
      }, 300);
    } else if (currentQ.type === 'missing' && currentQ.missingPositions?.length > 0) {
      // Focus first missing letter input
      const firstPos = currentQ.missingPositions[0];
      setTimeout(() => {
        inputRefs.current[`${currentQ.id}_${firstPos}`]?.focus();
      }, 300);
    }
  }, [currentIndex, currentQ.id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.mockTest} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.testScrollContent}>
            {/* Header with Test Name */}
            <View style={styles.gameHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Q {currentIndex + 1}/{questions.length}
                </Text>
                <Text style={styles.testNameText}>{getTestName(testNumber)}</Text>
                <Text style={styles.scoreTextPlaying}>⚡ {progress} Ans</Text>
              </View>
              
              <View style={styles.timerContainer}>
                <View style={[
                  styles.timerCircle,
                  timeLeft <= 60 && styles.timerCritical
                ]}>
                  <Text style={styles.timerTextLarge}>{formatTime(timeLeft)}</Text>
                </View>
              </View>
            </View>

            {/* Question Card */}
            <Card style={styles.questionCard}>
              <Text style={styles.questionEmoji}>{currentQ.word.emoji}</Text>
              <Text style={styles.questionText}>
                {currentQ.type === 'missing' 
                  ? 'Fill in the missing letters:' 
                  : currentQ.question}
              </Text>

              {currentQ.type === 'missing' ? (
                <View>
                  <View style={styles.hintBox}>
                    <Text style={styles.hintLabel}>💡 Definition:</Text>
                    <Text style={styles.hintText}>{currentQ.word.definition}</Text>
                  </View>
                  
                  {/* Show word with input boxes for missing letters */}
                  <View style={styles.mockWordContainer}>
                    {currentQ.word.word.split('').map((letter, idx) => {
                      const isMissing = currentQ.missingPositions?.includes(idx);
                      const userInput = ((answers[currentQ.id] || {})[idx]) || '';
                      
                      return (
                        <View key={idx} style={styles.mockLetterContainer}>
                          {isMissing ? (
                            <TextInput
                              ref={ref => inputRefs.current[`${currentQ.id}_${idx}`] = ref}
                              style={styles.mockLetterInput}
                              value={userInput}
                              onChangeText={(text) => {
                                const newAnswers = { ...(answers[currentQ.id] || {}) };
                                if (text.length <= 1) {
                                  newAnswers[idx] = text.toLowerCase();
                                  onSubmitAnswer(currentQ.id, newAnswers);
                                  
                                  // Only auto-focus next input if user actually typed a character
                                  if (text.length === 1 && currentQ.missingPositions) {
                                    const currentPosIndex = currentQ.missingPositions.indexOf(idx);
                                    if (currentPosIndex >= 0 && currentPosIndex < currentQ.missingPositions.length - 1) {
                                      const nextPos = currentQ.missingPositions[currentPosIndex + 1];
                                      setTimeout(() => {
                                        inputRefs.current[`${currentQ.id}_${nextPos}`]?.focus();
                                      }, 50);
                                    }
                                  }
                                }
                              }}
                              onKeyPress={(e) => {
                                // Handle backspace to go to previous input
                                if (e.nativeEvent.key === 'Backspace' && userInput === '') {
                                  const currentPosIndex = currentQ.missingPositions.indexOf(idx);
                                  if (currentPosIndex > 0) {
                                    const prevPos = currentQ.missingPositions[currentPosIndex - 1];
                                    inputRefs.current[`${currentQ.id}_${prevPos}`]?.focus();
                                  }
                                }
                              }}
                              maxLength={1}
                              autoCapitalize="none"
                              autoCorrect={false}
                              spellCheck={false}
                            />
                          ) : (
                            <Text style={styles.mockLetterText}>{letter}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : currentQ.type === 'spelling' ? (
                <View>
                  <View style={styles.hintBox}>
                    <Text style={styles.hintLabel}>💡 Hint:</Text>
                    <Text style={styles.hintText}>{currentQ.word.definition}</Text>
                  </View>
                  <TextInput
                    ref={spellingInputRef}
                    style={styles.spellingInput}
                    value={answers[currentQ.id] || ''}
                    onChangeText={(text) => onSubmitAnswer(currentQ.id, text)}
                    placeholder="Type your answer..."
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    multiline={false}
                    editable={true}
                    numberOfLines={1}
                  />
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {currentQ.options.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => onSubmitAnswer(currentQ.id, opt)}
                      style={[
                        styles.optionButton,
                        answers[currentQ.id] === opt && styles.selectedOption,
                      ]}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>

            {/* Navigation Buttons */}
            <View style={styles.navigation}>
              <Button
                variant="secondary"
                onPress={() => onNavigate(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                style={styles.navButton}
              >
                ← Previous
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button variant="green" onPress={onFinishTest} style={styles.navButton}>
                  Finish Test ✓
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onPress={() => onNavigate(Math.min(questions.length - 1, currentIndex + 1))}
                  style={styles.navButton}
                >
                  Next →
                </Button>
              )}
            </View>

            {/* Quick Navigation */}
            <View style={styles.quickNav}>
              <Text style={styles.quickNavTitle}>Quick Navigation</Text>
              <View style={styles.quickNavGrid}>
                {questions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onNavigate(idx)}
                    style={[
                      styles.quickNavButton,
                      currentIndex === idx && styles.quickNavCurrent,
                      answers[q.id] && styles.quickNavAnswered,
                    ]}
                  >
                    <Text style={[
                      styles.quickNavText,
                      currentIndex === idx && styles.quickNavTextCurrent,
                    ]}>
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* End Test Button */}
            <Button
              variant="error"
              size="small"
              onPress={() => {
                Alert.alert(
                  'Finish Test?',
                  'Are you sure you want to finish the test now? Your current answers will be graded.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Finish Test', onPress: onFinishTest, style: 'destructive' }
                  ]
                );
              }}
              style={styles.endButton}
            >
              Finish Test Early
            </Button>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  testScrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  
  // Header
  gameHeader: { marginBottom: spacing.sm },
  progressInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs 
  },
  progressText: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.bold, 
    color: colors.white,
    flex: 1,
  },
  testNameText: {
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.bold, 
    color: colors.white,
    flex: 2,
    textAlign: 'center',
  },
  scoreTextPlaying: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.bold, 
    color: colors.white,
    flex: 1,
    textAlign: 'right',
  },
  timerContainer: { alignItems: 'center' },
  timerCircle: { 
    width: 70, 
    height: 70, 
    borderRadius: 40, 
    backgroundColor: colors.success, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 4, 
    borderColor: colors.white 
  },
  timerCritical: { backgroundColor: colors.error },
  timerTextLarge: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.bold, 
    color: colors.white 
  },
  
  // Question Card
  questionCard: { marginBottom: spacing.md, alignItems: 'center' },
  questionEmoji: { fontSize: 48, marginBottom: spacing.xs },
  questionText: { 
    fontSize: fontSize.xl, 
    fontWeight: fontWeight.semibold, 
    color: colors.gray800, 
    textAlign: 'center', 
    marginBottom: spacing.sm 
  },
  hintBox: { 
    backgroundColor: colors.gray50, 
    padding: spacing.sm, 
    borderRadius: borderRadius.md, 
    marginBottom: spacing.xs, 
    width: '100%' 
  },
  hintLabel: { 
    fontSize: fontSize.md, 
    fontWeight: fontWeight.bold, 
    color: colors.primary, 
    marginBottom: spacing.xs 
  },
  hintText: { fontSize: fontSize.md, color: colors.gray700 },
  spellingInput: { 
    backgroundColor: colors.white, 
    borderWidth: 2, 
    borderColor: colors.primary, 
    borderRadius: borderRadius.md, 
    paddingHorizontal: spacing.md, 
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontSize: fontSize.lg, 
    color: colors.gray800,
    width: '100%',
    height: 60,
  },
  optionsContainer: { marginBottom: spacing.sm, width: '100%' },
  optionButton: { 
    backgroundColor: colors.white, 
    padding: spacing.sm, 
    borderRadius: borderRadius.lg, 
    marginBottom: spacing.sm, 
    borderWidth: 2, 
    borderColor: colors.gray300 
  },
  selectedOption: { 
    borderColor: colors.primary, 
    backgroundColor: colors.primaryLight 
  },
  optionText: { 
    fontSize: fontSize.lg, 
    color: colors.gray800, 
    textAlign: 'center' 
  },
  
  // Navigation
  navigation: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: spacing.lg 
  },
  navButton: { flex: 1, marginHorizontal: spacing.xs },
  
  // Quick Navigation
  quickNav: { marginBottom: spacing.lg },
  quickNavTitle: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.bold, 
    color: colors.white, 
    marginBottom: spacing.md, 
    textAlign: 'center' 
  },
  quickNavGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center' 
  },
  quickNavButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: colors.white, 
    borderRadius: 8, 
    margin: 4, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quickNavCurrent: { backgroundColor: colors.primary },
  quickNavAnswered: { backgroundColor: colors.success },
  quickNavText: { 
    fontSize: fontSize.md, 
    color: colors.gray800, 
    fontWeight: fontWeight.semibold 
  },
  quickNavTextCurrent: { color: colors.white },
  
  endButton: { alignSelf: 'center', marginTop: spacing.md },
  
  // Missing Word
  mockWordContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginTop: spacing.md 
  },
  mockLetterContainer: { marginHorizontal: 2, marginVertical: 4 },
  mockLetterText: { 
    fontSize: 28, 
    fontWeight: fontWeight.bold, 
    color: colors.gray800, 
    width: 35, 
    height: 45, 
    textAlign: 'center', 
    lineHeight: 45, 
    backgroundColor: colors.gray100, 
    borderRadius: borderRadius.md, 
    borderWidth: 2, 
    borderColor: colors.gray300 
  },
  mockLetterInput: { 
    fontSize: 28, 
    fontWeight: fontWeight.bold, 
    color: colors.gray800, 
    width: 35, 
    height: 45, 
    textAlign: 'center', 
    backgroundColor: '#fff3cd', 
    borderRadius: borderRadius.md, 
    borderWidth: 2, 
    borderColor: '#ffc107', 
    padding: 0 
  },
});
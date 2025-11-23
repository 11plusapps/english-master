import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function MockTestQuickResultsScreen({ 
  results, 
  testNumber,
  questions,
  answers,
  onViewDetailedResults,
  onTryAnotherTest,
  onBackHome 
}) {
  const percentage = results.score;
  
  const getPerformanceEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 75) return '🌟';
    if (percentage >= 60) return '👍';
    return '💪';
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 75) return 'Great Job!';
    if (percentage >= 60) return 'Well Done!';
    return 'Keep Practicing!';
  };

  // Create attempt data for detailed view
  const currentAttemptData = {
    questions,
    answers,
    score: results.correct,
    totalQuestions: results.total,
    percentage: results.score,
    date: new Date().toISOString()
  };

  const handleViewDetails = () => {
    onViewDetailedResults(currentAttemptData, testNumber);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.mockTest} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.resultsContent}>
            <Text style={styles.resultsEmoji}>{getPerformanceEmoji()}</Text>
            <Text style={styles.resultsTitle}>{getPerformanceMessage()}</Text>
            <Text style={styles.resultsSubtitle}>Mock Test {testNumber}</Text>

            <TouchableOpacity onPress={handleViewDetails} activeOpacity={0.7} style={{ width: '100%' }}>
              <Card style={styles.resultsScoreCard}>
                <Text style={styles.resultsScoreText}>{results.score}%</Text>
                <Text style={styles.resultsCorrectText}>
                  {results.correct} out of {results.total} correct
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${results.score}%` }]} />
                </View>
                <Text style={styles.tapHint}>💡Tap to view Full Results</Text>
              </Card>
            </TouchableOpacity>

            {/* Question Type Breakdown */}
            <View style={styles.breakdownContainer}>
              <Text style={styles.breakdownTitle}>Question Breakdown</Text>
              <View style={styles.breakdownGrid}>
                {Object.entries(results.breakdown).map(([type, data]) => {
                  if (data.total === 0) return null;
                  const emoji = type === 'quiz' ? '📝' : 
                                type === 'sentence' ? '📚' : 
                                type === 'missing' ? '🧩' : '✏️';
                  const typePercentage = data.total > 0 ? 
                    Math.round((data.correct / data.total) * 100) : 0;
                  
                  return (
                    <TouchableOpacity 
                      key={type} 
                      onPress={handleViewDetails} 
                      activeOpacity={0.7}
                      style={{ width: '48%' }}
                    >
                      <Card style={styles.breakdownCard}>
                        <Text style={styles.breakdownEmoji}>{emoji}</Text>
                        <Text style={styles.breakdownType}>{type}</Text>
                        <Text style={styles.breakdownScore}>{data.correct}/{data.total}</Text>
                        <Text style={styles.breakdownPercent}>{typePercentage}%</Text>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.resultsActions}>
              <Button 
                variant="secondary" 
                onPress={handleViewDetails} 
                style={styles.resultButton}
              >
                📋 View Full Results
              </Button>
              <Button 
                variant="green" 
                onPress={onTryAnotherTest} 
                style={styles.resultButton}
              >
                🔄 Try Another Test
              </Button>
              <Button 
                variant="primary" 
                onPress={onBackHome} 
                style={styles.resultButton}
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
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  resultsContent: { padding: spacing.lg, alignItems: 'center' },
  
  // Results
  resultsEmoji: { fontSize: 100, marginBottom: spacing.lg },
  resultsTitle: { 
    fontSize: fontSize.xxxl, 
    fontWeight: fontWeight.bold, 
    color: colors.white, 
    marginBottom: spacing.sm 
  },
  resultsSubtitle: { 
    fontSize: fontSize.lg, 
    color: colors.white, 
    marginBottom: spacing.xl, 
    opacity: 0.9 
  },
  resultsScoreCard: { 
    padding: spacing.lg, 
    alignItems: 'center', 
    marginBottom: spacing.lg, 
    width: '100%' 
  },
  resultsScoreText: { 
    fontSize: 72, 
    fontWeight: fontWeight.bold, 
    color: colors.primary 
  },
  resultsCorrectText: { 
    fontSize: fontSize.lg, 
    color: colors.gray600, 
    marginBottom: spacing.lg 
  },
  progressBar: { 
    width: '100%', 
    height: 12, 
    backgroundColor: colors.gray200, 
    borderRadius: borderRadius.full, 
    overflow: 'hidden',
    marginBottom: spacing.sm 
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  tapHint: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    marginTop: spacing.xs,
    fontStyle: 'normal'
  },
  
  // Breakdown
  breakdownContainer: { width: '100%', marginBottom: spacing.xl },
  breakdownTitle: { 
    fontSize: fontSize.xl, 
    fontWeight: fontWeight.bold, 
    color: colors.white, 
    textAlign: 'center', 
    marginBottom: spacing.md 
  },
  breakdownGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  breakdownCard: { 
    width: '100%', 
    padding: spacing.md, 
    alignItems: 'center', 
    marginBottom: spacing.md 
  },
  breakdownEmoji: { fontSize: 32, marginBottom: spacing.xs },
  breakdownType: { 
    fontSize: fontSize.sm, 
    color: colors.gray600, 
    marginBottom: spacing.xs, 
    textTransform: 'capitalize' 
  },
  breakdownScore: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.bold, 
    color: colors.gray800 
  },
  breakdownPercent: { 
    fontSize: fontSize.md, 
    color: colors.primary, 
    fontWeight: fontWeight.semibold 
  },
  
  // Actions
  resultsActions: { width: '100%' },
  resultButton: { marginBottom: spacing.md },
});
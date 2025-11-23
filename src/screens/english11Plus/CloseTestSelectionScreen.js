import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { english11PlusSets } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';

export default function CloseTestSelectionScreen({ route, navigation }) {
  const { setId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);

  const handleExerciseSelect = (exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('English11PlusCloseTestPractice', {
      setId,
      exerciseId: exercise.id
    });
  };

  return (
    <LinearGradient colors={set?.gradient || ['#10b981', '#059669']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📝 Choose an Exercise</Text>
          <Text style={styles.subtitle}>
            Select a cloze test to practice filling in blanks
          </Text>
        </View>

        <View style={styles.exercisesContainer}>
          {set?.exercises?.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => handleExerciseSelect(exercise)}
              activeOpacity={0.8}
            >
              <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exercisePreview} numberOfLines={3}>
                {exercise.text.substring(0, 150)}...
              </Text>
              <View style={styles.blanksBadge}>
                <Text style={styles.blanksBadgeText}>
                  {exercise.blanks.length} Blanks to Fill
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  exercisesContainer: {
    gap: spacing.lg,
  },
  exerciseCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  exerciseNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  exerciseTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  exercisePreview: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  blanksBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  blanksBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
});

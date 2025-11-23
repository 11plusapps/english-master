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

export default function ComprehensionSelectionScreen({ route, navigation }) {
  const { setId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);

  const handlePassageSelect = (passage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('English11PlusComprehensionPractice', {
      setId,
      passageId: passage.id
    });
  };

  return (
    <LinearGradient colors={set?.gradient || ['#3b82f6', '#2563eb']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 Choose a Passage</Text>
          <Text style={styles.subtitle}>
            Select a reading comprehension passage to practice
          </Text>
        </View>

        <View style={styles.passagesContainer}>
          {set?.passages?.map((passage, index) => (
            <TouchableOpacity
              key={passage.id}
              style={styles.passageCard}
              onPress={() => handlePassageSelect(passage)}
              activeOpacity={0.8}
            >
              <Text style={styles.passageNumber}>Passage {index + 1}</Text>
              <Text style={styles.passageTitle}>{passage.title}</Text>
              <Text style={styles.passagePreview} numberOfLines={3}>
                {passage.passage.substring(0, 150)}...
              </Text>
              <View style={styles.questionsBadge}>
                <Text style={styles.questionsBadgeText}>
                  {passage.questions.length} Questions
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
  passagesContainer: {
    gap: spacing.lg,
  },
  passageCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  passageNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  passageTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  passagePreview: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  questionsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.blue[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  questionsBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});

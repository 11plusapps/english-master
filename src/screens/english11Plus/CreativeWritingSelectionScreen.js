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

export default function CreativeWritingSelectionScreen({ route, navigation }) {
  const { setId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);

  const handlePromptSelect = (prompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('English11PlusCreativeWriting', {
      setId,
      promptId: prompt.id
    });
  };

  return (
    <LinearGradient colors={set?.gradient || ['#6366f1', '#4f46e5']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ Choose a Writing Prompt</Text>
          <Text style={styles.subtitle}>
            Select a creative writing prompt to practice
          </Text>
        </View>

        <View style={styles.promptsContainer}>
          {set?.prompts?.map((prompt, index) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptCard}
              onPress={() => handlePromptSelect(prompt)}
              activeOpacity={0.8}
            >
              <Text style={styles.promptNumber}>Prompt {index + 1}</Text>
              <Text style={styles.promptTitle}>{prompt.title}</Text>
              <Text style={styles.promptText} numberOfLines={2}>
                {prompt.prompt}
              </Text>
              <View style={styles.wordLimitBadge}>
                <Text style={styles.wordLimitText}>
                  {prompt.wordLimit.min}-{prompt.wordLimit.max} words
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
  promptsContainer: {
    gap: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  promptNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.indigo[600],
    marginBottom: spacing.xs,
  },
  promptTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  wordLimitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.indigo[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  wordLimitText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.indigo[600],
  },
});

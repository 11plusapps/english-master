import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { english11PlusSets } from '../../data/english11Plus';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme';

export default function CreativeWritingScreen({ route, navigation }) {
  const { setId, promptId } = route.params;
  const set = english11PlusSets.find(s => s.id === setId);
  const prompt = set?.prompts?.find(p => p.id === promptId) || set?.prompts?.[0];

  const [story, setStory] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (text) => {
    setStory(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSave = () => {
    if (wordCount < prompt.wordLimit.min) {
      Alert.alert(
        'Story Too Short',
        `Your story needs at least ${prompt.wordLimit.min} words. You have ${wordCount} words.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Story Saved! 📝',
      'Great work! Your creative writing has been saved. Keep practicing your writing skills!',
      [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]
    );
  };

  const getWordCountColor = () => {
    if (wordCount < prompt.wordLimit.min) return colors.error;
    if (wordCount > prompt.wordLimit.max) return colors.warning;
    return colors.success;
  };

  return (
    <LinearGradient colors={set?.gradient || ['#6366f1', '#4f46e5']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ Creative Writing</Text>
          <Text style={styles.promptTitle}>{prompt?.title}</Text>
        </View>

        {/* Prompt Card */}
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>📖 Your Writing Prompt:</Text>
          <Text style={styles.promptText}>{prompt?.prompt}</Text>
        </View>

        {/* Hints Card */}
        <View style={styles.hintsCard}>
          <Text style={styles.hintsTitle}>💡 Writing Tips:</Text>
          {prompt?.hints.map((hint, index) => (
            <Text key={index} style={styles.hintItem}>
              • {hint}
            </Text>
          ))}
        </View>

        {/* Word Limit */}
        <View style={styles.wordLimitCard}>
          <Text style={styles.wordLimitText}>
            Word Limit: {prompt?.wordLimit.min} - {prompt?.wordLimit.max} words
          </Text>
          <Text style={[styles.wordCountText, { color: getWordCountColor() }]}>
            Current: {wordCount} words
          </Text>
        </View>

        {/* Writing Area */}
        <View style={styles.writingCard}>
          <Text style={styles.writingLabel}>✍️ Write Your Story:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={15}
            value={story}
            onChangeText={handleTextChange}
            placeholder="Start writing your story here..."
            placeholderTextColor={colors.gray[400]}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Story</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  promptTitle: {
    fontSize: fontSize.lg,
    color: colors.white,
    opacity: 0.9,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  promptLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    lineHeight: 24,
  },
  hintsCard: {
    backgroundColor: colors.indigo[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  hintsTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  hintItem: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  wordLimitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordLimitText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  wordCountText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  writingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  writingLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    lineHeight: 24,
    minHeight: 300,
    color: colors.gray[800],
  },
  buttonContainer: {
    gap: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium,
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.indigo[600],
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

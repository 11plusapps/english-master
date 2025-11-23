import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

export default function MyDifficultWordsScreen({ navigation }) {
  const [practiceList, setPracticeList] = useState([]);

  useEffect(() => {
    loadPracticeList();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPracticeList();
    }, [])
  );

  const loadPracticeList = async () => {
    try {
      const list = await storage.getPracticeList();
      setPracticeList(list);
    } catch (error) {
      console.error('Error loading practice list:', error);
    }
  };

  const removeWord = async (word, setId) => {
    Alert.alert(
      'Remove Word?',
      `Are you sure you want to remove "${word}" from your difficult words list?`,
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.removeFromPracticeList(word, setId);
              await loadPracticeList();
            } catch (error) {
              console.error('Error removing word:', error);
            }
          }
        }
      ]
    );
  };

  const handleWordPress = (word) => {
    navigation.navigate('Flashcard', { 
      setId: 'practice-list',
      initialWord: word 
    });
  };

  const handlePractice = () => {
    navigation.navigate('Practice', {
      setId: 'practice-list',
    });
  };

  const handleGames = () => {
    navigation.navigate('FunGames', {
      setId: 'practice-list',
    });
  };

  const handleAddWords = () => {
    navigation.navigate('LearningPortal');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={['#667eea', '#3a096cff', '#f193fb66']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>📕</Text>
              <View>
                <Text style={styles.title}>My Difficult Words</Text>
                <Text style={styles.subtitle}>
                  {practiceList.length} word{practiceList.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Empty State */}
            {practiceList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌟</Text>
                <Text style={styles.emptyTitle}>No difficult words yet!</Text>
                <Text style={styles.emptyText}>
                  Mark words as difficult while learning to add them here
                </Text>
                <TouchableOpacity 
                  style={styles.addWordsButton}
                  onPress={handleAddWords}
                >
                  <Text style={styles.addWordsButtonText}>Start Learning</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Word List */}
                <View style={styles.wordsList}>
                  {practiceList.map((item, index) => (
                    <TouchableOpacity
                      key={`${item.word}-${index}`}
                      style={styles.wordItem}
                      onPress={() => handleWordPress(item.word)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.wordContent}>
                        <Text style={styles.wordEmoji}>{item.emoji || '📖'}</Text>
                        <View style={styles.wordInfo}>
                          <Text style={styles.wordText}>{item.word}</Text>
                          <Text style={styles.wordDefinition} numberOfLines={1}>
                            {item.definition}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeWord(item.word, item.setId);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.removeIcon}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.practiceButton]}
                    onPress={handlePractice}
                  >
                    <View style={styles.actionButtonContent}>
                      <Text style={styles.actionEmoji}>🎯</Text>
                      <Text style={styles.actionText}>Practice These Words</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.gamesButton]}
                    onPress={handleGames}
                  >
                    <View style={styles.actionButtonContent}>
                      <Text style={styles.actionEmoji}>🎮</Text>
                      <Text style={styles.actionText}>Play Games</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.addMoreButton]}
                    onPress={handleAddWords}
                  >
                    <View style={styles.actionButtonContent}>
                      <Text style={styles.actionEmoji}>➕</Text>
                      <Text style={styles.actionText}>Add More Words</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 40,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  addWordsButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addWordsButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#a855f7',
  },
  wordsList: {
    marginBottom: spacing.lg,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#e9d5ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wordEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  wordDefinition: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  removeIcon: {
    fontSize: 24,
    color: '#ef4444',
    fontWeight: fontWeight.bold,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: spacing.sm,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceButton: {
    backgroundColor: '#10b981',
  },
  gamesButton: {
    backgroundColor: '#3b82f6',
  },
  addMoreButton: {
    backgroundColor: '#a855f7',
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vocabularySets } from '../data/vocabulary';

const STORAGE_KEYS = {
  PROGRESS: '@vocab_master:progress',
  BEST_SCORES: '@vocab_master:best_scores',
};

export const useProgress = () => {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      const data = value ? JSON.parse(value) : {};
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsLearned = async (setId, word) => {
    try {
      const updatedProgress = { ...progress };
      if (!updatedProgress[setId]) {
        updatedProgress[setId] = [];
      }
      if (!updatedProgress[setId].includes(word)) {
        updatedProgress[setId].push(word);
        await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));
        setProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  };

  const getSetProgress = (setId, totalWords) => {
    const learnedWords = progress[setId] || [];
    const learned = learnedWords.length;
    const percentage = totalWords > 0 ? (learned / totalWords) * 100 : 0;
    
    return {
      learned,
      total: totalWords,
      percentage: Math.round(percentage),
    };
  };

  const isWordLearned = (setId, word) => {
    const learnedWords = progress[setId] || [];
    return learnedWords.includes(word);
  };

  const toggleWordLearned = async (setId, word) => {
    try {
      const updatedProgress = { ...progress };
      if (!updatedProgress[setId]) {
        updatedProgress[setId] = [];
      }
      
      // Toggle: if already learned, remove it; otherwise add it
      const index = updatedProgress[setId].indexOf(word);
      if (index > -1) {
        updatedProgress[setId].splice(index, 1);
      } else {
        updatedProgress[setId].push(word);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error toggling word learned status:', error);
    }
  };

  const resetSetProgress = async (setId) => {
    try {
      const updatedProgress = { ...progress };
      delete updatedProgress[setId];
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updatedProgress));
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  // New function: Get total words learned across all sets
  const getTotalWordsLearned = () => {
    let total = 0;
    Object.values(progress).forEach(words => {
      total += words.length;
    });
    return total;
  };

  // New function: Get number of completed sets
  const getCompletedSetsCount = () => {
    let completed = 0;
    vocabularySets.forEach(set => {
      const setProgress = getSetProgress(set.id, set.words.length);
      if (setProgress.percentage === 100) {
        completed++;
      }
    });
    return completed;
  };

  // New function: Get overall progress percentage
  const getOverallProgress = () => {
    const totalPossibleWords = vocabularySets.reduce((sum, set) => sum + set.words.length, 0);
    const totalLearned = getTotalWordsLearned();
    
    if (totalPossibleWords === 0) return 0;
    return Math.round((totalLearned / totalPossibleWords) * 100);
  };

  // New function: Get statistics for all sets
  const getAllSetStatistics = () => {
    return vocabularySets.map(set => ({
      id: set.id,
      name: set.name,
      emoji: set.emoji,
      ...getSetProgress(set.id, set.words.length),
    }));
  };

  return {
    progress,
    loading,
    markAsLearned,
    markWordAsLearned: markAsLearned, // Alias for consistency
    toggleWordLearned,
    getSetProgress,
    isWordLearned,
    resetSetProgress,
    // New functions
    getTotalWordsLearned,
    getCompletedSetsCount,
    getOverallProgress,
    getAllSetStatistics,
  };
};
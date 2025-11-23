import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PROGRESS: '@vocab_master:progress',
  BEST_SCORES: '@vocab_master:best_scores',
  SETTINGS: '@vocab_master:settings',
  MOCK_TEST_ATTEMPTS: '@vocab_master:mock_test_attempts',
  FUN_GAME_ATTEMPTS: '@vocab_master:fun_game_attempts',
  PRACTICE_ATTEMPTS: '@vocab_master:practice_attempts',
  PRACTICE_LIST: '@vocab_master:practice_list',
};

export const storage = {
  // Progress functions
  async getProgress() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading progress:', error);
      return {};
    }
  },

  async saveProgress(progress) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  },

  async markWordAsLearned(setId, word) {
    try {
      const progress = await this.getProgress();
      if (!progress[setId]) {
        progress[setId] = [];
      }
      if (!progress[setId].includes(word)) {
        progress[setId].push(word);
        await this.saveProgress(progress);
      }
      return progress;
    } catch (error) {
      console.error('Error marking word as learned:', error);
      return null;
    }
  },

  // Practice List functions (My Difficult Words)
  async getPracticeList() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_LIST);
      const list = value ? JSON.parse(value) : [];
      
      // Import vocabularySets to get original emojis
      const { vocabularySets } = require('../data/vocabulary');
      
      // Enrich practice list with original emoji from vocabularySets
      return list.map(item => {
        // Find the original word in vocabularySets to get its emoji
        const originalSet = vocabularySets.find(set => set.id === item.setId);
        const originalWord = originalSet?.words.find(w => w.word === item.word);
        
        return {
          ...item,
          emoji: originalWord?.emoji || item.emoji || '💬'
        };
      });
    } catch (error) {
      console.error('Error loading practice list:', error);
      return [];
    }
  },

  async addToPracticeList(wordData) {
    try {
      const practiceList = await this.getPracticeList();
      
      // Check if word already exists
      const exists = practiceList.some(item => 
        item.word === wordData.word && item.setId === wordData.setId
      );
      
      if (exists) {
        return { success: false, message: 'Word already in practice list' };
      }
      
      // Check if list is full
      if (practiceList.length >= 10) {
        return { success: false, message: 'full' };
      }
      
      // Add word with metadata
      practiceList.push({
        word: wordData.word,
        setId: wordData.setId,
        emoji: wordData.emoji || '💬',
        definition: wordData.definition,
        example: wordData.example,
        synonyms: wordData.synonyms,
        antonyms: wordData.antonyms,
        addedAt: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_LIST, JSON.stringify(practiceList));
      return { success: true, message: 'Added to practice list' };
    } catch (error) {
      console.error('Error adding to practice list:', error);
      return { success: false, message: 'Error adding word' };
    }
  },

  async removeFromPracticeList(word, setId) {
    try {
      const practiceList = await this.getPracticeList();
      const filteredList = practiceList.filter(item => 
        !(item.word === word && item.setId === setId)
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_LIST, JSON.stringify(filteredList));
      return { success: true, message: 'Removed from practice list' };
    } catch (error) {
      console.error('Error removing from practice list:', error);
      return { success: false, message: 'Error removing word' };
    }
  },

  async isInPracticeList(word, setId) {
    try {
      const practiceList = await this.getPracticeList();
      return practiceList.some(item => item.word === word && item.setId === setId);
    } catch (error) {
      console.error('Error checking practice list:', error);
      return false;
    }
  },

  // Best scores functions
  async getBestScores() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.BEST_SCORES);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading best scores:', error);
      return {};
    }
  },

  async saveBestScore(gameType, setId, score) {
    try {
      const scores = await this.getBestScores();
      const key = `${gameType}-${setId}`;
      
      if (!scores[key] || score > scores[key]) {
        scores[key] = score;
        await AsyncStorage.setItem(STORAGE_KEYS.BEST_SCORES, JSON.stringify(scores));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving best score:', error);
      return false;
    }
  },

  // Settings functions
  async getSettings() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const defaultSettings = {
        soundEnabled: true,
        hapticEnabled: true,
        voiceoverEnabled: true,
        autoPlayVoiceover: true,
        timedQuizSeconds: 30,
        mockTestMinutes: 15,
      };
      
      if (!value) {
        // Save defaults on first load
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      
      const savedSettings = JSON.parse(value);
      
      // Migrate old defaults to new defaults and save
      let needsSave = false;
      if (savedSettings.timedQuizSeconds === 15) {
        savedSettings.timedQuizSeconds = 30;
        needsSave = true;
      }
      if (savedSettings.mockTestMinutes === 10) {
        savedSettings.mockTestMinutes = 15;
        needsSave = true;
      }
      
      // Merge with defaults to ensure all keys exist
      const mergedSettings = { ...defaultSettings, ...savedSettings };
      
      // Save if migration occurred
      if (needsSave) {
        await this.saveSettings(mergedSettings);
      }
      
      return mergedSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return { 
        soundEnabled: true, 
        hapticEnabled: true,
        voiceoverEnabled: true,
        autoPlayVoiceover: true,
        timedQuizSeconds: 30,
        mockTestMinutes: 15,
      };
    }
  },

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  // Mock Test Attempts functions
  async getMockTestAttempts() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_TEST_ATTEMPTS);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading mock test attempts:', error);
      return {};
    }
  },

  async saveMockTestAttempt(testId, score, totalQuestions, questions = null, answers = null) {
    try {
      const attempts = await this.getMockTestAttempts();
      if (!attempts[testId]) {
        attempts[testId] = [];
      }
      
      const attempt = {
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        date: new Date().toISOString(),
      };

      if (questions && answers) {
        attempt.questions = questions;
        attempt.answers = answers;
      }
      
      attempts[testId].unshift(attempt);
      
      if (attempts[testId].length > 3) {
        attempts[testId] = attempts[testId].slice(0, 3);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.MOCK_TEST_ATTEMPTS, JSON.stringify(attempts));
      return true;
    } catch (error) {
      console.error('Error saving mock test attempt:', error);
      return false;
    }
  },

  // Fun Game Attempts functions
  async getFunGameAttempts() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.FUN_GAME_ATTEMPTS);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading fun game attempts:', error);
      return {};
    }
  },

  async saveFunGameAttempt(gameType, setId, score) {
    try {
      const attempts = await this.getFunGameAttempts();
      const key = `${gameType}-${setId}`;
      
      if (!attempts[key]) {
        attempts[key] = [];
      }
      
      attempts[key].unshift({
        score,
        date: new Date().toISOString(),
      });
      
      if (attempts[key].length > 3) {
        attempts[key] = attempts[key].slice(0, 3);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.FUN_GAME_ATTEMPTS, JSON.stringify(attempts));
      return true;
    } catch (error) {
      console.error('Error saving fun game attempt:', error);
      return false;
    }
  },

  // Practice Attempts functions
  async getPracticeAttempts() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_ATTEMPTS);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error loading practice attempts:', error);
      return {};
    }
  },

  async savePracticeAttempt(practiceType, setId, score, totalQuestions) {
    try {
      const attempts = await this.getPracticeAttempts();
      const key = `${practiceType}-${setId}`;
      
      if (!attempts[key]) {
        attempts[key] = [];
      }
      
      attempts[key].unshift({
        score,
        totalQuestions,
        date: new Date().toISOString(),
      });
      
      if (attempts[key].length > 3) {
        attempts[key] = attempts[key].slice(0, 3);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_ATTEMPTS, JSON.stringify(attempts));
      return true;
    } catch (error) {
      console.error('Error saving practice attempt:', error);
      return false;
    }
  },

  // Clear all data
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROGRESS,
        STORAGE_KEYS.BEST_SCORES,
        STORAGE_KEYS.SETTINGS,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },
};
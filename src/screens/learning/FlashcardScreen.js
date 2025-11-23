import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableWithoutFeedback, PanResponder, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { vocabularySets } from '../../data/vocabulary';
import { useProgress } from '../../hooks/useProgress';
import { useSubscription } from '../../context/SubscriptionContext';
import { storage } from '../../utils/storage';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function FlashcardScreen({ route, navigation }) {
  const { setId, initialWord, letter } = route.params;
  
  // Handle practice list special case
  const isPracticeList = setId === 'practice-list';
  const [practiceListWords, setPracticeListWords] = useState([]);
  
  // Handle A-Z letter browsing - convert setId to string for checking
  const setIdString = String(setId);
  const isAZBrowsing = setIdString.startsWith('az-');
  const azLetter = isAZBrowsing ? (letter || setIdString.split('-')[1]) : null;
  
  const foundSet = isPracticeList ? null : (isAZBrowsing ? null : vocabularySets.find(s => s.id === setId));
  
  // Generate words based on type
  const set = React.useMemo(() => {
    if (isPracticeList) {
      return { id: 'practice-list', name: 'My Difficult Words', words: practiceListWords, emoji: '📕' };
    }
    if (isAZBrowsing && azLetter) {
      // Get all words for this letter
      const allWords = vocabularySets
        .filter(s => s.id !== 0 && !s.isMixed)
        .flatMap(s => s.words.map(word => ({
          ...word,
          setId: s.id,
          categoryName: s.name,
          categoryEmoji: s.emoji
        })));
      
      const letterWords = allWords
        .filter(word => word.word.charAt(0).toUpperCase() === azLetter.toUpperCase())
        .sort((a, b) => a.word.localeCompare(b.word));
      
      return { 
        id: `az-${azLetter}`, 
        name: `Letter ${azLetter.toUpperCase()} Words`, 
        words: letterWords, 
        emoji: '🔤' 
      };
    }
    if (foundSet?.isMixed) {
      const allWords = vocabularySets
        .filter(s => !s.isMixed && s.id !== 0)
        .flatMap(s => s.words);
      const shuffled = [...allWords].sort(() => Math.random() - 0.5).slice(0, 10);
      return { ...foundSet, words: shuffled };
    }
    return foundSet;
  }, [setId, foundSet, practiceListWords, isPracticeList, isAZBrowsing, azLetter]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [autoPlayVoiceover, setAutoPlayVoiceover] = useState(true);
  const [isInPracticeList, setIsInPracticeList] = useState(false);
  const [isLoading, setIsLoading] = useState(isPracticeList);
  const [isFlipped, setIsFlipped] = useState(false);
  const { markWordAsLearned, isWordLearned, toggleWordLearned } = useProgress();
  const { isCategoryLocked } = useSubscription();
  
  const scrollViewRef = useRef(null);
  const pan = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const removeAnim = useRef(new Animated.Value(0)).current;
  const isSwipingRef = useRef(false);
  const setRef = useRef(set);
  const currentIndexRef = useRef(currentIndex);
  const hasShownAutoFlip = useRef(false);

  // Update refs whenever they change
  useEffect(() => {
    setRef.current = set;
  }, [set, practiceListWords]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const currentWord = set?.words?.[currentIndex];
  const currentSetId = isPracticeList ? currentWord?.setId : (isAZBrowsing ? currentWord?.setId : setId);
  const isLearned = currentWord ? isWordLearned(currentSetId, currentWord.word) : false;

  // Get emoji for practice list words
  const getWordEmoji = (word) => {
    if (!word) return '💬';
    if (word.emoji) return word.emoji;
    
    // If it's a practice list word or A-Z browsing, find the original emoji from the vocabulary set
    if ((isPracticeList || isAZBrowsing) && word.setId) {
      const originalSet = vocabularySets.find(s => s.id === word.setId);
      if (originalSet) {
        const originalWord = originalSet.words.find(w => w.word === word.word);
        if (originalWord?.emoji) return originalWord.emoji;
      }
    }
    
    return '💬';
  };

  // Dynamic font size calculation based on word length
  const getWordFontSize = (word) => {
    if (!word) return 56;
    const length = word.length;
    if (length <= 8) return 56;
    if (length <= 12) return 48;
    if (length <= 16) return 40;
    return 32;
  };

  const wordFontSize = currentWord ? getWordFontSize(currentWord.word) : 56;

  // Reset flip when card changes
  useEffect(() => {
    setIsFlipped(false);
    flipAnim.setValue(0);
  }, [currentIndex]);

  // Auto-flip animation to demonstrate the flip feature (happens once on first load)
  useEffect(() => {
    if (!hasShownAutoFlip.current && !isLoading && set && set.words && set.words.length > 0 && currentIndex === 0) {
      hasShownAutoFlip.current = true;
      
      // Wait 0.5 seconds, then flip to back
      const initialDelay = setTimeout(() => {
        Animated.spring(flipAnim, {
          toValue: 180,
          friction: 9,
          tension: 20,
          useNativeDriver: true,
        }).start(() => {
          setIsFlipped(true);
          
          // Wait 0.6 seconds, then flip back to front
          setTimeout(() => {
            Animated.spring(flipAnim, {
              toValue: 0,
              friction: 9,
              tension: 20,
              useNativeDriver: true,
            }).start();
            setIsFlipped(false);
          }, 600);
        });
      }, 500);
      
      return () => clearTimeout(initialDelay);
    }
  }, [isLoading, set, currentIndex]);


  // Load practice list words on mount and handle initial word navigation
  useEffect(() => {
    if (isPracticeList) {
      loadPracticeListWords();
    }
  }, [isPracticeList]);

  // Navigate to initial word after words are loaded
  useEffect(() => {
    // For practice list
    if (isPracticeList && !isLoading && initialWord && set?.words?.length > 0) {
      const wordIndex = set.words.findIndex(w => w.word === initialWord);
      if (wordIndex !== -1) {
        setCurrentIndex(wordIndex);
      }
    }
    // For A-Z browsing
    if (isAZBrowsing && initialWord && set?.words?.length > 0) {
      const wordIndex = set.words.findIndex(w => w.word === initialWord);
      if (wordIndex !== -1) {
        setCurrentIndex(wordIndex);
      }
    }
  }, [isPracticeList, isAZBrowsing, isLoading, initialWord, practiceListWords, set]);

  // Check if current word is in practice list
  useEffect(() => {
    if (currentWord) {
      checkPracticeListStatus();
    }
  }, [currentIndex, currentWord]);

  const loadPracticeListWords = async () => {
    setIsLoading(true);
    const words = await storage.getPracticeList();
    setPracticeListWords(words);
    setIsLoading(false);
  };

  const checkPracticeListStatus = async () => {
    if (currentWord) {
      const inList = await storage.isInPracticeList(currentWord.word, currentSetId);
      setIsInPracticeList(inList);
    }
  };

  const handleTogglePracticeList = async () => {
    if (!currentWord) return;

    if (isInPracticeList) {
      // Animate removal
      Animated.timing(removeAnim, {
        toValue: -400,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        const result = await storage.removeFromPracticeList(currentWord.word, currentSetId);
        if (result.success) {
          setIsInPracticeList(false);
          Alert.alert('Removed', 'Word removed from My Difficult Words');
          
          if (isPracticeList) {
            const updatedWords = await storage.getPracticeList();
            setPracticeListWords(updatedWords);
            
            if (updatedWords.length === 0) {
              navigation.goBack();
            } else if (currentIndex >= updatedWords.length) {
              setCurrentIndex(updatedWords.length - 1);
            }
            
            // Reset and animate in the next card
            removeAnim.setValue(400);
            Animated.spring(removeAnim, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }).start();
          } else {
            removeAnim.setValue(0);
          }
        } else {
          removeAnim.setValue(0);
        }
      });
    } else {
      const wordData = {
        word: currentWord.word,
        setId: currentSetId,
        definition: currentWord.definition,
        example: currentWord.example,
        synonyms: currentWord.synonyms,
        antonyms: currentWord.antonyms,
      };
      
      const result = await storage.addToPracticeList(wordData);
      
      if (result.success) {
        setIsInPracticeList(true);
        Alert.alert('Added!', 'Word added to My Difficult Words');
      } else if (result.message === 'full') {
        Alert.alert(
          'List Full',
          'You already have 10 words in My Difficult Words. Practice them first to add more!',
          [{ text: 'OK' }]
        );
      }
    }
  };

  useEffect(() => {
    if (!isLoading && set && set.words && set.words.length > 0 && currentIndex >= set.words.length && !showCompletion) {
      setShowCompletion(true);
    }
  }, [currentIndex, set, showCompletion, isLoading]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isSwipingRef.current) {
      pan.setValue(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (showCompletion) {
      Speech.stop();
      setIsSpeaking(false);
    }
  }, [showCompletion]);

  useEffect(() => {
    if (autoPlayVoiceover && voiceoverEnabled && !showCompletion && currentWord && !isFlipped) {
      const timer = setTimeout(() => {
        speakWord();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, autoPlayVoiceover, voiceoverEnabled, showCompletion, currentWord, isFlipped]);

  const loadSettings = async () => {
    try {
      const settings = await storage.getSettings();
      if (settings.voiceoverEnabled !== undefined) {
        setVoiceoverEnabled(settings.voiceoverEnabled);
      }
      if (settings.autoPlayVoiceover !== undefined) {
        setAutoPlayVoiceover(settings.autoPlayVoiceover);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };
  
  const highlightWordInExample = (example, word) => {
    if (!example || !word) return null;
    
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const parts = example.split(regex);
    const matches = example.match(regex) || [];
    
    return (
      <Text style={styles.sectionText}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {matches[index] && (
              <Text style={styles.highlightedWord}>{matches[index]}</Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

  const speakWord = () => {
    if (!voiceoverEnabled) {
      Alert.alert(
        'Voiceover Disabled',
        'Please enable voiceover in Settings to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!currentWord) return;
    
    setIsSpeaking(true);
    Speech.speak(currentWord.word, {
      language: 'en-AU',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const speakFullCard = () => {
    if (!voiceoverEnabled) {
      Alert.alert(
        'Voiceover Disabled',
        'Please enable voiceover in Settings to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!currentWord) return;
    
    setIsSpeaking(true);
    
    const fullText = `
      ${currentWord.word}.
      Definition: ${currentWord.definition}.
      Synonyms: ${currentWord.synonyms.join(', ')}.
      Antonyms: ${currentWord.antonyms.join(', ')}.
      Example: ${currentWord.example}.
    `;
    
    Speech.speak(fullText, {
      language: 'en-AU',
      pitch: 1.0,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

const goToNext = () => {
  if (isSpeaking) {
    Speech.stop();
    setIsSpeaking(false);
  }
  
  if (set && currentIndex < set.words.length - 1) {
    setCurrentIndex(currentIndex + 1);
    // Scroll to top when navigating
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  } else {
    setShowCompletion(true);
  }
};

const goToPrevious = () => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
    // Scroll to top when navigating
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }
};

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      // Detect horizontal swipes
      return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy);
    },
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      // Capture horizontal swipes
      return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy);
    },
    onPanResponderGrant: () => {
      isSwipingRef.current = true;
      scrollViewRef.current?.setNativeProps({ scrollEnabled: false });
    },
    onPanResponderMove: (evt, gestureState) => {
      pan.setValue(gestureState.dx);
    },
onPanResponderRelease: (evt, gestureState) => {
      scrollViewRef.current?.setNativeProps({ scrollEnabled: true });
      
      const { dx } = gestureState;
      const swipeThreshold = 40; // Reduced from 70 to 40 for easier swiping
      
      // Use refs to access the latest values
      const currentSet = setRef.current;
      const currentIdx = currentIndexRef.current;
      
      if (!currentSet || !currentSet.words || currentSet.words.length === 0) {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start(() => {
          isSwipingRef.current = false;
        });
        return;
      }
      
      // Swipe LEFT (negative dx) - Next card
      if (dx < -swipeThreshold) {
        if (currentIdx < currentSet.words.length - 1) {
          Animated.timing(pan, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex(prev => prev + 1);
            pan.setValue(0);
            isSwipingRef.current = false;
            setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 50);
          });
        } else {
          Animated.timing(pan, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowCompletion(true);
            pan.setValue(0);
            isSwipingRef.current = false;
          });
        }
      }
      // Swipe RIGHT (positive dx) - Previous card
      else if (dx > swipeThreshold) {
        if (currentIdx > 0) {
          Animated.timing(pan, {
            toValue: 400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex(prev => prev - 1);
            pan.setValue(0);
            isSwipingRef.current = false;
            setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 50);
          });
        } else {
          // At first card - bounce back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start(() => {
            isSwipingRef.current = false;
          });
        }
      }
      // Not enough swipe distance - bounce back
      else {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start(() => {
          isSwipingRef.current = false;
        });
      }
    },
  })
).current;

const handleMarkAsLearned = () => {
  if (!currentWord) return;
  
  const wasLearned = isLearned;
  toggleWordLearned(currentSetId, currentWord.word);
  
  if (!wasLearned && set && currentIndex < set.words.length - 1) {
    // Animate card sliding out to the left
    Animated.timing(pan, {
      toValue: -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      pan.setValue(0);
      // Scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  }
};

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.learning} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.completionContainer}>
              <Text style={styles.completionEmoji}>⏳</Text>
              <Text style={styles.completionTitle}>Loading...</Text>
              <Text style={styles.completionText}>
                Loading your difficult words
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (!set || !set.words || set.words.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.learning} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.completionContainer}>
              <Text style={styles.completionEmoji}>📚</Text>
              <Text style={styles.completionTitle}>No Words Yet</Text>
              <Text style={styles.completionText}>
                {isPracticeList 
                  ? 'Mark difficult words while learning to add them here!'
                  : 'No flashcards available'}
              </Text>
              <Button
                variant="blue"
                size="large"
                onPress={() => navigation.goBack()}
                style={styles.completionButton}
              >
                ◀ Go Back
              </Button>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (showCompletion) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.learning} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.completionContainer}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={styles.completionTitle}>Well Done!</Text>
              <Text style={styles.completionText}>
                You've completed all {set.words.length} flashcards
              </Text>
              
              <Card style={styles.completionCard}>
                <Text style={styles.completionStats}>
                  📚 {set.words.length} words reviewed
                </Text>
              </Card>

              <Button
                variant="green"
                size="large"
                onPress={() => navigation.navigate('Practice', { setId: isPracticeList ? 1 : setId })}
                style={styles.completionButton}
              >
                🎯 Practice Now
              </Button>

              <Button
                variant="blue"
                size="large"
                onPress={() => {
                  setShowCompletion(false);
                  setCurrentIndex(0);
                }}
                style={styles.completionButton}
              >
                🔄 Review Again
              </Button>

              <Button
                variant="blue"
                size="large"
                onPress={() => navigation.goBack()}
                style={styles.completionButton}
              >
                ◀ Back to Learning Zone
              </Button>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Safety check: if currentWord is undefined, show completion
  if (!currentWord && set && set.words && set.words.length > 0) {
    // This handles the edge case where index goes out of bounds before completion state updates
    if (!showCompletion) {
      setShowCompletion(true);
    }
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.learning} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.completionContainer}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={styles.completionTitle}>Well Done!</Text>
              <Text style={styles.completionText}>
                You've completed all {set.words.length} flashcards
              </Text>
              <Button
                variant="blue"
                size="large"
                onPress={() => navigation.goBack()}
                style={styles.completionButton}
              >
                ◀ Back to Learning Zone
              </Button>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.learning} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {set.emoji} {set.name} • Card {currentIndex + 1} of {set.words.length}
              </Text>
            </View>

            {/* Flashcard Container */}
            <Animated.View
              style={{
                transform: [
                  { translateX: pan },
                  { translateX: isPracticeList ? removeAnim : 0 }
                ],
              }}
              {...panResponder.panHandlers}
            >
              {/* Practice List Flag - Outside the flip card, stays in place */}
              {isInPracticeList && (
                <View style={styles.practiceFlag}>
                  <Text style={styles.practiceFlagText}>📕</Text>
                </View>
              )}

              <TouchableWithoutFeedback onPress={handleFlip}>
    <View style={[styles.cardContainer, { height: isFlipped ? 'auto' : 450 }]}>
      {/* Front of Card */}
      <Animated.View
        style={[
          styles.flipCard,
          styles.flipCardFront,
          {
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
      >
                    <Card style={styles.card}>
                      <View style={styles.frontCardContent}>
                        <Text style={styles.wordEmoji}>{getWordEmoji(currentWord)}</Text>
                        <Text style={[styles.wordLarge, { fontSize: wordFontSize }]}>{currentWord?.word || ''}</Text>
                        
                        {/* Read Button moved here */}
                        {!isSpeaking ? (
                          <Button
                            variant="blue"
                            size="small"
                            onPress={speakWord}
                            style={styles.readButton}
                          >
                            <Text style={styles.readButtonIcon}>🔊</Text>
                            <Text style={styles.readButtonText}>Read</Text>
                          </Button>
                        ) : (
                          <Button
                            variant="orange"
                            size="small"
                            onPress={stopSpeaking}
                            style={styles.readButton}
                          >
                            <Text style={styles.readButtonIcon}>⏸</Text>
                            <Text style={styles.readButtonText}>Stop</Text>
                          </Button>
                        )}
                      </View>

                      <View style={styles.cardBottomSection}>
                        <Text style={styles.tapHint}>👆 Tap anywhere to see meaning</Text>
                        <Text style={styles.swipeHint}>  Swipe 👈 left | right 👉 to navigate Flashcards</Text>
                      </View>
                    </Card>
                  </Animated.View>

                  {/* Back of Card */}
      <Animated.View
        style={[
          styles.flipCard,
          styles.flipCardBack,
          {
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
                    <Card style={styles.card}>
                      <View style={styles.scrollableContent}>
                        <Text style={styles.word}>{currentWord?.word || ''}</Text>

                        {/* Speaker Button */}
                        <View style={styles.speakerButtonsContainer}>
                          {!isSpeaking ? (
                            <Button
                              variant="blue"
                              size="small"
                              onPress={speakFullCard}
                              style={styles.speakerButtonSingle}
                            >
                              <Text style={styles.speakerButtonIcon}>🔊</Text>
                              <Text style={styles.speakerButtonText}>Read Full Card</Text>
                            </Button>
                          ) : (
                            <Button
                              variant="orange"
                              size="small"
                              onPress={stopSpeaking}
                              style={styles.speakerButtonSingle}
                            >
                              <Text style={styles.speakerButtonIcon}>⏸</Text>
                              <Text style={styles.speakerButtonText}>Stop</Text>
                            </Button>
                          )}
                        </View>

                        {/* Definition */}
                        <View style={styles.definitionBox}>
                          <Text style={styles.definition}>
                          <Text style={{ fontWeight: fontWeight.bold }}>Definition: </Text> {currentWord?.definition || ''}</Text>
                        </View>

                        {/* Synonyms */}
                        <View style={[styles.section, styles.sectionGreen]}>
                          <Text style={styles.sectionTitle}>🟢 Synonyms</Text>
                          <Text style={styles.sectionTextSynonymAntonym}>
                            {currentWord?.synonyms?.join(', ') || 'No synonyms'}
                          </Text>
                        </View>

                        {/* Antonyms */}
                        <View style={[styles.section, styles.sectionPurple]}>
                          <Text style={styles.sectionTitle}>↔️ Antonyms</Text>
                          <Text style={styles.sectionTextSynonymAntonym}>
                            {currentWord?.antonyms?.join(', ') || 'No antonyms'}
                          </Text>
                        </View>

                        {/* Example */}
                        <View style={styles.section}>
                          <Text style={styles.sectionTitleExample}>💬 Example</Text>
                          {highlightWordInExample(currentWord?.example || '', currentWord?.word || '')}
                        </View>
                      </View>

                      <View style={styles.cardBottomSection}>
                        <Text style={styles.swipeHint}>Swipe 👈 left | right 👉 to navigate Flashcards</Text>
                      </View>
                    </Card>
                  </Animated.View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>

            {/* Quick Actions Card */}
              {/* Add/Remove from My Difficult Words button */}
              <Card style={styles.actionsCard}>
              <Button
                variant={isInPracticeList ? "red" : "redPink"}
                size="medium"
                onPress={handleTogglePracticeList}
                style={styles.groupedButton}
              >
                <Text style={styles.actionButtonIcon}>
                  {isInPracticeList ? '📕' : '📕'} 
                </Text>
                <Text style={styles.actionButtonText}>
                  {isInPracticeList ? 'Remove from My Difficult Words' : 'Add to My Difficult Words'}
                </Text>
              </Button>
              
              {/* Mark as Learned button */}
              <Button
                variant={isLearned ? "darkGreen" : "redPink"}
                size="medium"
                onPress={handleMarkAsLearned}
                style={styles.groupedButton}
              >
                <Text style={[styles.actionButtonIcon, isLearned && styles.learnedStarGold]}>❤️</Text>
                <Text style={styles.actionButtonText}>
                  {isLearned ? 'Learned' : 'Mark as Learned'}
                </Text>
              </Button>
</Card>

{/* Navigation Card */}
<Card>
  <Text style={styles.hint}>Swipe the card 👈 👉 or use buttons to navigate</Text>
  <View style={styles.navigation}>
    <Button
      variant="blue"
      size="small"
      onPress={goToPrevious}
      style={styles.navButton}
      disabled={currentIndex === 0}
    >
      ◀ Previous
    </Button>
    <Button
      variant={currentIndex === set.words.length - 1 ? "green" : "blue"}
      size="small"
      onPress={() => {
        if (currentIndex === set.words.length - 1) {
          setShowCompletion(true);
        } else {
          goToNext();
        }
      }}
      style={styles.navButton}
    >
      {currentIndex === set.words.length - 1 ? 'Finish ✓' : 'Next ▶'}
    </Button>
  </View>
</Card>



            {/* Practice Button */}
            {!isCategoryLocked(setId) && (
              <Button
                variant="green"
                size="medium"
                onPress={() => navigation.navigate('Practice', { setId })}
                style={styles.practiceButton}
              >
                🎯 Practice Now
              </Button>
            )}
            
            {/* Back Button */}
            <Button
              variant="blue"
              size="medium"
              onPress={() => navigation.goBack()}
              icon="◀"
              style={styles.backButton}
            >
              Back to Learning Zone
            </Button>
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
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  cardContainer: {
    marginBottom: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  flipCard: {
    width: '100%',
    backfaceVisibility: 'hidden',
  },
  flipCardFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
    zIndex: 2,
  },
  flipCardBack: {
    minHeight: 450,
    zIndex: 1,
  },
  card: {
    minHeight: 450,  // Changed from height to minHeight
    justifyContent: 'space-between',
  },
  frontCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollableContent: {
    flex: 1,
  },
  cardBottomSection: {
    marginTop: 'auto',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  practiceFlag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e91bcdff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopRightRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  practiceFlagText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  wordEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  wordLarge: {
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  word: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  readButton: {
    minWidth: 120,
    marginTop: spacing.xs,
  },
  readButtonIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  readButtonText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  speakerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  speakerButtonSingle: {
    minWidth: 160,
  },
  speakerButtonIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  speakerButtonText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  tapHint: {
    textAlign: 'center',
    color: colors.gray500,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  swipeHint: {
    textAlign: 'center',
    color: colors.gray400,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  actionsCard: {
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
    padding: spacing.md,
  },
  actionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  groupedButton: {
    marginBottom: spacing.sm,
  },
  definitionBox: {
    backgroundColor: '#fef3c7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  definition: {
    fontSize: fontSize.lg,
    color: colors.black,
    textAlign: 'center',
    fontWeight: fontWeight.normal,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#eff6ff',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  sectionGreen: {
    backgroundColor: '#d1fae5',
    borderColor: colors.successLight,
  },
  sectionPurple: {
    backgroundColor: '#d3b1e25f',
    borderColor: '#b853e35f',
  },
  sectionRed: {
    backgroundColor: '#fee2e2',
    borderColor: colors.errorLight,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
    sectionTitleExample: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 2,
  },
  sectionText: {
    fontSize: fontSize.md,
    color: colors.gray700,
    lineHeight: 20,
  },
  sectionTextSynonymAntonym: {
    fontSize: fontSize.lg,
    color: colors.gray700,
    lineHeight: 20,
  },
  highlightedWord: {
    fontWeight: fontWeight.bold,
    color: colors.primary,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: fontWeight.medium,
  },
  learnedStarGold: {
    color: '#fbbf24',
  },
  hint: {
    textAlign: 'center',
    color: colors.gray600,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  navigation: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
  practiceButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  backButton: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completionText: {
    fontSize: fontSize.xl,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  completionCard: {
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.success,
  },
  completionStats: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    textAlign: 'center',
  },
  completionButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
separator: {
  height: 1,
  backgroundColor: colors.gray300,
  marginTop: spacing.lg,
  marginBottom: 0,  
  marginLeft:spacing.xl,
  marginRight:spacing.xl,
},
});
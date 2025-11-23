import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { vocabularySets } from '../../data/vocabulary';
import { storage } from '../../utils/storage';
import MockTestSelectionScreen from './MockTestSelectionScreen';
import MockTestInfoScreen from './MockTestInfoScreen';
import MockTestQuestionsScreen from './MockTestQuestionsScreen';
import MockTestQuickResultsScreen from './MockTestQuickResultsScreen';

export default function MockTestsScreen({ navigation }) {
  const [testMode, setTestMode] = useState('menu'); // menu, info, test, results
  const [testNumber, setTestNumber] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [results, setResults] = useState(null);
  const [mockTestAttempts, setMockTestAttempts] = useState({});
  const [mockTestMinutes, setMockTestMinutes] = useState(10);

  // Get all words from all sets
  const allWords = vocabularySets.flatMap(set => set.words);

  // Load settings and mock test attempts
  useEffect(() => {
    loadSettings();
    loadMockTestAttempts();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storage.getSettings();
      if (settings.mockTestMinutes !== undefined) {
        setMockTestMinutes(settings.mockTestMinutes);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadMockTestAttempts = async () => {
    const attempts = await storage.getMockTestAttempts();
    setMockTestAttempts(attempts);
  };

  // Timer effect
  useEffect(() => {
    if (testMode === 'test' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testMode, timeLeft]);

  // Check if time is up
  useEffect(() => {
    if (testMode === 'test' && timeLeft === 0) {
      finishTest();
    }
  }, [timeLeft, testMode]);

  // Generate Mock Test
  const generateTest = (testNum) => {
    console.log('Starting test generation...');
    const testQuestions = [];
    const usedWords = new Set();
    const questionTypes = ['quiz', 'sentence', 'missing', 'spelling'];
    
    if (allWords.length === 0) {
      Alert.alert('Error', 'No words available for test');
      return;
    }

    const validWords = allWords.filter(w => w.word && w.definition);
    if (validWords.length < 10) {
      Alert.alert('Error', 'Not enough words to generate test');
      return;
    }

    // Create a seeded random function for deterministic tests
    let seed = testNum === 'random' ? Date.now() : testNum * 12345;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const totalQuestions = Math.min(30, validWords.length);
    let attempts = 0;
    const maxAttempts = totalQuestions * 10;
    
    while (testQuestions.length < totalQuestions && attempts < maxAttempts) {
      attempts++;
      
      const availableWords = validWords.filter(w => !usedWords.has(w.word));
      if (availableWords.length === 0) break;
      
      const randomIndex = Math.floor(seededRandom() * availableWords.length);
      const randomWord = availableWords[randomIndex];
      usedWords.add(randomWord.word);
      
      const typeIndex = Math.floor(seededRandom() * questionTypes.length);
      const questionType = questionTypes[typeIndex];

      try {
        let questionAdded = false;
        
        if (questionType === 'quiz') {
          const wrong = validWords.filter(w => 
            w.word !== randomWord.word && !usedWords.has(w.word)
          );
          
          if (wrong.length >= 3) {
            const wrongAnswers = wrong.sort(() => seededRandom() - 0.5).slice(0, 3);
            const options = [
              ...wrongAnswers.map(w => w.definition), 
              randomWord.definition
            ].sort(() => seededRandom() - 0.5);
            
            testQuestions.push({
              id: testQuestions.length,
              type: 'quiz',
              word: randomWord,
              question: `What does "${randomWord.word}" mean?`,
              options,
              correctAnswer: randomWord.definition,
            });
            questionAdded = true;
          }
        } else if (questionType === 'sentence' && randomWord.example) {
          const otherWords = validWords.filter(w => 
            w.word !== randomWord.word && !usedWords.has(w.word)
          );
          
          if (otherWords.length >= 3) {
            const sentence = randomWord.example.replace(
              new RegExp(`\\b${randomWord.word}\\b`, 'gi'), 
              '______'
            );
            
            testQuestions.push({
              id: testQuestions.length,
              type: 'sentence',
              word: randomWord,
              question: `Complete the sentence: ${sentence}`,
              options: [
                randomWord.word, 
                ...otherWords.sort(() => seededRandom() - 0.5).slice(0, 3).map(w => w.word)
              ].sort(() => seededRandom() - 0.5),
              correctAnswer: randomWord.word,
            });
            questionAdded = true;
          }
        } else if (questionType === 'missing' && randomWord.word.length >= 4) {
          const word = randomWord.word;
          const numMissing = Math.min(3, Math.floor(word.length / 3));
          const pattern = word.split('');
          const positions = new Set();
          
          let posAttempts = 0;
          while (positions.size < numMissing && posAttempts < 20) {
            positions.add(Math.floor(seededRandom() * word.length));
            posAttempts++;
          }
          
          const positionsArray = Array.from(positions);
          positions.forEach(pos => pattern[pos] = '_');
          
          testQuestions.push({
            id: testQuestions.length,
            type: 'missing',
            word: randomWord,
            question: `Fill in the missing letters: ${pattern.join('')}`,
            correctAnswer: randomWord.word,
            missingPositions: positionsArray,
          });
          questionAdded = true;
        } else if (questionType === 'spelling') {
          testQuestions.push({
            id: testQuestions.length,
            type: 'spelling',
            word: randomWord,
            question: `How do you spell this word? (Definition: ${randomWord.definition})`,
            correctAnswer: randomWord.word,
          });
          questionAdded = true;
        }
        
        if (!questionAdded) {
          usedWords.delete(randomWord.word);
        }
        
      } catch (error) {
        console.error('Error generating question:', error);
        usedWords.delete(randomWord.word);
      }
    }

    console.log(`Generated ${testQuestions.length} questions after ${attempts} attempts`);

    if (testQuestions.length < 10) {
      Alert.alert('Error', `Could only generate ${testQuestions.length} questions. Need at least 10.`);
      return;
    }

    setQuestions(testQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(mockTestMinutes * 60);
    setTestNumber(testNum);
    setTestMode('info');
  };

  // Submit Answer
  const submitAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  // Finish Test
  const finishTest = () => {
    let correct = 0;
    const breakdown = { 
      quiz: { correct: 0, total: 0 }, 
      sentence: { correct: 0, total: 0 }, 
      missing: { correct: 0, total: 0 }, 
      spelling: { correct: 0, total: 0 } 
    };
    const totalQuestions = questions.length;

    questions.forEach(q => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (userAnswer) {
        if (q.type === 'missing') {
          if (typeof userAnswer === 'object') {
            const allCorrect = q.missingPositions.every(pos => 
              userAnswer[pos] && userAnswer[pos].toLowerCase() === q.word.word[pos].toLowerCase()
            );
            isCorrect = allCorrect;
          } else {
            isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase();
          }
        } else if (q.type === 'spelling') {
          isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase();
        } else {
          isCorrect = userAnswer === q.correctAnswer;
        }
      }

      if (isCorrect) {
        correct++;
        breakdown[q.type].correct++;
      }
      breakdown[q.type].total++;
    });

    const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const resultsData = { score, correct, total: totalQuestions, breakdown };
    setResults(resultsData);
    
    // Save attempt to storage WITH full test data
    storage.saveMockTestAttempt(testNumber, correct, totalQuestions, questions, answers).then(() => {
      loadMockTestAttempts();
    });
    
    setTestMode('results');
  };

  // Navigate to detailed results
  const viewDetailedResults = (attemptData, testId) => {
    navigation.navigate('MockTestDetailedResults', {
      attemptData,
      testNumber: testId
    });
  };

  // Render based on current mode
  if (testMode === 'menu') {
    return (
      <MockTestSelectionScreen
        navigation={navigation}
        mockTestAttempts={mockTestAttempts}
        onStartTest={generateTest}
        onViewDetailedResults={viewDetailedResults}
      />
    );
  }

  if (testMode === 'info') {
    return (
      <MockTestInfoScreen
        mockTestMinutes={mockTestMinutes}
        onBack={() => setTestMode('menu')}
        onStartTest={() => setTestMode('test')}
      />
    );
  }

  if (testMode === 'test') {
    return (
      <MockTestQuestionsScreen
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        timeLeft={timeLeft}
        testNumber={testNumber}
        onSubmitAnswer={submitAnswer}
        onNavigate={setCurrentIndex}
        onFinishTest={finishTest}
      />
    );
  }

  if (testMode === 'results' && results) {
    return (
      <MockTestQuickResultsScreen
        results={results}
        testNumber={testNumber}
        questions={questions}
        answers={answers}
        onViewDetailedResults={viewDetailedResults}
        onTryAnotherTest={() => setTestMode('menu')}
        onBackHome={() => navigation.goBack()}
      />
    );
  }

  return null;
}
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MyDifficultWordsScreen from '../screens/MyDifficultWordsScreen';
import AZLetterSelectionScreen from '../screens/az/AZLetterSelectionScreen';
import AZWordListScreen from '../screens/az/AZWordListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyProgressScreen from '../screens/MyProgressScreen';
import LearningPortalScreen from '../screens/learning/LearningPortalScreen';
import CategoryPracticeScreen from '../screens/practice/PracticeZoneScreen';
import CategoryFunGamesScreen from '../screens/games/FunGamesZoneScreen';
import MockTestsScreen from '../screens/mockTests/MockTestsScreen';
import MockTestSelectionScreen from '../screens/mockTests/MockTestSelectionScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import FlashcardScreen from '../screens/learning/FlashcardScreen';
import QuizScreen from '../screens/common/QuizScreen';
import ResultsScreen from '../screens/common/ResultsScreen';
import MockTestDetailedResultsScreen from '../screens/mockTests/MockTestDetailedResultsScreen';
import MockTestInfoScreen from '../screens/mockTests/MockTestInfoScreen';
import MockTestQuestionsScreen from '../screens/mockTests/MockTestQuestionsScreen';
import MockTestQuickResultsScreen from '../screens/mockTests/MockTestQuickResultsScreen';
import PracticeScreen from '../screens/practice/PracticeTypesScreen';
import DefinitionPracticeScreen from '../screens/practice/DefinitionPracticeScreen';
import SynonymPracticeScreen from '../screens/practice/SynonymPracticeScreen';
import AntonymPracticeScreen from '../screens/practice/AntonymPracticeScreen';
import SpellingPracticeScreen from '../screens/practice/SpellingPracticeScreen';
import FillGapPracticeScreen from '../screens/practice/FillGapPracticeScreen';
import MissingWordPracticeScreen from '../screens/practice/MissingWordPracticeScreen';
import DevSettingsScreen from '../screens/DevSettingsScreen';

// Fun Games - Modular
import GamesSelectionScreen from '../screens/games/GamesSelectionScreen';
import SpeedMatchGame from '../screens/games/SpeedMatchGame';
import WordChallengeGame from '../screens/games/WordChallengeGame';
import WordBuilderGame from '../screens/games/WordBuilderGame';
import TreasureHuntGame from '../screens/games/TreasureHuntGame';

import { colors } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const { height } = Dimensions.get('window');

// Custom tab bar icon component
const TabBarIcon = ({ emoji, focused, color }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.emoji, focused && styles.emojiActive, { opacity: focused ? 1 : 0.7 }]}>
      {emoji}
    </Text>
  </View>
);

// Custom tab bar label component
const TabBarLabel = ({ label, focused, color }) => (
  <Text style={[styles.label, { color, fontWeight: focused ? '600' : '500' }]}>
    {label}
  </Text>
);

// Menu Popup Component
const MenuPopup = ({ visible, onClose, navigation, tabBarHeight }) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const { areMockTestsLocked } = useSubscription();

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    {
      id: 1,
      title: 'Learning Zone',
      emoji: '📚',
      route: 'LearningPortal',
      gradient: ['#3b82f6', '#2563eb'],
      locked: false,
    },
    {
      id: 2,
      title: 'Practice Zone',
      emoji: '🎯',
      route: 'CategoryPractice',
      gradient: ['#10b981', '#059669'],
      locked: false,
    },
    {
      id: 3,
      title: 'Fun Games Zone',
      emoji: '🎮',
      route: 'CategoryFunGames',
      gradient: ['#a855f7', '#9333ea'],
      locked: false,
    },
    {
      id: 4,
      title: 'Mock Tests Zone',
      emoji: '🎓',
      route: 'MockTests',
      gradient: ['#f59e0b', '#d97706'],
      locked: areMockTestsLocked(),
    },
    {
      id: 5,
      title: 'My Progress',
      emoji: '📊',
      route: 'MyProgress',
      gradient: ['#fbbf24', '#f59e0b'],
      locked: false,
    },
  ];

  const handleNavigate = (item) => {
    onClose();
    
    if (item.locked) {
      // Navigate to subscription if locked
      setTimeout(() => {
        navigation.navigate('SettingsTab', { screen: 'Subscription' });
      }, 100);
    } else {
      // Navigate to MenuTab, then to the specific screen
      setTimeout(() => {
        navigation.navigate('MenuTab', { screen: item.route });
      }, 100);
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -(tabBarHeight + 10)],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.menuContent}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, item.locked && styles.menuItemLocked]}
                onPress={() => handleNavigate(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
                <Text style={[styles.menuItemText, item.locked && styles.menuItemTextLocked]}>
                  {item.title}
                </Text>
                {item.locked ? (
                  <Text style={styles.menuItemLock}>🔒</Text>
                ) : (
                  <Text style={styles.menuItemArrow}>→</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Arrow pointing down to menu tab */}
          <View style={styles.menuArrow} />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Home Stack - pass parent navigation
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DevSettings" component={DevSettingsScreen} />
      <Stack.Screen name="LearningPortal" component={LearningPortalScreen} />
      <Stack.Screen name="CategoryPractice" component={CategoryPracticeScreen} />
      <Stack.Screen name="CategoryFunGames" component={CategoryFunGamesScreen} />
      <Stack.Screen name="MockTests" component={MockTestsScreen} />
      <Stack.Screen name="MockTestSelection" component={MockTestSelectionScreen} />
    </Stack.Navigator>
  );
}

// My Difficult Words Stack
function DifficultWordsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyDifficultWordsScreen" component={MyDifficultWordsScreen} />
      <Stack.Screen name="LearningPortal" component={LearningPortalScreen} />
    </Stack.Navigator>
  );
}

// A-Z Stack
function AZStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AZLetterSelection" component={AZLetterSelectionScreen} />
      <Stack.Screen name="AZWordList" component={AZWordListScreen} />
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
}

// Menu Stack - screens accessed from popup menu
function MenuStack() {
  // Placeholder component - immediately redirects
  const MenuPlaceholder = ({ navigation }) => {
    React.useEffect(() => {
      // This should never be seen, but just in case
      navigation.navigate('LearningPortal');
    }, []);
    return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LearningPortal">
      <Stack.Screen name="MenuPlaceholder" component={MenuPlaceholder} />
      <Stack.Screen name="LearningPortal" component={LearningPortalScreen} />
      <Stack.Screen name="CategoryPractice" component={CategoryPracticeScreen} />
      <Stack.Screen name="CategoryFunGames" component={CategoryFunGamesScreen} />
      <Stack.Screen name="MockTests" component={MockTestsScreen} />
      <Stack.Screen name="MockTestSelection" component={MockTestSelectionScreen} />
      <Stack.Screen name="MyProgress" component={MyProgressScreen} />
    </Stack.Navigator>
  );
}

// Get tab bar color based on active route
const getTabBarColor = (route) => {
  const routeName = route?.state?.routes?.[route.state.index]?.name || route.name;
  
  switch(routeName) {
    case 'HomeTab':
    case 'HomeScreen':     
      return 'rgba(83, 5, 72, 0.58)';
    case 'MyDifficultWordsTab':
    case 'MyDifficultWordsScreen':
      return 'rgba(133, 18, 234, 0.4)';
    case 'AZTab':
    case 'AZLetterSelection':
      return 'rgba(83, 5, 72, 0.58)';
    case 'MenuTab':
    case 'LearningPortal':
      return 'rgba(9, 170, 214, 0.74)';
    case 'CategoryPractice':
    case 'PracticeTypes':
      return 'rgba(122, 7, 188, 0.65)';
    case 'CategoryFunGames':
    case 'FunGames':
      return 'rgba(214, 9, 40, 0.62)';
    case 'MockTests':
    case 'MockTestSelection':
      return 'rgba(83, 5, 72, 0.58)';
    case 'MyProgress':
      return 'rgba(83, 5, 72, 0.58)';
    case 'SettingsTab':
    case 'SettingsScreen':
      return 'rgba(83, 5, 72, 0.58)';
    default:
      return 'rgba(83, 5, 72, 0.58)';
  }
};

// Custom Tab Bar with Menu
function CustomTabBar({ state, descriptors, navigation, ...props }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const { isPremium } = useSubscription();
  const tabBarHeight = 65;

  // const handleTabPress = (route, index, isFocused) => {
  //   const isMenu = route.name === 'MenuTab';
  //   const isAZ = route.name === 'AZTab';
  //   const isSettings = route.name === 'SettingsTab';

  //   // If A-Z is clicked and locked, navigate to subscription
  //   if (isAZ && !isPremium) {
  //     navigation.navigate('SettingsTab', { screen: 'Subscription' });
  //     return;
  //   }

  //   if (isMenu) {
  //     setMenuLoading(true);
  //     setTimeout(() => {
  //       setMenuLoading(false);
  //       setMenuVisible(!menuVisible);
  //     }, 150);
  //     return; // Don't proceed with normal navigation for menu
  //   }

  //   // For Settings tab, explicitly navigate to SettingsScreen to avoid param persistence
  //   if (isSettings && !isFocused) {
  //     navigation.navigate('SettingsTab', { screen: 'SettingsScreen' });
  //     return;
  //   }
    
  //   // Normal tab press handling for all other tabs
  //   const event = navigation.emit({
  //     type: 'tabPress',
  //     target: route.key,
  //     canPreventDefault: true,
  //   });

  //   if (!isFocused && !event.defaultPrevented) {
  //     navigation.navigate(route.name);
  //   }
  // };

  const handleTabPress = (route, index, isFocused) => {
  const isMenu = route.name === 'MenuTab';
  const isAZ = route.name === 'AZTab';
  const isSettings = route.name === 'SettingsTab';
  const isHome = route.name === 'HomeTab'; // Add this

  // If A-Z is clicked and locked, navigate to subscription
  if (isAZ && !isPremium) {
    navigation.navigate('SettingsTab', { screen: 'Subscription' });
    return;
  }

  if (isMenu) {
    setMenuLoading(true);
    setTimeout(() => {
      setMenuLoading(false);
      setMenuVisible(!menuVisible);
    }, 150);
    return;
  }

  // For Settings tab, explicitly navigate to SettingsScreen
  if (isSettings && !isFocused) {
    navigation.navigate('SettingsTab', { screen: 'SettingsScreen' });
    return;
  }

  // For Home tab, explicitly navigate to HomeScreen (ADD THIS)
  if (isHome && !isFocused) {
    navigation.navigate('HomeTab', { screen: 'HomeScreen' });
    return;
  }
  
  // Normal tab press handling for all other tabs
  const event = navigation.emit({
    type: 'tabPress',
    target: route.key,
    canPreventDefault: true,
  });

  if (!isFocused && !event.defaultPrevented) {
    navigation.navigate(route.name);
  }
};
  return (
    <>
      <MenuPopup
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        tabBarHeight={tabBarHeight}
      />
      <View style={[styles.tabBar, { backgroundColor: getTabBarColor(state.routes[state.index]) }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isMenu = route.name === 'MenuTab';
          const isAZ = route.name === 'AZTab';
          const isLocked = isAZ && !isPremium;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={() => handleTabPress(route, index, isFocused)}
              style={styles.tabButton}
            >
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )}
              {isMenu && menuLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingDots}>⋯</Text>
                </View>
              ) : (
                <>
                  {options.tabBarIcon({ focused: isMenu ? menuVisible : isFocused, color: '#ffffff' })}
                  {options.tabBarLabel({ focused: isMenu ? menuVisible : isFocused, color: '#ffffff' })}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: ({ focused, color }) => <TabBarLabel label="Home" focused={focused} color={color} />,
          tabBarIcon: ({ focused, color }) => <TabBarIcon emoji="🏠" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="MyDifficultWordsTab"
        component={DifficultWordsStack}
        options={{
          tabBarLabel: ({ focused, color }) => <TabBarLabel label="My Words" focused={focused} color={color} />,
          tabBarIcon: ({ focused, color }) => <TabBarIcon emoji="📕" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuStack}
        options={{
          tabBarLabel: ({ focused, color }) => <TabBarLabel label="Menu" focused={focused} color={color} />,
          tabBarIcon: ({ focused, color }) => <TabBarIcon emoji="☰" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="AZTab"
        component={AZStack}
        options={{
          tabBarLabel: ({ focused, color }) => <TabBarLabel label="A-Z" focused={focused} color={color} />,
          tabBarIcon: ({ focused, color }) => <TabBarIcon emoji="🔠" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: ({ focused, color }) => <TabBarLabel label="Settings" focused={focused} color={color} />,
          tabBarIcon: ({ focused, color }) => <TabBarIcon emoji="⚙️" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator (for full-screen content without tabs)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        
        {/* Full-screen content (no tabs) */}
        <Stack.Screen name="Flashcard" component={FlashcardScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="DefinitionPractice" component={DefinitionPracticeScreen} />
        <Stack.Screen name="SynonymPractice" component={SynonymPracticeScreen} />
        <Stack.Screen name="AntonymPractice" component={AntonymPracticeScreen} />
        <Stack.Screen name="SpellingPractice" component={SpellingPracticeScreen} />
        <Stack.Screen name="FillGapPractice" component={FillGapPracticeScreen} />
        <Stack.Screen name="MissingWordPractice" component={MissingWordPracticeScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="MockTestInfo" component={MockTestInfoScreen} />
        <Stack.Screen name="MockTestQuestions" component={MockTestQuestionsScreen} />
        <Stack.Screen name="MockTestQuickResults" component={MockTestQuickResultsScreen} />
        <Stack.Screen name="MockTestDetailedResults" component={MockTestDetailedResultsScreen} />
        <Stack.Screen name="FunGames" component={GamesSelectionScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />

        {/* Fun Games - Individual Game Screens */}
        <Stack.Screen name="SpeedMatchGame" component={SpeedMatchGame} />
        <Stack.Screen name="WordChallengeGame" component={WordChallengeGame} />
        <Stack.Screen name="WordBuilderGame" component={WordBuilderGame} />
        <Stack.Screen name="TreasureHuntGame" component={TreasureHuntGame} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee9e95d',
    height: 65,
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  emojiActive: {
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Roboto',
  },
  lockBadge: {
    top: 10,
    right: -10,
    zIndex: 10,
  },
  lockIcon: {
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDots: {
    fontSize: 28,
    color: '#ffffff',
    letterSpacing: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  menuArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
    marginTop: -1,
    alignSelf: 'center',
  },
  menuContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#f9fafb',
  },
  menuItemLocked: {
    opacity: 1,
    backgroundColor: '#f3f4f6',
  },
  menuItemEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuItemTextLocked: {
    color: '#6b7280',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  menuItemLock: {
    fontSize: 18,
    color: '#ef4444',
  },
});

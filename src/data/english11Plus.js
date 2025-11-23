// 11+ English Master - Comprehensive Question Data
// Covers all question types found in real 11+ English grammar school entrance exams

export const english11PlusSets = [
  {
    id: 201,
    name: 'Comprehension',
    emoji: '📚',
    description: 'Reading passages with questions',
    color: 'blue',
    gradient: ['#3b82f6', '#2563eb'],
    type: 'comprehension',
    passages: [
      {
        id: 'comp1',
        title: 'The Secret Garden',
        passage: `The old garden had been locked for ten years. Nobody knew what had happened to it after Mrs. Craven died. Mr. Craven had locked the door and buried the key somewhere deep in the ground. The walls were covered with climbing roses, but nobody had tended to them for a decade.

Mary discovered the garden quite by accident. A robin had been watching her as she walked along the wall. The friendly bird led her to a place where the ivy grew thick and tangled. Hidden beneath the leaves, she found an old key, rusty but still whole.

Her heart pounding with excitement, Mary searched along the wall until she found the door. The key turned with difficulty in the old lock, and the door creaked open. What she saw took her breath away. The garden was wild and overgrown, but spring was beginning to work its magic. Green shoots were pushing through the earth, and buds were forming on the rose bushes.`,
        questions: [
          {
            question: 'How long had the garden been locked?',
            options: ['Five years', 'Ten years', 'Fifteen years', 'Twenty years'],
            correctAnswer: 'Ten years',
            type: 'multiple-choice'
          },
          {
            question: 'Who helped Mary find the key?',
            options: ['Mr. Craven', 'Mrs. Craven', 'A robin', 'A gardener'],
            correctAnswer: 'A robin',
            type: 'multiple-choice'
          },
          {
            question: 'Where was the key hidden?',
            options: ['Under a stone', 'Beneath the ivy', 'In the soil', 'Behind the door'],
            correctAnswer: 'Beneath the ivy',
            type: 'multiple-choice'
          },
          {
            question: 'What season was beginning in the garden?',
            options: ['Summer', 'Autumn', 'Winter', 'Spring'],
            correctAnswer: 'Spring',
            type: 'multiple-choice'
          },
          {
            question: 'How did Mary feel when she opened the door?',
            options: ['Frightened', 'Excited', 'Sad', 'Angry'],
            correctAnswer: 'Excited',
            type: 'multiple-choice'
          }
        ]
      },
      {
        id: 'comp2',
        title: 'The Invention of the Bicycle',
        passage: `The bicycle has a fascinating history that spans over two centuries. The first bicycle-like device, called a "running machine," was invented in 1817 by Baron Karl von Drais of Germany. It had no pedals; riders had to push themselves along with their feet.

In 1839, a Scottish blacksmith named Kirkpatrick Macmillan added pedals to the front wheel. This was a significant improvement, though the bicycle was still quite difficult to ride. The real breakthrough came in 1885 when John Kemp Starley invented the "safety bicycle." This design had two wheels of similar size and a chain drive to the rear wheel – much like modern bicycles.

The invention of pneumatic (air-filled) tyres by John Boyd Dunlop in 1888 made cycling much more comfortable. Soon, bicycles became enormously popular. They gave people, especially women, unprecedented freedom to travel. By 1900, there were over one million bicycles in Britain alone.`,
        questions: [
          {
            question: 'When was the first bicycle-like device invented?',
            options: ['1817', '1839', '1885', '1888'],
            correctAnswer: '1817',
            type: 'multiple-choice'
          },
          {
            question: 'Who added pedals to the bicycle?',
            options: ['Baron Karl von Drais', 'Kirkpatrick Macmillan', 'John Kemp Starley', 'John Boyd Dunlop'],
            correctAnswer: 'Kirkpatrick Macmillan',
            type: 'multiple-choice'
          },
          {
            question: 'What made the "safety bicycle" special?',
            options: ['It had pedals', 'It had two similar-sized wheels', 'It had air-filled tyres', 'It had no wheels'],
            correctAnswer: 'It had two similar-sized wheels',
            type: 'multiple-choice'
          },
          {
            question: 'What did pneumatic tyres do for cycling?',
            options: ['Made it faster', 'Made it more comfortable', 'Made it cheaper', 'Made it colorful'],
            correctAnswer: 'Made it more comfortable',
            type: 'multiple-choice'
          },
          {
            question: 'How many bicycles were in Britain by 1900?',
            options: ['Over one hundred thousand', 'Over one million', 'Over ten million', 'Over one hundred million'],
            correctAnswer: 'Over one million',
            type: 'multiple-choice'
          }
        ]
      }
    ]
  },
  {
    id: 202,
    name: 'Cloze Test',
    emoji: '📝',
    description: 'Fill in the missing words',
    color: 'green',
    gradient: ['#10b981', '#059669'],
    type: 'cloze',
    exercises: [
      {
        id: 'cloze1',
        title: 'The Storm',
        text: 'Dark clouds gathered _____ in the sky. The wind began to _____ through the trees, making an eerie whistling sound. Birds flew _____ to their nests, sensing the approaching storm. Lightning _____ across the sky, followed by a tremendous clap of thunder. Within minutes, rain began to _____ down heavily.',
        blanks: [
          { position: 1, options: ['overhead', 'underground', 'indoors', 'nowhere'], correctAnswer: 'overhead' },
          { position: 2, options: ['whisper', 'howl', 'speak', 'talk'], correctAnswer: 'howl' },
          { position: 3, options: ['slowly', 'hurriedly', 'lazily', 'calmly'], correctAnswer: 'hurriedly' },
          { position: 4, options: ['walked', 'crept', 'flashed', 'crawled'], correctAnswer: 'flashed' },
          { position: 5, options: ['drip', 'sprinkle', 'pour', 'drop'], correctAnswer: 'pour' }
        ]
      },
      {
        id: 'cloze2',
        title: 'At the Museum',
        text: 'The museum was _____ with ancient artifacts. Sarah walked _____ through the Egyptian gallery, marveling at the golden treasures. A tour guide was _____ the history of the pharaohs to a group of fascinated visitors. In the corner stood a magnificent _____, perfectly preserved for thousands of years. Sarah felt _____ to be able to see such historical wonders.',
        blanks: [
          { position: 1, options: ['empty', 'filled', 'broken', 'small'], correctAnswer: 'filled' },
          { position: 2, options: ['quickly', 'carelessly', 'slowly', 'roughly'], correctAnswer: 'slowly' },
          { position: 3, options: ['hiding', 'explaining', 'forgetting', 'destroying'], correctAnswer: 'explaining' },
          { position: 4, options: ['sarcophagus', 'television', 'computer', 'phone'], correctAnswer: 'sarcophagus' },
          { position: 5, options: ['bored', 'angry', 'privileged', 'tired'], correctAnswer: 'privileged' }
        ]
      }
    ]
  },
  {
    id: 203,
    name: 'Grammar',
    emoji: '📖',
    description: 'Parts of speech, tenses & grammar rules',
    color: 'purple',
    gradient: ['#a855f7', '#9333ea'],
    type: 'grammar',
    questions: [
      {
        question: 'Identify the noun in this sentence: "The cat jumped over the fence."',
        options: ['jumped', 'over', 'cat', 'the'],
        correctAnswer: 'cat',
        explanation: 'A noun is a person, place, or thing. "Cat" is a thing (animal).',
        category: 'Parts of Speech'
      },
      {
        question: 'Which word is an adjective? "The beautiful sunset amazed everyone."',
        options: ['sunset', 'beautiful', 'amazed', 'everyone'],
        correctAnswer: 'beautiful',
        explanation: 'An adjective describes a noun. "Beautiful" describes the sunset.',
        category: 'Parts of Speech'
      },
      {
        question: 'What is the verb in this sentence? "They quickly ran to school."',
        options: ['They', 'quickly', 'ran', 'school'],
        correctAnswer: 'ran',
        explanation: 'A verb is an action word. "Ran" shows the action.',
        category: 'Parts of Speech'
      },
      {
        question: 'Identify the adverb: "She sang beautifully at the concert."',
        options: ['She', 'sang', 'beautifully', 'concert'],
        correctAnswer: 'beautifully',
        explanation: 'An adverb describes how an action is done. "Beautifully" describes how she sang.',
        category: 'Parts of Speech'
      },
      {
        question: 'Which tense is this? "I have been studying for three hours."',
        options: ['Present simple', 'Present perfect continuous', 'Past simple', 'Future simple'],
        correctAnswer: 'Present perfect continuous',
        explanation: 'Present perfect continuous shows an action that started in the past and continues now.',
        category: 'Tenses'
      },
      {
        question: 'Choose the correct form: "She _____ to the park every Sunday."',
        options: ['go', 'goes', 'going', 'gone'],
        correctAnswer: 'goes',
        explanation: 'With third person singular (she), we add "s" to the verb in present simple.',
        category: 'Subject-Verb Agreement'
      },
      {
        question: 'Which is correct? "The children _____ playing in the garden."',
        options: ['is', 'are', 'am', 'be'],
        correctAnswer: 'are',
        explanation: '"Children" is plural, so we use "are".',
        category: 'Subject-Verb Agreement'
      },
      {
        question: 'What type of sentence is this? "Close the door!"',
        options: ['Declarative', 'Interrogative', 'Imperative', 'Exclamatory'],
        correctAnswer: 'Imperative',
        explanation: 'An imperative sentence gives a command or instruction.',
        category: 'Sentence Types'
      },
      {
        question: 'Identify the preposition: "The book is on the table."',
        options: ['book', 'is', 'on', 'table'],
        correctAnswer: 'on',
        explanation: 'A preposition shows the relationship between words. "On" shows where the book is.',
        category: 'Parts of Speech'
      },
      {
        question: 'Which is the correct past tense? "Yesterday, I _____ my homework."',
        options: ['do', 'does', 'did', 'doing'],
        correctAnswer: 'did',
        explanation: '"Did" is the past tense of "do".',
        category: 'Tenses'
      }
    ]
  },
  {
    id: 204,
    name: 'Punctuation',
    emoji: '❗',
    description: 'Master punctuation marks',
    color: 'orange',
    gradient: ['#f59e0b', '#d97706'],
    type: 'punctuation',
    questions: [
      {
        question: 'Which sentence is punctuated correctly?',
        options: [
          'I love pizza pasta and ice cream',
          'I love pizza, pasta, and ice cream.',
          'I love pizza pasta, and ice cream',
          'I love, pizza pasta and ice cream'
        ],
        correctAnswer: 'I love pizza, pasta, and ice cream.',
        explanation: 'Use commas to separate items in a list, and end with a period.'
      },
      {
        question: 'Where should the apostrophe go? "The dogs bone was buried."',
        options: ["The dog's bone was buried.", "The dogs' bone was buried.", "The dogs bone's was buried.", "The dogs bone was buried'."],
        correctAnswer: "The dog's bone was buried.",
        explanation: "The bone belongs to one dog, so the apostrophe goes before the 's'."
      },
      {
        question: 'Which sentence uses quotation marks correctly?',
        options: [
          'She said "I am happy."',
          'She said, "I am happy."',
          'She said "I am happy".',
          'She said I am "happy".'
        ],
        correctAnswer: 'She said, "I am happy."',
        explanation: 'Use a comma before the quotation, and put the period inside the quotation marks.'
      },
      {
        question: 'Choose the correctly punctuated sentence:',
        options: [
          'What a beautiful day',
          'What a beautiful day.',
          'What a beautiful day!',
          'What a beautiful day?'
        ],
        correctAnswer: 'What a beautiful day!',
        explanation: 'Exclamatory sentences showing strong emotion end with an exclamation mark.'
      },
      {
        question: 'Where does the question mark go? "I wonder if it will rain today"',
        options: [
          'I wonder if it will rain today?',
          'I wonder if it will rain today.',
          'I wonder? if it will rain today',
          'I wonder if it will? rain today'
        ],
        correctAnswer: 'I wonder if it will rain today.',
        explanation: 'This is an indirect question (a statement about wondering), so it ends with a period.'
      },
      {
        question: 'Which uses the colon correctly?',
        options: [
          'I need: bread, milk, and eggs.',
          'I need the following: bread, milk, and eggs.',
          'I: need bread, milk, and eggs.',
          'I need bread: milk, and eggs.'
        ],
        correctAnswer: 'I need the following: bread, milk, and eggs.',
        explanation: 'A colon introduces a list after a complete sentence.'
      },
      {
        question: 'Where should the semicolon go?',
        options: [
          'I love reading; it helps me learn new things.',
          'I; love reading it helps me learn new things.',
          'I love reading it; helps me learn new things.',
          'I love; reading it helps me learn new things.'
        ],
        correctAnswer: 'I love reading; it helps me learn new things.',
        explanation: 'A semicolon joins two related independent clauses.'
      },
      {
        question: 'Which sentence uses the hyphen correctly?',
        options: [
          'She is a well known author.',
          'She is a well-known author.',
          'She is a well known-author.',
          'She-is a well known author.'
        ],
        correctAnswer: 'She is a well-known author.',
        explanation: 'Compound adjectives before a noun are hyphenated.'
      }
    ]
  },
  {
    id: 205,
    name: 'Sentence Structure',
    emoji: '🏗️',
    description: 'Build perfect sentences',
    color: 'red',
    gradient: ['#ef4444', '#dc2626'],
    type: 'sentence-structure',
    questions: [
      {
        question: 'Which is a simple sentence?',
        options: [
          'The dog barked and the cat meowed.',
          'The dog barked.',
          'Although the dog barked, the cat slept.',
          'The dog barked because it was hungry.'
        ],
        correctAnswer: 'The dog barked.',
        explanation: 'A simple sentence has one independent clause with a subject and predicate.'
      },
      {
        question: 'Identify the compound sentence:',
        options: [
          'I love chocolate.',
          'I love chocolate, and my sister loves vanilla.',
          'Because I love chocolate, I eat it daily.',
          'The chocolate that I love is expensive.'
        ],
        correctAnswer: 'I love chocolate, and my sister loves vanilla.',
        explanation: 'A compound sentence has two independent clauses joined by a conjunction.'
      },
      {
        question: 'What is the subject of this sentence? "The tall boy played football."',
        options: ['tall', 'boy', 'played', 'football'],
        correctAnswer: 'boy',
        explanation: 'The subject is who or what the sentence is about. "Boy" is the main noun.'
      },
      {
        question: 'What is the predicate? "The children laughed loudly."',
        options: ['The children', 'children', 'laughed loudly', 'loudly'],
        correctAnswer: 'laughed loudly',
        explanation: 'The predicate tells what the subject does. It includes the verb and everything after it.'
      },
      {
        question: 'Which sentence has a subordinate clause?',
        options: [
          'I went to the shop.',
          'When I went to the shop, I bought milk.',
          'I went to the shop and bought milk.',
          'I went to the shop yesterday.'
        ],
        correctAnswer: 'When I went to the shop, I bought milk.',
        explanation: 'A subordinate clause ("When I went to the shop") cannot stand alone.'
      },
      {
        question: 'Rearrange into the correct order: "quickly / the / ran / boy"',
        options: [
          'The boy ran quickly',
          'Quickly ran the boy',
          'The quickly boy ran',
          'Ran quickly the boy'
        ],
        correctAnswer: 'The boy ran quickly',
        explanation: 'Standard English word order: subject (the boy) + verb (ran) + adverb (quickly).'
      },
      {
        question: 'Which is a complex sentence?',
        options: [
          'I like pizza.',
          'I like pizza and pasta.',
          'Although I like pizza, I prefer pasta.',
          'I really like pizza.'
        ],
        correctAnswer: 'Although I like pizza, I prefer pasta.',
        explanation: 'A complex sentence has an independent clause and at least one dependent clause.'
      },
      {
        question: 'What is the object in this sentence? "She kicked the ball."',
        options: ['She', 'kicked', 'the', 'ball'],
        correctAnswer: 'ball',
        explanation: 'The object receives the action of the verb. The ball is what was kicked.'
      }
    ]
  },
  {
    id: 206,
    name: 'Verbal Reasoning',
    emoji: '🧩',
    description: 'Word patterns & logic',
    color: 'cyan',
    gradient: ['#06b6d4', '#0891b2'],
    type: 'verbal-reasoning',
    questions: [
      {
        question: 'Complete the analogy: Cat is to Kitten as Dog is to _____',
        options: ['Puppy', 'Bark', 'Pet', 'Animal'],
        correctAnswer: 'Puppy',
        explanation: 'A kitten is a baby cat; a puppy is a baby dog.',
        category: 'Analogies'
      },
      {
        question: 'Which word is the odd one out?',
        options: ['Rose', 'Tulip', 'Daisy', 'Carrot'],
        correctAnswer: 'Carrot',
        explanation: 'Rose, tulip, and daisy are flowers; carrot is a vegetable.',
        category: 'Odd One Out'
      },
      {
        question: 'Complete: Happy, Joyful, Glad, _____',
        options: ['Sad', 'Cheerful', 'Angry', 'Tired'],
        correctAnswer: 'Cheerful',
        explanation: 'All words are synonyms meaning happy or pleased.',
        category: 'Word Relationships'
      },
      {
        question: 'Find the word that relates to both: RIVER _____ MONEY',
        options: ['BANK', 'FLOW', 'WATER', 'SAVE'],
        correctAnswer: 'BANK',
        explanation: 'A river bank is the side of a river; a money bank stores money.',
        category: 'Double Meanings'
      },
      {
        question: 'If MEAT is to TEAM, then STOP is to _____',
        options: ['POTS', 'POST', 'SPOT', 'TOPS'],
        correctAnswer: 'POTS',
        explanation: 'MEAT reversed spells TEAM; STOP reversed spells POTS.',
        category: 'Letter Patterns'
      },
      {
        question: 'Which three-letter word can be added to make two new words? "___LIGHT" and "SUN___"',
        options: ['DAY', 'SET', 'RAY', 'SKY'],
        correctAnswer: 'DAY',
        explanation: 'DAYLIGHT and SUNDAY are both real words.',
        category: 'Word Formation'
      },
      {
        question: 'Find the missing letters: B, D, F, H, ___',
        options: ['I', 'J', 'K', 'L'],
        correctAnswer: 'J',
        explanation: 'The pattern skips one letter each time: B(C)D(E)F(G)H(I)J.',
        category: 'Letter Sequences'
      },
      {
        question: 'Which word means the opposite of EXPAND?',
        options: ['Grow', 'Contract', 'Enlarge', 'Spread'],
        correctAnswer: 'Contract',
        explanation: 'Expand means to make bigger; contract means to make smaller.',
        category: 'Antonyms'
      },
      {
        question: 'Complete the analogy: Hot is to Cold as Night is to _____',
        options: ['Dark', 'Day', 'Moon', 'Sleep'],
        correctAnswer: 'Day',
        explanation: 'Hot and cold are opposites; night and day are opposites.',
        category: 'Analogies'
      },
      {
        question: 'Which word does NOT belong? Swift, Quick, Rapid, Slow',
        options: ['Swift', 'Quick', 'Rapid', 'Slow'],
        correctAnswer: 'Slow',
        explanation: 'Swift, quick, and rapid all mean fast; slow means not fast.',
        category: 'Odd One Out'
      }
    ]
  },
  {
    id: 207,
    name: 'Spelling',
    emoji: '✍️',
    description: 'Spell challenging words correctly',
    color: 'pink',
    gradient: ['#ec4899', '#db2777'],
    type: 'spelling',
    words: [
      { word: 'accommodate', difficulty: 'hard', category: 'Double Letters' },
      { word: 'necessary', difficulty: 'medium', category: 'Common Mistakes' },
      { word: 'occurrence', difficulty: 'hard', category: 'Double Letters' },
      { word: 'separate', difficulty: 'medium', category: 'Common Mistakes' },
      { word: 'definitely', difficulty: 'medium', category: 'Common Mistakes' },
      { word: 'believe', difficulty: 'easy', category: 'I Before E' },
      { word: 'receive', difficulty: 'easy', category: 'I Before E' },
      { word: 'embarrass', difficulty: 'hard', category: 'Double Letters' },
      { word: 'committee', difficulty: 'medium', category: 'Double Letters' },
      { word: 'conscience', difficulty: 'hard', category: 'Silent Letters' },
      { word: 'parallel', difficulty: 'hard', category: 'Double Letters' },
      { word: 'privilege', difficulty: 'hard', category: 'Common Mistakes' },
      { word: 'mischievous', difficulty: 'hard', category: 'Common Mistakes' },
      { word: 'achieve', difficulty: 'medium', category: 'I Before E' },
      { word: 'government', difficulty: 'medium', category: 'Common Mistakes' },
      { word: 'lightning', difficulty: 'medium', category: 'Silent Letters' },
      { word: 'rhythm', difficulty: 'hard', category: 'No Vowels' },
      { word: 'argument', difficulty: 'medium', category: 'Common Mistakes' },
      { word: 'conscience', difficulty: 'hard', category: 'Silent Letters' },
      { word: 'environment', difficulty: 'medium', category: 'Common Mistakes' }
    ]
  },
  {
    id: 208,
    name: 'Creative Writing',
    emoji: '✨',
    description: 'Story writing prompts',
    color: 'indigo',
    gradient: ['#6366f1', '#4f46e5'],
    type: 'creative-writing',
    prompts: [
      {
        id: 'cw1',
        title: 'The Mysterious Door',
        prompt: 'You discover a door in your house that you have never seen before. When you open it...',
        hints: [
          'Describe what you see, hear, and feel',
          'Build suspense and excitement',
          'Use descriptive adjectives and adverbs',
          'Include dialogue if appropriate',
          'Create a clear beginning, middle, and end'
        ],
        wordLimit: { min: 150, max: 300 }
      },
      {
        id: 'cw2',
        title: 'If I Could Fly',
        prompt: 'Imagine you wake up one morning and discover you can fly. Describe your day.',
        hints: [
          'How did you discover this ability?',
          'Where would you go first?',
          'How do others react?',
          'What adventures do you have?',
          'Use vivid descriptions of flying'
        ],
        wordLimit: { min: 150, max: 300 }
      },
      {
        id: 'cw3',
        title: 'The Time Traveler',
        prompt: 'You find a watch that allows you to travel through time. Where do you go and why?',
        hints: [
          'Choose an interesting time period',
          'Describe the sights and sounds',
          'What do you learn from your journey?',
          'Include historical or futuristic details',
          'Make it believable and engaging'
        ],
        wordLimit: { min: 150, max: 300 }
      },
      {
        id: 'cw4',
        title: 'A Day as an Animal',
        prompt: 'You wake up transformed into your favorite animal. Write about your experiences.',
        hints: [
          'Which animal did you become?',
          'How is life different?',
          'What challenges do you face?',
          'What do you enjoy about being this animal?',
          'Do you want to change back?'
        ],
        wordLimit: { min: 150, max: 300 }
      },
      {
        id: 'cw5',
        title: 'The Lost Island',
        prompt: 'You are shipwrecked on a deserted island. Describe your first week.',
        hints: [
          'How did you survive the shipwreck?',
          'What resources do you find?',
          'How do you get food and water?',
          'Do you find any clues about the island?',
          'Build tension and hope'
        ],
        wordLimit: { min: 150, max: 300 }
      }
    ]
  }
];

// Mock Test Data - Full 11+ English Practice Exams
export const english11PlusMockTests = [
  {
    id: 'mock1',
    name: 'Full 11+ English Paper 1',
    emoji: '📄',
    duration: 50, // minutes
    totalMarks: 100,
    sections: [
      {
        name: 'Comprehension',
        marks: 30,
        setId: 201,
        passageId: 'comp1'
      },
      {
        name: 'Cloze Test',
        marks: 15,
        setId: 202,
        exerciseId: 'cloze1'
      },
      {
        name: 'Grammar',
        marks: 20,
        setId: 203,
        questionCount: 10
      },
      {
        name: 'Punctuation',
        marks: 15,
        setId: 204,
        questionCount: 8
      },
      {
        name: 'Verbal Reasoning',
        marks: 20,
        setId: 206,
        questionCount: 10
      }
    ]
  },
  {
    id: 'mock2',
    name: 'Full 11+ English Paper 2',
    emoji: '📋',
    duration: 50,
    totalMarks: 100,
    sections: [
      {
        name: 'Comprehension',
        marks: 30,
        setId: 201,
        passageId: 'comp2'
      },
      {
        name: 'Cloze Test',
        marks: 15,
        setId: 202,
        exerciseId: 'cloze2'
      },
      {
        name: 'Grammar',
        marks: 20,
        setId: 203,
        questionCount: 10
      },
      {
        name: 'Sentence Structure',
        marks: 15,
        setId: 205,
        questionCount: 8
      },
      {
        name: 'Spelling',
        marks: 20,
        setId: 207,
        wordCount: 10
      }
    ]
  }
];

export default {
  english11PlusSets,
  english11PlusMockTests
};

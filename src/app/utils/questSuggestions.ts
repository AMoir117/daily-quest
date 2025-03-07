import { TaskDifficulty } from '../types';

export interface QuestSuggestion {
  title: string;
  description: string;
  difficulty: TaskDifficulty;
}

// Health & Fitness Quests
const healthQuests: QuestSuggestion[] = [
  {
    title: 'Morning Workout',
    description: 'Complete a 30-minute morning workout session.',
    difficulty: 'medium'
  },
  {
    title: 'Push-Up Challenge',
    description: 'Complete 3 sets of push-ups (as many as you can do).',
    difficulty: 'easy'
  },
  {
    title: 'Hydration Quest',
    description: 'Drink at least 8 glasses of water today.',
    difficulty: 'easy'
  },
  {
    title: 'Meditation Session',
    description: 'Meditate for 15 minutes to clear your mind.',
    difficulty: 'easy'
  },
  {
    title: 'Run/Jog',
    description: 'Go for a 5km run or jog outside.',
    difficulty: 'medium'
  },
  {
    title: 'Yoga Practice',
    description: 'Complete a 30-minute yoga session for flexibility.',
    difficulty: 'medium'
  },
  {
    title: 'Step Count',
    description: 'Reach 10,000 steps today.',
    difficulty: 'medium'
  },
  {
    title: 'Meal Prep',
    description: 'Prepare healthy meals for the next 3 days.',
    difficulty: 'hard'
  }
];

// Productivity Quests
const productivityQuests: QuestSuggestion[] = [
  {
    title: 'Inbox Zero',
    description: 'Clear all emails from your inbox.',
    difficulty: 'medium'
  },
  {
    title: 'Deep Work Session',
    description: 'Complete 2 hours of focused, uninterrupted work.',
    difficulty: 'medium'
  },
  {
    title: 'Task Prioritization',
    description: 'Create a prioritized to-do list for the week.',
    difficulty: 'easy'
  },
  {
    title: 'Digital Declutter',
    description: 'Organize your digital files and delete unnecessary ones.',
    difficulty: 'medium'
  },
  {
    title: 'Job Applications',
    description: 'Apply for 5 jobs that match your skills and interests.',
    difficulty: 'hard'
  },
  {
    title: 'Skill Building',
    description: 'Spend 1 hour learning a new skill related to your career.',
    difficulty: 'medium'
  },
  {
    title: 'Network Building',
    description: 'Reach out to 3 professional contacts to check in.',
    difficulty: 'medium'
  }
];

// Personal Development Quests
const personalQuests: QuestSuggestion[] = [
  {
    title: 'Reading Time',
    description: 'Read 30 pages of a book.',
    difficulty: 'easy'
  },
  {
    title: 'Journal Entry',
    description: 'Write a reflective journal entry about your day or goals.',
    difficulty: 'easy'
  },
  {
    title: 'Language Practice',
    description: 'Practice a new language for 20 minutes.',
    difficulty: 'medium'
  },
  {
    title: 'Creative Project',
    description: 'Spend 1 hour on a creative project (art, music, writing, etc.).',
    difficulty: 'medium'
  },
  {
    title: 'Gratitude List',
    description: "Write down 5 things you're grateful for today.",
    difficulty: 'easy'
  },
  {
    title: 'Digital Detox',
    description: 'Spend 3 hours without checking social media or news.',
    difficulty: 'medium'
  },
  {
    title: 'New Recipe',
    description: 'Cook a new recipe you\'ve never tried before.',
    difficulty: 'medium'
  }
];

// Home & Life Quests
const homeQuests: QuestSuggestion[] = [
  {
    title: 'Deep Clean',
    description: 'Deep clean one room in your home.',
    difficulty: 'medium'
  },
  {
    title: 'Declutter Session',
    description: 'Declutter and organize one area of your home.',
    difficulty: 'medium'
  },
  {
    title: 'Plant Care',
    description: 'Water and care for all your houseplants.',
    difficulty: 'easy'
  },
  {
    title: 'Budget Review',
    description: 'Review your monthly budget and identify areas to improve.',
    difficulty: 'medium'
  },
  {
    title: 'Meal Planning',
    description: 'Plan your meals for the entire week.',
    difficulty: 'easy'
  },
  {
    title: 'Home Maintenance',
    description: 'Complete one home maintenance task you\'ve been putting off.',
    difficulty: 'hard'
  },
  {
    title: 'Laundry Day',
    description: 'Wash, fold, and put away all laundry.',
    difficulty: 'medium'
  },
  {
    title: 'Donation Box',
    description: 'Fill a box with items to donate or recycle.',
    difficulty: 'medium'
  }
];

// Combine all quest categories
export const allQuestSuggestions: QuestSuggestion[] = [
  ...healthQuests,
  ...productivityQuests,
  ...personalQuests,
  ...homeQuests
];

// Function to get a random quest suggestion
export function getRandomQuestSuggestion(): QuestSuggestion {
  const randomIndex = Math.floor(Math.random() * allQuestSuggestions.length);
  return allQuestSuggestions[randomIndex];
}

// Function to get multiple random quest suggestions
export function getRandomQuestSuggestions(count: number): QuestSuggestion[] {
  const suggestions: QuestSuggestion[] = [];
  const availableSuggestions = [...allQuestSuggestions];
  
  for (let i = 0; i < count && availableSuggestions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
    suggestions.push(availableSuggestions[randomIndex]);
    availableSuggestions.splice(randomIndex, 1);
  }
  
  return suggestions;
} 
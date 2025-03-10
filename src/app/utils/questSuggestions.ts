import { TaskDifficulty } from '../types';

// Change from union type to string type for better compatibility with questType
export type QuestCategory = string;

export interface QuestSuggestion {
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  category: QuestCategory;
}

// Constants
const RECENTLY_SUGGESTED_KEY = 'dailyQuest_recentlySuggested';
const MAX_RECENT_SUGGESTIONS = 15; // Number of recent suggestions to remember

// Function to get recently suggested tasks from localStorage
function getRecentlySuggestedTasks(): string[] {
  if (typeof window === 'undefined') return []; // Handle server-side rendering
  
  const stored = localStorage.getItem(RECENTLY_SUGGESTED_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing recently suggested tasks:', e);
    return [];
  }
}

// Function to add a task to recently suggested
function addToRecentlySuggested(title: string): void {
  if (typeof window === 'undefined') return; // Handle server-side rendering
  
  const recent = getRecentlySuggestedTasks();
  
  // Add the new title if it's not already in the list
  if (!recent.includes(title)) {
    // Add to the beginning of the array
    recent.unshift(title);
    
    // Keep only the most recent N suggestions
    const trimmed = recent.slice(0, MAX_RECENT_SUGGESTIONS);
    
    // Save back to localStorage
    localStorage.setItem(RECENTLY_SUGGESTED_KEY, JSON.stringify(trimmed));
  }
}

// Function to add multiple tasks to recently suggested
function addMultipleToRecentlySuggested(suggestions: QuestSuggestion[]): void {
  suggestions.forEach(suggestion => addToRecentlySuggested(suggestion.title));
}

// Health & Fitness Quests
const healthQuests: QuestSuggestion[] = [
  {
    title: 'Morning Workout',
    description: 'Complete a 30-minute morning workout session.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Push-Up Challenge',
    description: 'Complete 3 sets of push-ups (as many as you can do).',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Hydration Quest',
    description: 'Drink at least 8 glasses of water today.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Meditation Session',
    description: 'Meditate for 15 minutes to clear your mind.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Run/Jog',
    description: 'Go for a 5km run or jog outside.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Yoga Practice',
    description: 'Complete a 30-minute yoga session for flexibility.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Step Count',
    description: 'Reach 10,000 steps today.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Meal Prep',
    description: 'Prepare healthy meals for the next 3 days.',
    difficulty: 'hard',
    category: 'health'
  },
  // New Health & Fitness Quests
  {
    title: 'HIIT Workout',
    description: 'Complete a 20-minute high-intensity interval training session.',
    difficulty: 'hard',
    category: 'health'
  },
  {
    title: 'Stretching Routine',
    description: 'Do a full-body stretching routine for 15 minutes.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Plank Challenge',
    description: 'Hold a plank position for as long as possible, try to beat your record.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Sugar-Free Day',
    description: 'Go the entire day without consuming added sugar.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Bike Ride',
    description: 'Go for a 30-minute bike ride.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Healthy Breakfast',
    description: 'Prepare and eat a nutritious breakfast with protein and vegetables.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Posture Check',
    description: 'Set hourly reminders to check and correct your posture throughout the day.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Squat Challenge',
    description: 'Complete 50 squats throughout the day.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Mindful Eating',
    description: 'Eat one meal without distractions, focusing only on your food and eating slowly.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Cold Shower',
    description: 'Take a cold shower or end your shower with 30 seconds of cold water.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Stair Climbing',
    description: 'Take the stairs instead of elevators all day.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Breathing Exercises',
    description: 'Practice deep breathing exercises for 5 minutes.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Dance Workout',
    description: 'Do a 20-minute dance workout video.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'No Caffeine Day',
    description: 'Go the entire day without consuming caffeine.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Meal Tracking',
    description: 'Track all your meals and snacks for the day.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Bodyweight Circuit',
    description: 'Complete a full bodyweight circuit workout (push-ups, squats, lunges, etc.).',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Walking Meeting',
    description: 'Take at least one meeting or phone call while walking.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Healthy Snack Prep',
    description: 'Prepare healthy snacks for the week.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Sleep Hygiene',
    description: 'Go to bed at a consistent time and avoid screens 1 hour before sleep.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Foam Rolling',
    description: 'Spend 15 minutes foam rolling tight muscles.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Intermittent Fasting',
    description: 'Try a 16:8 intermittent fasting schedule for the day.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Outdoor Activity',
    description: 'Spend at least 30 minutes doing any physical activity outdoors.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Healthy Recipe',
    description: 'Find and cook a new healthy recipe for dinner.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Flexibility Test',
    description: 'Measure your flexibility with simple tests and record your results.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Strength Training',
    description: 'Complete a 30-minute strength training session.',
    difficulty: 'medium',
    category: 'health'
  }
];

// Productivity Quests
const productivityQuests: QuestSuggestion[] = [
  {
    title: 'Inbox Zero',
    description: 'Clear all emails from your inbox.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Deep Work Session',
    description: 'Complete 2 hours of focused, uninterrupted work.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Task Prioritization',
    description: 'Create a prioritized to-do list for the week.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Digital Declutter',
    description: 'Organize your digital files and delete unnecessary ones.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Job Applications',
    description: 'Apply for 5 jobs that match your skills and interests.',
    difficulty: 'hard',
    category: 'productivity'
  },
  {
    title: 'Skill Building',
    description: 'Spend 1 hour learning a new skill related to your career.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Network Building',
    description: 'Reach out to 3 professional contacts to check in.',
    difficulty: 'medium',
    category: 'productivity'
  },
  // New Productivity Quests
  {
    title: 'Pomodoro Sessions',
    description: 'Complete 4 Pomodoro sessions (25 minutes work, 5 minutes break).',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Morning Planning',
    description: 'Spend 15 minutes planning your day first thing in the morning.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Email Management',
    description: 'Set up email filters and organize your inbox system.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Notification Audit',
    description: 'Review and disable unnecessary notifications on all your devices.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Weekly Review',
    description: 'Conduct a review of your week: achievements, challenges, and lessons learned.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Desk Organization',
    description: 'Clean and organize your workspace for maximum productivity.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Single-Tasking',
    description: 'Focus on one task at a time for the entire day, avoiding multitasking.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Project Planning',
    description: 'Break down a large project into actionable steps with deadlines.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Habit Tracking',
    description: 'Set up a system to track your daily habits and routines.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Time Audit',
    description: 'Track how you spend your time for one day to identify inefficiencies.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Meeting Efficiency',
    description: 'Prepare agendas for all meetings and keep them time-boxed.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Knowledge Base',
    description: 'Create or update your personal knowledge management system.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Procrastination List',
    description: 'Tackle three tasks you\'ve been procrastinating on.',
    difficulty: 'hard',
    category: 'productivity'
  },
  {
    title: 'Automation Setup',
    description: 'Automate one repetitive task in your workflow.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Focus Environment',
    description: 'Set up your environment to minimize distractions for deep work.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Calendar Cleanup',
    description: 'Review and optimize your calendar for the upcoming week.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Documentation',
    description: 'Document an important process or workflow you regularly use.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Skill Assessment',
    description: 'Identify three skills to develop and create a learning plan.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Feedback Session',
    description: 'Ask for feedback on a recent project or your performance.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'No-Meeting Day',
    description: 'Block off a full day for focused work with no meetings.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Portfolio Update',
    description: 'Update your portfolio, resume, or professional profiles.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Productivity Tools Audit',
    description: 'Evaluate your current productivity tools and optimize or replace as needed.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Delegation Practice',
    description: 'Identify and delegate at least one task that someone else could do.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Batch Processing',
    description: 'Batch similar tasks together and complete them in one focused session.',
    difficulty: 'easy',
    category: 'productivity'
  }
];

// Personal Development Quests
const personalQuests: QuestSuggestion[] = [
  {
    title: 'Reading Time',
    description: 'Read 30 pages of a book.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Journal Entry',
    description: 'Write a reflective journal entry about your day or goals.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Language Practice',
    description: 'Practice a new language for 20 minutes.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Creative Project',
    description: 'Spend 1 hour on a creative project (art, music, writing, etc.).',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Gratitude List',
    description: "Write down 5 things you're grateful for today.",
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Digital Detox',
    description: 'Spend 3 hours without checking social media or news.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'New Recipe',
    description: 'Cook a new recipe you\'ve never tried before.',
    difficulty: 'medium',
    category: 'personal'
  },
  // New Personal Development Quests
  {
    title: 'Mindfulness Practice',
    description: 'Practice mindfulness or meditation for 10 minutes.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Skill Learning',
    description: 'Spend 30 minutes learning a new skill unrelated to your work.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Podcast Episode',
    description: 'Listen to an educational podcast episode.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Vision Board',
    description: 'Create or update a vision board for your goals.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Comfort Zone Challenge',
    description: 'Do one thing outside your comfort zone today.',
    difficulty: 'hard',
    category: 'personal'
  },
  {
    title: 'Handwritten Letter',
    description: 'Write a handwritten letter or card to someone you appreciate.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Documentary Watching',
    description: 'Watch a documentary on a subject you know little about.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Hobby Time',
    description: 'Spend 1 hour engaging in a hobby you enjoy.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Self-Reflection',
    description: 'Answer three deep self-reflection questions in your journal.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Goal Review',
    description: 'Review your short and long-term goals and adjust as needed.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Online Course',
    description: 'Complete one lesson in an online course you\'re taking.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Public Speaking Practice',
    description: 'Practice a speech or presentation out loud for 10 minutes.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Inspirational Content',
    description: 'Read or watch something inspirational and take notes.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Networking Event',
    description: 'Attend a networking event or meetup (virtual or in-person).',
    difficulty: 'hard',
    category: 'personal'
  },
  {
    title: 'Skill Sharing',
    description: 'Teach someone a skill you\'re good at.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Personal Values',
    description: 'Write down your top 5 personal values and reflect on them.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Visualization Exercise',
    description: 'Spend 10 minutes visualizing achieving your biggest goal.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Feedback Analysis',
    description: 'Reflect on feedback you\'ve received and identify areas for growth.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Strength Assessment',
    description: 'Identify and write about your top 3 personal strengths.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Cultural Experience',
    description: 'Experience a cultural activity different from your own background.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Mentorship Session',
    description: 'Have a conversation with a mentor or someone you admire.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Habit Formation',
    description: 'Identify a new positive habit you want to develop and take the first step.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Emotional Intelligence',
    description: 'Practice active listening in a conversation without interrupting.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Creativity Exercise',
    description: 'Complete a creativity exercise or brain teaser.',
    difficulty: 'easy',
    category: 'personal'
  }
];

// Home & Life Quests
const homeQuests: QuestSuggestion[] = [
  {
    title: 'Deep Clean',
    description: 'Deep clean one room in your home.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Declutter Session',
    description: 'Declutter and organize one area of your home.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Plant Care',
    description: 'Water and care for all your houseplants.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Budget Review',
    description: 'Review your monthly budget and identify areas to improve.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Meal Planning',
    description: 'Plan your meals for the entire week.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Home Maintenance',
    description: 'Complete one home maintenance task you\'ve been putting off.',
    difficulty: 'hard',
    category: 'home'
  },
  {
    title: 'Laundry Day',
    description: 'Wash, fold, and put away all laundry.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Donation Box',
    description: 'Fill a box with items to donate or recycle.',
    difficulty: 'medium',
    category: 'home'
  },
  // New Home & Life Quests
  {
    title: 'Digital Cleanup',
    description: 'Delete unnecessary files and organize your digital storage.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Pantry Organization',
    description: 'Clean and organize your pantry or food storage area.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Wardrobe Audit',
    description: 'Review your wardrobe and identify items to donate or repair.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Financial Check-In',
    description: 'Review your recent expenses and update your budget.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Fridge Cleanup',
    description: 'Clean out your refrigerator and discard expired items.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Home Inventory',
    description: 'Create or update an inventory of valuable items in your home.',
    difficulty: 'hard',
    category: 'home'
  },
  {
    title: 'Emergency Plan',
    description: 'Create or review your emergency plan and supplies.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Subscription Audit',
    description: 'Review all your subscriptions and cancel unnecessary ones.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Bathroom Deep Clean',
    description: 'Deep clean your bathroom including all fixtures and surfaces.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Window Cleaning',
    description: 'Clean all windows in one room or area of your home.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Paperwork Organization',
    description: 'Organize and file important documents and paperwork.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Savings Contribution',
    description: 'Make an extra contribution to your savings or investment account.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Closet Organization',
    description: 'Organize one closet in your home.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Debt Reduction Plan',
    description: 'Create or review your debt reduction strategy.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Home Decor Refresh',
    description: 'Update one area of your home with simple decor changes.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Appliance Maintenance',
    description: 'Clean and maintain one major appliance (washing machine, dishwasher, etc.).',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Grocery Shopping',
    description: 'Complete grocery shopping with a prepared list and budget.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Insurance Review',
    description: 'Review your insurance policies and coverage.',
    difficulty: 'hard',
    category: 'home'
  },
  {
    title: 'Outdoor Space',
    description: 'Tidy and organize your balcony, patio, or yard.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Car Maintenance',
    description: 'Complete a car maintenance task (cleaning, oil check, tire pressure).',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Electronics Cleanup',
    description: 'Clean and organize your electronics and their cables.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Bathroom Supplies',
    description: 'Take inventory and restock bathroom supplies as needed.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Shoe Organization',
    description: 'Clean and organize your shoe collection.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Kitchen Drawers',
    description: 'Clean and organize kitchen drawers and utensils.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Ceiling Fans & Vents',
    description: 'Clean ceiling fans and air vents throughout your home.',
    difficulty: 'medium',
    category: 'home'
  }
];

// Technology & Learning Quests
const techQuests: QuestSuggestion[] = [
  {
    title: 'Coding Practice',
    description: 'Spend 30 minutes practicing coding or solving programming challenges.',
    difficulty: 'medium',
    category: 'tech'
  },
  {
    title: 'Tech Tutorial',
    description: 'Complete a tutorial for a technology you want to learn.',
    difficulty: 'medium',
    category: 'tech'
  },
  {
    title: 'Password Manager',
    description: 'Set up or update your password manager with secure passwords.',
    difficulty: 'medium',
    category: 'tech'
  },
  {
    title: 'Device Backup',
    description: 'Back up important data from your computer and mobile devices.',
    difficulty: 'easy',
    category: 'tech'
  },
  {
    title: 'Software Updates',
    description: 'Update all software and applications on your devices.',
    difficulty: 'easy',
    category: 'tech'
  },
  {
    title: 'Online Security Audit',
    description: 'Review and improve security settings on your important accounts.',
    difficulty: 'medium',
    category: 'tech'
  },
  {
    title: 'Tech Declutter',
    description: 'Uninstall unused applications and clean up your digital workspace.',
    difficulty: 'easy',
    category: 'tech'
  },
  {
    title: 'New Technology Exploration',
    description: 'Research and learn about a new technology trend for 30 minutes.',
    difficulty: 'easy',
    category: 'tech'
  },
  {
    title: 'Online Course Progress',
    description: 'Complete one module or lesson in an online tech course.',
    difficulty: 'medium',
    category: 'tech'
  },
  {
    title: 'Tech Project',
    description: 'Work on a personal tech project for 1 hour.',
    difficulty: 'hard',
    category: 'tech'
  },
  {
    title: 'Digital Minimalism',
    description: 'Remove digital distractions from your devices for improved focus.',
    difficulty: 'medium',
    category: 'tech'
  },
  {
    title: 'Tech Documentation',
    description: 'Document your tech setup, configurations, or code for future reference.',
    difficulty: 'medium',
    category: 'tech'
  }
];

// Social & Relationship Quests
const socialQuests: QuestSuggestion[] = [
  {
    title: 'Friend Check-In',
    description: 'Reach out to a friend you haven\'t spoken to in a while.',
    difficulty: 'easy',
    category: 'social'
  },
  {
    title: 'Family Time',
    description: 'Spend quality time with family members without distractions.',
    difficulty: 'medium',
    category: 'social'
  },
  {
    title: 'Gratitude Expression',
    description: 'Express genuine gratitude to someone who has helped you.',
    difficulty: 'easy',
    category: 'social'
  },
  {
    title: 'Active Listening',
    description: 'Practice active listening in all conversations today.',
    difficulty: 'medium',
    category: 'social'
  },
  {
    title: 'Social Media Detox',
    description: 'Take a 24-hour break from all social media platforms.',
    difficulty: 'medium',
    category: 'social'
  },
  {
    title: 'Random Act of Kindness',
    description: 'Perform a random act of kindness for a stranger or colleague.',
    difficulty: 'easy',
    category: 'social'
  },
  {
    title: 'Difficult Conversation',
    description: 'Have that difficult conversation you\'ve been putting off.',
    difficulty: 'hard',
    category: 'social'
  },
  {
    title: 'Social Event',
    description: 'Attend a social event or gathering (virtual or in-person).',
    difficulty: 'medium',
    category: 'social'
  },
  {
    title: 'Relationship Reflection',
    description: 'Reflect on your key relationships and how you can strengthen them.',
    difficulty: 'medium',
    category: 'social'
  },
  {
    title: 'Compliment Day',
    description: 'Give sincere compliments to at least 3 different people.',
    difficulty: 'easy',
    category: 'social'
  },
  {
    title: 'Volunteer Time',
    description: 'Volunteer your time or skills for a cause you care about.',
    difficulty: 'hard',
    category: 'social'
  },
  {
    title: 'Boundary Setting',
    description: 'Establish or reinforce a healthy boundary in a relationship.',
    difficulty: 'medium',
    category: 'social'
  }
];

// Recurring Daily Tasks
const recurringTasks: QuestSuggestion[] = [
  {
    title: 'Brush Teeth (Morning)',
    description: 'Brush your teeth for at least 2 minutes in the morning.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Brush Teeth (Night)',
    description: 'Brush your teeth for at least 2 minutes before bed.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Make Your Bed',
    description: 'Take a minute to make your bed after waking up.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Take Out Trash',
    description: 'Empty and take out the trash/recycling.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Wash Dishes',
    description: 'Clean all dirty dishes or load/unload the dishwasher.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Feed Pet',
    description: 'Feed your pet(s) their regular meals.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Water Plants',
    description: 'Check and water your houseplants as needed.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Take Medication',
    description: 'Take your daily medications/vitamins on schedule.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Floss Teeth',
    description: 'Floss your teeth thoroughly before bed.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Wipe Kitchen Counters',
    description: 'Clean kitchen surfaces after cooking/eating.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Check Mail',
    description: 'Check and sort through your mail/packages.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Charge Devices',
    description: 'Plug in your phone and other devices before bed.',
    difficulty: 'easy',
    category: 'tech'
  },
  {
    title: 'Pack Lunch',
    description: 'Prepare and pack your lunch for tomorrow.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Set Out Clothes',
    description: 'Choose and set out your outfit for tomorrow.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Quick Tidy-Up',
    description: 'Spend 10 minutes picking up and putting things away.',
    difficulty: 'easy',
    category: 'home'
  },
  // New recurring tasks
  {
    title: 'Leave Work On Time',
    description: 'Leave work at your scheduled end time without staying late.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Make Dinner',
    description: 'Prepare a home-cooked meal instead of ordering takeout.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Daily Walk',
    description: 'Take a 15-30 minute walk during the day.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Stretch Break',
    description: 'Take a 5-minute stretch break every few hours.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Drink Water',
    description: 'Drink at least 8 glasses of water throughout the day.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Go for a Drive',
    description: 'Take a short drive to clear your mind or enjoy scenery.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Take Stairs',
    description: 'Use stairs instead of elevators throughout the day.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Meal Planning',
    description: 'Plan your meals for the next few days.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Evening Reflection',
    description: 'Spend 5 minutes reflecting on your day before bed.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Morning Routine',
    description: 'Complete your morning routine without rushing.',
    difficulty: 'medium',
    category: 'productivity'
  },
  {
    title: 'Lunch Break',
    description: 'Take a proper lunch break away from your desk.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Screen Time Limit',
    description: 'Limit recreational screen time to a set amount today.',
    difficulty: 'medium',
    category: 'personal'
  },
  {
    title: 'Grocery Shopping',
    description: 'Pick up groceries for the week.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Weekend Planning',
    description: 'Plan activities for the upcoming weekend.',
    difficulty: 'easy',
    category: 'productivity'
  },
  {
    title: 'Laundry',
    description: 'Do a load of laundry and put clothes away.',
    difficulty: 'medium',
    category: 'home'
  },
  {
    title: 'Quick Workout',
    description: 'Complete a 10-15 minute workout or exercise routine.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Vacuum',
    description: 'Vacuum one room or area of your home.',
    difficulty: 'easy',
    category: 'home'
  },
  {
    title: 'Hiking',
    description: 'Go for a short hike on a local trail.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Bike Ride',
    description: 'Take a bike ride around your neighborhood or a local trail.',
    difficulty: 'medium',
    category: 'health'
  },
  {
    title: 'Call a Friend/Family',
    description: 'Call or video chat with a friend or family member.',
    difficulty: 'easy',
    category: 'social'
  },
  {
    title: 'Read for Pleasure',
    description: 'Read a book or article for at least 15 minutes.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Mindfulness Practice',
    description: 'Practice mindfulness or meditation for 5-10 minutes.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Prepare Coffee/Tea',
    description: 'Make yourself a nice cup of coffee or tea to enjoy.',
    difficulty: 'easy',
    category: 'personal'
  },
  {
    title: 'Shower/Bath',
    description: 'Take a refreshing shower or relaxing bath.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Skincare Routine',
    description: 'Complete your morning or evening skincare routine.',
    difficulty: 'easy',
    category: 'health'
  },
  {
    title: 'Commute Planning',
    description: 'Plan your commute to avoid traffic or delays.',
    difficulty: 'easy',
    category: 'productivity'
  }
];

// Combine all quest categories
const allQuestSuggestions: QuestSuggestion[] = [
  ...healthQuests,
  ...productivityQuests,
  ...personalQuests,
  ...homeQuests,
  ...techQuests,
  ...socialQuests,
  ...recurringTasks
];

// Function to get a random quest suggestion
export function getRandomQuestSuggestion(): QuestSuggestion {
  // Get recently suggested tasks
  const recentlySuggested = getRecentlySuggestedTasks();
  
  // Create a copy of all suggestions and filter out recently suggested ones
  const availableSuggestions = [...allQuestSuggestions];
  const filteredSuggestions = availableSuggestions.filter(
    suggestion => !recentlySuggested.includes(suggestion.title)
  );
  
  // If we've filtered out too many, fall back to all suggestions
  const finalSuggestions = filteredSuggestions.length > 0 ? filteredSuggestions : availableSuggestions;
  
  // Get a random suggestion
  const randomIndex = Math.floor(Math.random() * finalSuggestions.length);
  const suggestion = finalSuggestions[randomIndex];
  
  // Ensure the suggestion has a valid category
  const finalSuggestion = ensureCategoryForSuggestion(suggestion);
  
  // Add to recently suggested
  addToRecentlySuggested(finalSuggestion.title);
  
  return finalSuggestion;
}

// Helper function to ensure a suggestion has a valid category
function ensureCategoryForSuggestion(suggestion: QuestSuggestion): QuestSuggestion {
  if (!suggestion.category) {
    // Try to determine the category based on which array it belongs to
    if (recurringTasks.some(rt => rt.title === suggestion.title)) {
      return { ...suggestion, category: 'recurring' };
    } else if (healthQuests.some(hq => hq.title === suggestion.title)) {
      return { ...suggestion, category: 'health' };
    } else if (productivityQuests.some(pq => pq.title === suggestion.title)) {
      return { ...suggestion, category: 'productivity' };
    } else if (personalQuests.some(pq => pq.title === suggestion.title)) {
      return { ...suggestion, category: 'personal' };
    } else if (homeQuests.some(hq => hq.title === suggestion.title)) {
      return { ...suggestion, category: 'home' };
    } else if (techQuests.some(tq => tq.title === suggestion.title)) {
      return { ...suggestion, category: 'tech' };
    } else if (socialQuests.some(sq => sq.title === suggestion.title)) {
      return { ...suggestion, category: 'social' };
    } else {
      // Default fallback
      return { ...suggestion, category: 'personal' };
    }
  }
  return suggestion;
}

// Function to get multiple random quest suggestions
// Modified to avoid suggesting quests that are already in the task list or recently suggested
export function getRandomQuestSuggestions(count: number, existingTasks: { title: string }[] = []): QuestSuggestion[] {
  const suggestions: QuestSuggestion[] = [];
  
  // Create a copy of all suggestions
  const availableSuggestions = [...allQuestSuggestions];
  
  // Get recently suggested tasks
  const recentlySuggested = getRecentlySuggestedTasks();
  
  // Filter out suggestions that match titles in the existing tasks or recently suggested
  const existingTitles = new Set(existingTasks.map(task => task.title));
  const filteredSuggestions = availableSuggestions.filter(
    suggestion => !existingTitles.has(suggestion.title) && !recentlySuggested.includes(suggestion.title)
  );
  
  // If we've filtered out too many tasks, fall back to just filtering out existing tasks
  const finalSuggestions = filteredSuggestions.length < count
    ? availableSuggestions.filter(suggestion => !existingTitles.has(suggestion.title))
    : filteredSuggestions;
  
  // If we have no available suggestions after filtering, return empty array
  if (finalSuggestions.length === 0) {
    return [];
  }
  
  // Get random suggestions from the filtered list
  for (let i = 0; i < count && finalSuggestions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * finalSuggestions.length);
    const suggestion = ensureCategoryForSuggestion(finalSuggestions[randomIndex]);
    suggestions.push(suggestion);
    finalSuggestions.splice(randomIndex, 1);
  }
  
  // Add these suggestions to recently suggested
  addMultipleToRecentlySuggested(suggestions);
  
  return suggestions;
}

// Function to get a mix of recurring and other random tasks
export function getRecurringAndUnexpectedSuggestions(existingTasks: { title: string }[] = []): QuestSuggestion[] {
  const suggestions: QuestSuggestion[] = [];
  
  // Create copies of our task categories
  const availableRecurringTasks = [...recurringTasks];
  
  // Create a collection of all non-recurring tasks
  const otherTaskCategories = [
    ...healthQuests,
    ...productivityQuests,
    ...personalQuests,
    ...homeQuests,
    ...techQuests,
    ...socialQuests
  ];
  
  // Get recently suggested tasks to avoid repeating them
  const recentlySuggested = getRecentlySuggestedTasks();
  
  // Filter out suggestions that match titles in the existing tasks or recently suggested
  const existingTitles = new Set(existingTasks.map(task => task.title));
  
  const filteredRecurringTasks = availableRecurringTasks.filter(
    suggestion => !existingTitles.has(suggestion.title) && !recentlySuggested.includes(suggestion.title)
  );
  
  const filteredOtherTasks = otherTaskCategories.filter(
    suggestion => !existingTitles.has(suggestion.title) && !recentlySuggested.includes(suggestion.title)
  );
  
  // If we've filtered out too many recurring tasks, fall back to all recurring tasks minus existing
  const finalRecurringTasks = filteredRecurringTasks.length < 2 
    ? availableRecurringTasks.filter(suggestion => !existingTitles.has(suggestion.title))
    : filteredRecurringTasks;
    
  // If we've filtered out too many other tasks, fall back to all other tasks minus existing
  const finalOtherTasks = filteredOtherTasks.length === 0
    ? otherTaskCategories.filter(suggestion => !existingTitles.has(suggestion.title))
    : filteredOtherTasks;
  
  // Get 2 random recurring tasks
  for (let i = 0; i < 2 && finalRecurringTasks.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * finalRecurringTasks.length);
    const suggestion = ensureCategoryForSuggestion(finalRecurringTasks[randomIndex]);
    suggestions.push(suggestion);
    finalRecurringTasks.splice(randomIndex, 1);
  }
  
  // Get 1 random task from other categories
  if (finalOtherTasks.length > 0) {
    const randomIndex = Math.floor(Math.random() * finalOtherTasks.length);
    const suggestion = ensureCategoryForSuggestion(finalOtherTasks[randomIndex]);
    suggestions.push(suggestion);
  }
  
  // Add these suggestions to recently suggested
  addMultipleToRecentlySuggested(suggestions);
  
  return suggestions;
} 
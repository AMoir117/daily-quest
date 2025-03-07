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
  },
  // New Health & Fitness Quests
  {
    title: 'HIIT Workout',
    description: 'Complete a 20-minute high-intensity interval training session.',
    difficulty: 'hard'
  },
  {
    title: 'Stretching Routine',
    description: 'Do a full-body stretching routine for 15 minutes.',
    difficulty: 'easy'
  },
  {
    title: 'Plank Challenge',
    description: 'Hold a plank position for as long as possible, try to beat your record.',
    difficulty: 'medium'
  },
  {
    title: 'Sugar-Free Day',
    description: 'Go the entire day without consuming added sugar.',
    difficulty: 'medium'
  },
  {
    title: 'Bike Ride',
    description: 'Go for a 30-minute bike ride.',
    difficulty: 'medium'
  },
  {
    title: 'Healthy Breakfast',
    description: 'Prepare and eat a nutritious breakfast with protein and vegetables.',
    difficulty: 'easy'
  },
  {
    title: 'Posture Check',
    description: 'Set hourly reminders to check and correct your posture throughout the day.',
    difficulty: 'easy'
  },
  {
    title: 'Squat Challenge',
    description: 'Complete 50 squats throughout the day.',
    difficulty: 'medium'
  },
  {
    title: 'Mindful Eating',
    description: 'Eat one meal without distractions, focusing only on your food and eating slowly.',
    difficulty: 'easy'
  },
  {
    title: 'Cold Shower',
    description: 'Take a cold shower or end your shower with 30 seconds of cold water.',
    difficulty: 'medium'
  },
  {
    title: 'Stair Climbing',
    description: 'Take the stairs instead of elevators all day.',
    difficulty: 'easy'
  },
  {
    title: 'Breathing Exercises',
    description: 'Practice deep breathing exercises for 5 minutes.',
    difficulty: 'easy'
  },
  {
    title: 'Dance Workout',
    description: 'Do a 20-minute dance workout video.',
    difficulty: 'medium'
  },
  {
    title: 'No Caffeine Day',
    description: 'Go the entire day without consuming caffeine.',
    difficulty: 'medium'
  },
  {
    title: 'Meal Tracking',
    description: 'Track all your meals and snacks for the day.',
    difficulty: 'easy'
  },
  {
    title: 'Bodyweight Circuit',
    description: 'Complete a full bodyweight circuit workout (push-ups, squats, lunges, etc.).',
    difficulty: 'medium'
  },
  {
    title: 'Walking Meeting',
    description: 'Take at least one meeting or phone call while walking.',
    difficulty: 'easy'
  },
  {
    title: 'Healthy Snack Prep',
    description: 'Prepare healthy snacks for the week.',
    difficulty: 'easy'
  },
  {
    title: 'Sleep Hygiene',
    description: 'Go to bed at a consistent time and avoid screens 1 hour before sleep.',
    difficulty: 'medium'
  },
  {
    title: 'Foam Rolling',
    description: 'Spend 15 minutes foam rolling tight muscles.',
    difficulty: 'easy'
  },
  {
    title: 'Intermittent Fasting',
    description: 'Try a 16:8 intermittent fasting schedule for the day.',
    difficulty: 'medium'
  },
  {
    title: 'Outdoor Activity',
    description: 'Spend at least 30 minutes doing any physical activity outdoors.',
    difficulty: 'medium'
  },
  {
    title: 'Healthy Recipe',
    description: 'Find and cook a new healthy recipe for dinner.',
    difficulty: 'medium'
  },
  {
    title: 'Flexibility Test',
    description: 'Measure your flexibility with simple tests and record your results.',
    difficulty: 'easy'
  },
  {
    title: 'Strength Training',
    description: 'Complete a 30-minute strength training session.',
    difficulty: 'medium'
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
  },
  // New Productivity Quests
  {
    title: 'Pomodoro Sessions',
    description: 'Complete 4 Pomodoro sessions (25 minutes work, 5 minutes break).',
    difficulty: 'medium'
  },
  {
    title: 'Morning Planning',
    description: 'Spend 15 minutes planning your day first thing in the morning.',
    difficulty: 'easy'
  },
  {
    title: 'Email Management',
    description: 'Set up email filters and organize your inbox system.',
    difficulty: 'medium'
  },
  {
    title: 'Notification Audit',
    description: 'Review and disable unnecessary notifications on all your devices.',
    difficulty: 'easy'
  },
  {
    title: 'Weekly Review',
    description: 'Conduct a review of your week: achievements, challenges, and lessons learned.',
    difficulty: 'medium'
  },
  {
    title: 'Desk Organization',
    description: 'Clean and organize your workspace for maximum productivity.',
    difficulty: 'easy'
  },
  {
    title: 'Single-Tasking',
    description: 'Focus on one task at a time for the entire day, avoiding multitasking.',
    difficulty: 'medium'
  },
  {
    title: 'Project Planning',
    description: 'Break down a large project into actionable steps with deadlines.',
    difficulty: 'medium'
  },
  {
    title: 'Habit Tracking',
    description: 'Set up a system to track your daily habits and routines.',
    difficulty: 'easy'
  },
  {
    title: 'Time Audit',
    description: 'Track how you spend your time for one day to identify inefficiencies.',
    difficulty: 'medium'
  },
  {
    title: 'Meeting Efficiency',
    description: 'Prepare agendas for all meetings and keep them time-boxed.',
    difficulty: 'easy'
  },
  {
    title: 'Knowledge Base',
    description: 'Create or update your personal knowledge management system.',
    difficulty: 'medium'
  },
  {
    title: 'Procrastination List',
    description: 'Tackle three tasks you\'ve been procrastinating on.',
    difficulty: 'hard'
  },
  {
    title: 'Automation Setup',
    description: 'Automate one repetitive task in your workflow.',
    difficulty: 'medium'
  },
  {
    title: 'Focus Environment',
    description: 'Set up your environment to minimize distractions for deep work.',
    difficulty: 'easy'
  },
  {
    title: 'Calendar Cleanup',
    description: 'Review and optimize your calendar for the upcoming week.',
    difficulty: 'easy'
  },
  {
    title: 'Documentation',
    description: 'Document an important process or workflow you regularly use.',
    difficulty: 'medium'
  },
  {
    title: 'Skill Assessment',
    description: 'Identify three skills to develop and create a learning plan.',
    difficulty: 'medium'
  },
  {
    title: 'Feedback Session',
    description: 'Ask for feedback on a recent project or your performance.',
    difficulty: 'medium'
  },
  {
    title: 'No-Meeting Day',
    description: 'Block off a full day for focused work with no meetings.',
    difficulty: 'medium'
  },
  {
    title: 'Portfolio Update',
    description: 'Update your portfolio, resume, or professional profiles.',
    difficulty: 'medium'
  },
  {
    title: 'Productivity Tools Audit',
    description: 'Evaluate your current productivity tools and optimize or replace as needed.',
    difficulty: 'medium'
  },
  {
    title: 'Delegation Practice',
    description: 'Identify and delegate at least one task that someone else could do.',
    difficulty: 'medium'
  },
  {
    title: 'Batch Processing',
    description: 'Batch similar tasks together and complete them in one focused session.',
    difficulty: 'easy'
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
  },
  // New Personal Development Quests
  {
    title: 'Mindfulness Practice',
    description: 'Practice mindfulness or meditation for 10 minutes.',
    difficulty: 'easy'
  },
  {
    title: 'Skill Learning',
    description: 'Spend 30 minutes learning a new skill unrelated to your work.',
    difficulty: 'medium'
  },
  {
    title: 'Podcast Episode',
    description: 'Listen to an educational podcast episode.',
    difficulty: 'easy'
  },
  {
    title: 'Vision Board',
    description: 'Create or update a vision board for your goals.',
    difficulty: 'medium'
  },
  {
    title: 'Comfort Zone Challenge',
    description: 'Do one thing outside your comfort zone today.',
    difficulty: 'hard'
  },
  {
    title: 'Handwritten Letter',
    description: 'Write a handwritten letter or card to someone you appreciate.',
    difficulty: 'easy'
  },
  {
    title: 'Documentary Watching',
    description: 'Watch a documentary on a subject you know little about.',
    difficulty: 'easy'
  },
  {
    title: 'Hobby Time',
    description: 'Spend 1 hour engaging in a hobby you enjoy.',
    difficulty: 'easy'
  },
  {
    title: 'Self-Reflection',
    description: 'Answer three deep self-reflection questions in your journal.',
    difficulty: 'medium'
  },
  {
    title: 'Goal Review',
    description: 'Review your short and long-term goals and adjust as needed.',
    difficulty: 'medium'
  },
  {
    title: 'Online Course',
    description: 'Complete one lesson in an online course you\'re taking.',
    difficulty: 'medium'
  },
  {
    title: 'Public Speaking Practice',
    description: 'Practice a speech or presentation out loud for 10 minutes.',
    difficulty: 'medium'
  },
  {
    title: 'Inspirational Content',
    description: 'Read or watch something inspirational and take notes.',
    difficulty: 'easy'
  },
  {
    title: 'Networking Event',
    description: 'Attend a networking event or meetup (virtual or in-person).',
    difficulty: 'hard'
  },
  {
    title: 'Skill Sharing',
    description: 'Teach someone a skill you\'re good at.',
    difficulty: 'medium'
  },
  {
    title: 'Personal Values',
    description: 'Write down your top 5 personal values and reflect on them.',
    difficulty: 'medium'
  },
  {
    title: 'Visualization Exercise',
    description: 'Spend 10 minutes visualizing achieving your biggest goal.',
    difficulty: 'easy'
  },
  {
    title: 'Feedback Analysis',
    description: 'Reflect on feedback you\'ve received and identify areas for growth.',
    difficulty: 'medium'
  },
  {
    title: 'Strength Assessment',
    description: 'Identify and write about your top 3 personal strengths.',
    difficulty: 'easy'
  },
  {
    title: 'Cultural Experience',
    description: 'Experience a cultural activity different from your own background.',
    difficulty: 'medium'
  },
  {
    title: 'Mentorship Session',
    description: 'Have a conversation with a mentor or someone you admire.',
    difficulty: 'medium'
  },
  {
    title: 'Habit Formation',
    description: 'Identify a new positive habit you want to develop and take the first step.',
    difficulty: 'easy'
  },
  {
    title: 'Emotional Intelligence',
    description: 'Practice active listening in a conversation without interrupting.',
    difficulty: 'medium'
  },
  {
    title: 'Creativity Exercise',
    description: 'Complete a creativity exercise or brain teaser.',
    difficulty: 'easy'
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
  },
  // New Home & Life Quests
  {
    title: 'Digital Cleanup',
    description: 'Delete unnecessary files and organize your digital storage.',
    difficulty: 'medium'
  },
  {
    title: 'Pantry Organization',
    description: 'Clean and organize your pantry or food storage area.',
    difficulty: 'medium'
  },
  {
    title: 'Wardrobe Audit',
    description: 'Review your wardrobe and identify items to donate or repair.',
    difficulty: 'medium'
  },
  {
    title: 'Financial Check-In',
    description: 'Review your recent expenses and update your budget.',
    difficulty: 'medium'
  },
  {
    title: 'Fridge Cleanup',
    description: 'Clean out your refrigerator and discard expired items.',
    difficulty: 'easy'
  },
  {
    title: 'Home Inventory',
    description: 'Create or update an inventory of valuable items in your home.',
    difficulty: 'hard'
  },
  {
    title: 'Emergency Plan',
    description: 'Create or review your emergency plan and supplies.',
    difficulty: 'medium'
  },
  {
    title: 'Subscription Audit',
    description: 'Review all your subscriptions and cancel unnecessary ones.',
    difficulty: 'easy'
  },
  {
    title: 'Bathroom Deep Clean',
    description: 'Deep clean your bathroom including all fixtures and surfaces.',
    difficulty: 'medium'
  },
  {
    title: 'Window Cleaning',
    description: 'Clean all windows in one room or area of your home.',
    difficulty: 'medium'
  },
  {
    title: 'Paperwork Organization',
    description: 'Organize and file important documents and paperwork.',
    difficulty: 'medium'
  },
  {
    title: 'Savings Contribution',
    description: 'Make an extra contribution to your savings or investment account.',
    difficulty: 'medium'
  },
  {
    title: 'Closet Organization',
    description: 'Organize one closet in your home.',
    difficulty: 'medium'
  },
  {
    title: 'Debt Reduction Plan',
    description: 'Create or review your debt reduction strategy.',
    difficulty: 'medium'
  },
  {
    title: 'Home Decor Refresh',
    description: 'Update one area of your home with simple decor changes.',
    difficulty: 'easy'
  },
  {
    title: 'Appliance Maintenance',
    description: 'Clean and maintain one major appliance (washing machine, dishwasher, etc.).',
    difficulty: 'medium'
  },
  {
    title: 'Grocery Shopping',
    description: 'Complete grocery shopping with a prepared list and budget.',
    difficulty: 'easy'
  },
  {
    title: 'Insurance Review',
    description: 'Review your insurance policies and coverage.',
    difficulty: 'hard'
  },
  {
    title: 'Outdoor Space',
    description: 'Tidy and organize your balcony, patio, or yard.',
    difficulty: 'medium'
  },
  {
    title: 'Car Maintenance',
    description: 'Complete a car maintenance task (cleaning, oil check, tire pressure).',
    difficulty: 'medium'
  },
  {
    title: 'Electronics Cleanup',
    description: 'Clean and organize your electronics and their cables.',
    difficulty: 'easy'
  },
  {
    title: 'Bathroom Supplies',
    description: 'Take inventory and restock bathroom supplies as needed.',
    difficulty: 'easy'
  },
  {
    title: 'Shoe Organization',
    description: 'Clean and organize your shoe collection.',
    difficulty: 'easy'
  },
  {
    title: 'Kitchen Drawers',
    description: 'Clean and organize kitchen drawers and utensils.',
    difficulty: 'medium'
  },
  {
    title: 'Ceiling Fans & Vents',
    description: 'Clean ceiling fans and air vents throughout your home.',
    difficulty: 'medium'
  }
];

// Technology & Learning Quests
const techQuests: QuestSuggestion[] = [
  {
    title: 'Coding Practice',
    description: 'Spend 30 minutes practicing coding or solving programming challenges.',
    difficulty: 'medium'
  },
  {
    title: 'Tech Tutorial',
    description: 'Complete a tutorial for a technology you want to learn.',
    difficulty: 'medium'
  },
  {
    title: 'Password Manager',
    description: 'Set up or update your password manager with secure passwords.',
    difficulty: 'medium'
  },
  {
    title: 'Device Backup',
    description: 'Back up important data from your computer and mobile devices.',
    difficulty: 'easy'
  },
  {
    title: 'Software Updates',
    description: 'Update all software and applications on your devices.',
    difficulty: 'easy'
  },
  {
    title: 'Online Security Audit',
    description: 'Review and improve security settings on your important accounts.',
    difficulty: 'medium'
  },
  {
    title: 'Tech Declutter',
    description: 'Uninstall unused applications and clean up your digital workspace.',
    difficulty: 'easy'
  },
  {
    title: 'New Technology Exploration',
    description: 'Research and learn about a new technology trend for 30 minutes.',
    difficulty: 'easy'
  },
  {
    title: 'Online Course Progress',
    description: 'Complete one module or lesson in an online tech course.',
    difficulty: 'medium'
  },
  {
    title: 'Tech Project',
    description: 'Work on a personal tech project for 1 hour.',
    difficulty: 'hard'
  },
  {
    title: 'Digital Minimalism',
    description: 'Remove digital distractions from your devices for improved focus.',
    difficulty: 'medium'
  },
  {
    title: 'Tech Documentation',
    description: 'Document your tech setup, configurations, or code for future reference.',
    difficulty: 'medium'
  }
];

// Social & Relationship Quests
const socialQuests: QuestSuggestion[] = [
  {
    title: 'Friend Check-In',
    description: 'Reach out to a friend you haven\'t spoken to in a while.',
    difficulty: 'easy'
  },
  {
    title: 'Family Time',
    description: 'Spend quality time with family members without distractions.',
    difficulty: 'medium'
  },
  {
    title: 'Gratitude Expression',
    description: 'Express genuine gratitude to someone who has helped you.',
    difficulty: 'easy'
  },
  {
    title: 'Active Listening',
    description: 'Practice active listening in all conversations today.',
    difficulty: 'medium'
  },
  {
    title: 'Social Media Detox',
    description: 'Take a 24-hour break from all social media platforms.',
    difficulty: 'medium'
  },
  {
    title: 'Random Act of Kindness',
    description: 'Perform a random act of kindness for a stranger or colleague.',
    difficulty: 'easy'
  },
  {
    title: 'Difficult Conversation',
    description: 'Have that difficult conversation you\'ve been putting off.',
    difficulty: 'hard'
  },
  {
    title: 'Social Event',
    description: 'Attend a social event or gathering (virtual or in-person).',
    difficulty: 'medium'
  },
  {
    title: 'Relationship Reflection',
    description: 'Reflect on your key relationships and how you can strengthen them.',
    difficulty: 'medium'
  },
  {
    title: 'Compliment Day',
    description: 'Give sincere compliments to at least 3 different people.',
    difficulty: 'easy'
  },
  {
    title: 'Volunteer Time',
    description: 'Volunteer your time or skills for a cause you care about.',
    difficulty: 'hard'
  },
  {
    title: 'Boundary Setting',
    description: 'Establish or reinforce a healthy boundary in a relationship.',
    difficulty: 'medium'
  }
];

// Combine all quest categories
export const allQuestSuggestions: QuestSuggestion[] = [
  ...healthQuests,
  ...productivityQuests,
  ...personalQuests,
  ...homeQuests,
  ...techQuests,
  ...socialQuests
];

// Function to get a random quest suggestion
export function getRandomQuestSuggestion(): QuestSuggestion {
  const randomIndex = Math.floor(Math.random() * allQuestSuggestions.length);
  return allQuestSuggestions[randomIndex];
}

// Function to get multiple random quest suggestions
// Modified to avoid suggesting quests that are already in the task list
export function getRandomQuestSuggestions(count: number, existingTasks: { title: string }[] = []): QuestSuggestion[] {
  const suggestions: QuestSuggestion[] = [];
  
  // Create a copy of all suggestions
  const availableSuggestions = [...allQuestSuggestions];
  
  // Filter out suggestions that match titles in the existing tasks
  const existingTitles = new Set(existingTasks.map(task => task.title));
  const filteredSuggestions = availableSuggestions.filter(
    suggestion => !existingTitles.has(suggestion.title)
  );
  
  // If we have no available suggestions after filtering, return empty array
  if (filteredSuggestions.length === 0) {
    return [];
  }
  
  // Get random suggestions from the filtered list
  for (let i = 0; i < count && filteredSuggestions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
    suggestions.push(filteredSuggestions[randomIndex]);
    filteredSuggestions.splice(randomIndex, 1);
  }
  
  return suggestions;
} 
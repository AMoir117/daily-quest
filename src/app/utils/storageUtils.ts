import { Task, User, DailyStats, TaskHistory, DayOfWeek } from '../types';
import { XP_REWARDS } from './levelUtils';

// Storage keys
const TASKS_KEY = 'dailyquest_tasks';
const USER_KEY = 'dailyquest_user';
const STATS_KEY = 'dailyquest_stats';
const HISTORY_KEY = 'dailyquest_history';

// Default user data
export const DEFAULT_USER: User = {
  level: 1,
  xp: 0,
  totalXp: 0,
  xpToNextLevel: 100,
  tasksCompleted: 0,
  streakDays: 0,
  lastActive: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  lastRecurringCheck: undefined
};

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Generic function to get data from localStorage
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) {
    return defaultValue;
  }
  
  try {
    // Validate the key
    if (!key || typeof key !== 'string') {
      return defaultValue;
    }
    
    // Get item from localStorage
    const item = localStorage.getItem(key);
    
    // If item doesn't exist, return default value
    if (item === null || item === undefined) {
      return defaultValue;
    }
    
    // Parse the item
    const parsedItem = JSON.parse(item);
    
    // Validate the parsed item
    if (parsedItem === null || parsedItem === undefined) {
      return defaultValue;
    }
    
    return parsedItem;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    
    // If there's an error parsing the JSON, try to clean up the localStorage
    if (error instanceof SyntaxError) {
      try {
        localStorage.removeItem(key);
      } catch (cleanupError) {
        console.error(`Failed to clean up invalid data for ${key}:`, cleanupError);
      }
    }
    
    return defaultValue;
  }
}

// Generic function to save data to localStorage
export function saveToStorage<T>(key: string, value: T): void {
  if (!isBrowser) {
    return;
  }
  
  try {
    // Validate the key
    if (!key || typeof key !== 'string') {
      throw new Error(`Invalid storage key: ${key}`);
    }
    
    // Validate the value - ensure it can be serialized
    const valueStr = JSON.stringify(value);
    if (!valueStr) {
      throw new Error(`Failed to stringify value for key ${key}`);
    }
    
    // Save to localStorage
    localStorage.setItem(key, valueStr);
    
    // Verify the save
    const savedItem = localStorage.getItem(key);
    if (!savedItem) {
      throw new Error(`Failed to verify saved item for key ${key}`);
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    
    // Try to save a simplified version if the original save failed
    if (error instanceof Error && error.message.includes('stringify')) {
      try {
        // For complex objects that might have circular references
        const simplifiedValue = { ...value };
        localStorage.setItem(key, JSON.stringify(simplifiedValue));
      } catch (fallbackError) {
        console.error(`Failed fallback save for ${key}:`, fallbackError);
      }
    }
  }
}

// Task-specific functions
export function getTasks(): Task[] {
  return getFromStorage<Task[]>(TASKS_KEY, []);
}

export function saveTasks(tasks: Task[]): void {
  saveToStorage(TASKS_KEY, tasks);
}

// User-specific functions
export function getUser(): User {
  try {
    // Get user data from localStorage
    const user = getFromStorage<User>(USER_KEY, DEFAULT_USER);
    
    // Check if we got a valid user object
    if (!user || typeof user !== 'object') {
      return { ...DEFAULT_USER };
    }
    
    // Ensure all required properties exist and are the correct type
    const validatedUser = {
      ...DEFAULT_USER,  // Start with defaults for any missing properties
      ...user,          // Override with stored values
      // Ensure critical fields are numbers
      totalXp: Number(user.totalXp || 0),
      xp: Number(user.xp || 0),
      level: Number(user.level || 1),
      xpToNextLevel: Number(user.xpToNextLevel || 100),
      tasksCompleted: Number(user.tasksCompleted || 0),
      streakDays: Number(user.streakDays || 0)
    };
    
    // Ensure level is at least 1
    if (validatedUser.level < 1) {
      validatedUser.level = 1;
    }
    
    return validatedUser;
  } catch (error) {
    console.error('Error retrieving user data from localStorage:', error);
    return { ...DEFAULT_USER };
  }
}

export function saveUser(user: User): void {
  // Ensure all user properties are properly set before saving
  const userToSave = {
    ...DEFAULT_USER,  // Start with default values
    ...user,          // Override with provided values
    // Ensure critical fields are numbers
    totalXp: Number(user.totalXp || 0),
    xp: Number(user.xp || 0),
    level: Number(user.level || 1),
    xpToNextLevel: Number(user.xpToNextLevel || 100),
    tasksCompleted: Number(user.tasksCompleted || 0),
    streakDays: Number(user.streakDays || 0)
  };
  
  // Save to localStorage
  saveToStorage(USER_KEY, userToSave);
}

// Stats-specific functions
export function getStats(): DailyStats[] {
  return getFromStorage<DailyStats[]>(STATS_KEY, []);
}

export function saveStats(stats: DailyStats[]): void {
  saveToStorage(STATS_KEY, stats);
}

// History-specific functions
export function getHistory(): TaskHistory[] {
  return getFromStorage<TaskHistory[]>(HISTORY_KEY, []);
}

export function saveHistory(history: TaskHistory[]): void {
  saveToStorage(HISTORY_KEY, history);
}

// Function to update daily stats
export function updateDailyStats(tasksCompleted: number, xpGained: number): void {
  const today = new Date().toISOString().split('T')[0];
  const stats = getStats();
  
  const todayStats = stats.find(stat => stat.date === today);
  
  if (todayStats) {
    todayStats.tasksCompleted += tasksCompleted;
    todayStats.xpGained += xpGained;
    saveStats(stats);
  } else {
    const newStats = [...stats, { date: today, tasksCompleted, xpGained }];
    saveStats(newStats);
  }
}

// Function to update task history
export function updateTaskHistory(task: Task): void {
  const today = new Date().toISOString().split('T')[0];
  const history = getHistory();
  
  const todayHistory = history.find(h => h.date === today);
  
  if (todayHistory) {
    const existingTaskIndex = todayHistory.tasks.findIndex(t => t.id === task.id);
    
    if (existingTaskIndex >= 0) {
      todayHistory.tasks[existingTaskIndex] = task;
    } else {
      todayHistory.tasks.push(task);
    }
    
    saveHistory(history);
  } else {
    const newHistory = [...history, { date: today, tasks: [task] }];
    saveHistory(newHistory);
  }
}

// Function to clear all DailyQuest data from localStorage
export function clearStorage(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing DailyQuest data from localStorage:', error);
  }
}

// Helper function to get the day of week from a date
export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

// Function to check localStorage status and availability
export function checkLocalStorage(): { available: boolean; size: number; keys: string[] } {
  if (!isBrowser) {
    return { available: false, size: 0, keys: [] };
  }
  
  try {
    // Check if localStorage is available
    const testKey = 'dailyquest_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Get all keys related to DailyQuest
    const allKeys = Object.keys(localStorage);
    const dailyQuestKeys = allKeys.filter(key => key.startsWith('dailyquest_'));
    
    // Calculate total size
    let totalSize = 0;
    for (const key of dailyQuestKeys) {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // UTF-16 characters are 2 bytes each
      }
    }
    
    return {
      available: true,
      size: totalSize,
      keys: dailyQuestKeys
    };
  } catch (error) {
    console.error('Error checking localStorage:', error);
    return { available: false, size: 0, keys: [] };
  }
}

// Function to reset user data
export function resetUserData(): void {
  if (!isBrowser) return;
  
  try {
    // Remove existing user data
    localStorage.removeItem(USER_KEY);
    
    // Save default user data
    saveUser({ ...DEFAULT_USER });
  } catch (error) {
    console.error('Error resetting user data:', error);
  }
} 
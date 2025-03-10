import { Task, User, DailyStats, TaskHistory, DayOfWeek } from '../types';

// Storage keys
const TASKS_KEY = 'dailyquest_tasks';
const USER_KEY = 'dailyquest_user';
const STATS_KEY = 'dailyquest_stats';
const HISTORY_KEY = 'dailyquest_history';
const QUEST_TYPES_KEY = 'dailyquest_quest_types';
const FAILED_TASKS_KEY = 'dailyquest_failed_tasks';

// Helper function to get today's date in YYYY-MM-DD format based on local timezone
export function getLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Default user data
export const DEFAULT_USER: User = {
  level: 1,
  xp: 0,
  totalXp: 0,
  xpToNextLevel: 100,
  tasksCompleted: 0,
  tasksFailed: 0,
  streakDays: 0,
  lastActive: getLocalDateString(), // Today's date in local timezone format
  lastRecurringCheck: undefined,
  failedXp: 0
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
  try {
    // Validate tasks array
    if (!Array.isArray(tasks)) {
      console.error('Invalid tasks data (not an array):', tasks);
      return;
    }
    
    // Make sure we don't have any null or undefined tasks
    const validTasks = tasks.filter(task => task && task.id);
    
    // Check if we filtered anything out
    if (validTasks.length !== tasks.length) {
      console.warn(`Filtered out ${tasks.length - validTasks.length} invalid tasks during save`);
    }
    
    // Ensure no duplicate task IDs
    const uniqueTasks = removeDuplicateTasks(validTasks);
    
    if (uniqueTasks.length !== validTasks.length) {
      console.warn(`Removed ${validTasks.length - uniqueTasks.length} duplicate task IDs`);
    }
    
    // Save the validated tasks array
    saveToStorage(TASKS_KEY, uniqueTasks);
    
    // Verify the save was successful
    const savedTasks = getTasks();
    if (savedTasks.length !== uniqueTasks.length) {
      console.warn(`Task save verification failed. Expected ${uniqueTasks.length} tasks, got ${savedTasks.length}`);
    }
  } catch (error) {
    console.error('Error in saveTasks:', error);
  }
}

// Helper function to remove tasks with duplicate IDs (keeping the latest version)
function removeDuplicateTasks(tasks: Task[]): Task[] {
  const taskMap = new Map<string, Task>();
  
  // Process tasks in reverse to keep the latest version of each task ID
  [...tasks].reverse().forEach(task => {
    if (task && task.id) {
      taskMap.set(task.id, task);
    }
  });
  
  // Convert map back to array and reverse again to restore original order
  return Array.from(taskMap.values()).reverse();
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
export function updateDailyStats(tasksCompleted: number, xpGained: number, providedDate?: string): void {
  // Get today's date in local timezone
  const today = getLocalDateString();
  
  // Safety check: ensure we never add stats for tomorrow
  if (providedDate) {
    if (providedDate > today) {
      console.error('Attempted to add stats for a future date:', providedDate);
      return; // Don't add stats for future dates
    }
  }
  
  const stats = getStats();
  
  // Filter out any future dates that might be in the stats already
  const validStats = stats.filter(stat => stat.date <= today);
  
  // Find today's stats
  const todayStats = validStats.find(stat => stat.date === today);
  
  if (todayStats) {
    todayStats.tasksCompleted += tasksCompleted;
    todayStats.xpGained += xpGained;
    saveStats(validStats);
  } else {
    const newStats = [...validStats, { date: today, tasksCompleted, xpGained }];
    saveStats(newStats);
  }
}

// Function to update task history
export function updateTaskHistory(task: Task): void {
  // Get today's date in local timezone
  const today = getLocalDateString();
  
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

// Function to get failed tasks from storage
export function getFailedTasks(): Task[] {
  return getFromStorage<Task[]>(FAILED_TASKS_KEY, []);
}

// Function to save failed tasks to storage
export function saveFailedTasks(tasks: Task[]): void {
  saveToStorage<Task[]>(FAILED_TASKS_KEY, tasks);
}

// Add failed task to history and failed tasks storage
export function storeFailedTask(task: Task): void {
  // First add to standard task history
  updateTaskHistory(task);
  
  // Then add to special failed tasks storage
  const failedTasks = getFailedTasks();
  
  // Check if task already exists
  const existingTaskIndex = failedTasks.findIndex(t => t.id === task.id);
  
  if (existingTaskIndex >= 0) {
    // Update existing task
    failedTasks[existingTaskIndex] = task;
  } else {
    // Add new failed task
    failedTasks.push(task);
  }
  
  // Save updated failed tasks
  saveFailedTasks(failedTasks);
}

// Function to clear all DailyQuest data from localStorage
export function clearStorage(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(QUEST_TYPES_KEY);
    localStorage.removeItem(FAILED_TASKS_KEY);
    console.log('All DailyQuest data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing DailyQuest data:', error);
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

// Function to clean up any future dates in the stats
export function cleanupFutureDates(): void {
  if (!isBrowser) return;
  
  try {
    // Get today's date
    const today = getLocalDateString();
    
    // Clean up stats
    const stats = getStats();
    const validStats = stats.filter(stat => stat.date <= today);
    
    if (validStats.length !== stats.length) {
      console.log(`Removed ${stats.length - validStats.length} future date entries from stats.`);
      saveStats(validStats);
    }
    
    // Clean up history
    const history = getHistory();
    const validHistory = history.filter(h => h.date <= today);
    
    if (validHistory.length !== history.length) {
      console.log(`Removed ${history.length - validHistory.length} future date entries from history.`);
      saveHistory(validHistory);
    }
  } catch (error) {
    console.error('Error cleaning up future dates:', error);
  }
}

// Function to clean up duplicate recurring tasks
export function cleanupDuplicateTasks(): void {
  if (!isBrowser) return;
  
  try {
    // Get all tasks
    const tasks = getTasks();
    
    // Find all recurring templates
    const recurringTemplates = tasks.filter(task => task.isRecurring);
    
    // Group by title
    const templatesByTitle: Record<string, Task[]> = {};
    recurringTemplates.forEach(template => {
      if (!templatesByTitle[template.title]) {
        templatesByTitle[template.title] = [];
      }
      templatesByTitle[template.title].push(template);
    });
    
    // Find duplicate templates (more than one template with the same title)
    const duplicateTitles = Object.keys(templatesByTitle).filter(
      title => templatesByTitle[title].length > 1
    );
    
    if (duplicateTitles.length === 0) {
      // No duplicates found
      return;
    }
    
    // For each duplicate title, keep only the first template and update all instances
    // to reference the kept template
    const keptTemplates: Record<string, Task> = {};
    const tasksToRemove: string[] = [];
    
    // Identify which templates to keep and which to remove
    duplicateTitles.forEach(title => {
      const templates = templatesByTitle[title];
      // Keep the first template
      keptTemplates[title] = templates[0];
      // Mark the rest for removal
      templates.slice(1).forEach(template => {
        tasksToRemove.push(template.id);
      });
    });
    
    // Update all instances of the removed templates to reference the kept template
    const updatedTasks = tasks.map(task => {
      if (task.parentTaskId && tasksToRemove.includes(task.parentTaskId)) {
        // Find which template this should reference now
        const duplicateTemplate = recurringTemplates.find(t => t.id === task.parentTaskId);
        if (duplicateTemplate && keptTemplates[duplicateTemplate.title]) {
          return {
            ...task,
            parentTaskId: keptTemplates[duplicateTemplate.title].id
          };
        }
      }
      return task;
    });
    
    // Remove the duplicate templates
    const filteredTasks = updatedTasks.filter(task => !tasksToRemove.includes(task.id));
    
    // Save the cleaned up tasks
    if (filteredTasks.length !== tasks.length) {
      console.log(`Removed ${tasks.length - filteredTasks.length} duplicate recurring tasks.`);
      saveTasks(filteredTasks);
    }
  } catch (error) {
    console.error('Error cleaning up duplicate tasks:', error);
  }
}

// Quest types functions
export function getQuestTypes(): string[] {
  return getFromStorage<string[]>(QUEST_TYPES_KEY, []);
}

export function saveQuestTypes(types: string[]): void {
  saveToStorage(QUEST_TYPES_KEY, types);
} 
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, User, TaskDifficulty, DayOfWeek, QuestStatus } from '../types';
import { 
  getTasks, saveTasks, 
  getUser, saveUser, 
  updateDailyStats, 
  updateTaskHistory,
  getStats,
  saveStats,
  getDayOfWeek,
  getLocalDateString,
  cleanupFutureDates,
  cleanupDuplicateTasks,
  getQuestTypes,
  saveQuestTypes,
  storeFailedTask,
  getFailedTasks
} from '../utils/storageUtils';
import { 
  XP_REWARDS, 
  calculateLevel,
  LEVEL_THRESHOLDS,
  calculateXpToNextLevel
} from '../utils/levelUtils';

interface QuestContextType {
  tasks: Task[];
  user: User;
  questTypes: string[];
  addTask: (title: string, description: string, difficulty: TaskDifficulty, isRecurring?: boolean, recurringDays?: DayOfWeek[], questType?: string) => void;
  completeTask: (id: string) => boolean;
  undoTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string, description: string, difficulty: TaskDifficulty, isRecurring?: boolean, recurringDays?: DayOfWeek[], questType?: string) => void;
  copyTask: (id: string) => void;
  hideTask: (id: string) => void;
  unhideTask: (id: string) => void;
  isLevelUp: boolean;
  dismissLevelUp: () => void;
  saveTasks: (tasks: Task[]) => void;
  updateTaskHistory: (task: Task) => void;
  prevLevel: number;
  newLevel: number;
  levelUpData: { oldLevel: number, newLevel: number };
  failRecurringTask: (task: Task) => boolean;
  checkForFailedTasks: () => void;
  addQuestType: (type: string) => void;
  setUser: (user: User) => void;
  saveUser: (user: User) => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

// Define streak milestones and rewards
const STREAK_MILESTONES = [
  { days: 3, xpReward: 50, name: "3-Day Streak" },
  { days: 7, xpReward: 100, name: "Weekly Warrior" },
  { days: 14, xpReward: 250, name: "Fortnight Fighter" },
  { days: 30, xpReward: 500, name: "Monthly Master" },
  { days: 60, xpReward: 1000, name: "Bimonthly Boss" },
  { days: 100, xpReward: 2000, name: "Century Champion" },
  { days: 365, xpReward: 5000, name: "Year-Long Legend" },
];

// Add a function to check for streak milestones
const checkStreakMilestones = (currentStreak: number, previousStreak: number) => {
  // Find milestones that were crossed with this streak update
  const newMilestones = STREAK_MILESTONES.filter(
    milestone => currentStreak >= milestone.days && previousStreak < milestone.days
  );
  
  return newMilestones;
};

// Constants for failed task penalties
const FAILED_TASK_PENALTIES = {
  easy: 5,
  medium: 10,
  hard: 20
};

// Initialize default user
const INITIAL_USER: User = {
  level: 1,
  xp: 0,
  totalXp: 0,
  xpToNextLevel: 100,
  tasksCompleted: 0,
  tasksFailed: 0,
  streakDays: 0,
  lastActive: '',
  failedXp: 0
};

export function QuestProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [prevTotalXp, setPrevTotalXp] = useState(0);
  const [prevLevel, setPrevLevel] = useState(1);
  const [newLevel, setNewLevel] = useState(1);
  const [questTypes, setQuestTypes] = useState<string[]>([]);
  
  // Use refs to store level values for the level-up modal
  const levelUpDataRef = React.useRef({ oldLevel: 1, newLevel: 1 });

  // Generate tasks from recurring tasks
  const generateRecurringTasks = useCallback((today: string) => {
    console.log('Checking for recurring tasks due today:', today);
    
    // Parse the date string to get a Date object for today
    const currentDate = new Date(`${today}T12:00:00`);
    const dayOfWeek = getDayOfWeek(currentDate);
    
    // 1. Find all recurring templates scheduled for today's day of week
    const recurringTemplatesForToday = tasks.filter(task => 
      task.isRecurring && 
      task.recurringDays && 
      task.recurringDays.includes(dayOfWeek)
    );
    
    if (recurringTemplatesForToday.length === 0) {
      console.log('No recurring tasks scheduled for today');
      return;
    }
    
    console.log(`Found ${recurringTemplatesForToday.length} recurring templates for ${dayOfWeek}`);
    
    // 2. Find all instances for today (both active and completed)
    const todayInstances = tasks.filter(task => 
      task.parentTaskId && 
      (task.createdAt?.startsWith(today) || task.completedAt?.startsWith(today))
    );
    
    // 3. Create new instances for templates that don't have an instance for today
    const newTasks: Task[] = [];
    
    recurringTemplatesForToday.forEach(template => {
      // Check if this template already has an instance for today
      const hasInstanceForToday = todayInstances.some(instance => 
        instance.parentTaskId === template.id
      );
      
      if (!hasInstanceForToday) {
        console.log(`Creating instance for "${template.title}"`);
        
        // Create a new instance with today's date
        const now = new Date();
        const isoString = now.toISOString();
        
        const newInstance: Task = {
          id: uuidv4(),
          title: template.title,
          description: template.description,
          difficulty: template.difficulty,
          xpReward: template.xpReward,
          completed: false,
          createdAt: isoString,
          completedAt: undefined,
          isRecurring: false,
          parentTaskId: template.id,
          questType: template.questType
        };
        
        newTasks.push(newInstance);
      } else {
        console.log(`Template "${template.title}" already has instance for today`);
      }
    });
    
    // Only update if we created new tasks
    if (newTasks.length > 0) {
      const updatedTasks = [...tasks, ...newTasks];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      console.log(`Created ${newTasks.length} new task instances for today`);
    } else {
      console.log('No new task instances needed for today');
    }
    
    // Update lastRecurringCheck in user data
    const updatedUser = {
      ...user,
      lastRecurringCheck: today
    };
    
    setUser(updatedUser);
    saveUser(updatedUser);
  }, [tasks, user]);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      // Clean up any future dates that might have gotten into the storage
      cleanupFutureDates();
      
      // Clean up any duplicate recurring tasks
      cleanupDuplicateTasks();
      
      // Get tasks data from localStorage
      const loadedTasks = getTasks();
      
      // Get user data from localStorage
      const loadedUser = getUser();
      
      // Get today's date
      const today = getLocalDateString();
      
      // Calculate initial XP and level from tasks
      const completedTasks = loadedTasks.filter(task => task.completed);
      const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
      
      // Calculate level
      const calculatedLevel = Math.max(1, calculateLevel(calculatedTotalXp));
      
      // Set initial state
      setTasks(loadedTasks);
      
      // Update user with calculated values
      const updatedUser = {
        ...loadedUser,
        totalXp: calculatedTotalXp,
        level: calculatedLevel,
        tasksCompleted: completedTasks.length,
        lastActive: today, // Always update to today
        streakDays: loadedUser.streakDays || 0
      };
      
      setUser(updatedUser);
      setPrevTotalXp(calculatedTotalXp);
      setPrevLevel(calculatedLevel);
      setNewLevel(calculatedLevel);
      
      // Initialize the levelUpDataRef with the current level
      levelUpDataRef.current = {
        oldLevel: calculatedLevel,
        newLevel: calculatedLevel
      };
      
      // Check if we need to generate today's recurring tasks
      if (loadedUser.lastRecurringCheck !== today) {
        console.log(`Need to check recurring tasks for today (${today})`);
        // This will update the user's lastRecurringCheck
        setTimeout(() => generateRecurringTasks(today), 0);
      } else {
        console.log(`Already checked recurring tasks for today (${today})`);
      }
      
      // Save the updated user data
      saveUser(updatedUser);
      
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setTasks([]);
      setUser(INITIAL_USER);
    }
  }, []);

  // Check for streak updates and generate recurring tasks
  useEffect(() => {
    // Use local date string for consistency with other functions
    const today = getLocalDateString();
    
    // Only run this check during initial load or when the day changes
    // This prevents regenerating completed recurring tasks during normal app usage
    if (user.lastActive !== today) {
      console.log('Day changed from', user.lastActive, 'to', today);
      
      const lastActiveDate = new Date(user.lastActive);
      // Add time component to ensure consistent date parsing
      const todayDate = new Date(`${today}T12:00:00`);
      
      // Calculate the difference in days
      const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If the user was active yesterday, increment the streak
      // Otherwise, reset the streak
      const newStreakDays = diffDays === 1 ? user.streakDays + 1 : 0;
      
      // Check if any streak milestones were reached
      const achievedMilestones = checkStreakMilestones(newStreakDays, user.streakDays);
      
      // Calculate total XP reward from milestones
      let streakXpReward = 0;
      let streakMilestoneNames: string[] = [];
      
      if (achievedMilestones.length > 0) {
        // Sum up XP rewards from all achieved milestones
        streakXpReward = achievedMilestones.reduce((total, milestone) => total + milestone.xpReward, 0);
        streakMilestoneNames = achievedMilestones.map(milestone => milestone.name);
        
        console.log(`Achieved streak milestones: ${streakMilestoneNames.join(', ')} for ${streakXpReward} XP`);
      }
      
      // Update user with streak and any milestone rewards
      const updatedUser = {
        ...user,
        streakDays: newStreakDays,
        lastActive: today,
        // Reset lastRecurringCheck to force generation of new instances for the day
        lastRecurringCheck: undefined
      };
      
      // When the day changes, ensure all recurring tasks are properly handled:
      // 1. Preserve completed instances in history
      // 2. Create new instances for today
      
      // Save completed instances to history if they're not already there
      const completedInstances = tasks.filter(task => 
        task.parentTaskId && task.completed
      );
      
      for (const completedInstance of completedInstances) {
        updateTaskHistory(completedInstance);
      }
      
      // Apply streak milestone rewards if any were achieved
      if (streakXpReward > 0) {
        // Add XP from streak milestones
        const updatedXp = updatedUser.xp + streakXpReward;
        const updatedTotalXp = updatedUser.totalXp + streakXpReward;
        
        // Calculate new level based on updated total XP
        const newLevelFromStreak = calculateLevel(updatedTotalXp);
        const xpToNextLevelFromStreak = calculateXpToNextLevel(updatedTotalXp);
        
        // Check if this caused a level up
        if (newLevelFromStreak > updatedUser.level) {
          // Level up occurred from streak milestone
          setPrevLevel(updatedUser.level);
          setNewLevel(newLevelFromStreak);
          setIsLevelUp(true);
          
          // Update stats for the streak milestone XP
          updateDailyStats(0, streakXpReward, today);
          
          // Create a special "Streak Milestone" task in history for the XP gain
          const streakMilestoneTask: Task = {
            id: uuidv4(),
            title: `Streak Milestone: ${streakMilestoneNames.join(', ')}`,
            description: `Earned ${streakXpReward} XP for maintaining a ${newStreakDays}-day streak!`,
            completed: true,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            difficulty: 'medium', // Default difficulty for milestone rewards
            xpReward: streakXpReward
          };
          
          updateTaskHistory(streakMilestoneTask);
          
          // Update user with new level info
          updatedUser.level = newLevelFromStreak;
          updatedUser.xp = updatedXp;
          updatedUser.totalXp = updatedTotalXp;
          updatedUser.xpToNextLevel = xpToNextLevelFromStreak;
        } else {
          // No level up, just add the XP
          updatedUser.xp = updatedXp;
          updatedUser.totalXp = updatedTotalXp;
          updatedUser.xpToNextLevel = xpToNextLevelFromStreak;
          
          // Update stats for the streak milestone XP
          updateDailyStats(0, streakXpReward, today);
          
          // Create a special "Streak Milestone" task in history for the XP gain
          const streakMilestoneTask: Task = {
            id: uuidv4(),
            title: `Streak Milestone: ${streakMilestoneNames.join(', ')}`,
            description: `Earned ${streakXpReward} XP for maintaining a ${newStreakDays}-day streak!`,
            completed: true,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            difficulty: 'medium', // Default difficulty for milestone rewards
            xpReward: streakXpReward
          };
          
          updateTaskHistory(streakMilestoneTask);
        }
      }
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Generate tasks from recurring tasks for the new day
      generateRecurringTasks(today);
    } else if (!user.lastRecurringCheck || user.lastRecurringCheck !== today) {
      // If we haven't checked for recurring tasks today - typically on first page load
      generateRecurringTasks(today);
    }
  }, [user.lastActive, user.lastRecurringCheck, user.streakDays, tasks, prevLevel, newLevel, generateRecurringTasks]);

  // Load quest types from storage and add default categories from quest suggestions
  useEffect(() => {
    const storedQuestTypes = getQuestTypes();
    
    // Add default categories from quest suggestions if they don't exist yet
    const defaultCategories: string[] = ['health', 'productivity', 'personal', 'home', 'tech', 'social'];
    
    // Combine stored types with default categories (avoiding duplicates)
    const combinedTypes = [...storedQuestTypes];
    
    defaultCategories.forEach(category => {
      if (!combinedTypes.includes(category)) {
        combinedTypes.push(category);
      }
    });
    
    // Filter out 'recurring' if it somehow got into the list
    const filteredTypes = combinedTypes.filter(type => type !== 'recurring');
    
    setQuestTypes(filteredTypes);
    saveQuestTypes(filteredTypes);
  }, []);

  // Add a new quest type, preventing 'recurring' from being added
  const addQuestType = useCallback((type: string) => {
    // Convert to uppercase
    const uppercaseType = type.toUpperCase();
    
    // Don't allow adding 'RECURRING' as a quest type
    if (uppercaseType === 'RECURRING') {
      console.log("Cannot add 'RECURRING' as a quest type as it's a special property");
      return;
    }
    
    if (!questTypes.includes(uppercaseType)) {
      const updatedTypes = [...questTypes, uppercaseType];
      setQuestTypes(updatedTypes);
      saveQuestTypes(updatedTypes);
    }
  }, [questTypes]);
  

  const addTask = (
    title: string, 
    description: string, 
    difficulty: TaskDifficulty,
    isRecurring?: boolean,
    recurringDays?: DayOfWeek[],
    questType?: string
  ) => {
    const xpReward = XP_REWARDS[difficulty];
    
    // Convert questType to uppercase if it exists
    const uppercaseQuestType = questType ? questType.toUpperCase() : undefined;
    
    const newTask: Task = {
      id: uuidv4(),
      title,
      description: description || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
      difficulty,
      xpReward,
      isRecurring,
      recurringDays: isRecurring ? recurringDays : undefined,
      questType: uppercaseQuestType,
      questStatus: 'active' // Set active as default status
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    updateTaskHistory(newTask);
  };

  const completeTask = (id: string) => {
    console.log(`CompleteTask called for task ID: ${id}`);
    
    // Get fresh tasks from storage instead of using state to avoid race conditions
    const currentTasks = getTasks();
    const taskIndex = currentTasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      console.log(`Task with id ${id} not found in storage, checking state...`);
      // Fall back to checking in the current state
      const stateTaskIndex = tasks.findIndex(task => task.id === id);
      if (stateTaskIndex === -1) {
        console.log(`Task with id ${id} not found in state either, cannot complete`);
        return false;
      }
      // Copy task from state to storage
      console.log(`Found task in state, adding to storage`);
      const updatedTasks = [...currentTasks, tasks[stateTaskIndex]];
      saveTasks(updatedTasks);
      // Now retry with the updated tasks
      return completeTask(id);
    }
    
    const task = currentTasks[taskIndex];
    
    if (task.completed) {
      console.log(`Task ${id} is already completed`);
      return false;
    }
    
    console.log(`Completing task ${id}: ${task.title}`);
    
    // Get current date and time in local timezone with consistent format
    const now = new Date();
    
    // Format: Use precise ISO string for completion time (will be used for productivity analysis)
    const completionISOString = now.toISOString();
    
    console.log(`Setting completion time to: ${completionISOString}`);
    
    // Mark task as completed and update status
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: completionISOString,
      questStatus: 'completed' as const // Explicitly type as QuestStatus
    };
    
    // Log the updated task for verification
    console.log('Updated task:', JSON.stringify(updatedTask, null, 2));
    
    // Create a new array with the updated task
    const updatedTasks = [...currentTasks];
    updatedTasks[taskIndex] = updatedTask;
    
    // Save tasks to ensure completedAt is properly stored
    saveTasks(updatedTasks);
    
    // Update task history to include completion time
    updateTaskHistory(updatedTask);
    
    // Calculate XP from completed tasks
    const completedTasks = updatedTasks.filter(task => task.completed);
    const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate new level using the recalculated XP values
    const oldLevel = Math.max(1, calculateLevel(prevTotalXp));
    const newLevelValue = Math.max(1, calculateLevel(calculatedTotalXp));
    
    console.log('Task Complete Calculations:', {
      task: updatedTask.title,
      taskId: updatedTask.id,
      prevTotalXp,
      calculatedTotalXp,
      oldLevel,
      newLevelValue,
      currentLevelUpData: levelUpDataRef.current
    });
    
    // Check if level up occurred
    if (newLevelValue > oldLevel) {
      setIsLevelUp(true);
      setPrevLevel(oldLevel);
      setNewLevel(newLevelValue);
      levelUpDataRef.current = { oldLevel, newLevel: newLevelValue };
    }
    
    // Find XP thresholds for current and next level
    const currentLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === oldLevel);
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === newLevelValue + 1);
    
    // Calculate XP within current level and XP to next level
    const currentLevelXp = calculatedTotalXp - (currentLevelThreshold?.xpRequired || 0);
    const xpToNextLevel = (nextLevelThreshold?.xpRequired || 0) - calculatedTotalXp;
    
    // Update user data
    const updatedUser = {
      ...user,
      xp: currentLevelXp,
      totalXp: calculatedTotalXp,
      level: newLevelValue,
      xpToNextLevel: xpToNextLevel,
      tasksCompleted: user.tasksCompleted + 1,
      lastActive: getLocalDateString() // Use just the date part without time for consistent comparison
    };
    
    // Save to localStorage first to ensure persistence
    try {
      saveTasks(updatedTasks);
      saveUser(updatedUser);
      
      // Update daily stats and task history
      updateDailyStats(1, task.xpReward);
      updateTaskHistory(updatedTask);
      
      console.log(`Successfully completed task ${id}: ${task.title}`);
    } catch (error) {
      console.error('Error saving completed task:', error);
      return false;
    }
    
    // Update state after successful save
    setTasks(updatedTasks); // This updates the tasks array with the completed task
    setUser(updatedUser);
    setPrevTotalXp(calculatedTotalXp);
    
    return true;
  };

  const undoTask = (id: string) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // For failed tasks, we don't need to do anything here since the handleUndoFailedTask
    // function in FailedTasks.tsx already handles restoring the XP penalty
    if (task.title.startsWith('FAILED:')) {
      // Just remove the task from the tasks array
      const updatedTasks = [...tasks];
      updatedTasks.splice(taskIndex, 1);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      return;
    }
    
    if (!task.completed) return;
    
    // Mark task as not completed
    const updatedTask = {
      ...task,
      completed: false,
      completedAt: undefined
    };
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    // Calculate XP from remaining completed tasks
    const completedTasks = updatedTasks.filter(task => task.completed);
    const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate new level
    const newLevel = calculateLevel(calculatedTotalXp);
    
    // Get current date in local timezone
    const localDate = getLocalDateString();
    
    // Update user stats
    const updatedUser = {
      ...user,
      totalXp: calculatedTotalXp,
      level: newLevel,
      tasksCompleted: completedTasks.length,
      lastActive: localDate
    };
    
    // Update state
    setTasks(updatedTasks);
    setUser(updatedUser);
    setPrevTotalXp(calculatedTotalXp);
    
    // Save to localStorage
    try {
      saveTasks(updatedTasks);
      saveUser(updatedUser);
      updateTaskHistory(updatedTask);
      
      // Update daily stats if the task was completed today
      if (task.completedAt && task.completedAt.startsWith(localDate)) {
        const stats = getStats();
        const todayStats = stats.find(stat => stat.date === localDate);
        
        if (todayStats) {
          todayStats.tasksCompleted = Math.max(0, todayStats.tasksCompleted - 1);
          todayStats.xpGained = Math.max(0, todayStats.xpGained - task.xpReward);
          saveStats(stats);
        }
      }
    } catch (error) {
      console.error('Error saving task undo data:', error);
    }
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    
    // Recalculate XP if we're deleting a completed task
    const deletedTask = tasks.find(task => task.id === id);
    if (deletedTask && deletedTask.completed) {
      const completedTasks = updatedTasks.filter(task => task.completed);
      const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
      
      // Calculate new level
      const newLevel = calculateLevel(calculatedTotalXp);
      
      const updatedUser = {
        ...user,
        totalXp: calculatedTotalXp,
        level: newLevel,
        tasksCompleted: completedTasks.length
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
    }
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const editTask = (
    id: string, 
    title: string, 
    description: string, 
    difficulty: TaskDifficulty,
    isRecurring?: boolean,
    recurringDays?: DayOfWeek[],
    questType?: string
  ) => {
    const editedAt = new Date().toISOString();
    
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        // Preserve the questStatus when editing
        const questStatus = task.questStatus || 'active';
        return {
          ...task,
          title,
          description,
          difficulty,
          xpReward: XP_REWARDS[difficulty],
          isRecurring,
          recurringDays,
          questType,
          questStatus
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const copyTask = (id: string) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return;
    
    const originalTask = tasks[taskIndex];
    
    // Create a copy of the task with a new ID and reset completion status
    const newTask: Task = {
      ...originalTask,
      id: uuidv4(),
      title: `${originalTask.title} (Copy)`,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks, newTask];
    
    // Update tasks
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const dismissLevelUp = () => {
    // Update the levelUpDataRef to the current level after dismissing
    levelUpDataRef.current = {
      oldLevel: newLevel,
      newLevel: newLevel
    };
    setIsLevelUp(false);
  };

  const failRecurringTask = useCallback((task: Task) => {
    console.log(`Marking recurring task as failed: ${task.title} (${task.id})`);
    
    // Calculate XP penalty based on difficulty
    const xpPenalty = FAILED_TASK_PENALTIES[task.difficulty] || 5;
    
    // Get today's date
    const today = getLocalDateString();
    const now = new Date();
    const localTimeOffset = now.getTimezoneOffset() * 60000;
    const localISOString = new Date(now.getTime() - localTimeOffset).toISOString();
    
    // Create a failed task entry
    const failedTask: Task = {
      ...task,
      id: uuidv4(), // Generate a new ID for the failed instance
      title: `FAILED: ${task.title}`,
      completed: false, // Mark as NOT completed so it doesn't show in completed section
      completedAt: localISOString, // Still add completion date for tracking
      isRecurring: false,
      parentTaskId: task.id
    };
    
    // Store the failed task in both regular history and the failed tasks list
    storeFailedTask(failedTask);
    
    // Get all failed tasks to calculate total XP penalty
    const failedTasks = getFailedTasks();
    const totalXpPenalty = failedTasks.reduce((total, t) => {
      const penalty = FAILED_TASK_PENALTIES[t.difficulty] || 5;
      return total + penalty;
    }, 0) + xpPenalty; // Add the current penalty
    
    // Calculate new totalXp after penalty
    const newTotalXp = Math.max(0, user.totalXp - xpPenalty); // Don't go below 0
    
    // Recalculate level based on new totalXp
    let newLevel = calculateLevel(newTotalXp);
    
    // If totalXp would go negative, set level to 0
    if (user.totalXp - xpPenalty < 0) {
      newLevel = 0;
    }
    
    // Find XP thresholds for current and next level
    const currentLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === newLevel) || LEVEL_THRESHOLDS[0];
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === newLevel + 1) || LEVEL_THRESHOLDS[1];
    
    // Calculate XP within current level and XP to next level
    const xpWithinLevel = Math.max(0, newTotalXp - (currentLevelThreshold?.xpRequired || 0));
    const xpToNextLevel = Math.max(0, (nextLevelThreshold?.xpRequired || 0) - newTotalXp);
    
    // Update user stats
    const updatedUser = {
      ...user,
      totalXp: newTotalXp,
      level: newLevel,
      xp: xpWithinLevel,
      xpToNextLevel: xpToNextLevel,
      tasksFailed: user.tasksFailed + 1,
      failedXp: totalXpPenalty, // Update with total XP penalty from all failed tasks
      lastActive: today
    };
    
    // Save changes
    setUser(updatedUser);
    saveUser(updatedUser);
    
    // Add the failed task to the tasks array
    const updatedTasks = [...tasks, failedTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // Update daily stats
    updateDailyStats(0, -xpPenalty);
    
    console.log(`Failed task ${task.title}: -${xpPenalty} XP, new total: ${updatedUser.totalXp}, new level: ${updatedUser.level}, total failed XP: ${totalXpPenalty}`);
    
    return true;
  }, [user, tasks]);

  const checkForFailedTasks = useCallback(() => {
    console.log('Checking for failed recurring tasks...');
    
    // Get yesterday's date
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    // Get today's date string
    const todayString = getLocalDateString().split('T')[0];
    console.log(`Today's date for failed task check: ${todayString}`);
    
    // Skip the check if we already did it today (add a check in localStorage)
    const lastFailedCheck = localStorage.getItem('dailyquest_last_failed_check');
    if (lastFailedCheck === todayString) {
      console.log(`Already checked for failed tasks today (${todayString}), skipping...`);
      return;
    }
    
    // Get day of week for yesterday
    const yesterdayDayOfWeek = getDayOfWeek(yesterday);
    
    console.log(`Checking for incomplete tasks from yesterday (${yesterdayString}, ${yesterdayDayOfWeek})`);
    
    // Find all recurring templates that should have been done yesterday
    const yesterdayTemplates = tasks.filter(task => 
      task.isRecurring && 
      task.recurringDays && 
      task.recurringDays.includes(yesterdayDayOfWeek)
    );
    
    if (yesterdayTemplates.length === 0) {
      console.log('No recurring tasks scheduled for yesterday');
      // Mark that we've checked today
      localStorage.setItem('dailyquest_last_failed_check', todayString);
      return;
    }
    
    console.log(`Found ${yesterdayTemplates.length} recurring templates for yesterday (${yesterdayDayOfWeek})`);
    
    // Find all instances created yesterday (only check instances with a timestamp from yesterday)
    const yesterdayInstances = tasks.filter(task => 
      task.parentTaskId && 
      (task.createdAt?.startsWith(yesterdayString) || task.completedAt?.startsWith(yesterdayString))
    );
    
    console.log(`Found ${yesterdayInstances.length} task instances from yesterday`);
    
    // Track failed tasks
    const failedTasks: Task[] = [];
    
    // Check each template to see if it was completed
    yesterdayTemplates.forEach(template => {
      // Find all instances of this template from yesterday specifically
      const templateInstances = yesterdayInstances.filter(t => t.parentTaskId === template.id);
      console.log(`Template "${template.title}" has ${templateInstances.length} instances from yesterday`);
      
      // Find if there's an instance completed today (to prevent marking as failed tasks that were just completed)
      const todayInstance = tasks.find(t => 
        t.parentTaskId === template.id && 
        t.completed && 
        t.completedAt?.startsWith(todayString)
      );
      
      // Find if there's already a failed instance for this template within the past 48 hours
      const recentFailedInstance = tasks.find(t => 
        t.parentTaskId === template.id && 
        t.title.startsWith('FAILED:') &&
        (t.completedAt?.startsWith(yesterdayString) || t.completedAt?.startsWith(todayString))
      );
      
      // If we already have a failed instance for this template, skip it
      if (recentFailedInstance) {
        console.log(`Template "${template.title}" already has a failed instance - skipping`);
        return;
      }
      
      // If we have a completed instance from today, skip this template
      if (todayInstance) {
        console.log(`Template "${template.title}" has a completed instance today - skipping failure check`);
        return; // Skip this template
      }
      
      // Skip if we have a completed instance from yesterday
      const completedYesterdayInstance = templateInstances.find(t => t.completed === true);
      if (completedYesterdayInstance) {
        console.log(`Template "${template.title}" has a completed instance from yesterday - skipping failure check`);
        return;
      }
      
      // If we reach here and no instances exist for yesterday, mark as failed
      if (templateInstances.length === 0) {
        console.log(`Template "${template.title}" had no instance created yesterday - marking as failed`);
        failedTasks.push(template);
      } else {
        // If we have instances but none were completed, mark as failed
        const hasCompletedInstance = templateInstances.some(t => t.completed);
        if (!hasCompletedInstance) {
          console.log(`Template "${template.title}" had incomplete instances yesterday - marking as failed`);
          failedTasks.push(template);
        } else {
          console.log(`Template "${template.title}" was completed yesterday`);
        }
      }
    });
    
    // Process all failed tasks
    if (failedTasks.length > 0) {
      console.log(`Found ${failedTasks.length} failed tasks from yesterday`);
      
      // Calculate total XP penalty
      let totalPenalty = 0;
      
      // Process each failed task
      failedTasks.forEach(task => {
        const penalty = FAILED_TASK_PENALTIES[task.difficulty] || 5;
        totalPenalty += penalty;
        
        // Call failRecurringTask for each failed task
        failRecurringTask(task);
      });
      
      console.log(`Total XP penalty: -${totalPenalty} XP`);
    } else {
      console.log('No failed tasks from yesterday!');
    }
    
    // Mark that we've checked today to prevent multiple checks in the same day
    localStorage.setItem('dailyquest_last_failed_check', todayString);
  }, [tasks, failRecurringTask]);

  // Check for day change and update streak
  useEffect(() => {
    if (!user.lastActive) return;
    
    const today = getLocalDateString();
    
    // Get the date parts only for comparison
    const lastActiveDate = user.lastActive.split('T')[0];
    const todayDate = today.split('T')[0];
    
    // Only run day change logic if the dates are different (not just the timestamps)
    // This prevents triggering when simply completing tasks within the same day
    if (lastActiveDate !== todayDate) {
      console.log(`Day change detected: ${lastActiveDate} → ${todayDate}`);
      
      // Check for missed/failed tasks from yesterday
      checkForFailedTasks();
      
      // Calculate new streak based on consecutive days
      const lastActiveDateObj = new Date(lastActiveDate);
      const todayDateObj = new Date(todayDate);
      
      // Calculate the difference in days
      const timeDiff = todayDateObj.getTime() - lastActiveDateObj.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); // Convert ms to days
      
      // Update streak based on day difference
      let newStreakDays = user.streakDays;
      
      if (dayDiff === 1) {
        // Consecutive day - increase streak
        newStreakDays += 1;
        console.log(`New streak: ${newStreakDays} day(s)`);
      } else if (dayDiff > 1) {
        // Streak broken - reset to 1
        console.log(`Streak broken after ${newStreakDays} day(s). Resetting to 1.`);
        newStreakDays = 1;
      }
      
      // Check if we've hit any streak milestones and calculate rewards
      const streakMilestones = checkStreakMilestones(newStreakDays, user.streakDays);
      let streakXpReward = 0;
      const streakMilestoneNames: string[] = [];
      
      streakMilestones.forEach(milestone => {
        streakXpReward += milestone.xpReward;
        streakMilestoneNames.push(milestone.name);
      });
      
      if (streakMilestones.length > 0) {
        console.log(`Earned ${streakXpReward} XP from streak milestones:`, streakMilestoneNames);
      }
      
      // Calculate new XP from streak reward
      const updatedXp = user.xp + streakXpReward;
      
      // Update user stats
      const updatedUser = {
        ...user,
        streakDays: newStreakDays,
        lastActive: today,
        xp: updatedXp,
        totalXp: user.totalXp + streakXpReward
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
    }
  }, [user.lastActive, user.streakDays, checkForFailedTasks]);

  // Add new functions to handle hiding/unhiding tasks
  const hideTask = (id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          return { ...task, questStatus: 'hidden' as QuestStatus };
        }
        return task;
      });
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  };

  const unhideTask = (id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          return { ...task, questStatus: 'active' as QuestStatus };
        }
        return task;
      });
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  };

  // Function to verify all completed tasks have completedAt timestamps
  const verifyCompletedTasks = useCallback(() => {
    console.log('Verifying completed tasks have timestamps...');
    
    // Get all tasks
    const allTasks = getTasks();
    const completedTasks = allTasks.filter(task => task.completed);
    const tasksWithoutTimestamp = completedTasks.filter(task => !task.completedAt);
    
    if (tasksWithoutTimestamp.length > 0) {
      console.warn(`Found ${tasksWithoutTimestamp.length} completed tasks without completion timestamps!`);
      
      // Fix the tasks
      const now = new Date();
      const fixedTasks = allTasks.map(task => {
        if (task.completed && !task.completedAt) {
          console.log(`Fixing missing completedAt for task: ${task.title} (${task.id})`);
          return {
            ...task,
            completedAt: now.toISOString(), // Use current time as fallback
            questStatus: 'completed' as const // Make sure status is updated too
          };
        }
        return task;
      });
      
      // Save the fixed tasks
      saveTasks(fixedTasks);
      console.log('Fixed timestamp issues in completed tasks');
      
      // Update the local tasks state
      setTasks(fixedTasks);
    } else {
      console.log('All completed tasks have proper timestamps');
    }
  }, []);
  
  // Run verification when app initializes or when task count changes
  useEffect(() => {
    verifyCompletedTasks();
  }, [verifyCompletedTasks, tasks.length]);

  return (
    <QuestContext.Provider
      value={{
        tasks,
        user,
        questTypes,
        addTask,
        completeTask,
        undoTask,
        deleteTask,
        editTask,
        copyTask,
        hideTask,
        unhideTask,
        isLevelUp,
        dismissLevelUp,
        saveTasks,
        updateTaskHistory,
        prevLevel,
        newLevel,
        levelUpData: levelUpDataRef.current,
        failRecurringTask,
        checkForFailedTasks,
        addQuestType,
        setUser,
        saveUser
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (context === undefined) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
} 
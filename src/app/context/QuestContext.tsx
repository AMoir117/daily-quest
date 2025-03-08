'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, User, TaskDifficulty, DayOfWeek } from '../types';
import { 
  getTasks, saveTasks, 
  getUser, saveUser, 
  updateDailyStats, 
  updateTaskHistory,
  DEFAULT_USER,
  getStats,
  saveStats,
  getDayOfWeek,
  getLocalDateString,
  cleanupFutureDates,
  cleanupDuplicateTasks
} from '../utils/storageUtils';
import { 
  XP_REWARDS, 
  calculateLevel,
  LEVEL_THRESHOLDS
} from '../utils/levelUtils';

interface QuestContextType {
  tasks: Task[];
  user: User;
  addTask: (title: string, description: string, difficulty: TaskDifficulty, isRecurring?: boolean, recurringDays?: DayOfWeek[]) => void;
  completeTask: (id: string) => boolean;
  undoTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string, description: string, difficulty: TaskDifficulty, isRecurring?: boolean, recurringDays?: DayOfWeek[]) => void;
  copyTask: (id: string) => void;
  isLevelUp: boolean;
  dismissLevelUp: () => void;
  saveTasks: (tasks: Task[]) => void;
  updateTaskHistory: (task: Task) => void;
  prevLevel: number;
  newLevel: number;
  levelUpData: { oldLevel: number, newLevel: number };
  forceRegenerateRecurringTasks: () => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [prevTotalXp, setPrevTotalXp] = useState(0);
  const [prevLevel, setPrevLevel] = useState(1);
  const [newLevel, setNewLevel] = useState(1);
  
  // Use refs to store level values for the level-up modal
  const levelUpDataRef = React.useRef({ oldLevel: 1, newLevel: 1 });

  // Generate tasks from recurring tasks
  const generateRecurringTasks = useCallback((today: string) => {
    console.log('Generating recurring tasks for', today);
    
    // Get the day of the week
    const currentDate = new Date(today);
    const dayOfWeek = getDayOfWeek(currentDate);
    console.log('Current day of week:', dayOfWeek);
    
    // For each recurring task, ensure past instances remain completed
    // but create new instances for today if needed
    
    // 1. First, find all recurring tasks for today's day of week
    const recurringTasks = tasks.filter(task => 
      task.isRecurring && 
      task.recurringDays && 
      task.recurringDays.includes(dayOfWeek)
    );
    console.log('Found recurring tasks for today:', recurringTasks.length);
    
    // 2. Deduplicate recurring templates - keep only one template with the same title
    const uniqueTemplates = recurringTasks.reduce((unique: Task[], template) => {
      if (!unique.some(t => t.title === template.title)) {
        unique.push(template);
      }
      return unique;
    }, []);
    console.log('Unique recurring templates:', uniqueTemplates.length);
    
    if (uniqueTemplates.length === 0) {
      // No recurring tasks to generate, just update the lastRecurringCheck
      const updatedUser = {
        ...user,
        lastRecurringCheck: today
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      return;
    }
    
    // Get existing instances for today
    const existingTodayInstances = tasks.filter(t => 
      t.parentTaskId && 
      t.createdAt && 
      t.createdAt.startsWith(today)
    );
    console.log('Existing instances for today:', existingTodayInstances.length);
    
    // Get completed instances for today
    const completedTodayInstances = tasks.filter(t => 
      t.parentTaskId && 
      t.completedAt && 
      t.completedAt.startsWith(today) && 
      t.completed
    );
    console.log('Completed instances for today:', completedTodayInstances.length);
    
    // Get yesterday's date for filtering out completed tasks from yesterday
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    // Filter out any completed tasks from yesterday when creating today's instances
    const completedYesterdayInstances = tasks.filter(t =>
      t.parentTaskId &&
      t.completedAt &&
      t.completedAt.startsWith(yesterdayStr) &&
      t.completed
    );
    console.log('Completed instances from yesterday:', completedYesterdayInstances.length);
    
    // Processed tasks that will replace the current tasks list
    let updatedTasks = [...tasks];
    const newTasks: Task[] = [];
    
    // Process each recurring task
    for (const template of uniqueTemplates) {
      // Check if this recurring task already has an instance for today
      const existingTodayInstance = existingTodayInstances.find(t => 
        t.parentTaskId === template.id
      );
      
      // Check if there's a completed instance for today
      const completedTodayInstance = completedTodayInstances.find(t => 
        t.parentTaskId === template.id
      );
      
      // If there's no instance for today and no completed instance, create one
      if (!existingTodayInstance && !completedTodayInstance) {
        console.log('Creating new instance for template:', template.title);
        
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
          parentTaskId: template.id
        };
        
        newTasks.push(newInstance);
      } else {
        console.log(
          'Skipping template, already has instance:',
          template.title,
          existingTodayInstance ? 'active' : 'completed'
        );
      }
    }
    
    if (newTasks.length === 0) {
      console.log('No new tasks to create');
      // No new tasks were created, just update the lastRecurringCheck
      const updatedUser = {
        ...user,
        lastRecurringCheck: today
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      return;
    }
    
    console.log('Created new instances:', newTasks.length);
    
    // Add new tasks to the list
    updatedTasks = [...updatedTasks, ...newTasks];
    
    // Update state
    setTasks(updatedTasks);
    
    // Update user with lastRecurringCheck
    const updatedUser = {
      ...user,
      lastRecurringCheck: today
    };
    
    setUser(updatedUser);
    
    // Save to localStorage
    saveTasks(updatedTasks);
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
      
      // Calculate initial XP and level from tasks
      const completedTasks = loadedTasks.filter(task => task.completed);
      const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
      
      // Calculate level
      const calculatedLevel = Math.max(1, calculateLevel(calculatedTotalXp));
      
      console.log('Initial Load:', {
        calculatedTotalXp,
        calculatedLevel,
        loadedUserLevel: loadedUser.level
      });
      
      // Update user with calculated values
      const updatedUser = {
        ...loadedUser,
        totalXp: calculatedTotalXp,
        level: calculatedLevel,
        tasksCompleted: completedTasks.length,
        lastActive: loadedUser.lastActive || getLocalDateString(),
        lastRecurringCheck: undefined, // Force recurring task check on load
        streakDays: loadedUser.streakDays || 0
      };
      
      // Set initial state
      setTasks(loadedTasks);
      setUser(updatedUser);
      setPrevTotalXp(calculatedTotalXp);
      setPrevLevel(calculatedLevel);
      setNewLevel(calculatedLevel);
      
      // Force generation of today's recurring tasks
      const today = getLocalDateString();
      generateRecurringTasks(today);
      
      // Initialize the levelUpDataRef with the current level
      levelUpDataRef.current = {
        oldLevel: calculatedLevel,
        newLevel: calculatedLevel
      };
      
      console.log('After Initial Setup:', {
        levelUpDataRef: levelUpDataRef.current,
        prevLevel,
        newLevel
      });
      
      // Save the updated user data
      saveUser(updatedUser);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setTasks([]);
      setUser(DEFAULT_USER);
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
      const updatedUser = {
        ...user,
        streakDays: diffDays === 1 ? user.streakDays + 1 : 0,
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
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Generate tasks from recurring tasks for the new day
      generateRecurringTasks(today);
    } else if (!user.lastRecurringCheck || user.lastRecurringCheck !== today) {
      // If we haven't checked for recurring tasks today - typically on first page load
      generateRecurringTasks(today);
    }
  }, [user.lastActive, user.lastRecurringCheck, user.streakDays, tasks, prevLevel, newLevel, generateRecurringTasks]);

  const addTask = (title: string, description: string, difficulty: TaskDifficulty, isRecurring = false, recurringDays?: DayOfWeek[]) => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      difficulty,
      xpReward: XP_REWARDS[difficulty],
      isRecurring,
      recurringDays
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    updateTaskHistory(newTask);
  };

  const completeTask = (id: string) => {
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
    
    // Get current date and time in local timezone with consistent offset
    const now = new Date();
    const localDate = getLocalDateString();
    const localTimeOffset = now.getTimezoneOffset() * 60000;
    const localISOString = new Date(now.getTime() - localTimeOffset).toISOString();
    
    // Mark task as completed
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: localISOString
    };
    
    // Create a new array with the updated task
    const updatedTasks = [...currentTasks];
    updatedTasks[taskIndex] = updatedTask;
    
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
      lastActive: localDate
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
    setTasks(updatedTasks);
    setUser(updatedUser);
    setPrevTotalXp(calculatedTotalXp);
    
    return true;
  };

  const undoTask = (id: string) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
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

  const editTask = (id: string, title: string, description: string, difficulty: TaskDifficulty, isRecurring = false, recurringDays?: DayOfWeek[]) => {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return;
    
    const oldTask = tasks[taskIndex];
    const wasCompleted = oldTask.completed;
    
    // Calculate new XP reward
    const newXpReward = XP_REWARDS[difficulty];
    
    // Create updated task
    const updatedTask = {
      ...oldTask,
      title,
      description,
      difficulty,
      xpReward: newXpReward,
      isRecurring,
      recurringDays: isRecurring ? recurringDays || [] : undefined
    };
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    // If the task was completed, update the user's XP
    if (wasCompleted) {
      // Calculate new total XP
      const completedTasks = updatedTasks.filter(task => task.completed);
      const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
      
      // Calculate new level
      const oldLevel = calculateLevel(user.totalXp);
      const newLevel = calculateLevel(calculatedTotalXp);
      
      // Update user stats
      const updatedUser = {
        ...user,
        totalXp: calculatedTotalXp,
        level: newLevel,
        tasksCompleted: completedTasks.length
      };
      
      // Check for level up
      if (newLevel > oldLevel) {
        setIsLevelUp(true);
      }
      
      // Update state
      setUser(updatedUser);
      saveUser(updatedUser);
    }
    
    // Update tasks
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

  // Expose function to force regeneration of today's recurring tasks
  const forceRegenerateRecurringTasks = useCallback(() => {
    const today = getLocalDateString();
    console.log('Forcing regeneration of recurring tasks for today:', today);
    generateRecurringTasks(today);
  }, [generateRecurringTasks]);

  return (
    <QuestContext.Provider value={{
      tasks,
      user,
      addTask,
      completeTask,
      undoTask,
      deleteTask,
      editTask,
      copyTask,
      isLevelUp,
      dismissLevelUp,
      saveTasks,
      updateTaskHistory,
      prevLevel,
      newLevel,
      levelUpData: levelUpDataRef.current,
      forceRegenerateRecurringTasks
    }}>
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
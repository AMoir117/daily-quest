'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  getDayOfWeek
} from '../utils/storageUtils';
import { 
  XP_REWARDS, 
  calculateLevel,
  calculateCurrentLevelXp,
  calculateCurrentLevelTotalXp
} from '../utils/levelUtils';

interface QuestContextType {
  tasks: Task[];
  user: User;
  addTask: (title: string, description: string, difficulty: TaskDifficulty, isRecurring?: boolean, recurringDays?: DayOfWeek[]) => void;
  completeTask: (id: string) => void;
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

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      // Get tasks data from localStorage
      const loadedTasks = getTasks();
      setTasks(loadedTasks);
      
      // Get user data from localStorage
      const loadedUser = getUser();
      
      // Calculate initial XP and level from tasks
      const completedTasks = loadedTasks.filter(task => task.completed);
      const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
      
      // Calculate level
      const calculatedLevel = calculateLevel(calculatedTotalXp);
      
      // Update user with calculated values
      const updatedUser = {
        ...loadedUser,
        totalXp: calculatedTotalXp,
        level: calculatedLevel,
        tasksCompleted: completedTasks.length
      };
      
      setUser(updatedUser);
      setPrevTotalXp(calculatedTotalXp);
      setPrevLevel(calculatedLevel); // Set prevLevel to the current level on initial load
      setNewLevel(calculatedLevel); // Set newLevel to the current level on initial load
      
      // Initialize the levelUpDataRef
      levelUpDataRef.current = {
        oldLevel: calculatedLevel,
        newLevel: calculatedLevel
      };
      
      // Save the updated user data
      saveUser(updatedUser);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      
      // Initialize with default values
      setTasks([]);
      setUser(DEFAULT_USER);
    }
  }, []);

  // Monitor XP changes to detect level ups
  useEffect(() => {
    if (prevTotalXp > 0 && user.totalXp > prevTotalXp) {
      const oldLevel = calculateLevel(prevTotalXp);
      const newLevel = calculateLevel(user.totalXp);
      
      if (newLevel > oldLevel) {
        setIsLevelUp(true);
      }
      
      setPrevTotalXp(user.totalXp);
    }
  }, [user.totalXp, prevTotalXp]);

  // Check for streak updates and generate recurring tasks
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (user.lastActive !== today) {
      const lastActiveDate = new Date(user.lastActive);
      const todayDate = new Date(today);
      
      // Calculate the difference in days
      const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If the user was active yesterday, increment the streak
      // Otherwise, reset the streak
      const updatedUser = {
        ...user,
        streakDays: diffDays === 1 ? user.streakDays + 1 : 0,
        lastActive: today
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      // Generate tasks from recurring tasks
      generateRecurringTasks(today);
    } else if (!user.lastRecurringCheck || user.lastRecurringCheck !== today) {
      // If we haven't checked for recurring tasks today
      generateRecurringTasks(today);
    }
  }, [user.lastActive]);

  // Generate tasks from recurring tasks
  const generateRecurringTasks = (today: string) => {
    // Get the day of the week
    const currentDate = new Date(today);
    const dayOfWeek = getDayOfWeek(currentDate);
    
    // Find recurring tasks that should be generated today
    const recurringTasks = tasks.filter(task => 
      task.isRecurring && 
      task.recurringDays && 
      task.recurringDays.includes(dayOfWeek) &&
      (!task.completedAt || !task.completedAt.startsWith(today))
    );
    
    if (recurringTasks.length === 0) {
      // No recurring tasks to generate, just update the lastRecurringCheck
      const updatedUser = {
        ...user,
        lastRecurringCheck: today
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      return;
    }
    
    // Generate new tasks from recurring tasks
    const newTasks = recurringTasks.map(task => {
      // Check if this recurring task already has an instance for today
      const existingInstance = tasks.find(t => 
        t.parentTaskId === task.id && 
        t.createdAt && 
        t.createdAt.startsWith(today)
      );
      
      // If there's already an instance for today, skip creating a new one
      if (existingInstance) return null;
      
      // Create a new instance of the recurring task
      return {
        id: uuidv4(),
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        xpReward: task.xpReward,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: undefined,
        isRecurring: false, // The instance is not recurring
        parentTaskId: task.id // Reference to the recurring task
      };
    }).filter(Boolean) as Task[]; // Remove null values
    
    if (newTasks.length === 0) {
      // No new tasks were created, just update the lastRecurringCheck
      const updatedUser = {
        ...user,
        lastRecurringCheck: today
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      return;
    }
    
    // Add the new tasks to the task list
    const updatedTasks = [...tasks, ...newTasks];
    
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
  };

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
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    if (task.completed) return;
    
    // Mark task as completed
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    // Calculate XP from completed tasks
    const completedTasks = updatedTasks.filter(task => task.completed);
    const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate new level
    const oldLevel = calculateLevel(user.totalXp);
    const newLevelValue = calculateLevel(calculatedTotalXp);
    
    // Update user stats
    const updatedUser = {
      ...user,
      totalXp: calculatedTotalXp,
      level: newLevelValue,
      tasksCompleted: completedTasks.length,
      lastActive: new Date().toISOString().split('T')[0]
    };
    
    // Check for level up - handle multi-level jumps
    if (newLevelValue > oldLevel) {
      // Store the level values in the ref
      levelUpDataRef.current = {
        oldLevel: oldLevel,
        newLevel: newLevelValue
      };
      
      // Update state in a single batch
      setPrevLevel(oldLevel);
      setNewLevel(newLevelValue);
      setIsLevelUp(true);
    }
    
    // Update state
    setTasks(updatedTasks);
    setUser(updatedUser);
    setPrevTotalXp(user.totalXp); // Store previous XP for level change detection
    
    // Save to localStorage
    try {
      saveTasks(updatedTasks);
      saveUser(updatedUser);
      updateTaskHistory(updatedTask);
      // Calculate XP difference and update stats
      const xpGained = task.xpReward;
      updateDailyStats(1, xpGained);
    } catch (error) {
      console.error('Error saving task completion data:', error);
    }
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
    
    // Update user stats
    const updatedUser = {
      ...user,
      totalXp: calculatedTotalXp,
      level: newLevel,
      tasksCompleted: completedTasks.length,
      lastActive: new Date().toISOString().split('T')[0]
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
      const today = new Date().toISOString().split('T')[0];
      if (task.completedAt && task.completedAt.startsWith(today)) {
        const stats = getStats();
        const todayStats = stats.find(stat => stat.date === today);
        
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
    
    // Calculate old XP reward
    const oldXpReward = oldTask.xpReward;
    
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
      // Calculate XP difference
      const xpDifference = newXpReward - oldXpReward;
      
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
    // Only hide the level up modal without resetting any other state
    setIsLevelUp(false);
  };

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
      levelUpData: levelUpDataRef.current
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
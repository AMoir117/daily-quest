'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, TrophyIcon, CalendarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TrophyIcon as TrophySolid } from '@heroicons/react/24/solid';
import { useQuest } from '../context/QuestContext';
import { 
  calculateLevel, 
  LEVEL_THRESHOLDS
} from '../utils/levelUtils';
import { getLocalDateString, getFailedTasks, getHistory } from '../utils/storageUtils';
import { Task, TaskHistory } from '../types';

// Define streak milestones
const STREAK_MILESTONES = [
  { days: 3, xpReward: 50, name: "3-Day Streak" },
  { days: 7, xpReward: 100, name: "Weekly Warrior" },
  { days: 14, xpReward: 250, name: "Fortnight Fighter" },
  { days: 30, xpReward: 500, name: "Monthly Master" },
  { days: 60, xpReward: 1000, name: "Bimonthly Boss" },
  { days: 100, xpReward: 2000, name: "Century Champion" },
  { days: 365, xpReward: 5000, name: "Year-Long Legend" },
];

// Define XP penalties for failed tasks
const FAILED_TASK_PENALTIES: Record<string, number> = {
  easy: 5,
  medium: 10,
  hard: 15
};

// Add a new interface for tracking completed streak milestones
interface CompletedMilestone {
  days: number;
  xpReward: number;
  name: string;
  completedAt: string;
}

// Define types for the stats
interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  customDisplay?: boolean;
  customType?: 'level' | 'streak' | 'quests' | 'failures';
  nextMilestone?: typeof STREAK_MILESTONES[0] | null;
  progress?: number;
  todayStats?: {
    completed: number;
    active: number;
    total: number;
    date: string;
  };
  xpStats?: {
    totalXp: number;
    currentLevelXp: number;
    currentLevelTotalXp: number;
    progressPercentage: number;
    xpToNextLevel: number;
    failedTasks: number;
    failedXp: number;
  };
  failureStats?: {
    failedTasks: number;
    lostXp: number;
  };
  streakStats?: {
    currentStreak: number;
    longestStreak: number;
    streakXp: number;
    completedMilestones: CompletedMilestone[];
  };
}

export default function UserStats() {
  const { user, tasks } = useQuest();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [failedTasks, setFailedTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [completedMilestones, setCompletedMilestones] = useState<CompletedMilestone[]>([]);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [selectedMilestones, setSelectedMilestones] = useState<CompletedMilestone[]>([]);
  
  // Load failed tasks, history, and completed milestones
  useEffect(() => {
    const loadedFailedTasks = getFailedTasks();
    setFailedTasks(loadedFailedTasks);
    
    const loadedHistory = getHistory();
    setHistory(loadedHistory);
    
    // Load completed milestones from localStorage
    try {
      const storedMilestones = localStorage.getItem('dailyquest_completed_milestones');
      if (storedMilestones) {
        setCompletedMilestones(JSON.parse(storedMilestones));
      }
    } catch (error) {
      console.error('Error loading completed milestones:', error);
      setCompletedMilestones([]);
    }
  }, [user.tasksFailed]);
  
  // Calculate streak by analyzing task history
  const calculateStreak = (history: TaskHistory[]): number => {
    if (!history.length) return 0;
    
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get today's date
    const today = getLocalDateString();
    
    // Check if there are any completed tasks today
    const todayHistory = sortedHistory.find(h => h.date === today);
    const hasCompletedTaskToday = todayHistory && todayHistory.tasks.some(t => t.completed);
    
    // If no tasks completed today, check yesterday
    if (!hasCompletedTaskToday) {
      // Calculate yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      // Check if there are any completed tasks yesterday
      const yesterdayHistory = sortedHistory.find(h => h.date === yesterdayString);
      const hasCompletedTaskYesterday = yesterdayHistory && yesterdayHistory.tasks.some(t => t.completed);
      
      // If no tasks completed yesterday either, streak is 0
      if (!hasCompletedTaskYesterday) {
        return 0;
      }
    }
    
    // Start counting streak days
    let streak = 0;
    const currentDate = new Date();
    
    // Check each day going backwards
    while (true) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayHistory = sortedHistory.find(h => h.date === dateString);
      const hasCompletedTask = dayHistory && dayHistory.tasks.some(t => t.completed);
      
      if (hasCompletedTask) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Calculate longest streak from history
  const calculateLongestStreak = (history: TaskHistory[]): number => {
    if (!history.length) return 0;
    
    // Sort history by date (oldest first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let previousDate: Date | null = null;
    
    // Go through each day in history
    for (const day of sortedHistory) {
      const hasCompletedTask = day.tasks.some(t => t.completed);
      const currentDate = new Date(day.date);
      
      if (hasCompletedTask) {
        // Check if this is consecutive with previous date
        if (previousDate) {
          const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Consecutive day
            currentStreak++;
          } else {
            // Break in streak
            currentStreak = 1;
          }
        } else {
          // First day with completed task
          currentStreak = 1;
        }
        
        // Update longest streak if current is longer
        longestStreak = Math.max(longestStreak, currentStreak);
        previousDate = currentDate;
      } else {
        // No completed tasks this day, reset streak
        currentStreak = 0;
        previousDate = null;
      }
    }
    
    return longestStreak;
  };
  
  // Calculate streak XP earned, including previously completed milestones
  const calculateStreakXp = (currentStreak: number): { 
    totalXp: number; 
    currentMilestones: typeof STREAK_MILESTONES; 
    allCompletedMilestones: CompletedMilestone[];
  } => {
    // Find all milestones that have been reached with the current streak
    const currentMilestones = STREAK_MILESTONES.filter(milestone => 
      milestone.days <= currentStreak
    );
    
    // Get the names of current milestones
    const currentMilestoneNames = currentMilestones.map(m => m.name);
    
    // Check if we have any new milestones that aren't in our completed list
    const newMilestones: CompletedMilestone[] = [];
    
    currentMilestones.forEach(milestone => {
      const alreadyCompleted = completedMilestones.some(cm => cm.days === milestone.days);
      
      if (!alreadyCompleted) {
        // This is a new milestone, add it to our completed list
        const newMilestone: CompletedMilestone = {
          ...milestone,
          completedAt: new Date().toISOString()
        };
        newMilestones.push(newMilestone);
      }
    });
    
    // If we have new milestones, update our state and localStorage
    if (newMilestones.length > 0) {
      const updatedMilestones = [...completedMilestones, ...newMilestones];
      setCompletedMilestones(updatedMilestones);
      
      try {
        localStorage.setItem('dailyquest_completed_milestones', JSON.stringify(updatedMilestones));
      } catch (error) {
        console.error('Error saving completed milestones:', error);
      }
    }
    
    // Combine current milestones with previously completed ones that aren't in the current streak
    const allCompletedMilestones = [
      ...completedMilestones.filter(cm => !currentMilestoneNames.includes(cm.name)),
      ...currentMilestones.map(m => ({
        ...m,
        completedAt: completedMilestones.find(cm => cm.days === m.days)?.completedAt || new Date().toISOString()
      }))
    ];
    
    // Calculate total XP from all completed milestones
    const totalXp = allCompletedMilestones.reduce((total, milestone) => 
      total + milestone.xpReward, 0
    );
    
    return {
      totalXp,
      currentMilestones,
      allCompletedMilestones
    };
  };
  
  // Calculate and set stats
  useEffect(() => {
    // Get today's date
    const today = getLocalDateString();

    // Calculate active tasks for today
    const activeTasks = tasks.filter(task => !task.completed && !task.isRecurring);
    const todayActiveTasks = activeTasks.filter(task => task.createdAt.startsWith(today));
    
    // Calculate completed tasks for today
    const completedTasks = tasks.filter(task => task.completed && task.completedAt?.startsWith(today));
    
    // Calculate total tasks for today
    const totalTasks = todayActiveTasks.length + completedTasks.length;
    
    // Calculate streak from history
    const currentStreak = history.length > 0 ? calculateStreak(history) : user.streakDays;
    const longestStreak = history.length > 0 ? calculateLongestStreak(history) : user.streakDays;
    const streakXpInfo = calculateStreakXp(currentStreak);
    
    // Calculate streak progress
    const streakProgress = calculateStreakProgress(currentStreak);
    
    // Calculate total lost XP from failed tasks
    const totalLostXp = failedTasks.reduce((total, task) => {
      const penalty = FAILED_TASK_PENALTIES[task.difficulty] || 5;
      return total + penalty;
    }, 0);
    
    // Calculate total XP from all completed tasks
    const allCompletedTasks = tasks.filter(task => task.completed);
    const calculatedTotalXp = allCompletedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate adjusted XP (total XP minus lost XP)
    const adjustedTotalXp = Math.max(0, calculatedTotalXp - totalLostXp);
    
    // Calculate level based on adjusted XP
    const calculatedLevel = calculateLevel(adjustedTotalXp);
    
    // Calculate XP progress
    const currentLevelThreshold = LEVEL_THRESHOLDS.find((threshold) => threshold.level === calculatedLevel) || { level: 1, xpRequired: 0 };
    const nextLevelThreshold = LEVEL_THRESHOLDS.find((threshold) => threshold.level === calculatedLevel + 1) || { level: 2, xpRequired: 100 };
    
    const currentLevelXp = adjustedTotalXp - currentLevelThreshold.xpRequired;
    const currentLevelTotalXp = nextLevelThreshold.xpRequired - currentLevelThreshold.xpRequired;
    const progressPercentage = Math.min(100, Math.round((currentLevelXp / currentLevelTotalXp) * 100));
    
    // Calculate XP to next level
    const xpToNextLevel = nextLevelThreshold.xpRequired - adjustedTotalXp;
    
    // Calculate total completed tasks
    const totalCompletedTasks = allCompletedTasks.length;
    
    // Create stats array
    const newStats: StatItem[] = [
      {
        label: 'Level',
        value: calculatedLevel,
        icon: <TrophyIcon className="w-5 h-5" />,
        color: getLevelColor(calculatedLevel),
        customDisplay: true,
        customType: 'level',
        xpStats: {
          totalXp: adjustedTotalXp,
          currentLevelXp,
          currentLevelTotalXp,
          progressPercentage,
          xpToNextLevel,
          failedTasks: failedTasks.length,
          failedXp: totalLostXp
        }
      },
      {
        label: 'Streak',
        value: currentStreak,
        icon: <FireIcon className="w-5 h-5" />,
        color: 'text-orange-500',
        customDisplay: true,
        customType: 'streak',
        nextMilestone: streakProgress.nextMilestone,
        progress: streakProgress.progress,
        streakStats: {
          currentStreak,
          longestStreak,
          streakXp: streakXpInfo.totalXp,
          completedMilestones: streakXpInfo.allCompletedMilestones
        }
      },
      {
        label: 'Quests',
        value: totalCompletedTasks,
        icon: <CheckCircleIcon className="w-5 h-5" />,
        color: 'text-green-500',
        customDisplay: true,
        customType: 'quests',
        todayStats: {
          completed: completedTasks.length,
          active: todayActiveTasks.length,
          total: totalTasks,
          date: today
        }
      }
    ];
    
    setStats(newStats);
  }, [user, tasks, failedTasks, history, completedMilestones]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Get color based on level
  const getLevelColor = (level: number) => {
    if (level === 0) return 'text-gray-500';
    if (level < 5) return 'text-blue-500';
    if (level < 10) return 'text-green-500';
    if (level < 15) return 'text-yellow-500';
    if (level < 20) return 'text-orange-500';
    if (level < 25) return 'text-red-500';
    if (level < 30) return 'text-purple-500';
    return 'text-pink-500';
  };
  
  // Get background color based on level (for progress bars)
  const getLevelBgColor = (level: number) => {
    if (level === 0) return 'bg-gray-500';
    if (level < 5) return 'bg-blue-500';
    if (level < 10) return 'bg-green-500';
    if (level < 15) return 'bg-yellow-500';
    if (level < 20) return 'bg-orange-500';
    if (level < 25) return 'bg-red-500';
    if (level < 30) return 'bg-purple-500';
    return 'bg-pink-500';
  };
  

  
  // Find the next streak milestone
  const calculateStreakProgress = (currentStreak: number) => {
    const nextMilestone = STREAK_MILESTONES.find((milestone) => milestone.days > currentStreak);
    
    if (!nextMilestone) return { nextMilestone: null, progress: 100 }; // All milestones completed
    
    // Find the previous milestone
    const prevMilestoneIndex = STREAK_MILESTONES.findIndex((m) => m.days === nextMilestone.days) - 1;
    const prevMilestoneDays = prevMilestoneIndex >= 0 ? STREAK_MILESTONES[prevMilestoneIndex].days : 0;
    
    // Calculate days completed and total days needed
    const totalDaysToNextMilestone = nextMilestone.days - prevMilestoneDays;
    const daysCompleted = currentStreak - prevMilestoneDays;
    
    return {
      nextMilestone,
      progress: Math.round((daysCompleted / totalDaysToNextMilestone) * 100)
    };
  };
  
  // Today's quest progress section
  const renderTodayProgress = (stat: StatItem) => {
    if (stat.customType !== 'quests' || !stat.todayStats) return null;
    
    // Calculate progress percentage
    const progressPercentage = stat.todayStats.total > 0 
      ? Math.round((stat.todayStats.completed / stat.todayStats.total) * 100)
      : 0;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center text-xs font-mono mb-1">
          <span className="text-gray-400">Today&apos;s progress:</span>
          <span className="text-blue-400">{stat.todayStats.completed}/{stat.todayStats.total}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full bg-blue-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-mono text-gray-500 mt-1">
          <span>0</span>
          <span>{stat.todayStats.total}</span>
        </div>
        
        {/* Total completed quests - ensure consistent spacing with Failed section */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs font-mono text-gray-400 flex items-center">
            <CheckCircleIcon className="w-3 h-3 mr-1.5" />
            <span>Total Completed:</span>
          </div>
          <div className="text-xs font-mono text-green-400">{stat.value} quests</div>
        </div>
      </div>
    );
  };

  const renderQuestStats = (stat: StatItem) => {
    if (stat.customType !== 'quests' || !stat.todayStats) return null;
    
    // Return null since we're now showing the total completed quests in renderTodayProgress
    return null;
  };
  
  // Render XP progress bar and stats
  const renderXPProgress = (stat: StatItem) => {
    if (!stat.xpStats) return null;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-mono text-gray-400">Level {stat.value}</div>
          <div className="text-xs font-mono text-gray-400">
            {Math.round(stat.xpStats.currentLevelXp)} / {stat.xpStats.currentLevelTotalXp} XP
          </div>
        </div>
        
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${getLevelBgColor(stat.value)}`}
            initial={{ width: 0 }}
            animate={{ width: `${stat.xpStats.progressPercentage}%`}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            key={`xp-bar-${stat.xpStats.totalXp}`}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className={`text-xs ${getLevelColor(stat.value)}`}>Total XP: {stat.xpStats.totalXp}</div>
          <div className="text-xs font-mono text-gray-400">Next: {stat.xpStats.xpToNextLevel} XP</div>
        </div>
        
        {/* Failed quests summary - always display */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs font-mono text-amber-400 flex items-center">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Failed: {stat.xpStats.failedTasks}
          </div>
          <div className="text-xs font-mono text-amber-400">-{stat.xpStats.failedXp} XP</div>
        </div>
      </div>
    );
  };

  // Render streak progress section
  const renderStreakProgress = (stat: StatItem) => {
    if (stat.customType !== 'streak' || !stat.nextMilestone || !stat.streakStats) return null;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center text-xs font-mono mb-1">
          <span className="text-gray-400">Next: {stat.nextMilestone.name}</span>
          <span className="text-purple-400">+{stat.nextMilestone.xpReward} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full bg-red-500"
            style={{ width: `${stat.progress || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-mono text-gray-500 mt-1">
          <span>{stat.streakStats.currentStreak}</span>
          <span>{stat.nextMilestone.days}</span>
        </div>
        
        {/* Longest streak, streak XP, and milestones button - adjusted spacing to match other cards */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs font-mono text-orange-400">
            Longest Streak: {stat.streakStats.longestStreak}
          </div>
          <div className="flex items-center">
            <div className="text-xs font-mono text-purple-400 mr-2">
              +{stat.streakStats.streakXp} XP
            </div>
            <button
              onClick={() => {
                setSelectedMilestones(stat.streakStats!.completedMilestones);
                setShowMilestonesModal(true);
              }}
              className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              title={stat.streakStats.completedMilestones.length > 0 
                ? `View ${stat.streakStats.completedMilestones.length} Completed Milestones`
                : "View Streak Milestones"
              }
            >
              <TrophySolid className="w-3 h-3 text-yellow-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the milestones modal
  const renderMilestonesModal = () => {
    if (!showMilestonesModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-mono text-white flex items-center">
              <TrophySolid className="w-5 h-5 mr-2 text-yellow-400" />
              Streak Milestones
            </h3>
            <button 
              onClick={() => setShowMilestonesModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-grow">
            {selectedMilestones.length === 0 ? (
              <p className="text-gray-400 text-center font-mono">No milestones completed yet.</p>
            ) : (
              <div className="space-y-3">
                {selectedMilestones
                  .sort((a, b) => b.days - a.days) // Sort by highest days first
                  .map((milestone, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TrophySolid className="w-5 h-5 mr-2 text-yellow-400" />
                          <span className="font-mono text-white">{milestone.name}</span>
                        </div>
                        <span className="text-purple-400 font-mono">+{milestone.xpReward} XP</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400 font-mono">
                        {milestone.days} day streak • Completed {formatDate(milestone.completedAt)}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Total Milestone XP:</span>
              <span className="text-lg font-mono text-purple-400">
                +{selectedMilestones.reduce((total, m) => total + m.xpReward, 0)} XP
              </span>
            </div>
            <button
              onClick={() => setShowMilestonesModal(false)}
              className="mt-3 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm font-mono text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 rounded-md border border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${stat.color} bg-opacity-20 mr-3`}>
                  {stat.icon}
                </div>
                <div className="text-sm font-mono text-gray-400">{stat.label}</div>
              </div>
              
              {/* Display streak value in the header for streak stat */}
              {stat.customType === 'streak' && (
                <div className="flex items-center">
                  <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
                  <span className="ml-1 text-xs text-gray-400 font-mono">
                    {stat.value === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
              
              {/* Display quest count and date in the header for quests stat */}
              {stat.customType === 'quests' && stat.todayStats && (
                <div className="flex items-center">
                  <div className="text-sm text-gray-400 font-mono flex items-center">
                    {formatDate(stat.todayStats.date)}
                    <CalendarIcon className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </div>
              )}
            </div>
            
            {stat.customDisplay ? (
              <>
                {stat.customType === 'level' && renderXPProgress(stat)}
                {stat.customType === 'quests' && renderQuestStats(stat)}
                {stat.customType === 'quests' && renderTodayProgress(stat)}
                {stat.customType === 'streak' && renderStreakProgress(stat)}
              </>
            ) : (
              <div className={`text-2xl font-bold ${stat.color} mt-2 font-mono`}>
                {stat.value}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Render the milestones modal */}
      {renderMilestonesModal()}
    </>
  );
} 
'use client';

import React, { useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, TrophyIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';
import { 
  calculateLevel, 
  calculateXpToNextLevel,
  calculateCurrentLevelXp,
  calculateCurrentLevelTotalXp
} from '../utils/levelUtils';
import { getLocalDateString } from '../utils/storageUtils';

// Define streak milestones - should match the ones in QuestContext
const STREAK_MILESTONES = [
  { days: 3, xpReward: 50, name: "3-Day Streak" },
  { days: 7, xpReward: 100, name: "Weekly Warrior" },
  { days: 14, xpReward: 250, name: "Fortnight Fighter" },
  { days: 30, xpReward: 500, name: "Monthly Master" },
  { days: 60, xpReward: 1000, name: "Bimonthly Boss" },
  { days: 100, xpReward: 2000, name: "Century Champion" },
  { days: 365, xpReward: 5000, name: "Year-Long Legend" },
];

// Define types for the stats
interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  customDisplay?: boolean;
  customType?: 'level' | 'streak' | 'quests';
  nextMilestone?: typeof STREAK_MILESTONES[0];
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
  };
}

export default function UserStats() {
  const { tasks, user } = useQuest();
  const [animateProgress, setAnimateProgress] = React.useState(false);
  
  // Calculate stats directly from tasks
  const { level, tasksCompleted, todayStats, xpStats } = useMemo(() => {
    // Get completed tasks
    const completedTasks = tasks.filter(task => task.completed);
    
    // Calculate total XP from completed tasks
    const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate level
    const calculatedLevel = calculateLevel(calculatedTotalXp);
    
    // Calculate XP to next level
    const nextLevelXp = calculateXpToNextLevel(calculatedTotalXp);
    
    // Calculate XP within the current level
    const levelXp = calculateCurrentLevelXp(calculatedTotalXp);
    const levelTotalXp = calculateCurrentLevelTotalXp(calculatedTotalXp);
    
    // Calculate progress percentage
    const percentage = Math.min(100, (levelXp / levelTotalXp) * 100 || 0);
    
    // Get today's date
    const today = getLocalDateString();
    
    // Calculate today's stats
    const todayCompletedTasks = completedTasks.filter(task => {
      // Check if the task was completed today
      return task.completedAt && task.completedAt.startsWith(today);
    });
    
    // Count active tasks for today (not completed)
    const todayActiveTasks = tasks.filter(task => 
      !task.completed && 
      !task.isRecurring // Exclude recurring templates
    );
    
    return {
      level: calculatedLevel,
      tasksCompleted: completedTasks.length,
      todayStats: {
        completed: todayCompletedTasks.length,
        active: todayActiveTasks.length,
        total: todayCompletedTasks.length + todayActiveTasks.length,
        date: today
      },
      xpStats: {
        totalXp: calculatedTotalXp,
        currentLevelXp: levelXp,
        currentLevelTotalXp: levelTotalXp,
        progressPercentage: percentage,
        xpToNextLevel: nextLevelXp
      }
    };
  }, [tasks]);
  
  // Trigger animation when XP changes
  React.useEffect(() => {
    // Trigger progress bar animation
    setAnimateProgress(true);
    
    // Reset animation state after a short delay
    const timer = setTimeout(() => {
      setAnimateProgress(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [xpStats?.totalXp]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T12:00:00`); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Function to get level color based on the level
  const getLevelColor = (level: number) => {
    if (level < 5) return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-700' };
    if (level < 10) return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-700' };
    if (level < 15) return { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-700' };
    if (level < 20) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-700' };
    if (level < 30) return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-700' };
    if (level < 40) return { bg: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-700' };
    if (level < 50) return { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-700' };
    return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-700' }; // 50+
  };
  
  const levelColors = getLevelColor(level);
  
  // Find the next streak milestone
  const nextMilestone = STREAK_MILESTONES.find(milestone => milestone.days > user.streakDays);
  
  // Calculate progress to next milestone
  const calculateStreakProgress = () => {
    if (!nextMilestone) return 100; // All milestones completed
    
    // Find the previous milestone
    const prevMilestoneIndex = STREAK_MILESTONES.findIndex(m => m.days === nextMilestone.days) - 1;
    const prevMilestoneDays = prevMilestoneIndex >= 0 ? STREAK_MILESTONES[prevMilestoneIndex].days : 0;
    
    // Calculate progress percentage
    const totalDaysToNextMilestone = nextMilestone.days - prevMilestoneDays;
    const daysCompleted = user.streakDays - prevMilestoneDays;
    
    return Math.round((daysCompleted / totalDaysToNextMilestone) * 100);
  };
  
  // Calculate today's quest completion progress
  const calculateTodayProgress = () => {
    if (todayStats.total === 0) return 0;
    return Math.round((todayStats.completed / todayStats.total) * 100);
  };
  
  const stats: StatItem[] = [
    {
      label: 'Level',
      value: level,
      icon: <TrophyIcon className="w-5 h-5 text-yellow-400" />,
      color: 'text-yellow-400',
      customDisplay: true,
      customType: 'level',
      xpStats
    },
    {
      label: 'Progress',
      value: tasksCompleted,
      icon: <CalendarIcon className="w-5 h-5 text-blue-400" />,
      color: 'text-blue-400',
      customDisplay: true,
      customType: 'quests',
      todayStats,
      progress: calculateTodayProgress()
    },
    {
      label: 'Day Streak',
      value: user.streakDays,
      icon: <FireIcon className="w-5 h-5 text-red-400" />,
      color: 'text-red-400',
      customDisplay: true,
      customType: 'streak',
      nextMilestone,
      progress: calculateStreakProgress()
    }
  ];
  
  // Today's quest progress section
  const renderTodayProgress = (stat: StatItem) => {
    if (stat.customType !== 'quests' || !stat.todayStats) return null;
    
    return (
      <div className="mt-1">
        <div className="flex justify-between items-center text-xs font-mono mb-1">
          <span className="text-gray-400">Today&apos;s progress:</span>
          <span className="text-blue-400">{stat.todayStats.completed}/{stat.todayStats.total}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full bg-blue-500"
            style={{ width: `${stat.progress || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-mono text-gray-500 mt-1">
          <span>{stat.todayStats.completed} completed</span>
          <span>{stat.todayStats.active} active</span>
        </div>
      </div>
    );
  };

  // Render quest stats section
  const renderQuestStats = (stat: StatItem) => {
    if (stat.customType !== 'quests' || !stat.todayStats) return null;
    
    return (
      <div className="flex items-center justify-between">
        <div className={`text-xl font-bold ${stat.color} font-mono`}>
          {formatDate(stat.todayStats.date)}
        </div>
      
      </div>
    );
  };
  
  // XP progress bar section
  const renderXPProgress = (stat: StatItem) => {
    if (stat.customType !== 'level' || !stat.xpStats) return null;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-mono text-gray-400">Level {level}</div>
          <div className="text-xs font-mono text-gray-400">
            {Math.round(stat.xpStats.currentLevelXp)} / {stat.xpStats.currentLevelTotalXp} XP
          </div>
        </div>
        
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${levelColors.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${stat.xpStats.progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            key={`progress-${animateProgress ? 'animate' : 'static'}-${stat.xpStats.totalXp}`}
          />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className={`text-xs ${levelColors.text}`}>Total XP: {stat.xpStats.totalXp}</div>
          <div className="text-xs font-mono text-gray-400">Next: {stat.xpStats.xpToNextLevel} XP</div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col"
        >
          <div className="flex items-center mb-2">
            <div className="mr-4">{stat.icon}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-400 font-mono">{stat.label}</div>
              {stat.customDisplay && stat.customType === 'level' ? (
                <div className="flex items-center justify-between">
                  <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
                  <div className={`px-3 py-1 rounded-md ${levelColors.bg} text-white-100 text-sm font-bold border ${levelColors.border}`}>
                    {level < 5 ? 'Novice' : 
                     level < 10 ? 'Apprentice' : 
                     level < 15 ? 'Adept' :
                     level < 20 ? 'Expert' :
                     level < 30 ? 'Master' :
                     level < 40 ? 'Champion' :
                     level < 50 ? 'Hero' : 'Legend'}
                  </div>
                </div>
              ) : stat.customDisplay && stat.customType === 'streak' ? (
                <div className="flex items-center">
                  <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
                  {stat.value === 1 ? (
                    <span className="ml-1 text-xs text-gray-400 font-mono">day</span>
                  ) : (
                    <span className="ml-1 text-xs text-gray-400 font-mono">days</span>
                  )}
                </div>
              ) : stat.customDisplay && stat.customType === 'quests' ? (
                renderQuestStats(stat)
              ) : (
                <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
              )}
            </div>
          </div>
          
          {/* XP progress bar */}
          {renderXPProgress(stat)}
          
          {/* Streak milestone progress */}
          {stat.customType === 'streak' && stat.nextMilestone && (
            <div className="mt-1">
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
                <span>{user.streakDays}</span>
                <span>{stat.nextMilestone.days}</span>
              </div>
            </div>
          )}
          
          {/* Today's quest progress */}
          {renderTodayProgress(stat)}
        </div>
      ))}
    </div>
  );
} 
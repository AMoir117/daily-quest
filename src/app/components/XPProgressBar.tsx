'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../context/QuestContext';
import { 
  calculateLevel, 
  calculateXpToNextLevel,
  calculateCurrentLevelXp,
  calculateCurrentLevelTotalXp
} from '../utils/levelUtils';

// Function to get level color based on the level - same as in UserStats
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

export default function XPProgressBar() {
  const { tasks } = useQuest();
  const [animateProgress, setAnimateProgress] = useState(false);
  
  // Calculate XP and level directly from completed tasks
  const { 
    totalXp, 
    level, 
    currentLevelXp, 
    currentLevelTotalXp, 
    progressPercentage,
    xpToNextLevel,
    levelColors
  } = useMemo(() => {
    // Get completed tasks
    const completedTasks = tasks.filter(task => task.completed);
    
    // Calculate total XP from completed tasks
    const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate level and XP to next level
    const calculatedLevel = calculateLevel(calculatedTotalXp);
    const nextLevelXp = calculateXpToNextLevel(calculatedTotalXp);
    
    // Calculate XP within the current level
    const levelXp = calculateCurrentLevelXp(calculatedTotalXp);
    const levelTotalXp = calculateCurrentLevelTotalXp(calculatedTotalXp);
    
    // Calculate progress percentage
    const percentage = Math.min(100, (levelXp / levelTotalXp) * 100 || 0);
    
    // Get level color
    const colors = getLevelColor(calculatedLevel);
    
    return {
      totalXp: calculatedTotalXp,
      level: calculatedLevel,
      currentLevelXp: levelXp,
      currentLevelTotalXp: levelTotalXp,
      progressPercentage: percentage,
      xpToNextLevel: nextLevelXp,
      levelColors: colors
    };
  }, [tasks]);
  
  // Trigger animation when XP changes
  useEffect(() => {
    // Trigger progress bar animation
    setAnimateProgress(true);
    
    // Reset animation state after a short delay
    const timer = setTimeout(() => {
      setAnimateProgress(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [totalXp]);
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-medium">Level {level}</div>
        <div className="text-xs text-gray-500">
          {Math.round(currentLevelXp)} / {currentLevelTotalXp} XP
        </div>
      </div>
      
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${levelColors.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
          key={`progress-${animateProgress ? 'animate' : 'static'}-${totalXp}`}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <div className={`text-xs ${levelColors.text}`}>Total XP: {totalXp}</div>
        <div className="text-xs text-gray-500">XP to Next Level: {xpToNextLevel}</div>
      </div>
    </div>
  );
} 
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../context/QuestContext';
import { 
  calculateLevel, 
  calculateXpToNextLevel, 
  calculateCurrentLevelXp, 
  calculateCurrentLevelTotalXp,
  LEVEL_THRESHOLDS
} from '../utils/levelUtils';

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
    xpToNextLevel
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
    
    return {
      totalXp: calculatedTotalXp,
      level: calculatedLevel,
      currentLevelXp: levelXp,
      currentLevelTotalXp: levelTotalXp,
      progressPercentage: percentage,
      xpToNextLevel: nextLevelXp
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
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
          key={`progress-${animateProgress ? 'animate' : 'static'}-${totalXp}`}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-gray-500">Total XP: {totalXp}</div>
        <div className="text-xs text-gray-500">XP to Next Level: {xpToNextLevel}</div>
      </div>
    </div>
  );
} 
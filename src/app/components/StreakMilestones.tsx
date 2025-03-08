'use client';

import React from 'react';
import { useQuest } from '../context/QuestContext';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/outline';

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

export default function StreakMilestones() {
  const { user } = useQuest();
  const { streakDays } = user;
  
  // Find the next milestone
  const nextMilestone = STREAK_MILESTONES.find(milestone => milestone.days > streakDays);
  
  // Find all completed milestones
  const completedMilestones = STREAK_MILESTONES.filter(milestone => milestone.days <= streakDays);
  
  // Calculate progress to next milestone
  const calculateProgress = () => {
    if (!nextMilestone) return 100; // All milestones completed
    
    // Find the previous milestone
    const prevMilestoneIndex = STREAK_MILESTONES.findIndex(m => m.days === nextMilestone.days) - 1;
    const prevMilestoneDays = prevMilestoneIndex >= 0 ? STREAK_MILESTONES[prevMilestoneIndex].days : 0;
    
    // Calculate progress percentage
    const totalDaysToNextMilestone = nextMilestone.days - prevMilestoneDays;
    const daysCompleted = streakDays - prevMilestoneDays;
    
    return Math.round((daysCompleted / totalDaysToNextMilestone) * 100);
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-mono">Streak Milestones</h2>
        <div className="flex items-center">
          <FireIcon className="w-5 h-5 text-red-400 mr-2" />
          <span className="text-lg font-mono text-red-400">{streakDays} day{streakDays !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {/* Next milestone progress */}
      {nextMilestone && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-mono text-gray-400">Next milestone:</span>
            <span className="text-sm font-mono text-purple-400">{nextMilestone.name} (+{nextMilestone.xpReward} XP)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
            <div 
              className="h-2.5 rounded-full bg-red-500"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>{streakDays} days</span>
            <span>{nextMilestone.days} days</span>
          </div>
        </div>
      )}
      
      {/* Completed milestones */}
      <div>
        <h3 className="text-sm font-mono text-gray-400 mb-2">
          {completedMilestones.length > 0 ? 'Achieved milestones:' : 'No milestones achieved yet'}
        </h3>
        
        <div className="space-y-2">
          {completedMilestones.map((milestone) => (
            <div 
              key={milestone.days} 
              className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md"
            >
              <div className="flex items-center">
                <TrophyIcon className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="font-mono text-sm">{milestone.name}</span>
              </div>
              <span className="text-sm font-mono text-purple-400">+{milestone.xpReward} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
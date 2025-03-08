'use client';

import React, { useMemo } from 'react';
import { FireIcon, TrophyIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';
import { calculateLevel } from '../utils/levelUtils';

export default function UserStats() {
  const { tasks, user } = useQuest();
  
  // Calculate stats directly from tasks
  const { level, tasksCompleted } = useMemo(() => {
    // Get completed tasks
    const completedTasks = tasks.filter(task => task.completed);
    
    // Calculate total XP from completed tasks
    const calculatedTotalXp = completedTasks.reduce((total, task) => total + task.xpReward, 0);
    
    // Calculate level
    const calculatedLevel = calculateLevel(calculatedTotalXp);
    
    return {
      level: calculatedLevel,
      tasksCompleted: completedTasks.length
    };
  }, [tasks]);
  
  // Function to get level color based on the level
  const getLevelColor = (level: number) => {
    if (level < 5) return { bg: 'bg-green-900', text: 'text-green-400', border: 'border-green-700' };
    if (level < 10) return { bg: 'bg-blue-900', text: 'text-blue-400', border: 'border-blue-700' };
    if (level < 15) return { bg: 'bg-purple-900', text: 'text-purple-400', border: 'border-purple-700' };
    if (level < 20) return { bg: 'bg-red-900', text: 'text-red-400', border: 'border-red-700' };
    if (level < 30) return { bg: 'bg-orange-900', text: 'text-orange-400', border: 'border-orange-700' };
    if (level < 40) return { bg: 'bg-pink-900', text: 'text-pink-400', border: 'border-pink-700' };
    if (level < 50) return { bg: 'bg-indigo-900', text: 'text-indigo-400', border: 'border-indigo-700' };
    return { bg: 'bg-yellow-900', text: 'text-yellow-400', border: 'border-yellow-700' }; // 50+
  };
  
  const levelColors = getLevelColor(level);
  
  const stats = [
    {
      label: 'Level',
      value: level,
      icon: <TrophyIcon className="w-5 h-5 text-yellow-400" />,
      color: 'text-yellow-400',
      customDisplay: true
    },
    {
      label: 'Quests Completed',
      value: tasksCompleted,
      icon: <CalendarIcon className="w-5 h-5 text-blue-400" />,
      color: 'text-blue-400'
    },
    {
      label: 'Day Streak',
      value: user.streakDays,
      icon: <FireIcon className="w-5 h-5 text-red-400" />,
      color: 'text-red-400'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center"
        >
          <div className="mr-4">{stat.icon}</div>
          <div className="flex-1">
            <div className="text-sm text-gray-400 font-mono">{stat.label}</div>
            {stat.customDisplay && stat.label === 'Level' ? (
              <div className="flex items-center justify-between">
                <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
                <div className={`px-3 py-1 rounded-md ${levelColors.bg} ${levelColors.text} text-sm font-bold border ${levelColors.border}`}>
                  {level < 5 ? 'Novice' : 
                   level < 10 ? 'Apprentice' : 
                   level < 15 ? 'Adept' :
                   level < 20 ? 'Expert' :
                   level < 30 ? 'Master' :
                   level < 40 ? 'Champion' :
                   level < 50 ? 'Hero' : 'Legend'}
                </div>
              </div>
            ) : (
              <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 
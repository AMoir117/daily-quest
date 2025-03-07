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
  
  const stats = [
    {
      label: 'Level',
      value: level,
      icon: <TrophyIcon className="w-5 h-5 text-yellow-400" />,
      color: 'text-yellow-400'
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
          <div>
            <div className="text-sm text-gray-400 font-mono">{stat.label}</div>
            <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 
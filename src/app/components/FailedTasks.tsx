'use client';

import React, { useEffect, useState } from 'react';
import { useQuest } from '../context/QuestContext';
import { Task } from '../types';
import { getFailedTasks, saveFailedTasks } from '../utils/storageUtils';
import { CalendarIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { calculateLevel, LEVEL_THRESHOLDS } from '../utils/levelUtils';

// Define XP penalties for failed tasks
const FAILED_TASK_PENALTIES: Record<string, number> = {
  easy: 5,
  medium: 10,
  hard: 15
};

export default function FailedTasks() {
  const { user, undoTask, tasks, saveTasks, setUser, saveUser } = useQuest();
  const [failedTasks, setFailedTasks] = useState<Task[]>([]);
  
  // Load failed tasks from storage
  useEffect(() => {
    const tasks = getFailedTasks();
    // Sort by most recent first
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFailedTasks(tasks);
  }, [user.tasksFailed]); // Reload when tasksFailed count changes
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle undoing a failed task
  const handleUndoFailedTask = (task: Task) => {
    // Calculate the XP penalty that was applied for this task
    const xpPenalty = FAILED_TASK_PENALTIES[task.difficulty] || 5;
    
    // Remove the task from the failed tasks list
    const updatedFailedTasks = failedTasks.filter(t => t.id !== task.id);
    setFailedTasks(updatedFailedTasks);
    saveFailedTasks(updatedFailedTasks);
    
    // Create a new active task from the failed task
    if (task.title.startsWith('FAILED:')) {
      // Create a copy of the task with the FAILED prefix removed
      const activeTask = {
        ...task,
        title: task.title.replace('FAILED:', '').trim(),
        completed: false,
        completedAt: undefined
      };
      
      // Add the active task to the tasks list
      const updatedTasks = [...tasks, activeTask];
      saveTasks(updatedTasks);
    }
    
    // Recalculate total XP penalty from remaining failed tasks
    const remainingXpPenalty = updatedFailedTasks.reduce((total, t) => {
      const penalty = FAILED_TASK_PENALTIES[t.difficulty] || 5;
      return total + penalty;
    }, 0);
    
    // Update user stats to restore the XP penalty
    const updatedUser = {
      ...user,
      totalXp: user.totalXp + xpPenalty,
      xp: user.xp + xpPenalty,
      tasksFailed: Math.max(0, user.tasksFailed - 1),
      failedXp: remainingXpPenalty // Update with recalculated total
    };
    
    // Recalculate level based on new totalXp
    const newLevel = calculateLevel(updatedUser.totalXp);
    
    // Find XP thresholds for current and next level
    const currentLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === newLevel) || { level: 1, xpRequired: 0 };
    const nextLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === newLevel + 1) || { level: 2, xpRequired: 100 };
    
    // Calculate XP within current level and XP to next level
    const xpWithinLevel = Math.max(0, updatedUser.totalXp - currentLevelThreshold.xpRequired);
    const xpToNextLevel = Math.max(0, nextLevelThreshold.xpRequired - updatedUser.totalXp);
    
    // Update level and XP values
    updatedUser.level = newLevel;
    updatedUser.xp = xpWithinLevel;
    updatedUser.xpToNextLevel = xpToNextLevel;
    
    // Save the updated user stats
    setUser(updatedUser);
    saveUser(updatedUser);
    
    // Call the undoTask function to handle any other cleanup
    undoTask(task.id);
    
    console.log(`Undid failed task ${task.title}: +${xpPenalty} XP, new total: ${updatedUser.totalXp}, new level: ${updatedUser.level}`);
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-mono mb-4 border-b border-gray-700 pb-2">Failed Quests</h2>
      
      {/* Show failed tasks history section */}
      <div>
        {failedTasks.length === 0 ? (
          <div className="p-4 rounded-md border border-gray-700 bg-gray-800 text-center">
            <p className="text-gray-400 font-mono">
              No failed quests in history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {failedTasks.map(task => (
              <div 
                key={task.id}
                className="p-4 rounded-md border border-amber-900/40 bg-gray-800/90"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-mono text-amber-400">
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1 font-mono">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500">
                      <div className="flex items-center mr-4 mb-1">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>{formatDate(task.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center mr-4 mb-1">
                        <span className={`px-2 py-0.5 rounded-full ${
                          task.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' : 
                          task.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' : 
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-1">
                        <span className="text-amber-400">-{FAILED_TASK_PENALTIES[task.difficulty] || 5} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => handleUndoFailedTask(task)}
                      className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                      aria-label="Undo failed task"
                      title="Restore this failed task"
                    >
                      <ArrowUturnLeftIcon className="w-5 h-5 text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { getHistory, getLocalDateString } from '../utils/storageUtils';
import { useQuest } from '../context/QuestContext';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function FailedQuests() {
  const { tasks } = useQuest();
  const [uncompletedHistoricalTasks, setUncompletedHistoricalTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Get current tasks to check which historical tasks are no longer present
    const currentTaskIds = new Set(tasks.map(task => task.id));
    
    // Get task history
    const taskHistory = getHistory();
    const today = getLocalDateString();
    
    // Find uncompleted recurring tasks from previous days
    const historicalTasks: Task[] = [];
    const processedTaskIds = new Set<string>();
    
    // Process history in reverse chronological order (newest first)
    [...taskHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(dayHistory => {
        // Skip today's history
        if (dayHistory.date === today) return;
        
        dayHistory.tasks.forEach(historyTask => {
          // If it's a recurring task instance, wasn't completed, isn't in current tasks,
          // and we haven't processed it yet
          if (historyTask.parentTaskId && 
              !historyTask.completed && 
              !currentTaskIds.has(historyTask.id) &&
              !processedTaskIds.has(historyTask.id)) {
            
            // Add to our list and mark as processed
            historicalTasks.push({
              ...historyTask,
              // Add date information to the task for display
              description: `${historyTask.description || ''} (${dayHistory.date})`
            });
            processedTaskIds.add(historyTask.id);
          }
        });
      });
    
    setUncompletedHistoricalTasks(historicalTasks);
  }, [tasks]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T12:00:00`); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-mono mb-4 border-b border-gray-700 pb-2">Failed Quests</h2>
      
      {uncompletedHistoricalTasks.length === 0 ? (
        <div className="p-4 rounded-md border border-gray-700 bg-gray-800 text-center">
          <p className="text-gray-400 font-mono">No failed quests. Great job!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uncompletedHistoricalTasks.map(task => (
            <div 
              key={task.id}
              className="p-4 rounded-md border border-gray-700 bg-gray-800/90"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-mono text-gray-400">
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1 font-mono">{task.description}</p>
                  )}
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>Created: {formatDate(task.createdAt)}</span>
                    
                    <span className="mx-2">•</span>
                    
                    <span className={`px-2 py-0.5 rounded-full ${
                      task.difficulty === 'easy' ? 'bg-green-900 text-green-400' : 
                      task.difficulty === 'medium' ? 'bg-orange-900 text-orange-400' : 
                      'bg-red-900 text-red-400'
                    }`}>
                      {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                    </span>
                    
                    <span className="mx-2">•</span>
                    
                    <span>{task.xpReward} XP</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
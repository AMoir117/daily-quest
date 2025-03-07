'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';
import { RecurringTaskTemplate, DayOfWeek } from '../types';
import { XP_REWARDS } from '../utils/levelUtils';

interface RecurringTaskItemProps {
  template: RecurringTaskTemplate;
  onEdit: (template: RecurringTaskTemplate) => void;
}

function RecurringTaskItem({ template, onEdit }: RecurringTaskItemProps) {
  const { deleteRecurringTask } = useQuest();
  
  const difficultyColors = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500'
  };
  
  // Format days of week for display
  const formatDays = (days: DayOfWeek[]) => {
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 mb-3 rounded-md border border-gray-700 bg-gray-800"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-mono">{template.title}</h3>
          {template.description && (
            <p className="text-sm text-gray-400 mt-1 font-mono">{template.description}</p>
          )}
          <div className="flex items-center mt-2 text-xs">
            <span className={`${difficultyColors[template.difficulty]} mr-2 font-mono`}>
              {template.difficulty.toUpperCase()}
            </span>
            <span className="text-purple-400 font-mono mr-2">+{XP_REWARDS[template.difficulty]} XP</span>
            <span className="text-gray-400 font-mono flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {formatDays(template.daysOfWeek)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(template)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Edit recurring task"
          >
            <PencilIcon className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={() => deleteRecurringTask(template.id)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Delete recurring task"
          >
            <TrashIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface RecurringTaskListProps {
  onEditTemplate: (template: RecurringTaskTemplate) => void;
}

export default function RecurringTaskList({ onEditTemplate }: RecurringTaskListProps) {
  const { recurringTasks } = useQuest();
  
  if (recurringTasks.templates.length === 0) {
    return (
      <div className="text-center py-8 font-mono">
        <p className="text-gray-400">No recurring quests set up. Add your first recurring quest!</p>
      </div>
    );
  }
  
  return (
    <div>
      {recurringTasks.templates.map(template => (
        <RecurringTaskItem key={template.id} template={template} onEdit={onEditTemplate} />
      ))}
    </div>
  );
} 
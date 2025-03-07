'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, TrashIcon, PencilIcon, ArrowUturnLeftIcon, ClipboardDocumentIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onUndo?: (taskId: string) => void;
  onCopy?: (taskId: string) => void;
}

function TaskItem({ task, onEdit, onUndo, onCopy }: TaskItemProps) {
  const { completeTask, deleteTask } = useQuest();
  
  const difficultyColors = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500'
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get the relevant date (completion date if completed, otherwise creation date)
  const displayDate = task.completed && task.completedAt 
    ? formatDate(task.completedAt) 
    : formatDate(task.createdAt);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 mb-3 rounded-md border border-gray-700 bg-gray-800 ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`text-lg font-mono ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 font-mono">{task.description}</p>
          )}
          <div className="flex items-center mt-2 text-xs">
            <span className={`${difficultyColors[task.difficulty]} mr-2 font-mono`}>
              {task.difficulty.toUpperCase()}
            </span>
            <span className="text-purple-400 font-mono mr-2">+{task.xpReward} XP</span>
            <span className="text-gray-400 font-mono flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {displayDate}
              {task.completed ? ' (completed)' : ' (created)'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!task.completed ? (
            <>
              <button
                onClick={() => onEdit(task)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Edit task"
              >
                <PencilIcon className="w-5 h-5 text-blue-400" />
              </button>
              <button
                onClick={() => completeTask(task.id)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Complete task"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Delete task"
              >
                <TrashIcon className="w-5 h-5 text-red-400" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onUndo && onUndo(task.id)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Undo completion"
              >
                <ArrowUturnLeftIcon className="w-5 h-5 text-blue-400" />
              </button>
              <button
                onClick={() => onCopy && onCopy(task.id)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Copy to active quests"
              >
                <ClipboardDocumentIcon className="w-5 h-5 text-green-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TaskListProps {
  onEditTask: (task: Task) => void;
  showActive?: boolean;
  showCompleted?: boolean;
}

export default function TaskList({ 
  onEditTask, 
  showActive = true, 
  showCompleted = true 
}: TaskListProps) {
  const { tasks, undoTask, copyTask } = useQuest();
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // Function to scroll to completed quests section
  const scrollToCompletedQuests = () => {
    const completedQuestsSection = document.querySelector('#completed-quests-section');
    if (completedQuestsSection) {
      completedQuestsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 font-mono">
        <p className="text-gray-400">No quests available. Add your first quest!</p>
      </div>
    );
  }
  
  if (!showActive && !showCompleted) {
    return (
      <div className="text-center py-8 font-mono">
        <p className="text-gray-400">No tasks to display based on current filters.</p>
      </div>
    );
  }
  
  if (showActive && activeTasks.length === 0 && !showCompleted) {
    return (
      <div className="text-center py-8 font-mono">
        <p className="text-gray-400">
          No active quests. Add a new quest or check{' '}
          <button 
            onClick={scrollToCompletedQuests}
            className="text-purple-400 hover:text-purple-300 underline focus:outline-none"
          >
            completed quests
          </button>.
        </p>
      </div>
    );
  }
  
  if (showCompleted && completedTasks.length === 0 && !showActive) {
    return (
      <div className="text-center py-8 font-mono">
        <p className="text-gray-400">No completed quests yet. Complete some quests to see them here!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showActive && activeTasks.length > 0 && (
        <div>
          {activeTasks.map(task => (
            <TaskItem key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      )}
      
      {showCompleted && completedTasks.length > 0 && (
        <div>
          {completedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onEdit={onEditTask} 
              onUndo={undoTask} 
              onCopy={copyTask}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
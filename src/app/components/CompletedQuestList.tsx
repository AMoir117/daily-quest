'use client';

import { useQuest } from '../context/QuestContext';
import { Task } from '../types';
import {
  ArrowUturnLeftIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onUndo?: (taskId: string) => void;
  onCopy?: (taskId: string) => void;
}

function TaskItem({ task, onUndo, onCopy }: TaskItemProps) {
  const { hideTask, unhideTask } = useQuest();
  
  // Define difficulty colors for text and borders
  const difficultyColors = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500'
  };
  
  const difficultyBorders = {
    easy: 'border-green-500',
    medium: 'border-yellow-500',
    hard: 'border-red-500'
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get the relevant date (completion date if completed, otherwise creation date)
  const displayDate = task.completed && task.completedAt 
    ? formatDate(task.completedAt) 
    : formatDate(task.createdAt);
  
  // Determine if this is a recurring template or a daily instance
  const isRecurringTemplate = task.isRecurring;
  const isDailyInstance = Boolean(task.parentTaskId);
  
  // Check if this is a failed task
  const isFailedTask = task.title.startsWith('FAILED:');
  
  // Get border class based on task difficulty
  const getBorderClass = () => {
    // For completed tasks
    if (task.completed) {
      if (isFailedTask) {
        return 'border-amber-900/40 bg-gray-800/90'; // Failed task style
      }
      return 'border-gray-700 bg-gray-800/90'; // Completed task style
    }
    
    // Category-based border colors
    const categoryBorders: Record<string, string> = {
      health: 'border-green-600',
      productivity: 'border-yellow-600',
      personal: 'border-purple-600',
      home: 'border-orange-600',
      tech: 'border-indigo-600',
      social: 'border-pink-600',
      work: 'border-blue-600', 
      learning: 'border-purple-600',
      chores: 'border-yellow-600',
      finance: 'border-emerald-600',
      creative: 'border-indigo-600'
    };
    
    // If task has a category, use that for the border
    if (task.questType && task.questType !== "No Type") {
      const category = task.questType.toLowerCase();
      const borderClass = categoryBorders[category];
      
      if (borderClass) {
        return `${borderClass} bg-gray-900/90`;
      }
    }
    
    // For active tasks without a category, use difficulty-based borders
    if (isRecurringTemplate) {
      return 'border-blue-700 bg-gray-900/90'; // Recurring template style
    } else if (isDailyInstance) {
      return 'border-purple-600 bg-gray-900/90'; // Daily instance style
    } else {
      return `border-${difficultyBorders[task.difficulty]} bg-gray-900/90`; // Difficulty-based style for regular tasks
    }
  };
  
  // Get category class for quest type badge
  const getCategoryClass = () => {
    if (!task.questType) return 'bg-gray-700/50 text-gray-300';
    
    // Quest type colors matching the TaskList component
    const questTypeColors: Record<string, string> = {
      health: 'bg-green-900/50 text-green-300 border-green-600',
      productivity: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
      personal: 'bg-purple-900/50 text-purple-300 border-purple-600',
      home: 'bg-orange-900/50 text-orange-300 border-orange-600',
      tech: 'bg-indigo-900/50 text-indigo-300 border-indigo-600',
      social: 'bg-pink-900/50 text-pink-300 border-pink-600',
      work: 'bg-blue-900/50 text-blue-300 border-blue-600',
      learning: 'bg-purple-900/50 text-purple-300 border-purple-600',
      chores: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
      finance: 'bg-emerald-900/50 text-emerald-300 border-emerald-600',
      creative: 'bg-indigo-900/50 text-indigo-300 border-indigo-600'
    };
    
    return questTypeColors[task.questType.toLowerCase()] || 'bg-gray-700/50 text-gray-300';
  };
  
  // Handle hiding tasks
  const handleHide = () => {
    hideTask(task.id);
  };
  
  // Handle unhiding tasks
  const handleUnhide = () => {
    unhideTask(task.id);
  };
  
  return (
    <div className={`p-4 rounded-md border ${getBorderClass()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h3 className="text-lg font-mono flex items-center">
              <span className={`${task.completed ? (isFailedTask ? 'text-amber-400 line-through' : 'text-gray-400 line-through') : difficultyColors[task.difficulty]}`}>
                {isFailedTask ? task.title.replace('FAILED:', '').trim() : task.title}
              </span>
            </h3>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-400 mb-2">{task.description}</p>
          )}
          
          <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center">
            <span className={difficultyColors[task.difficulty]}>
              {task.difficulty.toUpperCase()}
            </span>
            <span className="ml-2 text-purple-400">+{task.xpReward} XP</span>
            
            {/* Display quest type if available */}
            {task.questType && task.questType !== "No Type" && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getCategoryClass()}`}>
                {task.questType.toUpperCase()}
              </span>
            )}
            
            {/* Completed tag moved here */}
            {task.completed && (
              <span className="ml-2 text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">
                COMPLETED
              </span>
            )}
            
          </div>
          
          {/* Show completion date on a new line */}
          {task.completedAt && (
            <span className="mt-1 text-gray-400 text-xs flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 inline" />
              {displayDate}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {/* Undo button */}
          {onUndo && (
            <button 
              onClick={() => onUndo(task.id)}
              className="text-gray-400 hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
              title="Undo completion"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
            </button>
          )}
          
          {/* Copy button */}
          {onCopy && (
            <button 
              onClick={() => onCopy(task.id)}
              className="text-gray-400 hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
              title="Copy task"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
          )}
          
          {/* Hide/Unhide button */}
          {task.questStatus === 'hidden' ? (
            <button 
              onClick={handleUnhide}
              className="text-gray-400 hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
              title="Unhide task"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={handleHide}
              className="text-gray-400 hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
              title="Hide task"
            >
              <EyeSlashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CompletedQuestListProps {
  onEditTask: (task: Task) => void;
  showHidden?: boolean;
}

export default function CompletedQuestList({ 
  onEditTask, 
  showHidden = false
}: CompletedQuestListProps) {
  const { tasks, undoTask, copyTask } = useQuest();
  
  // Use the showHidden prop directly instead of managing internal state
  // Filter only completed tasks
  const completedTasks = tasks.filter(task => {
    return task.completed === true && 
           (showHidden || task.questStatus !== 'hidden');
  });
  
  // Check if any tasks exist in the system (for onboarding message)
  const anyTasksExist = tasks.length > 0;
  
  
  // If there are no completed tasks or no tasks at all, show the "no completed quests" card
  if (completedTasks.length === 0 || !anyTasksExist) {
    return (
      <div className="space-y-6">
        
              
        {/* Completed tasks content */}
        <div id="completed-quests-section">
    
            <div className="p-4 rounded-md border border-gray-700 bg-gray-800 text-center">
                <p className="text-gray-400 font-mono">
                    No completed quests in history.
                </p>
            </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      
            
      {/* Completed tasks content */}
      <div id="completed-quests-section">
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-mono text-gray-300">
                    Completed ({completedTasks.length})
                </h3>
                {/* Remove the hidden toggle button - now managed from page.tsx */}
            </div>
            
            
        </div>
        {completedTasks.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center mb-2">
              <div className="text-sm font-mono text-gray-400">Completed Quests</div>
            </div>
            
            <div className="text-center py-3">
              <div className="text-sm font-mono text-gray-400 flex items-center justify-center">
                No completed quests in history.
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* One-time completed quests */}
            {completedTasks.filter(task => !task.parentTaskId && !task.isRecurring).length > 0 && (
              <>
                <h4 className="text-md font-mono text-gray-400 mt-4 mb-2 border-b border-gray-700 pb-1">
                  One-time Quests
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                  {completedTasks
                    .filter(task => !task.parentTaskId && !task.isRecurring)
                    .map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onEdit={onEditTask} 
                        onUndo={undoTask}
                        onCopy={copyTask}
                      />
                    ))}
                </div>
              </>
            )}
            
            {/* Recurring completed quests */}
            {completedTasks.filter(task => task.parentTaskId || task.isRecurring).length > 0 && (
              <>
                <h4 className="text-md font-mono text-gray-400 mt-4 mb-2 border-b border-gray-700 pb-1">
                  Recurring Quests
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                  {completedTasks
                    .filter(task => task.parentTaskId || task.isRecurring)
                    .map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onEdit={onEditTask} 
                        onUndo={undoTask}
                        onCopy={copyTask}
                      />
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
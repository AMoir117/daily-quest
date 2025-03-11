'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, TrashIcon, PencilIcon, ArrowUturnLeftIcon, ClipboardDocumentIcon, CalendarIcon, ArrowPathIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';
import { Task, DayOfWeek } from '../types';
import { 
  getDayOfWeek, 
  getLocalDateString,
  getDayStartDateString,
  getLocalISOString,
  getTasks,
  saveTasks as saveTasksUtil
} from '../utils/storageUtils';
import { v4 as uuidv4 } from 'uuid';
import DeleteTaskModal from './DeleteTaskModal';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onUndo?: (taskId: string) => void;
  onCopy?: (taskId: string) => void;
}

function TaskItem({ task, onEdit, onUndo, onCopy }: TaskItemProps) {
  const { completeTask, deleteTask, hideTask, unhideTask } = useQuest();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  

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
  
  // Quest type colors
  const questTypeColors: Record<string, string> = {
    health: 'bg-green-900/50 text-green-300 border-green-600',
    productivity: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
    personal: 'bg-purple-900/50 text-purple-300 border-purple-600',
    home: 'bg-orange-900/50 text-orange-300 border-orange-600',
    tech: 'bg-indigo-900/50 text-indigo-300 border-indigo-600',
    social: 'bg-pink-900/50 text-pink-300 border-pink-600'
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
  
  // Get current day of week for daily instances
  const currentDayOfWeek = isDailyInstance ? getDayOfWeek(new Date()) : '';
  // Format day of week with first letter capitalized
  const formattedDayOfWeek = currentDayOfWeek.charAt(0).toUpperCase() + currentDayOfWeek.slice(1);
  
  // Check if this is a failed task
  const isFailedTask = task.title.startsWith('FAILED:');
  
  // Get quest type - use instance's type or fallback to parent template's type
  // const questType = task.questType || (parentTemplate?.questType) || '';
  
  // Handle task completion
  const handleComplete = () => {
    console.log(`Attempting to complete task: ${task.id} - ${task.title} (${task.completed ? 'already completed' : 'not completed'})`);
    
    // Don't allow completing recurring templates
    if (isRecurringTemplate) {
      console.warn(`Cannot complete a recurring template directly`);
      return;
    }
    
    if (task.completed) {
      console.warn(`Task is already completed, ignoring completion request`);
      return;
    }
    
    const wasSuccessful = completeTask(task.id);
    console.log(`Completion result for task ${task.id}: ${wasSuccessful ? 'success' : 'failed'}`);
  };
  
  // Handle task deletion
  const handleDelete = () => {
    console.log(`Deleting task: ${task.id} - ${task.title}`);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    deleteTask(task.id);
  };
  
  // Get border class based on task status
  const getBorderClass = () => {
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
      social: 'border-pink-600'
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
      return `border-${difficultyBorders[task.difficulty]} bg-gray-900/90`; // Regular task style
    }
  };
  
  // Get category display class
  const getCategoryClass = () => {
    const category = task.questType?.toLowerCase() || "none";
    return questTypeColors[category] || 'bg-gray-700/50 text-gray-300';
  };
  
  // Add new handlers for hiding/showing
  const handleHide = () => {
    hideTask(task.id);
  };
  
  const handleUnhide = () => {
    unhideTask(task.id);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-md border ${getBorderClass()} mb-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-mono flex items-center">
              <span className={`${task.completed ? (isFailedTask ? 'text-amber-400 line-through' : 'text-gray-400 line-through') : difficultyColors[task.difficulty]}`}>
                {isFailedTask ? task.title.replace('FAILED:', '').trim() : task.title}
              </span>
              
              {/* Show day of week for daily instances */}
              {isDailyInstance && (
                <span className="ml-2 text-xs text-gray-400">
                  <ArrowPathIcon className="w-3 h-3 inline-block mr-1" />
                  {formattedDayOfWeek}
                </span>
              )}
              
              {/* Show recurring badge for templates */}
              {isRecurringTemplate && (
                <span className="ml-2 text-xs text-gray-400">
                  <ArrowPathIcon className="w-3 h-3 inline-block mr-1" />
                  Recurring
                </span>
              )}
              
              {/* Show status badge for completed or failed tasks */}
              {task.completed && (
                <span className={`ml-2 text-xs font-bold ${isFailedTask ? 'text-amber-500' : 'text-green-500'} border border-current px-2 py-0.5 rounded`}>
                  {isFailedTask ? 'Failed' : 'Completed'}
                </span>
              )}
            </h3>
          </div>
          
          {/* Task description */}
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-500' : 'text-gray-400'}`}>
              {task.description}
            </p>
          )}
          
          {/* Task metadata */}
          <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center">
            <span className={difficultyColors[task.difficulty]}>
              {task.difficulty.toUpperCase()}
            </span>
            <span className="ml-2 text-purple-400">
              {isFailedTask ? `-${task.xpReward} XP` : `+${task.xpReward} XP`}
            </span>
            <span className="ml-2 text-gray-400 flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {displayDate}
            </span>
            {/* Display quest type if available */}
            {task.questType && task.questType !== "No Type" && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getCategoryClass()}`}>
                {task.questType.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {/* Task actions */}
          {!task.completed && !isFailedTask && (
            <>
              {/* Edit button */}
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
                title="Edit task"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              
              {/* Complete button - only show if task is not hidden */}
              {!isRecurringTemplate && task.questStatus !== 'hidden' && (
                <button
                  onClick={handleComplete}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Complete task"
                  title="Mark as completed"
                >
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                </button>
              )}
            </>
          )}
          
          {/* Delete button */}
          {(!isFailedTask || task.title.startsWith('FAILED:')) && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-gray-700 text-red-500"
              title="Delete task"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
          
          {/* Undo and Copy buttons for completed tasks */}
          {task.completed && !isFailedTask && onUndo && onCopy && (
            <>
              <button
                onClick={() => onUndo(task.id)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Undo completion"
              >
                <ArrowUturnLeftIcon className="w-5 h-5 text-blue-400" />
              </button>
              <button
                onClick={() => onCopy(task.id)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Copy to active quests"
              >
                <ClipboardDocumentIcon className="w-5 h-5 text-green-400" />
              </button>
            </>
          )}
          
          {/* Add hide/unhide buttons */}
          {task.questStatus !== 'hidden' && (
            <button
              onClick={handleHide}
              className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
              title="Hide task"
            >
              <EyeSlashIcon className="w-5 h-5" />
            </button>
          )}
          
          {task.questStatus === 'hidden' && (
            <button
              onClick={handleUnhide}
              className="p-1 rounded-full hover:bg-gray-700 text-blue-500"
              title="Unhide task"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        task={task}
      />
    </motion.div>
  );
}

interface TaskListProps {
  onEditTask: (task: Task) => void;
  showActive?: boolean;
  showCompleted?: boolean;
  showHidden?: boolean;
  showRecurringTemplates?: boolean;
}

export default function TaskList({ 
  onEditTask, 
  showActive = true, 
  showHidden = false,
  showRecurringTemplates = false
}: TaskListProps) {
  const { tasks, questTypes } = useQuest();
  
  // Use showHidden prop directly
  const showHiddenTasks = showHidden;
  
  // Filter tasks by status and hidden state
  const activeTasks = tasks.filter(task => {
    return task.completed === false && 
           (showHiddenTasks || task.questStatus !== 'hidden');
  });
  
  const completedTasks = tasks.filter(task => {
    return task.completed === true && 
           (showHiddenTasks || task.questStatus !== 'hidden');
  });
  
  // Log current task counts
  console.log(`TaskList: Active tasks: ${activeTasks.length}, Completed tasks: ${completedTasks.length}`);
  
  // Verify no task is in both lists
  const activeIds = new Set(activeTasks.map(t => t.id));
  const completedIds = new Set(completedTasks.map(t => t.id));
  const intersection = [...activeIds].filter(id => completedIds.has(id));
  if (intersection.length > 0) {
    console.error(`ERROR: Found ${intersection.length} tasks in both active and completed lists:`, intersection);
  }
  
  // Organize active tasks to avoid duplicates in the UI
  const organizedActiveTasks = React.useMemo(() => {
    // Get today's date for filtering
    const today = getLocalDateString();
    console.log("Today is:", today);
    
    // Get the day of the week
    const currentDate = new Date(`${today}T12:00:00`);
    const dayOfWeek = getDayOfWeek(currentDate);
    console.log("Current day of week:", dayOfWeek);
    
    // Double check that there are no completed tasks in activeTasks
    const anyCompletedActive = activeTasks.some(task => task.completed);
    if (anyCompletedActive) {
      console.error("ERROR: Found completed tasks in activeTasks array. This shouldn't happen!");
      // Filter them out just to be safe
      const properActiveTasks = activeTasks.filter(task => !task.completed);
      console.log(`Filtered out ${activeTasks.length - properActiveTasks.length} completed tasks from activeTasks`);
      // Continue with the filtered array
      return organizeActiveTasks(properActiveTasks, dayOfWeek, today, questTypes);
    }
    
    // If we get here, activeTasks are all properly not completed
    return organizeActiveTasks(activeTasks, dayOfWeek, today, questTypes);
  }, [activeTasks, questTypes]); // Depend only on the tasks and questTypes

  // Helper function to organize active tasks - fixes type issues by using string for dayOfWeek
  function organizeActiveTasks(activeTasks: Task[], dayOfWeek: string, today: string, questTypes: string[]) {
    // Find all recurring task templates (tasks with isRecurring=true)
    const recurringTemplates = activeTasks.filter(task => task.isRecurring);
    console.log("All recurring templates:", recurringTemplates.length);
    
    // Log details of all recurring templates for debugging
    console.log("Recurring templates details:");
    recurringTemplates.forEach(template => {
      console.log(`- Template: "${template.title}" (ID: ${template.id})`);
      console.log(`  Quest Type: ${template.questType || 'none'}`);
      console.log(`  Days: ${template.recurringDays?.join(', ') || 'none'}`);
      
      // Fix: Safe check for day inclusion accounting for type issues
      const includesDay = template.recurringDays ? 
        template.recurringDays.some(day => day === dayOfWeek) : 
        false;
      
      console.log(`  Includes today (${dayOfWeek})? ${includesDay ? 'YES' : 'NO'}`);
    });
    
    // Find all daily instances (children of recurring templates)
    let dailyInstances = activeTasks.filter(task => task.parentTaskId);
    
    // Verify that all daily instances are not completed
    const completedInstances = dailyInstances.filter(task => task.completed);
    if (completedInstances.length > 0) {
      console.error("ERROR: Found completed instances in dailyInstances array:", completedInstances);
      // Filter them out
      dailyInstances = dailyInstances.filter(task => !task.completed);
    }
    
    // Log details of all daily instances
    console.log("All daily instances before de-duplication:", dailyInstances.length);
    dailyInstances.forEach(instance => {
      console.log(`- Instance: "${instance.title}" (ID: ${instance.id})`);
      console.log(`  Parent: ${instance.parentTaskId}`);
      console.log(`  Quest Type: ${instance.questType || 'none'}`);
      console.log(`  Created: ${instance.createdAt}`);
      console.log(`  Completed: ${instance.completed}`);
      
      // Find parent template
      const parent = recurringTemplates.find(t => t.id === instance.parentTaskId);
      if (parent) {
        console.log(`  Parent Template: "${parent.title}" (${parent.questType || 'no type'})`);
      } else {
        console.log(`  WARNING: Parent template not found!`);
      }
    });
    
    // Identify duplicate daily instances that might have been created
    const instancesByParentAndTitle: Record<string, Task[]> = {};
    
    // Group instances by parent ID and title to find duplicates
    dailyInstances.forEach(instance => {
      const key = `${instance.parentTaskId}-${instance.title}`;
      if (!instancesByParentAndTitle[key]) {
        instancesByParentAndTitle[key] = [];
      }
      instancesByParentAndTitle[key].push(instance);
    });
    
    // Log any duplicate instances
    Object.entries(instancesByParentAndTitle).forEach(([key, instances]) => {
      if (instances.length > 1) {
        console.warn(`Found ${instances.length} instances for key ${key} - keeping most recent`);
        // Keep only the most recent instance for each parent-title combination
        // (We don't delete here to avoid modifying the source data during render)
      }
    });
    
    // De-duplicate instances by keeping only the most recent for each parent-title combination
    const uniqueDailyInstances: Task[] = [];
    Object.values(instancesByParentAndTitle).forEach(instances => {
      // Sort by created date, most recent first
      const sortedInstances = [...instances].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      // Only keep the most recent instance
      uniqueDailyInstances.push(sortedInstances[0]);
    });
    
    // Use the de-duplicated instances
    dailyInstances = uniqueDailyInstances;
    
    console.log("Daily instances after de-duplication:", dailyInstances.length);
    
    // Find all regular tasks (not recurring or instances)
    const regularTasks = activeTasks.filter(task => !task.isRecurring && !task.parentTaskId);
    console.log("Regular tasks:", regularTasks.length);
    
    // Group all tasks by quest type
    const tasksByType: Record<string, Task[]> = {};
    
    // Initialize categories for all quest types
    questTypes.forEach(type => {
      tasksByType[type] = [];
    });
    
    // Add "No Type" as default category
    tasksByType["No Type"] = [];
    
    console.log("Task categorization by quest type:");
    console.log("Available quest types:", questTypes);
    
    // IMPORTANT: We're now skipping the daily instances when categorizing tasks
    // This ensures recurring task instances don't show up in regular category sections
    
    // Categorize regular tasks
    regularTasks.forEach(task => {
      const questType = task.questType || "No Type";
      
      console.log(`Categorizing regular task "${task.title}" (${task.id}):`);
      console.log(` - Quest type: ${questType}`);
      console.log(` - Will be displayed under: ${questType} ${questTypes.includes(questType) ? '✓' : '✗ (not in questTypes)'}`);
      
      if (questType && questTypes.includes(questType)) {
        tasksByType[questType].push(task);
      } else {
        tasksByType["No Type"].push(task);
      }
    });
    
    // Log final categorization results
    console.log("Tasks categorized by type:");
    for (const type in tasksByType) {
      console.log(`- ${type}: ${tasksByType[type].length} tasks`);
      if (tasksByType[type].length > 0) {
        tasksByType[type].forEach(task => 
          console.log(`  * "${task.title}" (${task.id})`)
        );
      }
    }
    
    return {
      tasksByType,
      recurringTemplates
    };
  }
  
  // Simplify the rendering logic by removing conditional returns for completed tasks
  if (activeTasks.length === 0 && showActive) {
    // Check if ANY tasks exist in the system before showing onboarding message
    const anyTasksExist = tasks.length > 0;
    const hasCompletedTasks = tasks.some(task => task.completed);
    const hasTemplates = tasks.some(task => task.isRecurring && !task.completed);
    
    if (!anyTasksExist) {
      return (
        <div className="space-y-6">
          <div className="text-center py-8 font-mono">
            <h3 className="text-lg text-purple-400 mb-2">Welcome to DailyQuest</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Track your daily tasks, earn XP, and level up as you complete quests. Create one-time or recurring quests to boost your productivity!
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* No active quests message - but there are completed tasks or templates */}
        <div className="text-center py-4 font-mono bg-gray-800 rounded-lg border border-gray-700 px-4">
          <p className="text-gray-300 mb-2">
            No active quests found.
          </p>
          {hasCompletedTasks && (
            <p className="text-gray-400">
              You have completed quests! Check the{' '}
              <button 
                onClick={() => {
                  const section = document.getElementById('completed-quests-section');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-purple-400 hover:text-purple-300 underline focus:outline-none"
              >
                completed quests section.
              </button>{' '}
            </p>
          )}
          {hasTemplates && (
            <p className="text-gray-400 mt-2">
              You have recurring quest templates. Add new quests from your templates to start tracking your progress.
            </p>
          )}
          {!hasCompletedTasks && !hasTemplates && (
            <p className="text-gray-400">
              Create a new quest to start tracking your progress.
            </p>
          )}
        </div>

        {/* Always show the completed section if showCompleted is true */}
        
      </div>
    );
  }
  
  
  if (showActive && activeTasks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Message for no active tasks */}
        <div className="text-center py-4 font-mono">
          <p className="text-gray-400">
            No active quests. Add a new quest or check{' '}
            <button 
              onClick={() => {
                const section = document.getElementById('completed-quests-section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-purple-400 hover:text-purple-300 underline focus:outline-none"
            >
              completed quests
            </button>.
          </p>
        </div>
      </div>
    );
  }
  
  if (completedTasks.length === 0 && !showActive) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 font-mono">
          <h3 className="text-lg text-purple-400 mb-2">Welcome to DailyQuest</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Track your daily tasks, earn XP, and level up as you complete quests. Create one-time or recurring quests to boost your productivity!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showActive && (
        <>
          {/* Message for no active tasks */}
          {activeTasks.length === 0 && (
            <div className="text-center py-4 font-mono">
              <p className="text-gray-400">
                No active quests. Add a new quest or check{' '}
                <button 
                  onClick={() => {
                    const section = document.getElementById('completed-quests-section');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-purple-400 hover:text-purple-300 underline focus:outline-none"
                >
                  completed quests
                </button>.
              </p>
            </div>
          )}
          
          {/* Show templates when showRecurringTemplates is true */}
          {showRecurringTemplates && (
            <div className="mt-2 pt-4 mb-6">
              <h3 className="text-sm font-mono uppercase text-gray-400 mb-2 border-b border-gray-700 pb-1">
                All Recurring Templates
              </h3>
              {organizedActiveTasks.recurringTemplates.length > 0 ? (
                organizedActiveTasks.recurringTemplates.map((template: Task) => (
                  <TaskItem key={template.id} task={template} onEdit={onEditTask} />
                ))
              ) : (
                <p className="text-sm text-gray-400 font-mono py-2">
                  No recurring templates yet. Create one by checking &quot;Make this a recurring quest&quot; when adding a new quest.
                </p>
              )}
            </div>
          )}
          
          {/* Recurring Quests for Today Section - Only show if there are templates */}
          {organizedActiveTasks.recurringTemplates.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-mono uppercase text-gray-400 border-b border-gray-700 pb-1 mb-2">
                Recurring Quests for Today
              </h3>
              
              {/* Display all recurring tasks for today */}
              <div className="mt-2">
                {(() => {
                  // Get all recurring templates scheduled for today
                  const templatesForToday = organizedActiveTasks.recurringTemplates
                    .filter(template => template.recurringDays?.includes(getDayOfWeek(new Date()) as DayOfWeek));
                  
                  if (templatesForToday.length === 0) {
                    return (
                      <p className="text-sm text-gray-400 font-mono py-2">
                        No recurring quests scheduled for today.
                      </p>
                    );
                  }
                  
                  // Group templates by category for better organization
                  const templatesByCategory: Record<string, Task[]> = {};
                  
                  // Initialize with all used categories
                  const categories = new Set<string>();
                  templatesForToday.forEach(template => {
                    if (template.questType) {
                      categories.add(template.questType);
                    } else {
                      categories.add("No Category");
                    }
                  });
                  
                  // Create empty arrays for each category
                  categories.forEach(category => {
                    templatesByCategory[category] = [];
                  });
                  
                  // Add templates to their categories
                  templatesForToday.forEach(template => {
                    const category = template.questType || "No Category";
                    templatesByCategory[category].push(template);
                  });
                  
                  // Render templates by category
                  return (
                    <div className="space-y-4">
                      {Object.entries(templatesByCategory).map(([category, templates]) => (
                        <div key={category} className="mb-2">
                          <div className="space-y-2">
                            {templates.map(template => (
                              <RecurringInstanceItem key={template.id} template={template} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          
          {/* Quest type groups */}
          {questTypes.map(type => {
            const tasksForType = organizedActiveTasks.tasksByType[type] || [];
            if (tasksForType.length === 0) return null;
            
            // Double verify no completed tasks in this category
            const completedInType = tasksForType.filter(t => t.completed);
            if (completedInType.length > 0) {
              console.error(`ERROR: Found ${completedInType.length} completed tasks in active list for type ${type}:`, 
                completedInType.map(t => `${t.id} - ${t.title}`));
            }
            
            // Capitalize the first letter of the type
            const displayType = type.charAt(0).toUpperCase() + type.slice(1);
            
            return (
              <div className="mb-6" key={type}>
                <h3 className="text-sm font-mono uppercase text-gray-400 mb-2 border-b border-gray-700 pb-1">
                  {displayType} Quests
                </h3>
                {tasksForType.map(task => (
                  <TaskItem key={task.id} task={task} onEdit={onEditTask} />
                ))}
              </div>
            );
          })}
          
          {/* Tasks with no type */}
          {organizedActiveTasks.tasksByType["No Type"].length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-mono uppercase text-gray-400 mb-2 border-b border-gray-700 pb-1">
                One-Time Quests
              </h3>
              {organizedActiveTasks.tasksByType["No Type"].map(task => (
                <TaskItem key={task.id} task={task} onEdit={onEditTask} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Component to display recurring task options for each template
function RecurringInstanceItem({ template }: { template: Task }) {
  const { completeTask, saveTasks, tasks, failRecurringTask } = useQuest();
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  const [hasInstance, setHasInstance] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  
  // Generate a stable component-specific key for this template
  const templateKey = useMemo(() => template.id, [template.id]);
  
  const dayOfWeek = getDayOfWeek(new Date());
  const formattedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  const today = getLocalDateString();
  
  // Define difficulty colors for this component
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
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Check if there's already a task for this template today
  useEffect(() => {
    if (isCreatingTask) {
      return; // Skip checks if we're in the process of creating a task
    }
    
    // Get today's date
    const todayDate = new Date();
    const todayString = todayDate.toISOString().split('T')[0];
    
    console.log(`Checking tasks for template ${template.title} (${templateKey}) on ${todayString}`);
    
    // Find all tasks for today that match this template
    const allTodaysTasks = tasks.filter(t => {
      // Match tasks created or completed today
      const createdToday = t.createdAt && t.createdAt.startsWith(todayString);
      const completedToday = t.completedAt && t.completedAt.startsWith(todayString);
      const isForToday = createdToday || completedToday;
      
      // Match by parent template ID or same title (for direct completion cases)
      const matchesTemplate = t.parentTaskId === templateKey || 
                              (t.title === template.title && t.isRecurring === false);
      
      return isForToday && matchesTemplate;
    });
    
    console.log(`Found ${allTodaysTasks.length} tasks for template ${template.title} today:`, 
      allTodaysTasks.map(t => `${t.id} (completed: ${t.completed})`));
    
    // Find specifically failed tasks
    const failedTask = allTodaysTasks.find(t => t.title.startsWith('FAILED:'));
    
    // Find specifically completed tasks
    const completedTask = allTodaysTasks.find(t => t.completed === true);
    
    // Regular instance (not completed, not failed)
    const regularTask = allTodaysTasks.find(t => !t.completed && !t.title.startsWith('FAILED:'));
    
    if (failedTask) {
      console.log(`Found failed task for template ${template.title} today: ${failedTask.id}`);
      setIsFailed(true);
      setHasInstance(true);
      setCompletedTaskId(failedTask.id);
    } else if (completedTask) {
      console.log(`Found completed task for template ${template.title} today: ${completedTask.id}`);
      setHasInstance(true);
      setIsCompleted(true);
      setIsFailed(false);
      setCompletedTaskId(completedTask.id);
    } else if (regularTask) {
      console.log(`Found existing task for template ${template.title} today: ${regularTask.id}`);
      setHasInstance(true);
      setIsCompleted(false);
      setIsFailed(false);
      setCompletedTaskId(regularTask.id);
    } else {
      // No tasks found for today
      console.log(`No tasks found for template ${template.title} today`);
      setHasInstance(false);
      setIsCompleted(false);
      setIsFailed(false);
      setCompletedTaskId(null);
    }
  }, [tasks, templateKey, today, isCreatingTask, template.title]);
  
 
  
  // Function to create and immediately complete a task
  const handleCreateAndComplete = () => {
    if (isCompleted) {
      console.log(`Task is already completed, skipping`);
      return;
    }
    
    try {
      setIsCreatingTask(true);
      console.log(`Creating and completing task "${template.title}" from template ${template.id}`);
      
      // For creation time, use 12:01 AM of the current day (for better time tracking)
      const creationISOString = getDayStartDateString();
      
      // For completion time, use the exact current time
      const completionISOString = getLocalISOString();
      
      // Create new task based on the template
      const newTask: Task = {
        id: uuidv4(),
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        completed: false, // Will be marked as completed after creation
        createdAt: creationISOString, // Using 12:01 AM for recurring tasks
        xpReward: template.xpReward,
        isRecurring: false, // Instance is not itself recurring
        parentTaskId: template.id, // Keep reference to parent template
        questType: template.questType,
        questStatus: 'active'
      };
      
      // Add new task to tasks list but don't save yet
      const updatedTasks = [...tasks, newTask];
      saveTasks(updatedTasks);
      
      // Store the new task ID (need to wait for state to update)
      const newTaskId = newTask.id;
      
      console.log(`Created task with ID: ${newTaskId}, now completing with creation time ${creationISOString} and completion time will be set to current time`);
      
      // Wait for the task to be saved then complete it
      setTimeout(() => {
        completeTask(newTaskId);
        
        // Also verify the task has been updated with completedAt timestamp
        setTimeout(() => {
          // Get latest tasks and check if our task has completedAt set
          const currentTasks = getTasks();
          const completedTask = currentTasks.find((t: Task) => t.id === newTaskId);
          
          if (completedTask && !completedTask.completedAt) {
            console.error(`Task ${newTaskId} was completed but has no completedAt timestamp!`, completedTask);
            
            // Fix the task manually if needed
            const fixedTask: Task = {
              ...completedTask,
              completedAt: getLocalISOString(),
              questStatus: 'completed' as const // Explicitly type as QuestStatus
            };
            
            // Update the task in storage
            const updatedTasks = currentTasks.map((t: Task) => t.id === newTaskId ? fixedTask : t);
            saveTasksUtil(updatedTasks);
            console.log(`Fixed missing completedAt timestamp for task ${newTaskId}`);
          } else {
            console.log(`Task ${newTaskId} completion verified:`, completedTask);
          }
        }, 200);
        
        // Update UI state immediately to reflect completion
        setIsCompleted(true);
        setIsCreatingTask(false);
        setHasInstance(true);
        setCompletedTaskId(newTaskId);
        
        // Log the completion for debugging
        console.log(`Completed task ${newTaskId}, set isCompleted to true.`);
      }, 100);
    } catch (error) {
      console.error('Error creating and completing task:', error);
      setIsCreatingTask(false);
    }
  };
  
  // Get the status info
  const getStatusInfo = () => {
    // Check if we have a task instance with the correct ID
    const taskInstance = tasks.find(t => t.id === completedTaskId);
    
    if (isFailed) {
      return {
        text: 'Failed',
        classes: 'bg-amber-900/50 text-amber-300 border-amber-600'
      };
    } else if (isCompleted || (taskInstance && taskInstance.completed)) {
      return {
        text: 'Completed',
        classes: 'bg-green-900/50 text-green-300 border-green-600'
      };
    } else if (taskInstance && taskInstance.questStatus === 'hidden') {
      return {
        text: 'Hidden',
        classes: 'bg-gray-900/50 text-gray-300 border-gray-600'
      };
    } else {
      // Default to Active for non-completed, non-failed, non-hidden tasks
      return {
        text: 'Active',
        classes: 'bg-blue-900/50 text-blue-300 border-blue-600'
      };
    }
  };
  
  // Function to manually mark a task as failed
  const handleMarkAsFailed = () => {
    if (isCompleted) {
      console.log(`Task is already completed, can't mark as failed`);
      return;
    }
    
    console.log(`Marking task "${template.title}" as failed`);
    failRecurringTask(template);
    
    // Update UI state to reflect the task was marked as failed
    setIsFailed(true);
    setHasInstance(true);
    setCompletedTaskId(template.id); // Set the completed task ID to help with status checks
  };
  
  // Skip templates that don't apply to today
  if (!template.recurringDays?.includes(dayOfWeek as DayOfWeek)) {
    return null;
  }
  
  const statusInfo = getStatusInfo();
  
  // Get quest type colors for category display
  const questTypeColors: Record<string, string> = {
    health: 'bg-green-900/50 text-green-300',
    productivity: 'bg-yellow-900/50 text-yellow-300',
    personal: 'bg-purple-900/50 text-purple-300',
    home: 'bg-orange-900/50 text-orange-300',
    tech: 'bg-indigo-900/50 text-indigo-300',
    social: 'bg-pink-900/50 text-pink-300'
  };
  
  // Get category display class
  const getCategoryClass = () => {
    const category = template.questType?.toLowerCase() || "none";
    return questTypeColors[category] || 'bg-gray-700/50 text-gray-300';
  };
  
  // Calculate display date - today's date for new, or from the task if it exists
  const displayDate = isCompleted || isFailed 
    ? formatDate(tasks.find(t => t.id === completedTaskId)?.completedAt) 
    : formatDate(new Date().toISOString()); // Use current date in ISO format instead of 'today' string
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 mb-3 rounded-md border ${statusInfo.classes}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-mono flex items-center">
              <span className={`${difficultyColors[template.difficulty]}`}>{template.title.replace('FAILED: ', '')}</span>
              <span className="ml-2 text-xs text-gray-400">
                <ArrowPathIcon className="w-3 h-3 inline-block mr-1" />
                {formattedDayOfWeek}
              </span>
              <span className={`ml-2 text-xs font-bold ${statusInfo.classes.split(' ')[1]} border border-current px-2 py-0.5 rounded`}>
                {statusInfo.text}
              </span>
            </h3>
          </div>
          
          <p className="text-sm text-gray-400 mt-1">
            {template.description || 'No description'}
          </p>
          
          <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center">
            <span className={difficultyColors[template.difficulty]}>
              {template.difficulty.toUpperCase()}
            </span>
            <span className="ml-2 text-purple-400">+{template.xpReward} XP</span>
            <span className="ml-2 text-gray-400 flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {displayDate}
            </span>
            {/* Display quest type if available */}
            {template.questType && template.questType !== "No Type" && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getCategoryClass()}`}>
                {template.questType.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Don't show any buttons if the task is failed or completed */}
        {!isFailed && !isCompleted && (
          <div className="flex space-x-2">
            <button
              onClick={handleCreateAndComplete}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Complete task"
              title="Mark as completed"
              disabled={isCreatingTask}
            >
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </button>
            
            <button
              onClick={handleMarkAsFailed}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Mark as failed"
              title="Mark as failed (lose XP)"
              disabled={isCreatingTask}
            >
              <ExclamationCircleIcon className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
} 
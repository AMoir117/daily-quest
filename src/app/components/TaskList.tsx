'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, TrashIcon, PencilIcon, ArrowUturnLeftIcon, ClipboardDocumentIcon, CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';
import { Task } from '../types';
import { getDayOfWeek, getLocalDateString } from '../utils/storageUtils';
import { v4 as uuidv4 } from 'uuid';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onUndo?: (taskId: string) => void;
  onCopy?: (taskId: string) => void;
}

function TaskItem({ task, onEdit, onUndo, onCopy }: TaskItemProps) {
  const { completeTask, deleteTask, tasks } = useQuest();
  
  // Find parent template for daily instances
  const parentTemplate = task.parentTaskId ? 
    tasks.find(t => t.id === task.parentTaskId) : 
    undefined;
  
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
  
  // Determine border color based on task type and difficulty
  const getBorderClass = () => {
    if (isRecurringTemplate) return 'border-blue-700 bg-gray-800/90';
    if (isDailyInstance) return `${difficultyBorders[task.difficulty]} bg-gray-800`;
    return `${difficultyBorders[task.difficulty]} bg-gray-800`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 mb-3 rounded-md border ${getBorderClass()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {/* For recurring templates and regular tasks, show title normally */}
            {(!isDailyInstance || task.completed) && (
              <h3 className={`text-lg font-mono ${task.completed && !isDailyInstance ? 'line-through opacity-60' : ''}`}>
                {task.title}
                {task.completed && isDailyInstance && (
                  <span className="ml-2 text-green-500 font-bold no-underline not-italic">COMPLETED</span>
                )}
              </h3>
            )}
            
            {/* For daily instances that are not completed, only show the day */}
            {isDailyInstance && !task.completed && (
              <h3 className="text-lg font-mono flex items-center">
                <span className={`${difficultyColors[task.difficulty]}`}>{task.title}</span>
                <span className="ml-2 text-xs text-gray-400">
                  <ArrowPathIcon className="w-3 h-3 inline-block mr-1" />
                  {formattedDayOfWeek}
                </span>
              </h3>
            )}
            
            {isRecurringTemplate && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-700 text-white rounded-full flex items-center">
                <ArrowPathIcon className="w-3 h-3 mr-1" />
                Recurring
              </span>
            )}
          </div>
          {task.description && (
            <p className={`text-sm text-gray-400 mt-1 font-mono ${task.completed ? 'opacity-60' : ''}`}>
              {task.description}
            </p>
          )}
          <div className={`flex items-center mt-2 text-xs ${task.completed ? 'opacity-60' : ''}`}>
            <span className={`${difficultyColors[task.difficulty]} mr-2 font-mono`}>
              {task.difficulty.toUpperCase()}
            </span>
            <span className="text-purple-400 font-mono mr-2">+{task.xpReward} XP</span>
            <span className="text-gray-400 font-mono flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {displayDate}
              {task.completed ? ' (completed)' : ' (created)'}
            </span>
            {isRecurringTemplate && task.recurringDays && (
              <span className="ml-2 text-blue-400 font-mono">
                {task.recurringDays.map(day => day.slice(0, 3)).join(', ')}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!task.completed ? (
            <>
              {/* Only show edit button for non-child tasks */}
              {!task.parentTaskId && (
                <button
                  onClick={() => {
                    // If this is a recurring instance, edit the parent template
                    if (isDailyInstance && parentTemplate) {
                      onEdit(parentTemplate);
                    } else {
                      onEdit(task);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Edit task"
                  title={isDailyInstance ? "Edit recurring template" : "Edit task"}
                >
                  <PencilIcon className="w-5 h-5 text-blue-400" />
                </button>
              )}
              
              {/* Only show complete button for non-recurring templates */}
              {!isRecurringTemplate && (
                <button
                  onClick={() => completeTask(task.id)}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Complete task"
                >
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                </button>
              )}
              
              {/* Only show delete button for non-child tasks */}
              {!task.parentTaskId && (
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Delete task"
                >
                  <TrashIcon className="w-5 h-5 text-red-400" />
                </button>
              )}
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
  const { tasks, undoTask, copyTask} = useQuest();
  
  // Filter tasks based on completion status
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  
  // Organize active tasks to avoid duplicates in the UI
  const organizedActiveTasks = React.useMemo(() => {
    // Get today's date for filtering
    const today = getLocalDateString();
    
    // First, separate recurring templates and daily instances
    const templates = activeTasks.filter(task => task.isRecurring);
    const dailyInstances = activeTasks.filter(task => task.parentTaskId);
    const regularTasks = activeTasks.filter(task => !task.isRecurring && !task.parentTaskId);
    
    // Find completed instances from today to avoid showing new instances 
    // if a task has already been completed today
    const completedTodayInstances = completedTasks.filter(task => 
      task.parentTaskId && 
      task.completedAt && 
      task.completedAt.startsWith(today)
    );
    
    // Get all parent IDs of completed tasks for today to filter templates
    const completedParentIds = completedTodayInstances.map(task => task.parentTaskId);
    
    // For each template, find its daily instance if it exists
    const templatesWithInstances = templates.map(template => {
      // Check if a completed instance exists for this template today
      const hasCompletedTodayInstance = completedParentIds.includes(template.id);
      
      // Only include active instances if there's no completed instance today
      const instance = !hasCompletedTodayInstance ? 
        dailyInstances.find(task => task.parentTaskId === template.id && !task.completed) : 
        undefined;
      
      return {
        template,
        instance,
        hasCompletedTodayInstance
      };
    });
    
    // Find daily instances without templates (rare case)
    // Also exclude instances that have completed counterparts today
    const orphanedInstances = dailyInstances.filter(
      instance => 
        !templates.some(template => template.id === instance.parentTaskId) &&
        !completedTodayInstances.some(completed => 
          completed.parentTaskId === instance.parentTaskId
        )
    );
    
    // Only keep templates that are for today's day of week
    const currentDayOfWeek = getDayOfWeek(new Date());
    const relevantTemplates = templates.filter(template => 
      template.recurringDays?.includes(currentDayOfWeek)
    );
    
    // Find active instances for today that are not completed already
    const todayInstancesRaw = dailyInstances.filter(instance => {
      // Must have a parent template
      if (!instance.parentTaskId) return false;
      
      // Must not be completed
      if (instance.completed) return false;
      
      // Check if created today
      const forToday = true; // We'll show all instances regardless of creation date
      
      // Keep all non-completed instances for today's templates
      return forToday;
    });
    
    // Deduplicate - for each parent template, only keep the first instance
    const todayInstances = todayInstancesRaw.reduce((unique: Task[], instance) => {
      // Only add if we don't already have an instance with the same parent
      if (!unique.some(task => task.parentTaskId === instance.parentTaskId)) {
        unique.push(instance);
      }
      return unique;
    }, []);
    
    return {
      templatesWithInstances,
      regularTasks,
      orphanedInstances,
      relevantTemplates,
      todayInstances
    };
  }, [activeTasks, completedTasks]);
  
  
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
          {/* Regular tasks */}
          {organizedActiveTasks.regularTasks.map(task => (
            <TaskItem key={task.id} task={task} onEdit={onEditTask} />
          ))}
          
          {/* Recurring Tasks Section */}
          {(organizedActiveTasks.todayInstances.length > 0 || organizedActiveTasks.relevantTemplates.length > 0) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h3 className="text-lg font-mono text-gray-300">Recurring Quests</h3>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-700 text-white rounded-full">
                    {(() => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return days[new Date().getDay()];
                    })()}
                  </span>
                </div>
              </div>
              
              {/* Instances for today (children of recurring tasks) */}
              <div className="ml-4 border-l-2 border-gray-700 pl-4">
                {/* If we have today's active instances, show them */}
                {organizedActiveTasks.todayInstances.length > 0 ? (
                  organizedActiveTasks.todayInstances.map(instance => (
                    <TaskItem key={instance.id} task={instance} onEdit={onEditTask} />
                  ))
                ) : null}
                
                {/* Always show RecurringInstanceItem components for relevant templates */}
                {organizedActiveTasks.relevantTemplates
                  .filter(template => 
                    // Filter out templates that already have an active instance shown above
                    !organizedActiveTasks.todayInstances.some(
                      instance => instance.parentTaskId === template.id
                    )
                  )
                  .map(template => (
                    <RecurringInstanceItem 
                      key={template.id} 
                      template={template} 
                    />
                  ))
                }
                
                {/* Show message if no tasks are available */}
                {organizedActiveTasks.todayInstances.length === 0 && 
                 organizedActiveTasks.relevantTemplates.length === 0 && (
                  <div className="text-sm text-gray-400 font-mono p-4">
                    No recurring quests for {(() => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return days[new Date().getDay()];
                    })()}. Add some in the &quot;Manage Recurring Templates&quot; section.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Recurring Templates Management Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-mono text-gray-300">Manage Recurring Templates</h3>
              <button 
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded font-mono"
                onClick={() => {
                  // For now this just toggles visibility; we'll handle it with state
                  const section = document.getElementById('recurring-templates-section');
                  if (section) {
                    section.classList.toggle('hidden');
                  }
                }}
              >
                Show/Hide
              </button>
            </div>
            
            <div id="recurring-templates-section" className="hidden mt-2">
              <div className="ml-4 border-l-2 border-gray-700 pl-4">
                {/* Show all recurring templates for management - ensure no duplicates */}
                {Array.from(new Set(activeTasks.filter(task => task.isRecurring).map(t => t.id)))
                  .map(id => activeTasks.find(task => task.id === id))
                  .filter(Boolean)
                  .map(template => (
                    template && <TaskItem key={template.id} task={template} onEdit={onEditTask} />
                  ))
                }
                
                {activeTasks.filter(task => task.isRecurring).length === 0 && (
                  <p className="text-sm text-gray-400 font-mono">No recurring templates yet. Create one by checking &quot;Make this a recurring quest&quot; when adding a new quest.</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Orphaned instances (rare case) */}
          {organizedActiveTasks.orphanedInstances.map(task => (
            <TaskItem key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      )}
      
      {showCompleted && completedTasks.length > 0 && (
        <div>
          {/* Group completed recurring tasks - remove the condition to ensure all completed tasks with parentTaskId show up */}
          <div className="mb-4" id="completed-quests-section">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-mono text-gray-300">Recurring Quests</h3>
            </div>
            
            <div className="ml-4 border-l-2 border-gray-700 pl-4">
              {/* Show all completed recurring task instances without any filtering, sorted by completion time */}
              {(() => {
                // Debug block to identify why tasks might not be showing
                const recurringCompleted = completedTasks.filter(task => {
                  const hasParent = !!task.parentTaskId;
                  console.log(`Task ${task.id}: parentTaskId=${task.parentTaskId}, considered recurring: ${hasParent}`);
                  return hasParent;
                });
                console.log("Completed recurring tasks:", recurringCompleted);
                
                if (recurringCompleted.length === 0) {
                  console.log("No recurring completed tasks found in the list");
                }
                
                return recurringCompleted
                  .sort((a, b) => {
                    // Sort by completion time, newest first
                    if (!a.completedAt || !b.completedAt) return 0;
                    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
                  })
                  .map(task => (
                    <TaskItem 
                      key={`completed-${task.id}`} // More specific key to avoid confusion
                      task={task} 
                      onEdit={onEditTask} 
                      onUndo={undoTask} 
                      onCopy={copyTask}
                    />
                  ));
              })()}
              
              {/* Show message if no completed recurring tasks */}
              {completedTasks.filter(task => task.parentTaskId).length === 0 && (
                <p className="text-sm text-gray-400 font-mono">No completed recurring quests yet.</p>
              )}
            </div>
          </div>
          
          {/* Completed regular tasks */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-mono text-gray-300">Regular Quests</h3>
            </div>
            
            {completedTasks.filter(task => !task.parentTaskId && !task.isRecurring).map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={onEditTask} 
                onUndo={undoTask} 
                onCopy={copyTask}
              />
            ))}
            
            {/* Completed recurring templates (usually invisible because we focus on instances) */}
            {completedTasks.filter(task => task.isRecurring).length > 0 && (
              <div className="hidden">
                {completedTasks.filter(task => task.isRecurring).map(task => (
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
        </div>
      )}
    </div>
  );
}

// Component to handle recurring task instances that aren't in the task list yet
function RecurringInstanceItem({ template }: { template: Task }) {
  const { completeTask, saveTasks, tasks } = useQuest();
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  // Add completion pending flag to prevent race conditions
  const [isCompletionPending, setIsCompletionPending] = useState(false);
  
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
  
  // Define difficulty border colors
  const difficultyBorders = {
    easy: 'border-green-500',
    medium: 'border-yellow-500',
    hard: 'border-red-500'
  };
  
  // Check if there's already a completed task for this template today
  useEffect(() => {
    // If completion is pending, don't check for undone tasks yet
    if (isCompletionPending) {
      console.log(`Template ${templateKey}: Skipping undo check because completion is pending`);
      return;
    }
    
    // More precise check with specific template ID
    const completedTask = tasks.find(t => 
      t.completed && 
      t.parentTaskId === templateKey && // Use our stable templateKey to match
      t.completedAt && 
      t.completedAt.startsWith(today)
    );
    
    // If we previously had a completedTaskId but now it's gone or no longer completed,
    // we need to reset the state (this handles the undo case properly)
    const previousTask = completedTaskId ? tasks.find(t => t.id === completedTaskId) : null;
    if (completedTaskId && (!previousTask || !previousTask.completed)) {
      console.log(`Task ${completedTaskId} was undone, resetting state for template ${templateKey}`);
      setIsCompleted(false);
      setCompletedTaskId(null);
      return;
    }
    
    if (completedTask) {
      console.log(`Template ${templateKey} found completed task: ${completedTask.id}`);
      setIsCompleted(true);
      setCompletedTaskId(completedTask.id);
    } else {
      console.log(`Template ${templateKey} has no completed tasks`);
      setIsCompleted(false);
      setCompletedTaskId(null);
    }
  }, [tasks, templateKey, today, completedTaskId, isCompletionPending]); // Add isCompletionPending to dependencies
  
  const handleComplete = () => {
    // Don't allow completing if already completed
    if (isCompleted) {
      console.log(`Task for template ${templateKey} is already completed`);
      return;
    }
    
    console.log("Creating and completing new task for template:", templateKey);
    
    // Set completion pending flag to prevent useEffect from undoing our new task
    setIsCompletionPending(true);
    
    try {
      // Create a proper task instance based on the template with a unique ID
      const newTaskId = uuidv4();
      
      console.log(`Generated new task ID: ${newTaskId} for template: ${templateKey}`);
      
      const newTask: Task = {
        id: newTaskId,
        title: template.title,
        description: template.description || '',
        difficulty: template.difficulty,
        xpReward: template.xpReward,
        completed: false, // Initially not completed, will be marked completed by the completeTask function
        createdAt: new Date().toISOString(),
        completedAt: undefined, // Will be set by completeTask
        isRecurring: false,
        parentTaskId: templateKey // Use our stable templateKey instead of template.id
      };
      
      // First add the task to the tasks array
      const tasksWithNewTask = [...tasks, newTask];
      
      // Visual feedback immediately - even though the task isn't completed yet
      setIsCompleted(true);
      setCompletedTaskId(newTaskId);
      
      // Step 1: Save the new uncompleted task first
      saveTasks(tasksWithNewTask);
      
      console.log(`Added new task ${newTaskId} to task list and saved`);
      
      // Create a small delay to ensure the task is saved before completing it
      setTimeout(() => {
        console.log(`Now completing task ${newTaskId}`);
        
        // Step 2: Now call completeTask which will update the task and handle XP
        completeTask(newTaskId);
        
        // Give more time for the completion process to finish before clearing the pending state
        setTimeout(() => {
          console.log(`Task completion process finished for ${newTaskId}`);
          setIsCompletionPending(false);
        }, 300);
      }, 100);
    } catch (error) {
      console.error('Error in handleComplete:', error);
      // Reset state in case of error
      setIsCompleted(false);
      setCompletedTaskId(null);
      setIsCompletionPending(false);
    }
  };
  
  return (
    <div className={`p-4 mb-3 rounded-md border ${difficultyBorders[template.difficulty]} relative transition-all duration-300 ease-in-out ${
      isCompleted 
        ? 'bg-gray-800/30 opacity-70 filter blur-[1px] pointer-events-none' 
        : 'bg-gray-800 hover:bg-gray-700'
    }`}>
      {/* Overlay "Completed" text on completed tasks - positioned with z-index to ensure visibility */}
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 ease-in-out">
          <span className="text-xl font-mono text-green-500 font-bold tracking-widest bg-gray-900/80 px-4 py-2 rounded-md transform scale-100 transition-transform duration-300">
            COMPLETED
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className={`text-lg font-mono ${difficultyColors[template.difficulty]} flex items-center ${isCompleted ? 'line-through' : ''}`}>
              {template.title}
              <span className="ml-2 text-xs text-gray-400">
                <ArrowPathIcon className="w-3 h-3 inline-block mr-1" />
                {formattedDayOfWeek}
              </span>
            </h3>
          </div>
          
          {template.description && (
            <p className={`text-sm text-gray-400 mt-1 font-mono ${isCompleted ? 'line-through' : ''}`}>
              {template.description}
            </p>
          )}
          
          <div className="flex items-center mt-2 text-xs">
            <span className={`${difficultyColors[template.difficulty]} mr-2 font-mono`}>
              {template.difficulty.toUpperCase()}
            </span>
            <span className="text-purple-400 font-mono mr-2">+{template.xpReward} XP</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {/* Only show complete button for incomplete tasks */}
          {!isCompleted && (
            <button
              onClick={handleComplete}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Complete task"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
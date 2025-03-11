'use client';

import React, { useState } from 'react';
import { Task, TaskDifficulty } from './types';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LevelUpModal from './components/LevelUpModal';
import UserStats from './components/UserStats';
import XPChart from './components/XPChart';
import QuestsChart from './components/QuestsChart';
import ActivityHeatmap from './components/ActivityHeatmap';
import TaskDifficultyChart from './components/TaskDifficultyChart';
import CompletionTimeChart from './components/CompletionTimeChart';
import FailedQuests from './components/FailedTasks';
import QuestSuggestionModal from './components/QuestSuggestionModal';
import ResetDataButton from './components/ResetDataButton';
import SaveLoadButtons from './components/SaveLoadButtons';
import CompletedQuestList from './components/CompletedQuestList';
import { PlusIcon, SparklesIcon, EyeIcon, EyeSlashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useQuest } from './context/QuestContext';


export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showHiddenTasks, setShowHiddenTasks] = useState(false);
  const [showRecurringTemplates, setShowRecurringTemplates] = useState(false);
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };
  
  const handleSelectQuest = (title: string, description: string, difficulty: TaskDifficulty, questType?: string) => {
    console.log("Selected quest with category/type:", questType);
    
    // Make sure quest type is included and correctly set
    const newTask: Task = {
      id: '', // This will be generated when the task is added
      title,
      description,
      difficulty,
      completed: false,
      createdAt: new Date().toISOString(),
      xpReward: 0, // This will be calculated when the task is added
      questType: questType || undefined // Ensure questType is correctly assigned
    };
    
    console.log("Created editingTask with questType:", newTask.questType);
    setEditingTask(newTask);
    setShowForm(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-purple-400">Daily</span>Quest
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="mb-8">
          <UserStats />
        </div>
        {/* Active quests section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <h2 className="text-xl font-mono border-b border-gray-700 pb-2">Active Quests</h2>
            <div className="flex flex-wrap gap-2">
              {!showForm && (
                <>
                  {/* Global action buttons - standardized heights and widths */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <SaveLoadButtons />
                    
                    <button
                      onClick={() => setShowHiddenTasks(!showHiddenTasks)}
                      className="flex items-center justify-center h-8 w-24 text-xs px-2 py-1 bg-gray-700 rounded font-mono hover:bg-gray-600 transition-colors"
                    >
                      {showHiddenTasks ? (
                        <>
                          <EyeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>Hide Hidden</span>
                        </>
                      ) : (
                        <>
                          <EyeSlashIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>Show Hidden</span>
                        </>
                      )}
                    </button>
                    
                    {/* Manage Templates button - fixed width */}
                    <button
                      onClick={() => setShowRecurringTemplates(!showRecurringTemplates)}
                      className="flex items-center justify-center h-8 w-32 text-xs px-2 py-1 bg-gray-700 rounded font-mono hover:bg-gray-600 transition-colors"
                    >
                      <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{showRecurringTemplates ? 'Hide Templates' : 'Show Templates'}</span>
                    </button>
                    
                    {/* Action buttons - consistent height with toggle buttons */}
                    <button
                      onClick={() => setShowSuggestionModal(true)}
                      className="flex items-center justify-center h-8 text-xs px-4 py-1 bg-blue-700 rounded font-mono hover:bg-blue-600 transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>Generate Quest</span>
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center justify-center h-8 text-xs px-4 py-1 bg-purple-700 rounded font-mono hover:bg-purple-600 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>Create Quest</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {showForm && (
            <TaskForm editingTask={editingTask} onCancel={handleCancelForm} />
          )}
          
          <TaskList 
            onEditTask={handleEditTask} 
            showCompleted={false} 
            showHidden={showHiddenTasks}
            showRecurringTemplates={showRecurringTemplates}
          />
        </div>
        
        {/* Visualizations section */}
        <div className="mb-8">
          <h2 className="text-xl font-mono mb-4 border-b border-gray-700 pb-2">Visualizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <XPChart />
            <QuestsChart />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TaskDifficultyChart />
            <CompletionTimeChart />
          </div>
          <ActivityHeatmap />
        </div>
        
        {/* Completed quests section */}
        <div id="completed-quests-section" className="mb-8">
          <h2 className="text-xl font-mono mb-4 border-b border-gray-700 pb-2">Completed Quests</h2>
          <CompletedQuestList 
            onEditTask={handleEditTask} 
            showHidden={showHiddenTasks} 
          />
        </div>
        
        {/* Failed quests section */}
        <FailedQuests />
        
        {/* Reset data button */}
        <ResetDataButton />
      </main>
      
      <LevelUpModal />
      
      <QuestSuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        onSelectQuest={handleSelectQuest}
      />
    </div>
  );
}

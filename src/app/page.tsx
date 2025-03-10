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
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';


export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-mono border-b border-gray-700 pb-2">Active Quests</h2>
            {!showForm && (
              <div className="flex space-x-2">
                <SaveLoadButtons />
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-700 rounded-md font-mono hover:bg-blue-600 transition-colors"
                >
                  <SparklesIcon className="w-5 h-5 mr-1" />
                  Generate Quest
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-purple-700 rounded-md font-mono hover:bg-purple-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-1" />
                  Create Quest
                </button>
              </div>
            )}
          </div>
          
          {showForm && (
            <TaskForm editingTask={editingTask} onCancel={handleCancelForm} />
          )}
          
          <TaskList onEditTask={handleEditTask} showCompleted={false} />
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
          <TaskList onEditTask={handleEditTask} showActive={false} showCompleted={true} />
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

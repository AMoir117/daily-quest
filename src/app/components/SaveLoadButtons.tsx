'use client';

import React from 'react';
import { useQuest } from '../context/QuestContext';
import { saveTasksToFile, loadTasksFromFile } from '../utils/fileUtils';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const SaveLoadButtons: React.FC = () => {
  const { tasks, saveTasks } = useQuest();

  const handleSave = () => {
    saveTasksToFile(tasks);
  };

  const handleLoad = async () => {
    try {
      const loadedTasks = await loadTasksFromFile();
      if (loadedTasks && loadedTasks.length > 0) {
        // Confirm before replacing tasks
        if (window.confirm(`Load ${loadedTasks.length} tasks? This will replace your current tasks.`)) {
          saveTasks(loadedTasks);
          alert(`Successfully loaded ${loadedTasks.length} tasks.`);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      if (error instanceof Error) {
        alert(`Failed to load tasks: ${error.message}`);
      } else {
        alert('Failed to load tasks: Unknown error');
      }
    }
  };

  return (
    <div className="flex space-x-1">
      <button
        onClick={handleSave}
        className="flex items-center px-2 py-2 bg-gray-700 rounded-md font-mono hover:bg-gray-600 transition-colors text-sm"
        title="Save quests to JSON file"
      >
        <ArrowDownTrayIcon className="w-4 h-4 text-blue-400" />
      </button>
      <button
        onClick={handleLoad}
        className="flex items-center px-2 py-2 bg-gray-700 rounded-md font-mono hover:bg-gray-600 transition-colors text-sm"
        title="Load quests from JSON file"
      >
        <ArrowUpTrayIcon className="w-4 h-4 text-purple-400" />
      </button>
    </div>
  );
};

export default SaveLoadButtons; 
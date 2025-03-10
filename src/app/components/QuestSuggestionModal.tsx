'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { 
  QuestSuggestion, 
  getRecurringAndUnexpectedSuggestions,
  QuestCategory
} from '../utils/questSuggestions';
import { TaskDifficulty } from '../types';
import { useQuest } from '../context/QuestContext';

interface QuestSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuest: (title: string, description: string, difficulty: TaskDifficulty, questType?: string) => void;
}

export default function QuestSuggestionModal({
  isOpen,
  onClose,
  onSelectQuest
}: QuestSuggestionModalProps) {
  const [suggestions, setSuggestions] = useState<QuestSuggestion[]>([]);
  const { tasks } = useQuest();
  
  // Get new suggestions when the modal opens
  useEffect(() => {
    if (isOpen) {
      const newSuggestions = getRecurringAndUnexpectedSuggestions(tasks);
      console.log("Generated suggestions:", newSuggestions.map(s => ({ title: s.title, category: s.category })));
      setSuggestions(newSuggestions);
    }
  }, [isOpen, tasks]);
  
  // Get new suggestions
  const refreshSuggestions = () => {
    setSuggestions(getRecurringAndUnexpectedSuggestions(tasks));
  };
  
  // Difficulty color mapping
  const difficultyColors = {
    easy: 'text-green-500 bg-green-900/30',
    medium: 'text-yellow-500 bg-yellow-900/30',
    hard: 'text-red-500 bg-red-900/30'
  };

  // Category label mapping
  const categoryLabels: Record<string, { text: string, classes: string }> = {
    health: { text: 'HEALTH', classes: 'bg-green-900/50 text-green-300' },
    productivity: { text: 'PRODUCTIVITY', classes: 'bg-yellow-900/50 text-yellow-300' },
    personal: { text: 'PERSONAL', classes: 'bg-purple-900/50 text-purple-300' },
    home: { text: 'HOME', classes: 'bg-orange-900/50 text-orange-300' },
    tech: { text: 'TECH', classes: 'bg-indigo-900/50 text-indigo-300' },
    social: { text: 'SOCIAL', classes: 'bg-pink-900/50 text-pink-300' }
  };
  
  // Function to safely get category label
  const getCategoryLabel = (category: QuestCategory | undefined) => {
    if (!category || !categoryLabels[category]) {
      // Default fallback if category is missing or invalid
      return { text: 'TASK', classes: 'bg-gray-900/50 text-gray-300' };
    }
    return categoryLabels[category];
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-mono flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />
                Daily Quests
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Choose a quest to add to your quest log.
            </p>
            
            <div className="space-y-4 mb-6">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-700 rounded-md bg-gray-900 cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => {
                    onSelectQuest(
                      suggestion.title,
                      suggestion.description,
                      suggestion.difficulty,
                      suggestion.category
                    );
                    onClose();
                  }}
                >
                  <h3 className="text-lg font-mono mb-1 flex items-center">
                    {suggestion.title}
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${getCategoryLabel(suggestion.category).classes}`}>
                      {getCategoryLabel(suggestion.category).text}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-400 font-mono mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded font-mono ${
                        difficultyColors[suggestion.difficulty as TaskDifficulty]
                      }`}
                    >
                      {suggestion.difficulty.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={refreshSuggestions}
                className="px-4 py-2 bg-blue-700 rounded-md font-mono hover:bg-blue-600 transition-colors flex items-center"
              >
                <SparklesIcon className="w-4 h-4 mr-1" />
                More Suggestions
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded-md font-mono hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
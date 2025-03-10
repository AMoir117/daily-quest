'use client';

import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface QuestTypeManagerProps {
  questTypes: string[];
  onAddQuestType: (type: string) => void;
}

export default function QuestTypeManager({ 
  questTypes, 
  onAddQuestType
}: QuestTypeManagerProps) {
  const [newQuestType, setNewQuestType] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddType = () => {
    if (newQuestType.trim() && !questTypes.includes(newQuestType.trim().toUpperCase())) {
      onAddQuestType(newQuestType.trim());
      setNewQuestType('');
      setShowInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddType();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewQuestType('');
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-2">
        {!showInput && (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-md hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="w-3 h-3 mr-1" />
            Add Type
          </button>
        )}
      </div>

      {showInput && (
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newQuestType}
            onChange={(e) => setNewQuestType(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter new quest type"
          />
          <button
            type="button"
            onClick={handleAddType}
            className="ml-2 bg-purple-700 px-3 py-2 rounded-md hover:bg-purple-600 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setNewQuestType('');
              setShowInput(false);
            }}
            className="ml-2 bg-gray-700 px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
} 
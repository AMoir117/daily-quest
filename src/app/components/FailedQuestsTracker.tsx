'use client';

import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useQuest } from '../context/QuestContext';

export default function FailedQuestsTracker() {
  const { user } = useQuest();
  
  // Show positive message if there are no failed quests
  if (user.tasksFailed === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center">
          <div className="mr-2">
            <ExclamationCircleIcon className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-sm font-mono text-gray-400">Failed Quests</div>
        </div>
        
        <div className="text-center py-3">
          <div className="text-sm font-mono text-green-400 font-bold flex items-center justify-center">
            <span className="mr-1">🏆</span>
            No failed quests. Great Job!
            <span className="ml-1">🎉</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Show failed quests stats if there are any
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-amber-900/40">
      <div className="flex items-center">
        <div className="mr-2">
          <ExclamationCircleIcon className="w-5 h-5 text-amber-400" />
        </div>
        <div className="text-sm font-mono text-gray-400">Failed Quests</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="bg-gray-800/60 p-3 rounded-lg border border-amber-900/40">
          <div className="flex justify-between items-center">
            <div className="text-sm font-mono text-gray-300">Failed tasks</div>
            <div className="text-lg font-mono text-amber-400 font-bold">{user.tasksFailed}</div>
          </div>
        </div>
        
        <div className="bg-gray-800/60 p-3 rounded-lg border border-amber-900/40">
          <div className="flex justify-between items-center">
            <div className="text-sm font-mono text-gray-300">XP penalty</div>
            <div className="text-lg font-mono text-amber-400 font-bold">-{user.failedXp} XP</div>
          </div>
        </div>
      </div>
    </div>
  );
} 
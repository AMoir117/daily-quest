'use client';

import React, { useState } from 'react';
import { LEVEL_THRESHOLDS } from '../utils/levelUtils';
import { useQuest } from '../context/QuestContext';

export default function LevelProgressionTable() {
  const { user } = useQuest();
  const [showTable, setShowTable] = useState(false);
  
  // Calculate how many levels to show (current level + 10, max 30)
  const maxLevel = Math.min(30, user.level + 10);
  
  // Get the relevant level thresholds
  const relevantThresholds = LEVEL_THRESHOLDS.slice(0, maxLevel);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-mono">Level Progression</h2>
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-3 py-1 rounded-md font-mono text-sm bg-purple-700 hover:bg-purple-600 transition-colors"
        >
          {showTable ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      <p className="text-sm text-gray-400 font-mono mb-4">
        Each level requires more XP than the previous. The formula is: <br />
        <code className="bg-gray-900 px-2 py-1 rounded">XP = 100 × 1.5^(level-1)</code>
      </p>
      
      {showTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left">Level</th>
                <th className="px-4 py-2 text-left">XP Required</th>
                <th className="px-4 py-2 text-left">Total XP</th>
                <th className="px-4 py-2 text-left">XP Increase</th>
              </tr>
            </thead>
            <tbody>
              {relevantThresholds.map((threshold, index) => {
                const prevThreshold = index > 0 ? relevantThresholds[index - 1].xpRequired : 0;
                const xpIncrease = threshold.xpRequired - prevThreshold;
                const isCurrentLevel = user.level === threshold.level;
                
                return (
                  <tr 
                    key={threshold.level} 
                    className={`border-b border-gray-700 ${isCurrentLevel ? 'bg-purple-900/30' : ''}`}
                  >
                    <td className="px-4 py-2">
                      {threshold.level} {isCurrentLevel && '(Current)'}
                    </td>
                    <td className="px-4 py-2">{xpIncrease}</td>
                    <td className="px-4 py-2">{threshold.xpRequired}</td>
                    <td className="px-4 py-2">
                      {index > 0 ? `+${Math.round((xpIncrease / (relevantThresholds[index - 1].xpRequired - (index > 1 ? relevantThresholds[index - 2].xpRequired : 0)) - 1) * 100)}%` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
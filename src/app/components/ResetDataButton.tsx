'use client';

import React, { useState } from 'react';
import { clearStorage } from '../utils/storageUtils';

export default function ResetDataButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleReset = () => {
    clearStorage();
    window.location.reload(); // Reload the page to reflect the changes
  };
  
  return (
    <div className="mt-8 text-center">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-700 rounded-md font-mono hover:bg-red-600 transition-colors text-sm"
        >
          Reset All Data
        </button>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg border border-red-700 inline-block">
          <p className="text-sm font-mono mb-3">
            Are you sure? This will delete all your quests, progress, and stats.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-gray-700 rounded-md font-mono hover:bg-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-700 rounded-md font-mono hover:bg-red-600 transition-colors text-sm"
            >
              Yes, Reset Everything
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
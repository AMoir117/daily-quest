'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuest } from '../context/QuestContext';

export default function LevelUpModal() {
  const { isLevelUp, dismissLevelUp, levelUpData } = useQuest();
  
  return (
    <AnimatePresence>
      {isLevelUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          <div className="absolute inset-0 bg-black bg-opacity-70" onClick={dismissLevelUp} />
          
          <motion.div
            className="bg-gray-800 border-2 border-purple-500 rounded-lg p-8 max-w-md w-full relative z-10 text-center"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <div className="mb-4 text-purple-400 font-mono text-xl">⚔️ LEVEL UP! ⚔️</div>
            
            <h2 className="text-3xl font-bold mb-6 font-mono">
              {levelUpData.oldLevel === levelUpData.newLevel - 1 
                ? `Level ${levelUpData.oldLevel} → Level ${levelUpData.newLevel}`
                : `Level ${levelUpData.oldLevel} → Level ${levelUpData.newLevel} (Jumped ${levelUpData.newLevel - levelUpData.oldLevel} levels!)`
              }
            </h2>
            
            <div className="mb-6 font-mono">
              <p className="text-gray-300">
                Congratulations, brave human! You&apos;ve gained enough experience to reach the next level.
              </p>
              <p className="mt-2 text-gray-300">
                New challenges await you and old ones get easier!
              </p>
            </div>
            
            <motion.div
              className="text-5xl mb-6"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              🏆
            </motion.div>
            
            <button
              onClick={dismissLevelUp}
              className="px-6 py-2 bg-purple-700 rounded-md font-mono hover:bg-purple-600 transition-colors"
            >
              Continue Questing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
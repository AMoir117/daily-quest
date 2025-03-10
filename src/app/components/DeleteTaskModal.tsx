'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Task } from '../types';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  task: Task | null;
}

export default function DeleteTaskModal({
  isOpen,
  onClose,
  onConfirm,
  task
}: DeleteTaskModalProps) {
  if (!task) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Separate backdrop element with immediate appearance */}
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40 pointer-events-auto" 
            onClick={onClose} 
          />
          
          {/* Modal content with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <motion.div
              className="bg-gray-800/95 border-2 border-red-500 rounded-lg p-6 max-w-sm w-full relative text-center shadow-xl pointer-events-auto"
              initial={{ y: 10, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 5, scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <button 
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <div className="mb-3 text-red-400 font-mono text-lg">DELETE QUEST</div>
              
              <h2 className="text-lg font-bold mb-3 font-mono">
                Are you sure?
              </h2>
              
              <div className="mb-4 font-mono">
                <p className="text-gray-300 text-sm">
                  &quot;{task.title}&quot;
                </p>
                {task.description && (
                  <p className="mt-1 text-gray-400 text-xs">
                    {task.description.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
                  </p>
                )}
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-gray-700 rounded-md font-mono hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-red-700 rounded-md font-mono hover:bg-red-600 transition-colors flex items-center text-sm"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
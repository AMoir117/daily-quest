'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskDifficulty, DayOfWeek } from '../types';
import { useQuest } from '../context/QuestContext';
import { XP_REWARDS } from '../utils/levelUtils';
import QuestTypeManager from './QuestTypeManager';

interface TaskFormProps {
  editingTask: Task | null;
  onCancel: () => void;
}

export default function TaskForm({ editingTask, onCancel }: TaskFormProps) {
  const { addTask, editTask, questTypes, addQuestType} = useQuest();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>([]);
  const [selectedQuestType, setSelectedQuestType] = useState<string | undefined>(undefined);
  
  const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // If editing a task, populate the form with its values
  useEffect(() => {
    if (editingTask) {
      console.log("Editing task with questType:", editingTask.questType);
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDifficulty(editingTask.difficulty);
      setIsRecurring(editingTask.isRecurring || false);
      setRecurringDays(editingTask.recurringDays || []);
      setSelectedQuestType(editingTask.questType);
    }
  }, [editingTask]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    if (isRecurring && recurringDays.length === 0) return;
    
    console.log("Submitting form with questType:", selectedQuestType);
    
    if (editingTask && editingTask.id) {
      editTask(
        editingTask.id, 
        title, 
        description, 
        difficulty, 
        isRecurring, 
        isRecurring ? recurringDays : undefined,
        selectedQuestType
      );
    } else {
      addTask(
        title, 
        description, 
        difficulty, 
        isRecurring, 
        isRecurring ? recurringDays : undefined,
        selectedQuestType
      );
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setIsRecurring(false);
    setRecurringDays([]);
    setSelectedQuestType(undefined);
    onCancel();
  };
  
  const toggleDay = (day: DayOfWeek) => {
    if (recurringDays.includes(day)) {
      setRecurringDays(recurringDays.filter(d => d !== day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };
  
  // Determine if this is a new task or editing an existing one
  const isNewTask = !editingTask || !editingTask.id;
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-xl font-mono mb-4 pb-2 border-b border-gray-700">
        {isNewTask ? 'New Quest' : 'Edit Quest'}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-mono mb-2">
          Quest Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Enter quest title"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-mono mb-2">
          Quest Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[80px]"
          placeholder="Enter quest description (optional)"
        />
      </div>
      
      {/* Quest Type Manager */}
      <QuestTypeManager 
        questTypes={questTypes} 
        onAddQuestType={addQuestType} 
      />
      
      {/* Quest Type Selector */}
      <div className="mb-4">
        <label htmlFor="questType" className="block text-sm font-mono mb-2">
          Quest Type
        </label>
        <select
          id="questType"
          value={selectedQuestType || ''}
          onChange={(e) => setSelectedQuestType(e.target.value || undefined)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="">No specific type</option>
          {questTypes.map((type) => (
            <option key={type} value={type}>
              {type.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-mono mb-2">Difficulty (XP Reward)</label>
        <div className="flex space-x-4">
          {(['easy', 'medium', 'hard'] as TaskDifficulty[]).map((diff) => (
            <label key={diff} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value={diff}
                checked={difficulty === diff}
                onChange={() => setDifficulty(diff)}
                className="sr-only"
              />
              <span
                className={`px-3 py-1 rounded-md font-mono text-sm ${
                  difficulty === diff
                    ? diff === 'easy'
                      ? 'bg-green-900 text-green-300'
                      : diff === 'medium'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                    : 'bg-gray-700'
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)} (+{XP_REWARDS[diff]} XP)
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={() => setIsRecurring(!isRecurring)}
            className="sr-only"
          />
          <span
            className={`w-5 h-5 mr-2 flex items-center justify-center rounded border ${
              isRecurring ? 'bg-purple-600 border-purple-600' : 'bg-gray-700 border-gray-600'
            }`}
          >
            {isRecurring && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-sm font-mono">Make this a recurring quest</span>
        </label>
      </div>
      
      {isRecurring && (
        <div className="mb-6 ml-7">
          <label className="block text-sm font-mono mb-2">Days of Week *</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={recurringDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="sr-only"
                />
                <span
                  className={`px-3 py-1 rounded-md font-mono text-sm ${
                    recurringDays.includes(day) ? 'bg-blue-700' : 'bg-gray-700'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              </label>
            ))}
          </div>
          {isRecurring && recurringDays.length === 0 && (
            <p className="text-red-400 text-xs mt-1 font-mono">Please select at least one day</p>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 rounded-md font-mono hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isRecurring && recurringDays.length === 0}
          className={`px-4 py-2 rounded-md font-mono ${
            (isRecurring && recurringDays.length === 0)
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-purple-700 hover:bg-purple-600'
          } transition-colors`}
        >
          {isNewTask ? 'Add Quest' : 'Update Quest'}
        </button>
      </div>
    </form>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useQuest } from '../context/QuestContext';
import { Task, TaskDifficulty } from '../types';
import { getHistory } from '../utils/storageUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TaskDifficultyChart() {
  const { tasks } = useQuest();
  const [chartData, setChartData] = useState<{
    completedCounts: number[];
    totalCounts: number[];
    completionRates: number[];
  }>({
    completedCounts: [0, 0, 0],
    totalCounts: [0, 0, 0],
    completionRates: [0, 0, 0],
  });

  useEffect(() => {
    // Process task data to get difficulty distribution
    const getTaskDifficultyDistribution = (tasks: Task[]) => {
      // Get task history to track uncompleted recurring tasks
      const taskHistory = getHistory();
      
      // Create a set to track recurring task IDs that were not completed
      const uncompletedRecurringTaskIds = new Set<string>();
      
      // Go through history to find uncompleted recurring tasks
      taskHistory.forEach(dayHistory => {
        dayHistory.tasks.forEach(historyTask => {
          // If it's a recurring task instance and wasn't completed
          if (historyTask.parentTaskId && !historyTask.completed) {
            uncompletedRecurringTaskIds.add(historyTask.id);
          }
        });
      });
      
      // Filter out recurring task templates but keep recurring task instances
      // Templates have isRecurring=true, while instances have parentTaskId set
      const filteredTasks = tasks.filter(task => !task.isRecurring || task.parentTaskId);
      
      // Create a virtual list of tasks that includes current tasks and historical uncompleted recurring tasks
      const virtualTaskList = [...filteredTasks];
      
      // Add uncompleted recurring tasks from history that aren't in the current task list
      // (These are tasks that reset when the day changed)
      taskHistory.forEach(dayHistory => {
        dayHistory.tasks.forEach(historyTask => {
          if (historyTask.parentTaskId && !historyTask.completed && 
              !filteredTasks.some(task => task.id === historyTask.id)) {
            // This is a recurring task that wasn't completed and is no longer in the current task list
            virtualTaskList.push(historyTask);
          }
        });
      });
      
      // Initialize counters for each difficulty
      const difficulties: TaskDifficulty[] = ['easy', 'medium', 'hard'];
      const completedByDifficulty = [0, 0, 0];
      const totalByDifficulty = [0, 0, 0];
      
      // Track processed task IDs to avoid counting the same task multiple times
      const processedTaskIds = new Set<string>();
      
      // Count tasks by difficulty
      virtualTaskList.forEach(task => {
        // Skip if we've already processed this task
        if (processedTaskIds.has(task.id)) return;
        processedTaskIds.add(task.id);
        
        const difficultyIndex = difficulties.indexOf(task.difficulty);
        if (difficultyIndex !== -1) {
          totalByDifficulty[difficultyIndex]++;
          
          if (task.completed) {
            completedByDifficulty[difficultyIndex]++;
          }
        }
      });
      
      // Calculate completion rates
      const completionRates = difficulties.map((_, index) => 
        totalByDifficulty[index] ? (completedByDifficulty[index] / totalByDifficulty[index]) * 100 : 0
      );
      
      return {
        completedCounts: completedByDifficulty,
        totalCounts: totalByDifficulty,
        completionRates
      };
    };

    setChartData(getTaskDifficultyDistribution(tasks));
  }, [tasks]);

  // Prepare data for the horizontal bar chart
  const barData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Completed',
        data: chartData.completedCounts,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // green-500
          'rgba(249, 115, 22, 0.8)', // orange-500
          'rgba(239, 68, 68, 0.8)',  // red-500
        ],
        borderColor: [
          'rgb(34, 197, 94)', // green-500
          'rgb(249, 115, 22)', // orange-500
          'rgb(239, 68, 68)', // red-500
        ],
        borderWidth: 1,
      },
      {
        label: 'Incomplete',
        data: chartData.totalCounts.map((total, index) => total - chartData.completedCounts[index]),
        backgroundColor: 'rgba(75, 85, 99, 0.5)', // gray-600
        borderColor: 'rgb(75, 85, 99)', // gray-600
        borderWidth: 1,
      }
    ],
  };

  // Chart options
  const options = {
    indexAxis: 'y' as const, // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // Subtle grid lines
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)', // White text
          font: {
            family: 'monospace'
          }
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false, // No horizontal grid lines
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)', // White text
          font: {
            family: 'monospace'
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'monospace'
          },
          color: 'white'
        }
      },
      title: {
        display: false, // Hide title, we'll use our own
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
          footer: function(tooltipItems: any) {
            const index = tooltipItems[0].dataIndex;
            const total = chartData.totalCounts[index];
            const completed = chartData.completedCounts[index];
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            return `Completion Rate: ${rate}%`;
          }
        }
      }
    },
  };

  // If there are no tasks (excluding recurring templates), show a message
  if (tasks.filter(task => !task.isRecurring || task.parentTaskId).length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Complete quests to see difficulty distribution!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-xl font-mono mb-4">Task Difficulty Distribution</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Horizontal bar chart */}
        <div className="h-48">
          <Bar data={barData} options={options} />
        </div>
        
        {/* Completion rate stats */}
        <div className="grid grid-cols-3 gap-2">
          {['easy', 'medium', 'hard'].map((difficulty, index) => (
            <div key={difficulty} className="text-center">
              <div className={`text-sm font-bold ${
                difficulty === 'easy' ? 'text-green-500' : 
                difficulty === 'medium' ? 'text-orange-500' : 'text-red-500'
              } font-mono`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {chartData.completedCounts[index]}/{chartData.totalCounts[index]} 
                ({chartData.totalCounts[index] > 0 
                  ? Math.round((chartData.completedCounts[index] / chartData.totalCounts[index]) * 100) 
                  : 0}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
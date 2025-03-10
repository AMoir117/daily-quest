'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useQuest } from '../context/QuestContext';
import { TaskDifficulty } from '../types';
import { getFailedTasks } from '../utils/storageUtils';

// Register Chart.js components
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
}

// Only attempt to render the chart on the client side
function safeChartRender(chartData: ChartData<'bar'>, options: ChartOptions<'bar'>) {
  try {
    return <Bar options={options} data={chartData} />;
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <div className="text-red-500 font-mono p-4 h-full flex items-center justify-center">
        Error rendering chart. Please try refreshing the page.
      </div>
    );
  }
}

export default function TaskDifficultyChart() {
  const { tasks, user } = useQuest();
  const [chartData, setChartData] = useState<{
    completedCounts: number[];
    failedCounts: number[];
    totalCounts: number[];
    completionRates: number[];
    failureRates: number[];
  }>({
    completedCounts: [0, 0, 0],
    failedCounts: [0, 0, 0],
    totalCounts: [0, 0, 0],
    completionRates: [0, 0, 0],
    failureRates: [0, 0, 0],
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip if SSR (server-side rendering)
    if (typeof window === 'undefined') return;
    
    // Process task data to get difficulty distribution
    const getTaskDifficultyDistribution = () => {
      // Get task history and failed tasks
      const failedTasksList = getFailedTasks();
      
      // Filter out recurring task templates but keep recurring task instances
      // Templates have isRecurring=true, while instances have parentTaskId set
      const filteredTasks = tasks.filter(task => !task.isRecurring || task.parentTaskId);
      
      // Create a virtual list of tasks that includes current tasks
      const virtualTaskList = [...filteredTasks];
      
      // Initialize counters for each difficulty
      const difficulties: TaskDifficulty[] = ['easy', 'medium', 'hard'];
      const completedByDifficulty = [0, 0, 0];
      const failedByDifficulty = [0, 0, 0];
      const totalByDifficulty = [0, 0, 0];
      
      // Track processed task IDs to avoid counting the same task multiple times
      const processedTaskIds = new Set<string>();
      
      // Count completed tasks by difficulty
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
      
      // Count failed tasks by difficulty
      failedTasksList.forEach(task => {
        const difficultyIndex = difficulties.indexOf(task.difficulty);
        if (difficultyIndex !== -1) {
          // Only increment total if this task wasn't already counted
          if (!processedTaskIds.has(task.id)) {
            totalByDifficulty[difficultyIndex]++;
            processedTaskIds.add(task.id);
          }
          
          failedByDifficulty[difficultyIndex]++;
        }
      });
      
      // Calculate completion and failure rates
      const completionRates = difficulties.map((_, index) => 
        totalByDifficulty[index] ? (completedByDifficulty[index] / totalByDifficulty[index]) * 100 : 0
      );
      
      const failureRates = difficulties.map((_, index) => 
        totalByDifficulty[index] ? (failedByDifficulty[index] / totalByDifficulty[index]) * 100 : 0
      );
      
      return {
        completedCounts: completedByDifficulty,
        failedCounts: failedByDifficulty,
        totalCounts: totalByDifficulty,
        completionRates,
        failureRates
      };
    };

    setChartData(getTaskDifficultyDistribution());
  }, [tasks, user.tasksFailed]); // Also update when tasksFailed count changes

  // Prepare data for the horizontal bar chart
  const barData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Completed',
        data: chartData.completedCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // green-500 - consistent color for completed
        borderColor: 'rgb(34, 197, 94)', // green-500
        borderWidth: 1,
      },
      {
        label: 'Failed',
        data: chartData.failedCounts,
        backgroundColor: 'rgba(251, 191, 36, 0.7)', // amber-500
        borderColor: 'rgb(251, 191, 36)', // amber-500
        borderWidth: 1,
      }
    ],
  };

  // Chart options
  const options: ChartOptions<'bar'> = {
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
          label: function(tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw as number;
            return `${label}: ${value}`;
          },
          footer: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const total = chartData.totalCounts[index];
            const completed = chartData.completedCounts[index];
            const failed = chartData.failedCounts[index];
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            const failureRate = total > 0 ? Math.round((failed / total) * 100) : 0;
            return [
              `Completion Rate: ${completionRate}%`,
              `Failure Rate: ${failureRate}%`
            ];
          }
        }
      }
    },
  };

  // If there are no tasks (excluding recurring templates), show a message
  if (!isClient) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Loading difficulty distribution...</p>
      </div>
    );
  }
  
  if (tasks.filter(task => !task.isRecurring || task.parentTaskId).length === 0 && chartData.failedCounts.every(count => count === 0)) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Complete quests to see difficulty distribution!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-mono mb-4">Task Difficulty Distribution</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Horizontal bar chart */}
        <div className="h-48">
          {safeChartRender(barData, options)}
        </div>
        
        {/* Completion rate stats */}
        <div className="grid grid-cols-3 gap-2">
          {['easy', 'medium', 'hard'].map((difficulty, index) => {
            // Calculate the total of completed and failed tasks for this difficulty
            const completedCount = chartData.completedCounts[index];
            const failedCount = chartData.failedCounts[index];
            const relevantTotal = completedCount + failedCount;
            
            // Calculate percentages based only on completed and failed tasks
            const completedPercentage = relevantTotal > 0 
              ? Math.round((completedCount / relevantTotal) * 100) 
              : 0;
            
            const failedPercentage = relevantTotal > 0 
              ? Math.round((failedCount / relevantTotal) * 100) 
              : 0;
            
            return (
              <div key={difficulty} className="text-center">
                <div className="text-sm font-bold text-white font-mono">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </div>
                <div className="text-xs text-green-500 font-mono">
                  Completed: {completedCount}
                  ({completedPercentage}%)
                </div>
                <div className="text-xs text-amber-400 font-mono">
                  Failed: {failedCount}
                  ({failedPercentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
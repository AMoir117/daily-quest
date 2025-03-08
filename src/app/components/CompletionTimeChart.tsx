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
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useQuest } from '../context/QuestContext';
import { Task } from '../types';

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
function safeChartRender(chartData: any, options: ChartOptions<'bar'>) {
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

export default function CompletionTimeChart() {
  const { tasks } = useQuest();
  const [hourlyData, setHourlyData] = useState<number[]>(Array(24).fill(0));
  const [productiveRange, setProductiveRange] = useState<{start: number, end: number} | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip if SSR (server-side rendering)
    if (typeof window === 'undefined') return;
    
    // Process task data to extract completion times
    const getCompletionTimeDistribution = (tasks: Task[]) => {
      // Initialize an array with 24 zeros (one for each hour)
      const hourlyDistribution = Array(24).fill(0);
      
      // Count completions by hour
      tasks.forEach(task => {
        if (task.completed && task.completedAt) {
          try {
            const completionDate = new Date(task.completedAt);
            const hour = completionDate.getHours();
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
              hourlyDistribution[hour]++;
            }
          } catch (error) {
            console.error('Error parsing date:', error);
          }
        }
      });
      
      // Find the maximum value for scaling (not used but kept for future reference)
      const max = Math.max(...hourlyDistribution);
      
      // Find the most productive 3-hour range
      let maxSum = 0;
      let startHour = 0;
      
      // Check each possible 3-hour window
      for (let i = 0; i < 24; i++) {
        // Calculate sum for a 3-hour window (wrapping around if needed)
        const sum = hourlyDistribution[i] + 
                   hourlyDistribution[(i + 1) % 24] + 
                   hourlyDistribution[(i + 2) % 24];
        
        if (sum > maxSum) {
          maxSum = sum;
          startHour = i;
        }
      }
      
      // Only set a productive range if we have some data
      const productiveRange = maxSum > 0 
        ? { 
            start: startHour, 
            end: (startHour + 2) % 24 
          } 
        : null;
      
      return {
        hourlyDistribution,
        max,
        productiveRange
      };
    };

    const { hourlyDistribution, productiveRange } = getCompletionTimeDistribution(tasks);
    setHourlyData(hourlyDistribution);
    setProductiveRange(productiveRange);
  }, [tasks]);

  // Format hour for display (e.g., "3 PM", "12 AM")
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Generate labels for all 24 hours
  const hourLabels = Array.from({ length: 24 }, (_, i) => formatHour(i));

  // Get bar colors - using a more appealing color scheme
  const getBarColors = () => {
    // Use a consistent purple theme with varying opacity
    const baseColors = Array(24).fill('').map((_, hour) => {
      // Check if this hour is in the productive range
      const isInProductiveRange = productiveRange && (
        (productiveRange.start <= productiveRange.end && 
         hour >= productiveRange.start && hour <= productiveRange.end) ||
        (productiveRange.start > productiveRange.end && 
         (hour >= productiveRange.start || hour <= productiveRange.end))
      );
      
      // Use a brighter purple for the productive range, darker purple for other hours
      return isInProductiveRange 
        ? 'rgba(147, 51, 234, 0.8)' // Bright purple for productive range
        : 'rgba(79, 70, 229, 0.5)'; // Darker purple for other hours
    });
    
    return baseColors;
  };

  // Prepare data for the bar chart
  const chartData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: hourlyData,
        backgroundColor: getBarColors(),
        borderColor: 'rgba(30, 41, 59, 0.8)', // Dark border for all bars
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // Subtle grid lines
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)', // White text
          font: {
            family: 'monospace'
          },
          callback: function(value, index) {
            // Only show every 3 hours to avoid crowding
            return index % 3 === 0 ? hourLabels[index] : '';
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // Subtle grid lines
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)', // White text
          font: {
            family: 'monospace'
          },
          precision: 0 // Only show whole numbers
        }
      }
    },
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: true,
        text: 'Task Completion Time Distribution',
        color: 'white',
        font: {
          family: 'monospace',
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return `${hourLabels[tooltipItems[0].dataIndex]}`;
          },
          label: function(tooltipItem) {
            const count = tooltipItem.raw as number;
            const label = count === 1 ? 'task completed' : 'tasks completed';
            return `${count} ${label}`;
          }
        }
      }
    },
  };

  // If there are no completed tasks, show a message
  if (!isClient) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Loading productive hours...</p>
      </div>
    );
  }
  
  if (tasks.filter(task => task.completed).length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Complete quests to see your productive hours!</p>
      </div>
    );
  }

  // Format the productive range for display
  const formatProductiveRange = () => {
    if (!productiveRange) return '';
    
    const { start, end } = productiveRange;
    
    // Handle cases where the range wraps around midnight
    if (start > end) {
      return `${formatHour(start)} to ${formatHour(end)} (next day)`;
    }
    
    return `${formatHour(start)} to ${formatHour(end)}`;
  };

  // Calculate total tasks completed in the productive range
  const getProductiveRangeTasks = () => {
    if (!productiveRange) return 0;
    
    const { start, end } = productiveRange;
    let sum = 0;
    
    if (start <= end) {
      // Normal range (e.g., 9 AM to 11 AM)
      for (let i = start; i <= end; i++) {
        sum += hourlyData[i];
      }
    } else {
      // Range wraps around midnight (e.g., 10 PM to 1 AM)
      for (let i = start; i < 24; i++) {
        sum += hourlyData[i];
      }
      for (let i = 0; i <= end; i++) {
        sum += hourlyData[i];
      }
    }
    
    return sum;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-xl font-mono mb-4">Productive Hours</h2>
      
      <div className="h-64">
        {safeChartRender(chartData, options)}
      </div>

      {productiveRange && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400 font-mono">
            Most productive time: <span className="text-purple-400 font-bold">{formatProductiveRange()}</span>
          </p>
          <p className="text-sm text-gray-400 font-mono">
            Tasks completed: <span className="text-purple-400 font-bold">{getProductiveRangeTasks()}</span>
          </p>
        </div>
      )}
    </div>
  );
} 
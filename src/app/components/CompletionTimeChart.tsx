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

export default function CompletionTimeChart() {
  const { tasks } = useQuest();
  const [hourlyData, setHourlyData] = useState<number[]>(Array(24).fill(0));
  const [productiveRange, setProductiveRange] = useState<{start: number, end: number} | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [averageCompletionTimes, setAverageCompletionTimes] = useState<number[]>(Array(24).fill(0));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip if SSR (server-side rendering)
    if (typeof window === 'undefined') return;
    
    // Process task data to extract completion times and durations
    const analyzeTaskProductivity = (tasks: Task[]) => {
      // Initialize arrays for our data
      const hourlyDistribution = Array(24).fill(0);
      const hourlyCompletionTimes: number[][] = Array(24).fill(0).map(() => []);
      const hourlyAverageCompletionTimes = Array(24).fill(0);
      
      // Analyze completed tasks - only filter by completed status
      const completedTasks = tasks.filter(task => task.completed && task.completedAt);
      
      console.log(`Analyzing ${completedTasks.length} completed tasks for productivity patterns`);
      
      completedTasks.forEach(task => {
        try {
          // For the chart, we only need the completion hour
          const completionDate = new Date(task.completedAt!);
          
          // Skip invalid dates
          if (isNaN(completionDate.getTime())) {
            console.warn('Invalid completion date for task:', task.id, task.title);
            return;
          }
          
          const completionHour = completionDate.getHours();
          console.log(`Task "${task.title}" completed at hour ${completionHour}`);
          
          if (completionHour >= 0 && completionHour < 24) {
            // Count the completion in this hour
            hourlyDistribution[completionHour]++;
            
            // If we have a valid creation date, calculate completion time
            if (task.createdAt) {
              const creationDate = new Date(task.createdAt);
              
              if (!isNaN(creationDate.getTime())) {
                // Handle recurring tasks which have 12:01 AM creation time
                let timeToComplete: number;
                
                // If it's a recurring task instance (has parentTaskId) and was created at the beginning of the day
                const isRecurringInstance = !!task.parentTaskId && creationDate.getHours() === 0 && creationDate.getMinutes() <= 1;
                
                if (isRecurringInstance) {
                  // For recurring tasks, use the time since the start of the same day
                  // This avoids showing unrealistically long completion times
                  const sameDayMidnight = new Date(completionDate);
                  sameDayMidnight.setHours(0, 0, 0, 0);
                  timeToComplete = (completionDate.getTime() - sameDayMidnight.getTime()) / (1000 * 60);
                } else {
                  // For regular tasks, calculate actual time between creation and completion
                  timeToComplete = Math.max(0, (completionDate.getTime() - creationDate.getTime()) / (1000 * 60));
                }
                
                // Skip unreasonably long times (more than 24 hours for most tasks)
                // But allow up to 7 days for non-recurring tasks
                const maxTime = isRecurringInstance ? 1440 : 10080; // 24 hours or 7 days
                if (timeToComplete <= maxTime) {
                  console.log(`Task completion time: ${timeToComplete.toFixed(0)} minutes`);
                  hourlyCompletionTimes[completionHour].push(timeToComplete);
                } else {
                  console.log(`Skipping unusually long completion time: ${timeToComplete.toFixed(0)} minutes`);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error analyzing task:', error);
        }
      });
      
      // Calculate average completion time for each hour
      for (let i = 0; i < 24; i++) {
        if (hourlyCompletionTimes[i].length > 0) {
          const sum = hourlyCompletionTimes[i].reduce((acc, time) => acc + time, 0);
          hourlyAverageCompletionTimes[i] = sum / hourlyCompletionTimes[i].length;
        }
      }
      
      // Find the most productive 3-hour range based on number of tasks completed
      let maxTasks = 0;
      let startHour = 0;
      let endHour = 0;
      
      // Check each possible 3-hour window
      for (let i = 0; i < 24; i++) {
        // Calculate tasks in current 3-hour window (handling wrap-around midnight)
        let windowTasks = 0;
        for (let j = 0; j < 3; j++) {
          const hour = (i + j) % 24; // Wrap around midnight if needed
          windowTasks += hourlyDistribution[hour];
        }
        
        if (windowTasks > maxTasks) {
          maxTasks = windowTasks;
          startHour = i;
          endHour = (i + 2) % 24; // End hour is inclusive (so 2 hours after start)
        }
      }
      
      // More detailed logs about most productive time
      console.log(`Most productive time: ${formatHour(startHour)} to ${formatHour(endHour)}`);
      console.log(`Tasks completed during this time: ${maxTasks}`);
      
      return {
        hourlyDistribution,
        hourlyAverageCompletionTimes,
        productiveRange: {
          start: startHour,
          end: endHour
        }
      };
    };

    const { hourlyDistribution, hourlyAverageCompletionTimes, productiveRange } = analyzeTaskProductivity(tasks);
    setHourlyData(hourlyDistribution);
    setAverageCompletionTimes(hourlyAverageCompletionTimes);
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

  // Get average completion time for the productive range (in minutes)
  const getAverageCompletionTime = () => {
    if (!productiveRange) return 0;
    
    const { start, end } = productiveRange;
    let totalTasks = 0;
    let totalTime = 0;
    
    const processHour = (hour: number) => {
      const tasks = hourlyData[hour];
      if (tasks > 0) {
        totalTasks += tasks;
        totalTime += averageCompletionTimes[hour] * tasks;
      }
    };
    
    if (start <= end) {
      // Normal range (e.g., 9 AM to 11 AM)
      for (let i = start; i <= end; i++) {
        processHour(i);
      }
    } else {
      // Range wraps around midnight (e.g., 10 PM to 1 AM)
      for (let i = start; i < 24; i++) {
        processHour(i);
      }
      for (let i = 0; i <= end; i++) {
        processHour(i);
      }
    }
    
    if (totalTasks === 0) return 0;
    return Math.round(totalTime / totalTasks);
  };

  // Format minutes into a readable duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-mono mb-4">Productive Hours</h2>
      
      <div className="h-48">
        {safeChartRender(chartData, options)}
      </div>

      {productiveRange && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400 font-mono">
            Most productive time: <span className="text-purple-400 font-bold">{formatProductiveRange()}</span>
          </p>
          <p className="text-sm text-gray-400 font-mono">
            Tasks completed: <span className="text-purple-400 font-bold">{getProductiveRangeTasks()}</span>
            {getAverageCompletionTime() > 0 && (
              <> • Avg. completion time: <span className="text-purple-400 font-bold">{formatDuration(getAverageCompletionTime())}</span></>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
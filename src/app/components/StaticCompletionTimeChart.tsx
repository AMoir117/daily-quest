'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuest } from '../context/QuestContext';
import { ChartConfiguration } from 'chart.js';

export default function StaticCompletionTimeChart() {
  const { tasks } = useQuest();
  const [chartImagePath, setChartImagePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productiveRange, setProductiveRange] = useState<{start: number, end: number} | null>(null);
  const [productiveRangeTasks, setProductiveRangeTasks] = useState<number>(0);
  
  useEffect(() => {
    async function generateChart() {
      try {
        setIsLoading(true);
        
        // Skip if no completed tasks
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Process task data to extract completion times
        const hourlyDistribution = Array(24).fill(0);
        
        // Count completions by hour
        completedTasks.forEach(task => {
          if (task.completedAt) {
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
        const prodRange = maxSum > 0 
          ? { 
              start: startHour, 
              end: (startHour + 2) % 24 
            } 
          : null;
        
        setProductiveRange(prodRange);
        setProductiveRangeTasks(maxSum);
        
        // Format hour for display (e.g., "3 PM", "12 AM")
        const formatHour = (hour: number) => {
          if (hour === 0) return '12 AM';
          if (hour === 12) return '12 PM';
          return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
        };
        
        // Generate labels for all 24 hours
        const hourLabels = Array.from({ length: 24 }, (_, i) => formatHour(i));
        
        // Prepare chart config
        const chartConfig: ChartConfiguration = {
          type: 'bar',
          data: {
            labels: hourLabels,
            datasets: [
              {
                label: 'Tasks Completed',
                data: hourlyDistribution,
                backgroundColor: hourLabels.map((_, hour) => {
                  // Check if this hour is in the productive range
                  const isInProductiveRange = prodRange && (
                    (prodRange.start <= prodRange.end && 
                     hour >= prodRange.start && hour <= prodRange.end) ||
                    (prodRange.start > prodRange.end && 
                     (hour >= prodRange.start || hour <= prodRange.end))
                  );
                  
                  // Use a brighter purple for the productive range, darker purple for other hours
                  return isInProductiveRange 
                    ? 'rgba(147, 51, 234, 0.8)' // Bright purple for productive range
                    : 'rgba(79, 70, 229, 0.5)'; // Darker purple for other hours
                }),
                borderColor: 'rgba(30, 41, 59, 0.8)', // Dark border for all bars
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                ticks: {
                  callback: function(value, index) {
                    // Only show every 3 hours to avoid crowding
                    return index % 3 === 0 ? hourLabels[index] : '';
                  }
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
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
          }
        };
        
        // Generate a unique filename
        const timestamp = new Date().getTime();
        const filename = `completion-time-chart-${timestamp}.png`;
        
        // Call API to generate chart with larger height for better readability
        const response = await fetch('/api/chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chartConfig,
            filename,
            width: 800,  // Standard width
            height: 500  // Increased height for better readability
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate chart');
        }
        
        const data = await response.json();
        setChartImagePath(data.imagePath);
      } catch (error) {
        console.error('Error generating chart:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    generateChart();
  }, [tasks]);
  
  // Format the productive range for display
  const formatProductiveRange = () => {
    if (!productiveRange) return '';
    
    const { start, end } = productiveRange;
    const formatHour = (hour: number) => {
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    };
    
    // Handle cases where the range wraps around midnight
    if (start > end) {
      return `${formatHour(start)} to ${formatHour(end)} (next day)`;
    }
    
    return `${formatHour(start)} to ${formatHour(end)}`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
        <h2 className="text-xl font-mono mb-4">Productive Hours</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 font-mono">Generating chart...</p>
        </div>
      </div>
    );
  }
  
  // If there are no completed tasks, show a message
  if (tasks.filter(task => task.completed).length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Complete quests to see your productive hours!</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-xl font-mono mb-4">Productive Hours</h2>
      
      <div className="h-80 relative">
        {chartImagePath ? (
          <Image 
            src={chartImagePath} 
            alt="Completion time chart" 
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400 font-mono">No data available</p>
          </div>
        )}
      </div>
      
      {productiveRange && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400 font-mono">
            Most productive time: <span className="text-purple-400 font-bold">{formatProductiveRange()}</span>
          </p>
          <p className="text-sm text-gray-400 font-mono">
            Tasks completed: <span className="text-purple-400 font-bold">{productiveRangeTasks}</span>
          </p>
        </div>
      )}
    </div>
  );
} 
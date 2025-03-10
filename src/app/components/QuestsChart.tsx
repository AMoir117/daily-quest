'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getStats, getLocalDateString } from '../utils/storageUtils';
import { DailyStats } from '../types';
import { useQuest } from '../context/QuestContext';

// Only register Chart.js on the client side
let isChartRegistered = false;

if (typeof window !== 'undefined' && !isChartRegistered) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  isChartRegistered = true;
}

export default function QuestsChart() {
  const { user } = useQuest();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  
  useEffect(() => {
    // Load stats from localStorage
    const loadedStats = getStats();
    
    // Get today's date for filtering
    const today = getLocalDateString();
    
    // Filter out any future dates
    const validStats = loadedStats.filter(stat => {
      return stat.date <= today;
    });
    
    // Sort by date
    const sortedStats = [...validStats].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setStats(sortedStats);
    
    // Mark data as ready after everything is processed
    setIsDataReady(true);
  }, [user.tasksCompleted]); // Re-fetch stats when tasksCompleted changes
  
  // Format date for display (e.g., "Mar 15")
  const formatDate = (dateString: string) => {
    // Handle date strings in YYYY-MM-DD format to prevent timezone issues
    // By appending 'T12:00:00' we set it to noon to avoid any date shifting
    const fullDateString = `${dateString}T12:00:00`;
    const date = new Date(fullDateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Prepare data for charts
  const questsData = {
    labels: stats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'Cumulative Quests',
        data: stats.reduce((acc: number[], stat, index) => {
          // Calculate cumulative sum
          const previousTotal = index > 0 ? acc[index - 1] : 0;
          acc.push(previousTotal + stat.tasksCompleted);
          return acc;
        }, []),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        yAxisID: 'y'
      },
      {
        label: 'Daily Quests',
        data: stats.map(stat => stat.tasksCompleted),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        yAxisID: 'y1',
        borderDash: [5, 5]
      }
    ]
  };
  
  // Options for the quests chart
  const questsOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0 // Disables bezier curves, uses straight lines
      },
      point: {
        radius: 4,
        hitRadius: 10
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'monospace'
          }
        }
      },
      title: {
        display: true,
        text: 'Quests Completed Over Time',
        font: {
          family: 'monospace',
          size: 16
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'monospace'
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cumulative Quests',
          font: {
            family: 'monospace'
          }
        },
        ticks: {
          font: {
            family: 'monospace'
          },
          precision: 0
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Daily Quests',
          font: {
            family: 'monospace'
          }
        },
        ticks: {
          font: {
            family: 'monospace'
          },
          precision: 0
        }
      }
    }
  };
  
  const renderChart = () => {
    if (!isDataReady || stats.length === 0) {
      return <div className="flex items-center justify-center h-full">Loading chart data...</div>;
    }

    try {
      return (
        <div className="h-48">
          <Line options={questsOptions} data={questsData} />
        </div>
      );
    } catch (error) {
      console.error('Error rendering quests chart:', error);
      return <div className="text-red-500">Error rendering chart. Please try refreshing.</div>;
    }
  };
  
  if (stats.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-40 flex items-center justify-center">
        <p className="text-gray-400 font-mono">Complete quests to see your progress over time!</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-mono mb-4">Quests Progress</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {renderChart()}
      </div>
    </div>
  );
} 
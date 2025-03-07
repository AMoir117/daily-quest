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
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getStats } from '../utils/storageUtils';
import { DailyStats } from '../types';
import { useQuest } from '../context/QuestContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Chart options
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
      text: 'XP Gained Over Time',
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
      beginAtZero: true,
      ticks: {
        font: {
          family: 'monospace'
        }
      }
    }
  }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
      text: 'Quests Completed Per Day',
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
      beginAtZero: true,
      ticks: {
        font: {
          family: 'monospace'
        }
      }
    }
  }
};

type ChartType = 'line' | 'bar';

export default function XPChart() {
  const { user } = useQuest();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  
  useEffect(() => {
    // Load stats from localStorage
    const loadedStats = getStats();
    
    // Sort by date
    const sortedStats = [...loadedStats].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setStats(sortedStats);
  }, [user.tasksCompleted]); // Re-fetch stats when tasksCompleted changes
  
  // Format date for display (e.g., "Mar 15")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Prepare data for charts
  const lineData = {
    labels: stats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'XP Gained',
        data: stats.map(stat => stat.xpGained),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0.3
      }
    ]
  };
  
  const barData = {
    labels: stats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'Quests Completed',
        data: stats.map(stat => stat.tasksCompleted),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      }
    ]
  };
  
  if (stats.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-64 flex items-center justify-center mb-6">
        <p className="text-gray-400 font-mono">Complete quests to see your progress over time!</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-mono">Charts</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded-md font-mono text-sm ${
              chartType === 'line' ? 'bg-purple-700' : 'bg-gray-700'
            }`}
          >
            XP Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md font-mono text-sm ${
              chartType === 'bar' ? 'bg-blue-700' : 'bg-gray-700'
            }`}
          >
            Quest Chart
          </button>
        </div>
      </div>
      
      <div className="h-64">
        {chartType === 'line' ? (
          <Line options={lineOptions} data={lineData} />
        ) : (
          <Bar options={barOptions} data={barData} />
        )}
      </div>
    </div>
  );
} 
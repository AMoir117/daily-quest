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
  BarElement,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
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
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  isChartRegistered = true;
}

// Chart options
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0, // Disables bezier curves, uses straight lines
      borderWidth: 2
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
      text: 'XP Progress Over Time',
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
        text: 'Cumulative XP',
        font: {
          family: 'monospace'
        }
      },
      ticks: {
        font: {
          family: 'monospace'
        }
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
        text: 'Daily XP',
        font: {
          family: 'monospace'
        }
      },
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

// XP Velocity Chart options
const velocityOptions = {
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
      text: 'XP Velocity (7-Day Moving Average)',
      font: {
        family: 'monospace',
        size: 16
      }
    },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: function(context: any) {
          return `${context.dataset.label}: ${Math.round(context.raw)} XP/day`;
        }
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
      title: {
        display: true,
        text: 'XP per Day',
        font: {
          family: 'monospace'
        }
      },
      ticks: {
        font: {
          family: 'monospace'
        }
      }
    }
  }
};

type ChartType = 'line' | 'bar' | 'velocity';

export default function XPChart() {
  const { user } = useQuest();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [velocityData, setVelocityData] = useState<number[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  
  useEffect(() => {
    // Load stats from localStorage
    const loadedStats = getStats();
    
    // Get today's date for filtering
    const today = getLocalDateString();
    
    // Filter out any future dates (should not exist, but somehow they do)
    const validStats = loadedStats.filter(stat => {
      return stat.date <= today;
    });
    
    // Sort by date
    const sortedStats = [...validStats].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setStats(sortedStats);
    
    // Calculate velocity data (7-day moving average)
    calculateVelocityData(sortedStats);
    
    // Mark data as ready after everything is processed
    setIsDataReady(true);
  }, [user.tasksCompleted]); // Re-fetch stats when tasksCompleted changes
  
  // Calculate velocity data (7-day moving average)
  const calculateVelocityData = (sortedStats: DailyStats[]) => {
    const windowSize = 7; // 7-day moving average
    const velocityPoints: number[] = [];
    
    // We need at least windowSize days of data to calculate a moving average
    if (sortedStats.length < windowSize) {
      // If we don't have enough data, just use what we have
      const avgXP = sortedStats.reduce((sum, stat) => sum + stat.xpGained, 0) / sortedStats.length;
      velocityPoints.push(avgXP);
    } else {
      // Calculate moving average for each day after the initial window
      for (let i = windowSize - 1; i < sortedStats.length; i++) {
        // Sum the XP gained in the window
        let windowSum = 0;
        for (let j = 0; j < windowSize; j++) {
          windowSum += sortedStats[i - j].xpGained;
        }
        // Calculate the average
        const avgXP = windowSum / windowSize;
        velocityPoints.push(avgXP);
      }
    }
    
    setVelocityData(velocityPoints);
  };
  
  // Format date for display (e.g., "Mar 15")
  const formatDate = (dateString: string) => {
    // Handle date strings in YYYY-MM-DD format to prevent timezone issues
    // By appending 'T12:00:00' we set it to noon to avoid any date shifting
    const fullDateString = `${dateString}T12:00:00`;
    const date = new Date(fullDateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Prepare data for charts
  const lineData = {
    labels: stats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'Cumulative XP',
        data: stats.reduce((acc: number[], stat, index) => {
          // Calculate cumulative sum
          const previousTotal = index > 0 ? acc[index - 1] : 0;
          acc.push(previousTotal + stat.xpGained);
          return acc;
        }, []),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0, // Use straight lines instead of curves
        stepped: false, // Ensure no stepped interpolation
        yAxisID: 'y'
      },
      {
        label: 'Daily XP',
        data: stats.map(stat => stat.xpGained),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0, // Use straight lines instead of curves
        stepped: false, // Ensure no stepped interpolation
        yAxisID: 'y1',
        borderDash: [5, 5]
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
  
  // Prepare velocity chart data
  const velocityChartData = {
    // Use labels starting from the 7th day (or whatever window size we're using)
    labels: stats.slice(Math.min(7, stats.length) - 1).map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'XP Velocity',
        data: velocityData,
        borderColor: 'rgb(234, 88, 12)', // Orange
        backgroundColor: 'rgba(234, 88, 12, 0.5)',
        tension: 0, // Use straight lines instead of curves
        stepped: false, // Ensure no stepped interpolation
        fill: true
      }
    ]
  };
  
  // Render chart based on type
  const renderChart = () => {
    if (!isDataReady || stats.length === 0) {
      return <div className="flex items-center justify-center h-full">Loading chart data...</div>;
    }

    try {
      if (chartType === 'line') {
        return <Line options={lineOptions} data={lineData} />;
      } else if (chartType === 'bar') {
        return <Bar options={barOptions} data={barData} />;
      } else {
        return <Line options={velocityOptions} data={velocityChartData} />;
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return <div className="text-red-500">Error rendering chart. Please try refreshing.</div>;
    }
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
        <h2 className="text-xl font-mono">XP Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded font-mono text-sm ${
              chartType === 'line' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setChartType('velocity')}
            className={`px-3 py-1 rounded font-mono text-sm ${
              chartType === 'velocity' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Velocity
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded font-mono text-sm ${
              chartType === 'bar' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Quests/Day
          </button>
        </div>
      </div>
      <div className="h-80">
        {renderChart()}
      </div>
      
      {chartType === 'velocity' && (
        <div className="mt-4 text-sm text-gray-400 font-mono">
          <p>XP Velocity shows your average daily XP gain over a 7-day period. Higher values indicate increased productivity.</p>
          {velocityData.length > 0 && (
            <p className="mt-2">
              Current velocity: <span className="text-orange-400 font-bold">{Math.round(velocityData[velocityData.length - 1])} XP/day</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
} 
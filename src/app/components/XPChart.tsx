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
        },
        precision: 0 // Only show whole numbers for quest counts
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
  
  // Modified to include cumulative quests
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
  
  // Update quests chart options to include dual Y axes
  const questsOptions = {
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
  
  // Render only the XP chart
  const renderChart = () => {
    if (!isDataReady || stats.length === 0) {
      return <div className="flex items-center justify-center h-full">Loading chart data...</div>;
    }

    try {
      return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-mono">XP Progress</h2>
            <button
              onClick={() => setChartType(chartType === 'velocity' ? 'line' : 'velocity')}
              className="px-3 py-1 rounded font-mono text-sm bg-purple-600 text-white hover:bg-purple-700"
            >
              {chartType === 'velocity' ? 'Show Progress' : 'Show Velocity'}
            </button>
          </div>
          
          <div className="h-48">
            {chartType === 'velocity' ? (
              <Line options={velocityOptions} data={velocityChartData} />
            ) : (
              <Line options={lineOptions} data={lineData} />
            )}
          </div>
          
          {chartType === 'velocity' && velocityData.length > 0 && (
            <div className="mt-4 text-sm text-gray-400 font-mono">
              <p>XP Velocity shows your average daily XP gain over a 7-day period. Higher values indicate increased productivity.</p>
              <p className="mt-2">
                Current velocity: <span className="text-orange-400 font-bold">{Math.round(velocityData[velocityData.length - 1])} XP/day</span>
              </p>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering chart:', error);
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
  
  return renderChart();
} 
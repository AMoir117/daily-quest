'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getStats, getLocalDateString } from '../utils/storageUtils';
import { useQuest } from '../context/QuestContext';
import { ChartConfiguration } from 'chart.js';

export default function StaticXPChart() {
  const { user } = useQuest();
  const [chartImagePath, setChartImagePath] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'velocity'>('line');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function generateChart() {
      try {
        setIsLoading(true);
        
        // Load stats from localStorage
        const loadedStats = getStats();
        const today = getLocalDateString();
        const validStats = loadedStats.filter(stat => stat.date <= today);
        const sortedStats = [...validStats].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        if (sortedStats.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Format dates for display
        const formatDate = (dateString: string) => {
          const fullDateString = `${dateString}T12:00:00`;
          const date = new Date(fullDateString);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        
        // Calculate data based on chart type
        let chartConfig: ChartConfiguration;
        
        if (chartType === 'line') {
          chartConfig = {
            type: 'line',
            data: {
              labels: sortedStats.map(stat => formatDate(stat.date)),
              datasets: [
                {
                  label: 'Cumulative XP',
                  data: sortedStats.reduce((acc: number[], stat, index) => {
                    const previousTotal = index > 0 ? acc[index - 1] : 0;
                    acc.push(previousTotal + stat.xpGained);
                    return acc;
                  }, []),
                  borderColor: 'rgb(147, 51, 234)',
                  backgroundColor: 'rgba(147, 51, 234, 0.5)',
                  tension: 0,
                  yAxisID: 'y',
                },
                {
                  label: 'Daily XP',
                  data: sortedStats.map(stat => stat.xpGained),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  tension: 0,
                  yAxisID: 'y1',
                  borderDash: [5, 5],
                }
              ]
            },
            options: {
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Cumulative XP',
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  beginAtZero: true,
                  grid: {
                    drawOnChartArea: false,
                  },
                  title: {
                    display: true,
                    text: 'Daily XP',
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'XP Progress Over Time',
                }
              }
            }
          };
        } else if (chartType === 'bar') {
          chartConfig = {
            type: 'bar',
            data: {
              labels: sortedStats.map(stat => formatDate(stat.date)),
              datasets: [
                {
                  label: 'Quests Completed',
                  data: sortedStats.map(stat => stat.tasksCompleted),
                  backgroundColor: 'rgba(59, 130, 246, 0.7)'
                }
              ]
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: 'Quests Completed Per Day',
                }
              }
            }
          };
        } else { // velocity
          // Calculate velocity data (7-day moving average)
          const windowSize = 7;
          const velocityData: number[] = [];
          
          if (sortedStats.length < windowSize) {
            const avgXP = sortedStats.reduce((sum, stat) => sum + stat.xpGained, 0) / sortedStats.length;
            velocityData.push(avgXP);
          } else {
            for (let i = windowSize - 1; i < sortedStats.length; i++) {
              let windowSum = 0;
              for (let j = 0; j < windowSize; j++) {
                windowSum += sortedStats[i - j].xpGained;
              }
              const avgXP = windowSum / windowSize;
              velocityData.push(avgXP);
            }
          }
          
          chartConfig = {
            type: 'line',
            data: {
              labels: sortedStats.slice(Math.min(7, sortedStats.length) - 1).map(stat => formatDate(stat.date)),
              datasets: [
                {
                  label: 'XP Velocity',
                  data: velocityData,
                  borderColor: 'rgb(234, 88, 12)',
                  backgroundColor: 'rgba(234, 88, 12, 0.5)',
                  tension: 0,
                  fill: true
                }
              ]
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: 'XP Velocity (7-Day Moving Average)',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${Math.round(context.raw as number)} XP/day`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'XP per Day',
                  }
                }
              }
            }
          };
        }
        
        // Generate a unique filename based on chart type and current time
        const timestamp = new Date().getTime();
        const filename = `xp-chart-${chartType}-${timestamp}.png`;
        
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
  }, [chartType, user.tasksCompleted]);
  
  if (isLoading) {
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
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400 font-mono">Generating chart...</p>
        </div>
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
      
      <div className="h-80 relative">
        {chartImagePath ? (
          <Image 
            src={chartImagePath} 
            alt={`${chartType} chart`} 
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
      
      {chartType === 'velocity' && (
        <div className="mt-4 text-sm text-gray-400 font-mono">
          <p>XP Velocity shows your average daily XP gain over a 7-day period. Higher values indicate increased productivity.</p>
        </div>
      )}
    </div>
  );
} 
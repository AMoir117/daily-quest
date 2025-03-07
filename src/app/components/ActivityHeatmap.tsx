'use client';

import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './heatmap.css';
import { format, parseISO, isAfter, isBefore, addDays, startOfYear, endOfYear } from 'date-fns';
import { getStats } from '../utils/storageUtils';
import { useQuest } from '../context/QuestContext';
import { DailyStats } from '../types';
import { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';

// Define the data structure for the heatmap
interface HeatmapValue extends ReactCalendarHeatmapValue<string> {
  date: string;
  count: number;
}

export default function ActivityHeatmap() {
  const { user } = useQuest();
  const [values, setValues] = useState<HeatmapValue[]>([]);
  const [maxValue, setMaxValue] = useState(0);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Calculate date ranges - start from January 1st of current year
  const today = new Date();
  const startDate = startOfYear(today);
  const endDate = endOfYear(today);
  
  useEffect(() => {
    // Load stats from localStorage
    const stats = getStats();
    
    // Create a map of all dates in the range with 0 counts
    const dateMap = new Map<string, number>();
    let currentDate = new Date(startDate);
    
    while (!isAfter(currentDate, endDate)) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dateMap.set(dateStr, 0);
      currentDate = addDays(currentDate, 1);
    }
    
    // Update with actual stats
    stats.forEach((stat: DailyStats) => {
      const dateStr = stat.date;
      const date = parseISO(dateStr);
      
      if (isAfter(date, startDate) && isBefore(date, addDays(endDate, 1))) {
        dateMap.set(dateStr, stat.tasksCompleted);
      }
    });
    
    // Convert to array format needed by the heatmap
    const heatmapValues: HeatmapValue[] = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
    
    // Find the maximum value for scaling
    const max = Math.max(...heatmapValues.map(v => v.count), 1);
    
    setValues(heatmapValues);
    setMaxValue(max);
    
    // Only depend on user.tasksCompleted, not on the dates which are calculated on each render
  }, [user.tasksCompleted]);
  
  // Function to determine the color intensity based on the count
  const getClassForValue = (value: ReactCalendarHeatmapValue<string> | undefined) => {
    if (!value || !('count' in value) || value.count === 0) {
      return 'color-empty';
    }
    
    // Scale from 1-4 based on the count relative to max
    const intensity = Math.ceil((value.count / maxValue) * 4);
    return `color-scale-${intensity}`;
  };
  
  // Handle tooltip display
  const handleMouseOver = (event: React.MouseEvent<SVGRectElement>, value: ReactCalendarHeatmapValue<string> | undefined) => {
    if (value && 'count' in value && value.count > 0) {
      const date = format(parseISO(value.date as string), 'MMM d, yyyy');
      const quests = value.count === 1 ? 'quest' : 'quests';
      setTooltipContent(`${date}: ${value.count} ${quests} completed`);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    } else {
      setTooltipContent(null);
    }
  };
  
  const handleMouseLeave = () => {
    setTooltipContent(null);
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-xl font-mono mb-8">Heatmap</h2>
      
      <div className="relative">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          classForValue={getClassForValue}
          showWeekdayLabels={true}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          titleForValue={(value: ReactCalendarHeatmapValue<string> | undefined) => {
            if (!value || !('count' in value) || value.count === 0) return 'No quests completed';
            const date = format(parseISO(value.date as string), 'MMM d, yyyy');
            const quests = value.count === 1 ? 'quest' : 'quests';
            return `${date}: ${value.count} ${quests} completed`;
          }}
        />
        
        {tooltipContent && (
          <div
            className="absolute bg-gray-900 text-white p-2 rounded-md text-xs font-mono z-10 shadow-lg border border-gray-700"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 40}px`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none'
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
      
      <div className="flex justify-end items-center mt-4 text-xs font-mono text-gray-400">
        <span className="mr-1">Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-[#2d2d2d] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#4c1d95] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#6d28d9] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#8b5cf6] rounded-sm"></div>
          <div className="w-3 h-3 bg-[#a78bfa] rounded-sm"></div>
        </div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
} 
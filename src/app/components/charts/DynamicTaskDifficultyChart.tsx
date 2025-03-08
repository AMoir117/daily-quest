'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the chart component with SSR disabled
const TaskDifficultyChartClient = dynamic(
  () => import('../TaskDifficultyChart'),
  { ssr: false }
);

export default function DynamicTaskDifficultyChart() {
  return (
    <Suspense fallback={<div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6 h-64 flex items-center justify-center">
      <p className="text-gray-400 font-mono">Loading difficulty chart...</p>
    </div>}>
      <TaskDifficultyChartClient />
    </Suspense>
  );
} 
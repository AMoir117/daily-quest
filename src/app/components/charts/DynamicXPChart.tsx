'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the chart component with SSR disabled
const XPChartClient = dynamic(
  () => import('../XPChart'),
  { ssr: false }
);

export default function DynamicXPChart() {
  return (
    <Suspense fallback={<div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6 h-80 flex items-center justify-center">
      <p className="text-gray-400 font-mono">Loading XP chart...</p>
    </div>}>
      <XPChartClient />
    </Suspense>
  );
} 
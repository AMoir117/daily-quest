'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';

// Add fallback loading state management
const LoadingFallback = () => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6 h-64 flex items-center justify-center">
    <p className="text-gray-400 font-mono">Loading completion time chart...</p>
  </div>
);

// Dynamically import the chart component with SSR disabled
// Use a more controlled loading approach
const CompletionTimeChartClient = dynamic(
  async () => {
    // Add a small delay to ensure client-side hydration is complete
    if (typeof window !== 'undefined') {
      // Make sure Chart.js is only initialized on the client
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return import('../CompletionTimeChart');
  },
  { 
    ssr: false,
    loading: () => <LoadingFallback />
  }
);

export default function DynamicCompletionTimeChart() {
  const [mounted, setMounted] = useState(false);

  // Only render after component has mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompletionTimeChartClient />
    </Suspense>
  );
} 
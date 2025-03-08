import { NextRequest, NextResponse } from 'next/server';
import { generateChartImage } from '@/app/utils/chartGenerator';
import { ChartConfiguration } from 'chart.js';

export async function POST(request: NextRequest) {
  try {
    const { chartConfig, filename, width = 800, height = 400 } = await request.json();
    
    if (!chartConfig || !filename) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Generate chart image with specified dimensions
    const imagePath = await generateChartImage(
      chartConfig as ChartConfiguration,
      filename,
      width,
      height
    );
    
    // Return the path to the generated image
    return NextResponse.json({ imagePath });
  } catch (error) {
    console.error('Error generating chart:', error);
    return NextResponse.json(
      { error: 'Failed to generate chart' },
      { status: 500 }
    );
  }
}

// Optional GET method to test the API
export async function GET() {
  // Sample chart config for testing
  const sampleConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          label: 'Sample Dataset',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
  };
  
  const imagePath = await generateChartImage(
    sampleConfig,
    'test-chart.png'
  );
  
  return NextResponse.json({ imagePath });
} 
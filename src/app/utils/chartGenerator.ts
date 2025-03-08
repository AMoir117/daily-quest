import { ChartConfiguration } from 'chart.js';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Make sure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generates a chart image and returns the URL path to it
 */
export async function generateChartImage(
  chartConfig: ChartConfiguration,
  filename: string,
  width = 800,
  height = 400
): Promise<string> {
  try {
    // Dynamic import to prevent errors when running on the client
    const { Chart } = await import('chart.js/auto');

    // Create canvas and context
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

    // Set white background
    ctx.fillStyle = '#1f2937'; // Match your dark background
    ctx.fillRect(0, 0, width, height);

    // Create a deep copy of the config to modify safely
    const enhancedConfig = JSON.parse(JSON.stringify(chartConfig));
    
    // Set font sizes larger for better readability
    if (!enhancedConfig.options) {
      enhancedConfig.options = {};
    }
    
    // Set default options
    enhancedConfig.options.responsive = false;
    enhancedConfig.options.maintainAspectRatio = false;
    enhancedConfig.options.color = 'white';
    
    // Setup plugins with larger fonts
    if (!enhancedConfig.options.plugins) {
      enhancedConfig.options.plugins = {};
    }
    
    // Configure legend
    if (!enhancedConfig.options.plugins.legend) {
      enhancedConfig.options.plugins.legend = {};
    }
    if (!enhancedConfig.options.plugins.legend.labels) {
      enhancedConfig.options.plugins.legend.labels = {};
    }
    enhancedConfig.options.plugins.legend.labels.color = 'white';
    enhancedConfig.options.plugins.legend.labels.font = {
      family: 'monospace',
      size: 16,
      weight: 'bold' // Using string 'bold' instead of a numeric weight
    };
    enhancedConfig.options.plugins.legend.labels.padding = 20;
    
    // Configure title
    if (!enhancedConfig.options.plugins.title) {
      enhancedConfig.options.plugins.title = {};
    }
    enhancedConfig.options.plugins.title.display = true;
    enhancedConfig.options.plugins.title.color = 'white';
    enhancedConfig.options.plugins.title.font = {
      family: 'monospace',
      size: 20,
      weight: 'bold'
    };
    enhancedConfig.options.plugins.title.padding = {
      top: 20,
      bottom: 20
    };
    
    // Configure scales for better readability
    if (!enhancedConfig.options.scales) {
      enhancedConfig.options.scales = {};
    }
    
    // Setup x-axis
    if (enhancedConfig.options.scales.x) {
      if (!enhancedConfig.options.scales.x.ticks) {
        enhancedConfig.options.scales.x.ticks = {};
      }
      enhancedConfig.options.scales.x.ticks.color = 'white';
      enhancedConfig.options.scales.x.ticks.font = {
        family: 'monospace',
        size: 14
      };
      enhancedConfig.options.scales.x.grid = {
        color: 'rgba(255, 255, 255, 0.1)'
      };
    }
    
    // Setup y-axis
    if (enhancedConfig.options.scales.y) {
      if (!enhancedConfig.options.scales.y.ticks) {
        enhancedConfig.options.scales.y.ticks = {};
      }
      enhancedConfig.options.scales.y.ticks.color = 'white';
      enhancedConfig.options.scales.y.ticks.font = {
        family: 'monospace',
        size: 14
      };
      enhancedConfig.options.scales.y.grid = {
        color: 'rgba(255, 255, 255, 0.1)'
      };
    }

    // Create chart instance with enhanced config
    new Chart(ctx, enhancedConfig);

    // Ensure directory exists
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'chart-images');
    ensureDirectoryExists(imagesDir);

    // Save image file
    const filePath = path.join(imagesDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    // Return path relative to /public
    return `/chart-images/${filename}`;
  } catch (error) {
    console.error('Error generating chart:', error);
    return '/placeholder-chart.png'; // Return placeholder if generation fails
  }
} 
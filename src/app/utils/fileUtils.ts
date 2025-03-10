import { Task } from '../types';

/**
 * Save tasks to a JSON file for download
 * @param tasks Array of tasks to save
 */
export function saveTasksToFile(tasks: Task[]): void {
  try {
    // Create a JSON string with proper formatting
    const tasksJson = JSON.stringify(tasks, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([tasksJson], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    
    // Set the filename with current date
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    a.download = `dailyquest-tasks-${formattedDate}.json`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving tasks to file:', error);
    alert('Failed to save tasks to file. Please try again.');
  }
}

/**
 * Load tasks from a JSON file
 * @returns Promise that resolves to an array of tasks
 */
export function loadTasksFromFile(): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    try {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      
      // Handle file selection
      fileInput.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        
        if (!files || files.length === 0) {
          reject(new Error('No file selected'));
          return;
        }
        
        const file = files[0];
        
        // Read the file
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            const tasks = JSON.parse(result) as Task[];
            
            // Validate the tasks
            if (!Array.isArray(tasks)) {
              reject(new Error('Invalid file format: not a task array'));
              return;
            }
            
            // Ensure all tasks have the required properties
            const validTasks = tasks.filter(task => 
              task && typeof task === 'object' && 
              typeof task.id === 'string' && 
              typeof task.title === 'string'
            );
            
            if (validTasks.length !== tasks.length) {
              console.warn(`Filtered out ${tasks.length - validTasks.length} invalid tasks during import`);
            }
            
            resolve(validTasks);
          } catch (error) {
            console.error('Error parsing JSON file:', error);
            reject(new Error('Invalid JSON file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
      };
      
      // Trigger the file selection dialog
      fileInput.click();
    } catch (error) {
      console.error('Error loading tasks from file:', error);
      reject(error);
    }
  });
} 
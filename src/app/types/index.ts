export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  difficulty: TaskDifficulty;
  xpReward: number;
  isRecurring?: boolean;
  recurringDays?: DayOfWeek[];
  parentTaskId?: string; // For tasks generated from recurring tasks
}

export interface User {
  level: number;
  xp: number;
  totalXp: number;
  xpToNextLevel: number;
  tasksCompleted: number;
  streakDays: number;
  lastActive: string;
  lastRecurringCheck?: string; // Date when recurring tasks were last generated
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  xpGained: number;
}

export interface LevelThreshold {
  level: number;
  xpRequired: number;
}

export interface TaskHistory {
  date: string;
  tasks: Task[];
}

export interface RecurringTaskTemplate {
  id: string;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  daysOfWeek: DayOfWeek[];
}

export interface RecurringTasksConfig {
  templates: RecurringTaskTemplate[];
  lastGenerated?: string; // Date when tasks were last generated
} 
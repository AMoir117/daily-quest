export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type QuestStatus = 'active' | 'hidden' | 'completed';

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
  questType?: string; // Custom quest type for categorization
  questStatus?: QuestStatus; // Status of the quest (active, hidden, etc.)
}

export interface User {
  level: number;
  xp: number;
  totalXp: number;
  xpToNextLevel: number;
  tasksCompleted: number;
  tasksFailed: number;
  streakDays: number;
  lastActive: string;
  lastRecurringCheck?: string; // Date when recurring tasks were last generated
  failedXp: number; // Track total XP lost from failed quests
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
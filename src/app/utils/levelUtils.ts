import { LevelThreshold, TaskDifficulty } from '../types';

// XP rewards for different task difficulties
export const XP_REWARDS: Record<TaskDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

// Different leveling algorithms
const LevelingAlgorithms = {
  // 1. Progressive Scaling: Each level requires more XP than the previous
  progressive: () => {
    const thresholds: LevelThreshold[] = [
      { level: 1, xpRequired: 0 } // Level 1 starts at 0 XP
    ];
    
    let levelXp = 50; // XP required for level 1 to 2
    let totalXp = 0;
    
    for (let i = 1; i < 100; i++) {
      totalXp += levelXp;
      
      thresholds.push({
        level: i + 1,
        xpRequired: totalXp
      });
      
      // Increase XP required for next level by 20%
      levelXp = Math.round(levelXp * 1.2);
    }
    
    return thresholds;
  },
  
  // 2. Linear Progression: Simple linear increase in XP requirements
  linear: () => {
    const thresholds: LevelThreshold[] = [
      { level: 1, xpRequired: 0 } // Level 1 starts at 0 XP
    ];
    
    let baseXp = 50; // Base XP for level 1 to 2
    let increment = 25; // Additional XP per level
    let totalXp = 0;
    
    for (let i = 1; i < 100; i++) {
      const levelXp = baseXp + (i - 1) * increment;
      totalXp += levelXp;
      
      thresholds.push({
        level: i + 1,
        xpRequired: totalXp
      });
    }
    
    return thresholds;
  },
  
  // 3. Quadratic Progression: XP requirements grow quadratically
  quadratic: () => {
    const thresholds: LevelThreshold[] = [
      { level: 1, xpRequired: 0 } // Level 1 starts at 0 XP
    ];
    
    let baseXp = 50; // Base XP for level 1 to 2
    let totalXp = 0;
    
    for (let i = 1; i < 100; i++) {
      const levelXp = baseXp + Math.round(10 * Math.pow(i, 1.5));
      totalXp += levelXp;
      
      thresholds.push({
        level: i + 1,
        xpRequired: totalXp
      });
    }
    
    return thresholds;
  },
  
  // 4. Gentle Curve: Slow initial increase that accelerates
  gentleCurve: () => {
    const thresholds: LevelThreshold[] = [
      { level: 1, xpRequired: 0 } // Level 1 starts at 0 XP
    ];
    
    let baseXp = 50; // Base XP for level 1 to 2
    let growthFactor = 1.1; // Initial growth factor
    let totalXp = 0;
    
    for (let i = 1; i < 100; i++) {
      totalXp += baseXp;
      
      thresholds.push({
        level: i + 1,
        xpRequired: totalXp
      });
      
      // Gradually increase the growth factor
      growthFactor = Math.min(1.5, growthFactor + 0.01);
      baseXp = Math.round(baseXp * growthFactor);
    }
    
    return thresholds;
  },
  
  // 5. RPG Standard: Common in many RPGs, balanced progression
  rpgStandard: () => {
    const thresholds: LevelThreshold[] = [
      { level: 1, xpRequired: 0 } // Level 1 starts at 0 XP
    ];
    
    let totalXp = 0;
    
    for (let i = 1; i < 100; i++) {
      // Level-specific XP formula: base * level * (level factor)
      const levelXp = Math.round(25 * i * (1 + i * 0.1));
      totalXp += levelXp;
      
      thresholds.push({
        level: i + 1,
        xpRequired: totalXp
      });
    }
    
    return thresholds;
  }
};

// Generate level thresholds using the Progressive Scaling algorithm
export const LEVEL_THRESHOLDS: LevelThreshold[] = LevelingAlgorithms.progressive();

/**
 * Calculate the level based on total XP
 */
export function calculateLevel(totalXp: number): number {
  // Ensure totalXp is a number
  totalXp = Number(totalXp);
  
  // Find the highest level threshold that the totalXp exceeds
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  
  // Default to level 1
  return 1;
}

/**
 * Calculate XP needed for the next level
 */
export function calculateXpToNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  
  // If at max level, return 0
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0;
  }
  
  // Find the next level threshold
  const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(threshold => threshold.level > currentLevel);
  
  if (nextLevelIndex === -1) {
    return 0; // No next level found (at max level)
  }
  
  return LEVEL_THRESHOLDS[nextLevelIndex].xpRequired - totalXp;
}

/**
 * Calculate current XP within the current level
 */
export function calculateCurrentLevelXp(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  
  // Find the current level threshold
  const currentLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === currentLevel);
  
  if (!currentLevelThreshold) {
    return totalXp; // Fallback
  }
  
  return totalXp - currentLevelThreshold.xpRequired;
}

/**
 * Calculate total XP needed for the current level
 */
export function calculateCurrentLevelTotalXp(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp);
  
  // Find the current and next level thresholds
  const currentLevelThreshold = LEVEL_THRESHOLDS.find(threshold => threshold.level === currentLevel);
  const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(threshold => threshold.level > currentLevel);
  
  if (nextLevelIndex === -1 || !currentLevelThreshold) {
    return 0; // At max level or threshold not found
  }
  
  return LEVEL_THRESHOLDS[nextLevelIndex].xpRequired - currentLevelThreshold.xpRequired;
} 
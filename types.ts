
export type GameMode = 'TOWER' | 'DUNGEON';
export type GambleType = 'DICE' | 'COIN' | 'CARDS' | 'WHEEL' | 'SLOTS';
export type FloorType = 'MONSTER' | 'TREASURE' | 'BOSS' | 'JACKPOT';
export type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY';

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  gambleType: GambleType;
  baseDamage: number;
  level: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  type: 'tower_dps' | 'wizard_hp' | 'gold_find' | 'luck' | 'auto_attack' | 'lifesteal' | 'dodge' | 'floor_skip' | 'treasure_find' | 'mana_regen' | 'spell_power' | 'exp_boost' | 'double_cast' | 'crit_potency' | 'relic_chance' | 'boss_dmg';
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  gold: number;
  color: string;
  visualType?: string;
}

export interface ExpeditionItem {
  id: string;
  name: string;
  description: string;
  type: 'HEAL' | 'BUFF' | 'GOLD' | 'STAT' | 'RELIC';
  value: number;
  statType?: 'LUCK' | 'DAMAGE' | 'DODGE' | 'CRIT';
  relicId?: string;
}

export interface JackpotChoice {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: Rarity;
  effect: (prev: RunState) => RunState;
}

export interface GameState {
  gold: number;
  towerDps: number;
  wizardMaxHp: number;
  luck: number;
  totalKills: number;
  unlockedSkills: string[];
  currentDungeonFloor: number;
  autoAttackLevel: number;
  lifestealLevel: number;
  dodgeLevel: number;
  floorSkipLevel: number;
  treasureFindLevel: number;
  manaRegenLevel: number;
  spellPowerLevel: number;
  expBoostLevel: number;
  doubleCastLevel: number;
  critPotencyLevel: number;
  relicChanceLevel: number;
  bossDmgLevel: number;
  goldFindLevel: number;
  level: number;
  experience: number;
  skillPoints: number;
  // New Mobile Settings
  isAdFree: boolean;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  syncToken?: string;
}

export interface RunState {
  active: boolean;
  floorCleared: boolean;
  selectedSkillId: string | null;
  currentFloor: number;
  killsOnFloor: number;
  wizardHp: number;
  enemy: Enemy | null;
  floorType: FloorType;
  items: ExpeditionItem[];
  relics: string[];
  rewardsThisFloor: {
    gold: number;
    xp: number;
    items: ExpeditionItem[];
    buffName?: string;
  };
  runBuffs: {
    damageMult: number;
    luckBonus: number;
    lifestealBonus: number;
    dodgeBonus: number;
    doubleCastChance: number;
    critPotencyBonus: number;
  };
}

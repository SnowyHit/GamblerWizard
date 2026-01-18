
import { Upgrade, Skill, ExpeditionItem, Relic } from './types';

export const RELICS: Relic[] = [
  { id: 'phoenix_ash', name: 'Phoenix Ash', description: 'Prevents death once per run, healing 50% HP.', icon: 'Flame', rarity: 'LEGENDARY' },
  { id: 'midas_glove', name: "Midas' Glove", description: '+25% Gold from all sources.', icon: 'Coins', rarity: 'RARE' },
  { id: 'void_pendant', name: 'Void Pendant', description: '+15% Spell Damage permanently.', icon: 'Zap', rarity: 'RARE' },
  { id: 'lucky_die', name: 'Infinite Die', description: '+10 Base Luck permanently.', icon: 'Star', rarity: 'COMMON' },
  { id: 'shadow_cloak', name: 'Shadow Cloak', description: '+5% Dodge chance permanently.', icon: 'Wind', rarity: 'COMMON' },
  { id: 'vampire_fang', name: 'Vampire Fang', description: '+5% Lifesteal permanently.', icon: 'Heart', rarity: 'COMMON' },
  { id: 'dragon_scale', name: 'Dragon Scale', description: 'Reduces all incoming damage by 15%.', icon: 'Shield', rarity: 'LEGENDARY' },
];

export const SKILLS: Skill[] = [
  { id: 'thunder-dice', name: 'Thunderbolt', description: 'Invoke the storm with 2D6 Dice. Stable and reliable damage with high critical potential on 10+ rolls.', gambleType: 'DICE', baseDamage: 40, level: 1 },
  { id: 'arcane-flip', name: 'Arcane Coin', description: 'Flip the Coin of Fate. A 50/50 gamble where Heads delivers a crushing blow and Tails barely scratches.', gambleType: 'COIN', baseDamage: 75, level: 1 },
  { id: 'fate-cards', name: 'Soul Tarot', description: 'Draw a single Card of Destiny. Low cards fumble, while High cards (10-13) multiply your power exponentially.', gambleType: 'CARDS', baseDamage: 120, level: 1 },
  { id: 'eldritch-slots', name: 'Eldritch Slots', description: 'Spin the abyssal reels. High risk but matches grant enormous multipliers. Mastery increases damage on every win.', gambleType: 'SLOTS', baseDamage: 250, level: 1 },
  { id: 'chaos-dice', name: 'Chaos Flux', description: 'Roll 3D6 Chaos Dice. Highly unpredictable; only for those who seek the fabled Triple 6 reality-shattering strike.', gambleType: 'DICE', baseDamage: 160, level: 1 },
  { id: 'lootbox-libram', name: 'Wheel of Fate', description: 'Spin the Cosmic Wheel. Features a variety of multipliers from weak failures to legendary Jackpots.', gambleType: 'WHEEL', baseDamage: 220, level: 1 }
];

export const TOWER_UPGRADES: Upgrade[] = [
  { id: 'crystal-focus', name: 'Crystal Focus', description: 'Passive gold generation per second.', baseCost: 50, costMultiplier: 1.25, level: 0, type: 'tower_dps' },
  { id: 'alchemy-vat', name: 'Alchemy Vat', description: 'Monsters drop more gold (+10%/lvl).', baseCost: 150, costMultiplier: 1.35, level: 0, type: 'gold_find' },
  { id: 'divination-scryer', name: 'Fortune Scry', description: 'Better chance for Treasure floors.', baseCost: 1000, costMultiplier: 1.7, level: 0, type: 'treasure_find' },
  { id: 'dimensional-anchor', name: 'Warp Anchor', description: 'Start runs at higher floors.', baseCost: 5000, costMultiplier: 2.5, level: 0, type: 'floor_skip' },
  { id: 'relic-compass', name: 'Relic Compass', description: 'Find Relics in chests more often (+1%).', baseCost: 10000, costMultiplier: 2.2, level: 0, type: 'relic_chance' },
  { id: 'library-wings', name: 'Library Wings', description: 'Permanent experience gain boost (+10%).', baseCost: 400, costMultiplier: 1.5, level: 0, type: 'exp_boost' },
  { id: 'defense-sigils', name: 'Defense Sigils', description: 'Passive evasion/dodge chance (+1%).', baseCost: 800, costMultiplier: 1.9, level: 0, type: 'dodge' },
  { id: 'titan-bane', name: 'Titan Bane', description: 'Increased damage against Bosses (+10%).', baseCost: 2500, costMultiplier: 2.1, level: 0, type: 'boss_dmg' }
];

export const WIZARD_TRAINING_STATS: Upgrade[] = [
  { id: 'ancient-vitality', name: 'Wizard HP', description: 'Permanent Max Health (+100).', baseCost: 100, costMultiplier: 1.3, level: 0, type: 'wizard_hp' },
  { id: 'arcane-potency', name: 'Spell Damage', description: 'Permanent Magic Damage (+10%).', baseCost: 150, costMultiplier: 1.4, level: 0, type: 'spell_power' },
  { id: 'wisdoms-grace', name: 'EXP Boost', description: 'Experience gained (+10%).', baseCost: 250, costMultiplier: 1.45, level: 0, type: 'exp_boost' },
  { id: 'luck-scriptures', name: 'Base Luck', description: 'Permanent Base Luck (+2).', baseCost: 400, costMultiplier: 1.8, level: 0, type: 'luck' },
  { id: 'soul-siphon', name: 'Lifesteal', description: 'Heal from magic damage (+1%).', baseCost: 2000, costMultiplier: 2.4, level: 0, type: 'lifesteal' },
  { id: 'evasion-drills', name: 'Dodge Chance', description: 'Chance to avoid attacks (+1%).', baseCost: 1200, costMultiplier: 2.0, level: 0, type: 'dodge' },
  { id: 'echoing-resonance', name: 'Double Cast', description: 'Chance to cast twice (+2%).', baseCost: 8000, costMultiplier: 3.0, level: 0, type: 'double_cast' },
  { id: 'destinys-edge', name: 'Crit Potency', description: 'Critical hit damage (+25%).', baseCost: 2000, costMultiplier: 2.2, level: 0, type: 'crit_potency' },
  { id: 'relic-hunter', name: 'Relic Seeker', description: 'Relic find chance in chests (+1%).', baseCost: 12000, costMultiplier: 3.5, level: 0, type: 'relic_chance' },
  { id: 'giant-slayer', name: 'Giant Slayer', description: 'Damage vs Bosses (+10%).', baseCost: 4000, costMultiplier: 2.3, level: 0, type: 'boss_dmg' },
];

export const CHEST_REWARDS: ExpeditionItem[] = [
  { id: 'heal_s', name: 'Minor Potion', description: 'Heals 25% Max HP.', type: 'HEAL', value: 25 },
  { id: 'heal_m', name: 'Great Potion', description: 'Heals 50% Max HP.', type: 'HEAL', value: 50 },
  { id: 'gold_s', name: 'Pouch of Gold', description: 'A modest sum of gold.', type: 'GOLD', value: 500 },
  { id: 'gold_l', name: 'Treasure Chest', description: 'A massive hoard of gold.', type: 'GOLD', value: 2500 },
  { id: 'luck_charm', name: 'Rabbit Foot', description: '+10 Luck for this run.', type: 'STAT', value: 10, statType: 'LUCK' },
  { id: 'dmg_charm', name: 'Fire Rune', description: '+0.25x Damage for this run.', type: 'STAT', value: 0.25, statType: 'DAMAGE' },
];

export const ENEMY_TYPES = [
  { name: 'Slime', hpBase: 50, atkBase: 5, goldBase: 25, color: '#4ade80', visualType: 'SLIME' },
  { name: 'Skeleton', hpBase: 80, atkBase: 8, goldBase: 40, color: '#cbd5e1', visualType: 'SKULL' },
  { name: 'Bat', hpBase: 45, atkBase: 12, goldBase: 35, color: '#475569', visualType: 'BAT' },
  { name: 'Armor', hpBase: 200, atkBase: 15, goldBase: 90, color: '#94a3b8', visualType: 'ARMOR' },
  { name: 'Mimic', hpBase: 350, atkBase: 20, goldBase: 500, color: '#78350f', visualType: 'MIMIC' },
  { name: 'Ghost', hpBase: 220, atkBase: 28, goldBase: 150, color: '#1e293b', visualType: 'GHOST' },
  { name: 'Beholder', hpBase: 25000, atkBase: 250, goldBase: 10000, color: '#701a75', visualType: 'EYE' },
];

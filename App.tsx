
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PixelWizard } from './components/PixelWizard';
import { PixelEnemy } from './components/PixelEnemy';
import { DungeonBackdrop } from './components/DungeonBackdrop';
import { GamblingMechanic } from './components/GamblingMechanic';
import { HealthBar } from './components/HealthBar';
import { PixelChest } from './components/PixelChest';
import { TOWER_UPGRADES, WIZARD_TRAINING_STATS, SKILLS, ENEMY_TYPES, CHEST_REWARDS, RELICS } from './constants';
import { GameState, RunState, GameMode, Enemy, Upgrade, Skill, FloorType, ExpeditionItem, JackpotChoice, Rarity, Relic } from './types';
import { 
  Coins, Swords, Shield, TowerControl as Tower, Zap, 
  LogOut, Heart, GraduationCap, Star, TrendingUp, 
  Lock, Map as MapIcon, Sparkles, Play, Ghost, Gift, Award, Anchor, Eye, Waves,
  Trophy, Flame, Wind, Wand2, Skull, ArrowRightCircle, CheckCircle2, ChevronDown, Info, HelpCircle, X, ShieldAlert,
  Compass, Library, Medal, BookOpen, Target, Activity, Gift as LootIcon, ChevronUp, Package,
  ZapOff, Search, Sparkle, ShieldCheck, Crosshair, Sword
} from 'lucide-react';

const JACKPOT_POOL: JackpotChoice[] = [
  { id: 'arcane_strike', rarity: 'COMMON', title: 'Arcane Strike', description: '+25% Damage.', icon: 'Swords', effect: (s) => ({ ...s, runBuffs: { ...s.runBuffs, damageMult: s.runBuffs.damageMult + 0.25 } }) },
  { id: 'lucky_coin', rarity: 'COMMON', title: 'Lucky Coin', description: '+15 Luck for this run.', icon: 'Star', effect: (s) => ({ ...s, runBuffs: { ...s.runBuffs, luckBonus: s.runBuffs.luckBonus + 15 } }) },
  { id: 'vampiric_touch', rarity: 'COMMON', title: 'Vampiric Touch', description: '+10% Lifesteal.', icon: 'Heart', effect: (s) => ({ ...s, runBuffs: { ...s.runBuffs, lifestealBonus: s.runBuffs.lifestealBonus + 0.1 } }) },
  { id: 'glass_cannon', rarity: 'RARE', title: 'Glass Cannon', description: '+150% Damage, -40% HP.', icon: 'Flame', effect: (s) => ({ ...s, wizardHp: Math.floor(s.wizardHp * 0.6), runBuffs: { ...s.runBuffs, damageMult: s.runBuffs.damageMult + 1.5 } }) },
  { id: 'phase_cloak', rarity: 'RARE', title: 'Phase Cloak', description: '+15% Dodge.', icon: 'Wind', effect: (s) => ({ ...s, runBuffs: { ...s.runBuffs, dodgeBonus: s.runBuffs.dodgeBonus + 15 } }) },
  { id: 'echo_of_void', rarity: 'LEGENDARY', title: 'Echo of Void', description: '20% chance to cast spell TWICE.', icon: 'Wand2', effect: (s) => ({ ...s, runBuffs: { ...s.runBuffs, doubleCastChance: s.runBuffs.doubleCastChance + 0.2 } }) },
];

const getXpToNextLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.85));

const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('TOWER');
  const [activeTab, setActiveTab] = useState<'PASSIVE' | 'EXPLORE' | 'TRAINING'>('EXPLORE');
  const [showJackpot, setShowJackpot] = useState(false);
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [jackpotOptions, setJackpotOptions] = useState<JackpotChoice[]>([]);
  const [showRunInfo, setShowRunInfo] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('wizard_gambling_save_v28');
    return saved ? JSON.parse(saved) : {
      gold: 100, towerDps: 0, wizardMaxHp: 100, luck: 0, totalKills: 0, 
      unlockedSkills: ['thunder-dice', 'arcane-flip', 'fate-cards', 'eldritch-slots', 'chaos-dice', 'lootbox-libram'], 
      currentDungeonFloor: 1, autoAttackLevel: 0, lifestealLevel: 0, dodgeLevel: 0, 
      floorSkipLevel: 0, treasureFindLevel: 0, manaRegenLevel: 0, spellPowerLevel: 0,
      expBoostLevel: 0, doubleCastLevel: 0, critPotencyLevel: 0, relicChanceLevel: 0, 
      bossDmgLevel: 0, goldFindLevel: 0,
      level: 1, experience: 0, skillPoints: 0
    };
  });

  const [selectedSkillId, setSelectedSkillId] = useState<string>('thunder-dice');
  const wizardReady = !!selectedSkillId;

  const [runState, setRunState] = useState<RunState>({
    active: false, floorCleared: false, selectedSkillId: null, currentFloor: 1, killsOnFloor: 0, 
    wizardHp: 100, enemy: null, floorType: 'MONSTER', items: [], relics: [], rewardsThisFloor: { gold: 0, xp: 0, items: [] }, 
    runBuffs: { damageMult: 1, luckBonus: 0, lifestealBonus: 0, dodgeBonus: 0, doubleCastChance: 0, critPotencyBonus: 0 }
  });

  const [towerUpgrades, setTowerUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('wizard_tower_upgrades_v28');
    return saved ? JSON.parse(saved) : TOWER_UPGRADES;
  });
  const [statUpgrades, setStatUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('wizard_stat_upgrades_v28');
    return saved ? JSON.parse(saved) : WIZARD_TRAINING_STATS;
  });
  const [skills, setSkills] = useState<Skill[]>(() => {
    const savedSkills = localStorage.getItem('wizard_skills_save_v28');
    return savedSkills ? JSON.parse(savedSkills) : SKILLS;
  });

  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [isWizardAttacking, setIsWizardAttacking] = useState(false);
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const [isWizardHit, setIsWizardHit] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; text: string; color?: string; size?: string; icon?: React.ReactNode }[]>([]);
  
  const textCounter = useRef(0);

  useEffect(() => {
    localStorage.setItem('wizard_gambling_save_v28', JSON.stringify(gameState));
    localStorage.setItem('wizard_skills_save_v28', JSON.stringify(skills));
    localStorage.setItem('wizard_tower_upgrades_v28', JSON.stringify(towerUpgrades));
    localStorage.setItem('wizard_stat_upgrades_v28', JSON.stringify(statUpgrades));
  }, [gameState, skills, towerUpgrades, statUpgrades]);

  const generateFloorContent = useCallback((floor: number) => {
    setIsChestOpen(false);
    let floorType: FloorType = 'MONSTER';
    const treasureChance = 0.1 + (gameState.treasureFindLevel * 0.05);
    const jackpotChance = 0.05 + (gameState.treasureFindLevel * 0.02);

    if (floor % 10 === 0) floorType = 'BOSS';
    else if (floor % 5 === 0 || Math.random() < treasureChance) floorType = 'TREASURE';
    else if (Math.random() < jackpotChance) floorType = 'JACKPOT';

    if (floorType === 'JACKPOT') {
      const shuffled = [...JACKPOT_POOL].sort(() => 0.5 - Math.random());
      setJackpotOptions(shuffled.slice(0, 3));
      setRunState(prev => ({ ...prev, floorType: 'JACKPOT', enemy: null, floorCleared: false, rewardsThisFloor: { gold: 0, xp: 0, items: [] } }));
      setShowJackpot(true);
      return;
    }

    if (floorType === 'TREASURE') {
      setRunState(prev => ({ ...prev, floorType: 'TREASURE', enemy: null, floorCleared: false, rewardsThisFloor: { gold: 0, xp: 0, items: [] } }));
      return;
    }

    const minTier = Math.floor(floor / 15);
    const maxTier = Math.floor(floor / 5) + 3;
    const available = ENEMY_TYPES.slice(Math.min(minTier, ENEMY_TYPES.length - 1), Math.min(ENEMY_TYPES.length, maxTier));
    const type = available[Math.floor(Math.random() * available.length)];
    const isBoss = floorType === 'BOSS';
    
    // REBALANCED CURVES: steeper scaling to match increased costs
    const hpScale = Math.pow(1.25, floor - 1);
    const goldFindBonus = 1 + (gameState.goldFindLevel * 0.1) + (runState.relics.includes('midas_glove') ? 0.25 : 0);
    const goldScale = Math.pow(1.22, floor - 1);
    const dmgScale = Math.pow(1.15, floor - 1);

    let hp = Math.floor(type.hpBase * hpScale);
    let gold = Math.floor(type.goldBase * goldScale * goldFindBonus);
    let damage = Math.floor(type.atkBase * dmgScale);

    if (isBoss) { hp *= 8; damage = Math.floor(damage * 1.8); gold *= 12; }

    setRunState(prev => ({
      ...prev, floorType, floorCleared: false, rewardsThisFloor: { gold: 0, xp: 0, items: [] },
      enemy: { 
        name: isBoss ? `BOSS: ${type.name.toUpperCase()}` : type.name, 
        hp, maxHp: hp, damage, gold, color: isBoss ? '#facc15' : type.color,
        visualType: type.visualType 
      }
    }));
  }, [gameState.treasureFindLevel, gameState.goldFindLevel, runState.relics]);

  const nextFloor = () => {
    const nextF = runState.currentFloor + 1;
    setRunState(prev => ({ ...prev, currentFloor: nextF }));
    generateFloorContent(nextF);
  };

  const openTreasure = () => {
    if (isChestOpen) return;
    setIsChestOpen(true);
    
    const relicChance = 0.02 + (gameState.relicChanceLevel * 0.01);
    const isRelicDrop = Math.random() < relicChance;
    
    let reward: ExpeditionItem;
    if (isRelicDrop) {
      const unownedRelics = RELICS.filter(r => !runState.relics.includes(r.id));
      if (unownedRelics.length > 0) {
        const picked = unownedRelics[Math.floor(Math.random() * unownedRelics.length)];
        reward = { id: `relic_${picked.id}`, name: picked.name, description: picked.description, type: 'RELIC', value: 0, relicId: picked.id };
      } else {
        reward = CHEST_REWARDS[Math.floor(Math.random() * CHEST_REWARDS.length)];
      }
    } else {
      reward = CHEST_REWARDS[Math.floor(Math.random() * CHEST_REWARDS.length)];
    }

    const floorMult = 1 + (runState.currentFloor / 15);
    
    setTimeout(() => {
      if (reward.type === 'GOLD') {
        const finalGold = Math.floor(reward.value * floorMult);
        setGameState(gs => ({ ...gs, gold: gs.gold + finalGold }));
        setRunState(prev => ({ ...prev, floorCleared: true, rewardsThisFloor: { gold: finalGold, xp: 0, items: [] } }));
        const tid = textCounter.current++;
        setFloatingTexts(ft => [...ft, { id: tid, x: window.innerWidth * 0.5, y: window.innerHeight * 0.35, text: `+${finalGold}`, color: "text-yellow-400", size: "text-xl", icon: <Coins size={24} /> }]);
        setTimeout(() => setFloatingTexts(ft => ft.filter(t => t.id !== tid)), 1500);
      } else if (reward.type === 'HEAL') {
        const healVal = Math.floor(gameState.wizardMaxHp * (reward.value / 100));
        setRunState(prev => ({ 
          ...prev, 
          wizardHp: Math.min(gameState.wizardMaxHp, prev.wizardHp + healVal), 
          floorCleared: true, 
          items: [...prev.items, reward],
          rewardsThisFloor: { gold: 0, xp: 0, items: [reward] } 
        }));
      } else if (reward.type === 'STAT') {
        setRunState(prev => {
           let ns = { ...prev, floorCleared: true, items: [...prev.items, reward], rewardsThisFloor: { gold: 0, xp: 0, items: [reward] } };
           if (reward.statType === 'LUCK') ns.runBuffs.luckBonus += reward.value;
           if (reward.statType === 'DAMAGE') ns.runBuffs.damageMult += reward.value;
           if (reward.statType === 'DODGE') ns.runBuffs.dodgeBonus += reward.value;
           if (reward.statType === 'CRIT') ns.runBuffs.critPotencyBonus += reward.value;
           return ns;
        });
      } else if (reward.type === 'RELIC' && reward.relicId) {
        const rid = reward.relicId;
        setRunState(prev => ({ 
          ...prev, 
          relics: [...prev.relics, rid],
          floorCleared: true, 
          rewardsThisFloor: { gold: 0, xp: 0, items: [reward] } 
        }));
        const tid = textCounter.current++;
        setFloatingTexts(ft => [...ft, { id: tid, x: window.innerWidth * 0.5, y: window.innerHeight * 0.3, text: `RELIC: ${reward.name}`, color: "text-yellow-400", size: "text-xl", icon: <Trophy size={24} /> }]);
        setTimeout(() => setFloatingTexts(ft => ft.filter(t => t.id !== tid)), 2000);
      }
    }, 200); 
  };

  const leaveRun = () => {
    setMode('TOWER');
    setRunState(prev => ({ 
      ...prev, active: false, floorCleared: false, items: [], relics: [],
      runBuffs: { damageMult: 1, luckBonus: 0, lifestealBonus: 0, dodgeBonus: 0, doubleCastChance: 0, critPotencyBonus: 0 } 
    }));
  };

  const startRun = () => {
    const startingFloor = 1 + (gameState.floorSkipLevel * 2);
    setMode('DUNGEON');
    setRunState(prev => ({
      ...prev,
      active: true,
      currentFloor: startingFloor,
      wizardHp: gameState.wizardMaxHp,
      selectedSkillId: selectedSkillId,
      floorCleared: false,
      items: [],
      relics: [],
      rewardsThisFloor: { gold: 0, xp: 0, items: [] },
      runBuffs: { damageMult: 1, luckBonus: 0, lifestealBonus: 0, dodgeBonus: 0, doubleCastChance: 0, critPotencyBonus: 0 }
    }));
    generateFloorContent(startingFloor);
  };

  const handleGambleResult = useCallback((multiplier: number) => {
    if (!runState.enemy || !runState.selectedSkillId || isProcessingAction || runState.floorCleared) return;
    setIsProcessingAction(true);
    
    setTimeout(() => {
      setIsWizardAttacking(true);
      const skill = skills.find(s => s.id === runState.selectedSkillId)!;
      
      let baseDamage = skill.baseDamage;
      let masteryMult = 1.0;

      switch(skill.id) {
        case 'thunder-dice':
          masteryMult = Math.pow(1.25, skill.level - 1);
          break;
        case 'arcane-flip':
          masteryMult = Math.pow(1.4, skill.level - 1);
          break;
        case 'fate-cards':
          masteryMult = Math.pow(1.5, skill.level - 1);
          break;
        case 'eldritch-slots':
          masteryMult = Math.pow(1.8, skill.level - 1);
          break;
        case 'chaos-dice':
          masteryMult = Math.pow(1.6, skill.level - 1);
          break;
        case 'lootbox-libram':
          masteryMult = Math.pow(1.45, skill.level - 1);
          break;
      }

      const baseWithLevel = baseDamage * masteryMult;
      const relicPower = runState.relics.includes('void_pendant') ? 0.15 : 0;
      const sanctumDmgMult = 1 + (gameState.spellPowerLevel * 0.10) + relicPower;
      const isBoss = runState.enemy?.name.includes('BOSS');
      const bossDmgBonus = isBoss ? (gameState.bossDmgLevel * 0.1) : 0;

      let finalGambleMult = multiplier;
      if (multiplier >= 2.5) {
         const critPotencyBonus = (gameState.critPotencyLevel * 0.25) + runState.runBuffs.critPotencyBonus;
         finalGambleMult += critPotencyBonus;
      }

      const damage = Math.floor(baseWithLevel * finalGambleMult * runState.runBuffs.damageMult * sanctumDmgMult * (1 + bossDmgBonus));

      const applyDamage = (targetDamage: number, isExtraCast: boolean = false) => {
        setTimeout(() => {
          let monsterDied = false;
          setIsWizardAttacking(false);
          if (multiplier > 0) {
            setIsEnemyHit(true);
            if (multiplier >= 2.5) { setIsScreenShaking(true); setTimeout(() => setIsScreenShaking(false), 300); }
            setTimeout(() => setIsEnemyHit(false), 200);
          }
          setRunState(prev => {
            if (!prev.enemy) return prev;
            const newHp = prev.enemy.hp - targetDamage;
            const lsVal = gameState.lifestealLevel * 0.01 + prev.runBuffs.lifestealBonus + (prev.relics.includes('vampire_fang') ? 0.05 : 0);
            const newWizardHp = Math.min(gameState.wizardMaxHp, prev.wizardHp + Math.floor(targetDamage * lsVal));
            if (newHp <= 0) {
              monsterDied = true;
              const expMult = 1 + (gameState.expBoostLevel * 0.10);
              const xpGained = Math.floor(15 * Math.pow(1.18, prev.currentFloor - 1) * expMult);
              
              setGameState(gs => {
                let newExp = gs.experience + xpGained;
                let newLevel = gs.level;
                let newMaxHp = gs.wizardMaxHp;
                let newLuck = gs.luck;
                let newSkillPoints = gs.skillPoints;
                let needed = getXpToNextLevel(newLevel);
                while (newExp >= needed) {
                  newExp -= needed;
                  newLevel += 1;
                  newSkillPoints += 1; // Reduced to 1 per level for balancing
                  newMaxHp += 100;
                  newLuck += 1;
                  needed = getXpToNextLevel(newLevel);
                }
                return { ...gs, gold: gs.gold + prev.enemy!.gold, totalKills: gs.totalKills + 1, experience: newExp, level: newLevel, wizardMaxHp: newMaxHp, luck: newLuck, skillPoints: newSkillPoints };
              });
              
              const gtid = textCounter.current++;
              setFloatingTexts(ft => [...ft, { id: gtid, x: window.innerWidth * 0.5, y: window.innerHeight * 0.4, text: `+${prev.enemy!.gold}`, color: "text-yellow-400", size: "text-lg", icon: <Coins size={16} /> }]);
              setTimeout(() => setFloatingTexts(ft => ft.filter(t => t.id !== gtid)), 1500);

              const xtid = textCounter.current++;
              setFloatingTexts(ft => [...ft, { id: xtid, x: window.innerWidth * 0.5, y: window.innerHeight * 0.45, text: `+${xpGained} XP`, color: "text-purple-400", size: "text-lg", icon: <Zap size={16} /> }]);
              setTimeout(() => setFloatingTexts(ft => ft.filter(t => t.id !== xtid)), 1500);

              return { ...prev, wizardHp: newWizardHp, enemy: { ...prev.enemy, hp: 0 }, floorCleared: true, rewardsThisFloor: { gold: prev.enemy!.gold, xp: xpGained, items: [] } };
            }
            return { ...prev, wizardHp: newWizardHp, enemy: { ...prev.enemy, hp: newHp } };
          });

          const wizardTextId = textCounter.current++;
          setFloatingTexts(prevFt => [...prevFt, { id: wizardTextId, x: window.innerWidth * 0.8, y: window.innerHeight * 0.25, text: multiplier === 0 ? "FUMBLE!" : `-${targetDamage}`, color: multiplier === 0 ? "text-slate-500" : (multiplier >= 2.5 ? "text-yellow-400" : "text-red-500"), size: multiplier >= 2.5 ? "text-xl" : "text-lg" }]);
          setTimeout(() => setFloatingTexts(ft => ft.filter(t => t.id !== wizardTextId)), 1000);

          if (!monsterDied && !isExtraCast) {
            setTimeout(() => {
              setRunState(prev => {
                if (!prev.enemy || !prev.active) return prev;
                const dodgeChance = (gameState.dodgeLevel + prev.runBuffs.dodgeBonus + (prev.relics.includes('shadow_cloak') ? 5 : 0)) * 0.01;
                if (Math.random() < dodgeChance) { return prev; }
                let incomingDamage = prev.enemy.damage;
                if (prev.relics.includes('dragon_scale')) incomingDamage = Math.floor(incomingDamage * 0.85);
                const nextWizardHp = prev.wizardHp - incomingDamage;
                setIsWizardHit(true); setIsScreenShaking(true); setTimeout(() => setIsScreenShaking(false), 200); setTimeout(() => setIsWizardHit(false), 200);
                
                if (nextWizardHp <= 0) { 
                  if (prev.relics.includes('phoenix_ash')) {
                    return { ...prev, relics: prev.relics.filter(r => r !== 'phoenix_ash'), wizardHp: Math.floor(gameState.wizardMaxHp * 0.5) };
                  }
                  setTimeout(() => leaveRun(), 100); return { ...prev, wizardHp: 0 }; 
                }
                return { ...prev, wizardHp: nextWizardHp };
              });
              setTimeout(() => setIsProcessingAction(false), 400);
            }, 800);
          } else { setTimeout(() => setIsProcessingAction(false), 500); }
        }, 400);
      };
      applyDamage(damage);
      const totalDoubleCastChance = runState.runBuffs.doubleCastChance + (gameState.doubleCastLevel * 0.02);
      if (Math.random() < totalDoubleCastChance) { 
        setTimeout(() => applyDamage(Math.floor(damage * 0.7), true), 600); 
      }
    }, 1800); 
  }, [runState, skills, isProcessingAction, gameState, generateFloorContent]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'TOWER' && runState.wizardHp < gameState.wizardMaxHp) {
        setRunState(prev => ({ ...prev, wizardHp: Math.min(gameState.wizardMaxHp, prev.wizardHp + (gameState.wizardMaxHp * (0.04 + gameState.manaRegenLevel * 0.02))) }));
      }
      if (mode === 'TOWER' && gameState.towerDps > 0) { 
        setGameState(prev => ({ ...prev, gold: prev.gold + (prev.towerDps / 1) })); 
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.towerDps, gameState.wizardMaxHp, gameState.manaRegenLevel, mode, runState.wizardHp]);

  const buyUpgrade = (upgrade: Upgrade, isSanctum: boolean) => {
    // HARD CAPS FOR GAMEPLAY BALANCE
    if (upgrade.type === 'dodge' && upgrade.level >= 60) return;
    if (upgrade.type === 'double_cast' && upgrade.level >= 30) return;
    if (upgrade.type === 'lifesteal' && upgrade.level >= 20) return;
    if (upgrade.type === 'relic_chance' && upgrade.level >= 25) return;
    if (upgrade.type === 'floor_skip' && upgrade.level >= 50) return;
    if (upgrade.type === 'treasure_find' && upgrade.level >= 10) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    if (gameState.gold >= cost) {
      setGameState(gs => {
        const next = { ...gs, gold: gs.gold - cost };
        // TOWER DPS REBALANCED: linear growth for passive income to prevent runaway inflation
        if (upgrade.type === 'tower_dps') next.towerDps += Math.floor(2 + upgrade.level * 0.5); 
        if (upgrade.type === 'wizard_hp') next.wizardMaxHp += 100;
        if (upgrade.type === 'luck') next.luck += 2;
        if (upgrade.type === 'auto_attack') next.autoAttackLevel += 1;
        if (upgrade.type === 'lifesteal') next.lifestealLevel += 1;
        if (upgrade.type === 'dodge') next.dodgeLevel += 1;
        if (upgrade.type === 'floor_skip') next.floorSkipLevel += 1;
        if (upgrade.type === 'treasure_find') next.treasureFindLevel += 1;
        if (upgrade.type === 'mana_regen') next.manaRegenLevel += 1;
        if (upgrade.type === 'spell_power') next.spellPowerLevel += 1;
        if (upgrade.type === 'exp_boost') next.expBoostLevel += 1;
        if (upgrade.type === 'double_cast') next.doubleCastLevel += 1;
        if (upgrade.type === 'crit_potency') next.critPotencyLevel += 1;
        if (upgrade.type === 'relic_chance') next.relicChanceLevel += 1;
        if (upgrade.type === 'boss_dmg') next.bossDmgLevel += 1;
        if (upgrade.type === 'gold_find') next.goldFindLevel += 1;
        return next;
      });
      if (isSanctum) setStatUpgrades(prev => prev.map(u => u.id === upgrade.id ? { ...u, level: u.level + 1 } : u));
      else setTowerUpgrades(prev => prev.map(u => u.id === upgrade.id ? { ...u, level: u.level + 1 } : u));
    }
  };

  const getCurrentStatValueDisplay = (type: string) => {
    switch (type) {
      case 'tower_dps': return `${gameState.towerDps} Gold/s`;
      case 'wizard_hp': return `${gameState.wizardMaxHp} HP`;
      case 'luck': return `+${gameState.luck} Luck`;
      case 'lifesteal': return `${gameState.lifestealLevel * 1}% Vampirism`;
      case 'dodge': return `${gameState.dodgeLevel}% Evasion`;
      case 'floor_skip': return `Floor ${gameState.floorSkipLevel * 2 + 1}`;
      case 'treasure_find': return `+${gameState.treasureFindLevel * 5}% Rate`;
      case 'mana_regen': return `+${gameState.manaRegenLevel * 4}% Regen`;
      case 'spell_power': return `+${gameState.spellPowerLevel * 10}% Dmg`;
      case 'exp_boost': return `+${gameState.expBoostLevel * 10}% Gain`;
      case 'double_cast': return `${gameState.doubleCastLevel * 2}% Echo`;
      case 'crit_potency': return `+${gameState.critPotencyLevel * 25}% Crit`;
      case 'relic_chance': return `+${gameState.relicChanceLevel}% Rate`;
      case 'boss_dmg': return `+${gameState.bossDmgLevel * 10}% Dmg`;
      case 'gold_find': return `+${gameState.goldFindLevel * 10}% Find`;
      default: return 'Active';
    }
  };

  const getUpgradeBenefit = (type: string, level: number) => {
    switch (type) {
      case 'tower_dps': return `+${Math.floor(2 + level * 0.5)} Gold/sec`;
      case 'wizard_hp': return '+100 Max HP';
      case 'luck': return '+2 Base Luck';
      case 'auto_attack': return '+1 Auto-Dmg';
      case 'lifesteal': return '+1% Lifesteal';
      case 'dodge': return '+1% Evasion';
      case 'floor_skip': return '+2 Floor Jump';
      case 'treasure_find': return '+5% Treasures';
      case 'mana_regen': return '+4% Regen';
      case 'spell_power': return '+10% Spell Damage';
      case 'exp_boost': return '+10% EXP Gain';
      case 'double_cast': return '+2% Echo Chance';
      case 'crit_potency': return '+25% Crit Damage';
      case 'relic_chance': return '+1% Relic Find';
      case 'boss_dmg': return '+10% Boss Dmg';
      case 'gold_find': return '+10% Gold Find';
      default: return 'Increases Power';
    }
  };

  const getSkillNextMasteryDescription = (skillId: string) => {
    switch (skillId) {
      case 'thunder-dice': return "+25% Power and +0.2x Critical Multiplier";
      case 'arcane-flip': return "+40% Power and +0.5x Heads Multiplier";
      case 'fate-cards': return "+50% Power and +1.2x High Card Multiplier";
      case 'eldritch-slots': return "+80% Power and +1.5x Multiplier to all matches";
      case 'chaos-dice': return "+60% Power and +3.0x Triple Jackpot outcome";
      case 'lootbox-libram': return "+45% Power and +0.1x minimum roll increase";
      default: return "+Mastery Growth";
    }
  };

  const totalLuck = gameState.luck + runState.runBuffs.luckBonus + (runState.relics.includes('lucky_die') ? 10 : 0);

  return (
    <div className={`flex flex-col h-screen text-slate-100 bg-[#020617] font-['Press_Start_2P'] select-none overflow-hidden transition-all duration-75 ${isScreenShaking ? 'translate-x-1 translate-y-1' : ''}`}>
      {/* Grand Spellbook Overlay */}
      {showRunInfo && (
        <div className="fixed inset-0 z-[120] bg-black/85 flex items-start md:items-center justify-center p-4 md:p-6 backdrop-blur-md overflow-y-auto" onClick={() => setShowRunInfo(false)}>
           <div className="bg-slate-900 border-4 border-indigo-600 p-5 md:p-8 rounded-2xl w-full max-w-4xl animate-in zoom-in duration-200 shadow-[0_0_100px_rgba(79,70,229,0.3)] my-auto relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-4">
                 <div className="flex flex-col">
                    <span className="text-[12px] md:text-[14px] font-black uppercase text-indigo-400">Grand Spellbook</span>
                    <span className="text-[7px] md:text-[8px] text-slate-500 uppercase font-bold mt-1 tracking-widest">{mode === 'TOWER' ? 'Bastion Records' : 'Dungeon Logbook'}</span>
                 </div>
                 <button onClick={() => setShowRunInfo(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><X size={20} /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="flex flex-col gap-6">
                    <div>
                       <h3 className="text-[9px] text-indigo-300 font-black mb-4 border-b border-indigo-900 pb-1 flex items-center gap-2">
                          {mode === 'TOWER' ? <Medal size={14}/> : <Activity size={14}/>}
                          {mode === 'TOWER' ? 'Eternal Knowledge' : 'Active Enchantments'}
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
                          {mode === 'TOWER' ? (
                            <>
                              <StatItem icon={<Heart size={10}/>} label="Eternal HP" value={gameState.wizardMaxHp} />
                              <StatItem icon={<Swords size={10}/>} label="Spell Dmg" value={`+${(gameState.spellPowerLevel * 10)}%`} />
                              <StatItem icon={<Zap size={10}/>} label="EXP Mastery" value={`+${(gameState.expBoostLevel * 10)}%`} />
                              <StatItem icon={<Star size={10}/>} label="Base Luck" value={gameState.luck} />
                              <StatItem icon={<Waves size={10}/>} label="Vampirism" value={`${(gameState.lifestealLevel * 1)}%`} />
                              <StatItem icon={<Wind size={10}/>} label="Evasion" value={`${gameState.dodgeLevel}%`} />
                              <StatItem icon={<Sparkle size={10}/>} label="Crit Power" value={`+${(gameState.critPotencyLevel * 25)}%`} />
                              <StatItem icon={<Wand2 size={10}/>} label="Echo Cast" value={`${(gameState.doubleCastLevel * 2)}%`} />
                              <StatItem icon={<Trophy size={10}/>} label="Relic Find" value={`+${(gameState.relicChanceLevel)}%`} />
                              <StatItem icon={<Coins size={10}/>} label="Tax Master" value={`+${(gameState.goldFindLevel * 10)}%`} />
                              <StatItem icon={<Skull size={10}/>} label="Titan Slayer" value={`+${(gameState.bossDmgLevel * 10)}%`} />
                              <StatItem icon={<Compass size={10}/>} label="Warp Jump" value={`+${gameState.floorSkipLevel * 2}`} />
                              <StatItem icon={<Search size={10}/>} label="Scrying" value={`+${(gameState.treasureFindLevel * 5)}%`} />
                            </>
                          ) : (
                            <>
                              <StatItem icon={<Sword size={10}/>} label="Total Damage" value={`x${((1 + gameState.spellPowerLevel * 0.10) * runState.runBuffs.damageMult + (runState.relics.includes('void_pendant') ? 0.15 : 0)).toFixed(2)}`} />
                              <StatItem icon={<Sparkles size={10}/>} label="Crit Force" value={`+${((gameState.critPotencyLevel * 0.25 + runState.runBuffs.critPotencyBonus) * 100).toFixed(0)}%`} />
                              <StatItem icon={<Star size={10}/>} label="Leyline Luck" value={totalLuck} />
                              <StatItem icon={<ShieldCheck size={10}/>} label="Reflexes" value={`${gameState.dodgeLevel + runState.runBuffs.dodgeBonus + (runState.relics.includes('shadow_cloak') ? 5 : 0)}%`} />
                              <StatItem icon={<Heart size={10}/>} label="Blood Rite" value={`${((gameState.lifestealLevel * 0.01 + runState.runBuffs.lifestealBonus + (runState.relics.includes('vampire_fang') ? 0.05 : 0)) * 100).toFixed(0)}%`} />
                              <StatItem icon={<Wand2 size={10}/>} label="Twin Casting" value={`${((gameState.doubleCastLevel * 0.02 + runState.runBuffs.doubleCastChance) * 100).toFixed(0)}%`} />
                              <StatItem icon={<Skull size={10}/>} label="Executioner" value={`+${((gameState.bossDmgLevel * 0.1) * 100).toFixed(0)}%`} />
                              <StatItem icon={<Target size={10}/>} label="Dungeon Floor" value={runState.currentFloor} />
                            </>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-6">
                    {mode === 'DUNGEON' ? (
                       <>
                          <div>
                             <h3 className="text-[9px] text-emerald-300 font-black mb-4 border-b border-emerald-900 pb-1 flex items-center gap-2"><Package size={14}/> Run Inventory</h3>
                             <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                {runState.items.length === 0 ? <div className="text-[7px] text-slate-700 uppercase italic py-4">Satchel is currently empty...</div> : 
                                 runState.items.map((item, idx) => (
                                   <div key={idx} className="flex flex-col p-3 bg-slate-950/50 border border-slate-800 rounded-xl group hover:border-emerald-500/30 transition-all">
                                      <span className="text-[8px] text-emerald-400 font-black uppercase">{item.name}</span>
                                      <span className="text-[6px] text-slate-500 uppercase mt-1 leading-tight font-bold">{item.description}</span>
                                   </div>
                                 ))}
                             </div>
                          </div>
                          <div>
                             <h3 className="text-[9px] text-yellow-300 font-black mb-4 border-b border-yellow-900 pb-1 flex items-center gap-2"><Trophy size={14}/> Artifacts Recovered</h3>
                             <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
                                {runState.relics.length === 0 ? <div className="text-[7px] text-slate-700 uppercase italic py-4">No relics claimed from the void...</div> : 
                                 runState.relics.map(rid => {
                                   const r = RELICS.find(rel => rel.id === rid);
                                   return r ? (
                                     <div key={rid} className="flex flex-col p-4 bg-slate-950/80 border-2 border-yellow-900/20 rounded-xl hover:border-yellow-500/40 transition-all group">
                                        <div className="flex justify-between items-center mb-2">
                                           <span className="text-[9px] text-yellow-100 font-black uppercase group-hover:text-yellow-400 transition-all">{r.name}</span>
                                           <div className="text-[6px] bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 font-black border border-yellow-500/20">{r.rarity}</div>
                                        </div>
                                        <p className="text-[7px] text-slate-400 uppercase leading-relaxed font-bold">{r.description}</p>
                                     </div>
                                   ) : null;
                                 })}
                             </div>
                          </div>
                       </>
                    ) : (
                       <>
                          <div>
                             <h3 className="text-[9px] text-rose-300 font-black mb-4 border-b border-rose-900 pb-1 flex items-center gap-2"><Library size={14}/> Tower Chronicles</h3>
                             <div className="grid grid-cols-1 gap-3">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                   <div className="flex justify-between items-center mb-3">
                                      <span className="text-[8px] text-slate-400 uppercase font-black">Wizard Tier</span>
                                      <span className="text-[14px] text-indigo-400 font-black">Level {gameState.level}</span>
                                   </div>
                                   <div className="flex justify-between items-center mb-1">
                                      <span className="text-[7px] text-slate-600 uppercase font-bold">Arcane XP</span>
                                      <span className="text-[7px] text-slate-500 font-bold">{gameState.experience.toLocaleString()} / {getXpToNextLevel(gameState.level).toLocaleString()}</span>
                                   </div>
                                   <div className="relative w-full h-3 bg-slate-900 rounded-full border border-slate-800 p-0.5">
                                      <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-500" style={{ width: `${(gameState.experience / getXpToNextLevel(gameState.level)) * 100}%` }} />
                                   </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                   <StatItem icon={<Coins size={10}/>} label="Passive Gold" value={`${(gameState.towerDps).toLocaleString()}/s`} />
                                   <StatItem icon={<Skull size={10}/>} label="Total Kills" value={gameState.totalKills.toLocaleString()} />
                                   <StatItem icon={<Medal size={10}/>} label="Unspent SP" value={gameState.skillPoints} />
                                </div>
                             </div>
                          </div>
                          <div>
                             <h3 className="text-[9px] text-indigo-300 font-black mb-4 border-b border-indigo-900 pb-1 flex items-center gap-2"><Wand2 size={14}/> Mastery Level</h3>
                             <div className="grid grid-cols-2 gap-2">
                                {skills.map(s => (
                                   <div key={s.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex flex-col justify-center">
                                      <span className="text-[7px] text-slate-500 uppercase font-bold truncate">{s.name}</span>
                                      <span className="text-[9px] text-indigo-200 font-black mt-1">Tier {s.level}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </>
                    )}
                 </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                 <button onClick={() => setShowRunInfo(false)} className="flex-1 py-4 bg-indigo-600 border-b-6 border-indigo-900 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-indigo-500 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-3">
                    {mode === 'DUNGEON' ? <Swords size={14}/> : <Sparkles size={14}/>}
                    {mode === 'DUNGEON' ? 'Resume Descent' : 'Close Spellbook'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="h-12 md:h-16 flex justify-between items-center px-4 md:px-8 bg-slate-950 border-b-2 border-slate-900 z-50 shrink-0">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setShowRunInfo(true)}>
            <Coins className="text-yellow-500" size={14} />
            <span className="text-[10px] md:text-lg text-yellow-200 font-black tracking-tight">{Math.floor(gameState.gold).toLocaleString()}</span>
          </div>
          <button onClick={() => setShowRunInfo(prev => !prev)} className={`p-1.5 rounded-lg border transition-all bg-slate-900 border-slate-700 hover:border-indigo-500`}>
            <BookOpen size={14} className="text-indigo-200" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[120px] md:min-w-[200px]">
           <span className="text-[7px] md:text-[11px] text-indigo-100 font-black uppercase tracking-[0.2em]">{mode === 'TOWER' ? 'Arcane Tower' : 'The Dungeon'}</span>
           <span className="text-[5px] md:text-[7px] text-indigo-400/80 font-black uppercase mt-1">{mode === 'DUNGEON' ? `Floor ${runState.currentFloor}` : `Sanctuary`}</span>
        </div>

        <div className="flex-1 flex items-center justify-end gap-3 md:gap-6">
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-2">
                <span className="text-[6px] md:text-[8px] text-slate-400 uppercase font-bold">Lvl</span>
                <span className="text-[10px] md:text-lg text-purple-400 font-black tracking-tight">{gameState.level}</span>
             </div>
             <div className="relative w-20 md:w-32 h-1.5 bg-slate-900 rounded-full border border-slate-800">
                <div className="absolute h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${(gameState.experience / getXpToNextLevel(gameState.level)) * 100}%` }} />
             </div>
          </div>
          {mode === 'DUNGEON' && (
            <button onClick={leaveRun} className="bg-red-950/40 hover:bg-red-900 border border-red-900 px-2 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-2">
              <LogOut size={12} className="text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stage */}
      <div className="relative flex-[1.4] flex flex-col items-center justify-center overflow-hidden px-4">
        <DungeonBackdrop floor={mode === 'DUNGEON' ? runState.currentFloor : 1} mode={mode} />
        {floatingTexts.map(t => (
          <div key={t.id} className={`absolute pointer-events-none font-black z-[60] flex items-center gap-1 ${t.color} ${t.size}`} style={{ left: t.x - 20, top: t.y - 40, animation: 'float-up 1.2s forwards' }}>
            {t.icon} {t.text}
          </div>
        ))}
        <div className={`relative z-20 flex flex-col items-center ${mode === 'DUNGEON' ? 'md:w-1/2' : 'w-full'}`}>
           <HealthBar current={runState.wizardHp} max={gameState.wizardMaxHp} label="Grand Archmage" width="w-44 md:w-56" />
           <div className="relative scale-[0.7] md:scale-100 -mt-2">
             <PixelWizard isHit={isWizardHit} isAttacking={isWizardAttacking} />
           </div>
           {mode === 'TOWER' && (
             <button onClick={startRun} disabled={!wizardReady} className="mt-4 px-10 py-5 bg-indigo-600 border-b-6 border-indigo-900 rounded-2xl uppercase text-[10px] font-black tracking-[0.2em] shadow-2xl transition-all flex items-center gap-4 group">
               Descend Dungeon <Compass size={20} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
           )}
        </div>

        {mode === 'DUNGEON' && (
          <div className="flex flex-col items-center justify-center md:w-1/2 relative mt-4 min-h-[160px]">
             {!runState.floorCleared ? (
               runState.floorType === 'TREASURE' ? (
                 <div className="scale-75 md:scale-100 flex flex-col items-center gap-3">
                    <PixelChest isOpen={isChestOpen} onOpen={openTreasure} />
                 </div>
               ) : runState.enemy ? (
                 <>
                   <HealthBar current={runState.enemy.hp} max={runState.enemy.maxHp} label={runState.enemy.name} width="w-44 md:w-64" colorClass={runState.enemy.name.includes('BOSS') ? "from-yellow-400 to-orange-600" : "from-red-600 to-rose-400"} />
                   <div className="scale-[0.7] md:scale-100 -mt-2">
                     <PixelEnemy color={runState.enemy.color} isHit={isEnemyHit} name={runState.enemy.name} visualType={runState.enemy.visualType} />
                   </div>
                 </>
               ) : <div className="text-slate-500 text-[8px] animate-pulse uppercase tracking-widest">Wandering the Void...</div>
             ) : (
               <div className="flex flex-col items-center gap-2 text-center animate-in zoom-in duration-300">
                  <CheckCircle2 size={56} className="text-emerald-500/80 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                  <span className="text-emerald-400 text-[12px] font-black uppercase tracking-[0.4em]">Passage Safe</span>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Tabs / Bottom Panel */}
      <div className="h-[40%] bg-slate-950 border-t-2 border-slate-900 flex flex-col shrink-0 overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
        {mode === 'TOWER' ? (
          <>
            <div className="flex h-12 bg-slate-900 border-b border-slate-950 shrink-0">
               <button onClick={() => setActiveTab('PASSIVE')} className={`flex-1 flex items-center justify-center gap-3 text-[7px] font-black uppercase transition-all ${activeTab === 'PASSIVE' ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500'}`}><Tower size={16}/>Bastion</button>
               <button onClick={() => setActiveTab('EXPLORE')} className={`flex-1 flex items-center justify-center gap-3 text-[7px] font-black uppercase transition-all ${activeTab === 'EXPLORE' ? 'text-rose-400 bg-rose-500/5' : 'text-slate-500'}`}><MapIcon size={16}/>Library</button>
               <button onClick={() => setActiveTab('TRAINING')} className={`flex-1 flex items-center justify-center gap-3 text-[7px] font-black uppercase transition-all ${activeTab === 'TRAINING' ? 'text-purple-400 bg-purple-500/5' : 'text-slate-500'}`}><GraduationCap size={16}/>Sanctum</button>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
               {activeTab === 'EXPLORE' && (
                 <div className="bg-slate-900/50 px-6 py-3 flex justify-between items-center border-b border-slate-800 shrink-0">
                    <span className="text-[8px] text-indigo-300 font-black uppercase tracking-widest">Mastery Knowledge</span>
                    <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full animate-pulse">
                       <Medal size={14} className="text-indigo-400" />
                       <span className="text-[10px] text-indigo-200 font-black">{gameState.skillPoints} SP</span>
                    </div>
                 </div>
               )}
               
               <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                     {(activeTab === 'PASSIVE' ? towerUpgrades : activeTab === 'TRAINING' ? statUpgrades : []).map(u => {
                       const cost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level));
                       return (
                         <div key={u.id} className={`flex flex-col p-4 border-2 rounded-xl transition-all ${gameState.gold >= cost ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-slate-950 opacity-50 border-slate-900'}`}>
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-black text-white uppercase">{u.name}</span>
                             <span className="text-[7px] text-slate-500 font-bold">Lv.{u.level}</span>
                           </div>
                           <p className="text-[7px] text-indigo-300 uppercase italic mb-3 p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/20 leading-relaxed">{u.description}</p>
                           
                           {/* Current Value Display */}
                           <div className="mb-2 px-2 py-1 bg-slate-950/50 border border-slate-800 rounded flex justify-between items-center">
                              <span className="text-[6px] text-slate-500 uppercase font-black">Current:</span>
                              <span className="text-[7px] text-indigo-400 font-black">{getCurrentStatValueDisplay(u.type)}</span>
                           </div>

                           <div className="mb-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                             <TrendingUp size={10} className="text-emerald-400" />
                             <span className="text-[6px] text-emerald-400 font-black uppercase tracking-tighter">Next Level: {getUpgradeBenefit(u.type, u.level)}</span>
                           </div>

                           <div className="flex justify-between items-center mt-auto">
                             <div className="text-[9px] text-yellow-500 font-black flex items-center gap-2"><Coins size={12}/>{cost.toLocaleString()}</div>
                             <button onClick={() => buyUpgrade(u, activeTab === 'TRAINING')} disabled={gameState.gold < cost} className={`px-5 py-2 rounded-lg text-[7px] font-black uppercase transition-all ${gameState.gold >= cost ? 'bg-indigo-600 text-white shadow-lg active:scale-95' : 'bg-slate-800 text-slate-500'}`}>Upgrade</button>
                           </div>
                         </div>
                       );
                     })}
                     
                     {activeTab === 'EXPLORE' && skills.map(s => (
                         <div key={s.id} className={`flex flex-col p-4 border-2 rounded-xl transition-all ${selectedSkillId === s.id ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'bg-slate-900 border-slate-800'}`}>
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white uppercase">{s.name}</span>
                                <span className="text-[6px] text-rose-400 font-bold uppercase mt-1">Mastery {s.level}</span>
                             </div>
                             <button onClick={() => setSelectedSkillId(s.id)} className={`p-1.5 rounded-lg border transition-all ${selectedSkillId === s.id ? 'bg-rose-500 border-rose-400' : 'bg-slate-800 border-slate-700 hover:border-rose-500'}`}><Zap size={12} /></button>
                           </div>
                           <p className="text-[7px] text-rose-300 uppercase italic mb-3 p-3 bg-rose-950/30 rounded-lg border border-rose-500/20">{s.description}</p>
                           
                           <div className="mb-2 px-2 py-1 bg-slate-950/50 border border-slate-800 rounded flex justify-between items-center">
                              <span className="text-[6px] text-slate-500 uppercase font-black">Base Power:</span>
                              <span className="text-[7px] text-rose-400 font-black">{Math.floor(s.baseDamage * Math.pow(1.35, s.level - 1))} ATK</span>
                           </div>

                           <div className="mb-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                             <TrendingUp size={10} className="text-emerald-400" />
                             <span className="text-[6px] text-emerald-400 font-black uppercase tracking-tighter">Next: {getSkillNextMasteryDescription(s.id)}</span>
                           </div>

                           <button 
                             onClick={() => upgradeSkill(s.id)} 
                             disabled={gameState.skillPoints <= 0}
                             className={`w-full py-2.5 text-[8px] font-black rounded-lg uppercase flex items-center justify-center gap-2 transition-all ${gameState.skillPoints > 0 ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 active:scale-95' : 'bg-slate-800 text-slate-500'}`}
                           >
                              {gameState.skillPoints > 0 ? <ChevronUp size={14}/> : <Lock size={12}/>}
                              {gameState.skillPoints > 0 ? 'Improve Libram' : 'No Points'}
                           </button>
                         </div>
                     ))}
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col p-4 bg-slate-950 relative overflow-y-auto custom-scrollbar">
             {runState.floorCleared ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 z-10 animate-in slide-in-from-bottom-4 duration-300 pb-4">
                   <div className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] mb-2 animate-pulse">Loot Secured</div>
                   
                   <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {runState.rewardsThisFloor.gold > 0 && (
                        <div className="flex justify-between items-center bg-yellow-500/10 px-4 py-3 rounded-xl border border-yellow-500/20">
                           <div className="flex items-center gap-3">
                              <Coins size={16} className="text-yellow-400"/>
                              <span className="text-[8px] text-yellow-500 font-black uppercase">Gold</span>
                           </div>
                           <span className="text-[12px] text-yellow-100 font-black">+{runState.rewardsThisFloor.gold}</span>
                        </div>
                      )}
                      {runState.rewardsThisFloor.xp > 0 && (
                        <div className="flex justify-between items-center bg-purple-500/10 px-4 py-3 rounded-xl border border-purple-500/20">
                           <div className="flex items-center gap-3">
                              <Zap size={16} className="text-purple-400"/>
                              <span className="text-[8px] text-purple-500 font-black uppercase">Exp</span>
                           </div>
                           <span className="text-[12px] text-purple-100 font-black">+{runState.rewardsThisFloor.xp}</span>
                        </div>
                      )}
                      {runState.rewardsThisFloor.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-indigo-500/10 px-4 py-3 rounded-xl border border-indigo-500/20 md:col-span-2">
                           <div className="flex items-center gap-3">
                              <Package size={16} className="text-indigo-400"/>
                              <span className="text-[8px] text-indigo-400 font-black uppercase">Found: {item.name}</span>
                           </div>
                           <div className="text-[6px] text-indigo-300 font-black uppercase italic bg-indigo-500/20 px-2 py-1 rounded">Rare</div>
                        </div>
                      ))}
                      {runState.rewardsThisFloor.gold === 0 && runState.rewardsThisFloor.xp === 0 && runState.rewardsThisFloor.items.length === 0 && (
                        <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest text-center py-4 w-full md:col-span-2 opacity-50">Nothing found here...</div>
                      )}
                   </div>

                   <button onClick={nextFloor} className="w-full md:w-80 py-5 bg-emerald-600 border-b-6 border-emerald-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 hover:bg-emerald-500 hover:-translate-y-1 active:translate-y-1 active:border-b-0">
                      Venture Deeper <ArrowRightCircle size={20} />
                   </button>
                </div>
             ) : (runState.floorType === 'MONSTER' || runState.floorType === 'BOSS') ? (
                <div className="flex-1 flex flex-col gap-3 overflow-hidden z-10">
                   <div className="flex justify-between items-center shrink-0 mb-1 px-1">
                      <span className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] flex items-center gap-3"><Zap size={14} className="animate-pulse" />{skills.find(s => s.id === runState.selectedSkillId)?.name}</span>
                      <span className="text-[7px] text-slate-600 uppercase font-black">Luck: {totalLuck}%</span>
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <GamblingMechanic 
                        type={skills.find(s => s.id === runState.selectedSkillId)?.gambleType || 'DICE'}
                        skillId={runState.selectedSkillId || ''}
                        skillLevel={skills.find(s => s.id === runState.selectedSkillId)?.level || 1}
                        luck={totalLuck}
                        onResult={handleGambleResult}
                        isProcessing={isProcessingAction}
                      />
                   </div>
                </div>
             ) : <div className="flex-1 flex items-center justify-center text-slate-500 text-[9px] uppercase tracking-[0.5em] italic font-black">Dimensional Rift...</div>}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 1; transform: translateY(-15px) scale(1.1); }
          100% { transform: translateY(-130px) scale(1.5); opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string | number, icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border-2 border-slate-800/50 hover:border-indigo-500/30 transition-all group">
    <div className="flex items-center gap-2">
       {icon && <span className="text-indigo-400/60 group-hover:text-indigo-400 transition-all">{icon}</span>}
       <span className="text-[7px] text-slate-400 uppercase font-black tracking-tight group-hover:text-slate-300">{label}</span>
    </div>
    <span className="text-[10px] text-rose-400 font-black">{value}</span>
  </div>
);

export default App;

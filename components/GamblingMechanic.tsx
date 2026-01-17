
import React, { useState, useEffect, useRef } from 'react';
import { GambleType } from '../types';
import { Dice6, CircleDot, Layers, RotateCw, Sparkles, AlertTriangle, Zap, Star, Trophy, ArrowRightCircle, Skull, Moon, Sun, FlaskConical, Gem } from 'lucide-react';

interface GambleProps {
  type: GambleType;
  skillId: string;
  skillLevel: number;
  luck: number;
  onResult: (multiplier: number) => void;
  isProcessing: boolean;
}

type FeedbackType = 'NONE' | 'FUMBLE' | 'WEAK' | 'SUCCESS' | 'CRIT' | 'MEGA' | 'CHAOS' | 'SLOT_MATCH' | 'SLOT_WIN';

interface LootSegment {
  mult: number;
  color: string;
  label: string;
  icon: React.ReactNode;
}

const ITEM_WIDTH = 100; // pixels

const LOOT_ITEMS: LootSegment[] = [
  { mult: 10.0, color: '#eab308', label: 'VOID JACKPOT', icon: <Trophy size={20}/> }, 
  { mult: 0.1, color: '#ef4444', label: 'FAILURE', icon: <AlertTriangle size={20}/> },
  { mult: 1.0, color: '#3b82f6', label: 'ARCANE HIT', icon: <Zap size={20}/> },
  { mult: 3.0, color: '#a855f7', label: 'MYSTIC CRIT', icon: <Sparkles size={20}/> },
  { mult: 1.0, color: '#475569', label: 'ARCANE HIT', icon: <Zap size={20}/> },
  { mult: 0.1, color: '#ef4444', label: 'FAILURE', icon: <AlertTriangle size={20}/> },
  { mult: 3.0, color: '#a855f7', label: 'MYSTIC CRIT', icon: <Sparkles size={20}/> },
  { mult: 1.0, color: '#3b82f6', label: 'ARCANE HIT', icon: <Zap size={20}/> },
  { mult: 1.0, color: '#475569', label: 'ARCANE HIT', icon: <Zap size={20}/> },
  { mult: 0.1, color: '#ef4444', label: 'FAILURE', icon: <AlertTriangle size={20}/> },
  { mult: 1.0, color: '#3b82f6', label: 'ARCANE HIT', icon: <Zap size={20}/> },
  { mult: 1.0, color: '#475569', label: 'ARCANE HIT', icon: <Zap size={20}/> },
];

const SLOT_ICONS = [
  { id: 'skull', icon: <Skull size={32} />, color: '#94a3b8', weight: 40, mult: 2.0, feedback: 'SLOT_WIN' as FeedbackType },
  { id: 'potion', icon: <FlaskConical size={32} />, color: '#ec4899', weight: 25, mult: 4.5, feedback: 'SLOT_WIN' as FeedbackType },
  { id: 'gem', icon: <Gem size={32} />, color: '#3b82f6', weight: 15, mult: 7.0, feedback: 'SLOT_MATCH' as FeedbackType },
  { id: 'sun', icon: <Sun size={32} />, color: '#f59e0b', weight: 8, mult: 12.0, feedback: 'CRIT' as FeedbackType },
  { id: 'star', icon: <Star size={32} />, color: '#facc15', weight: 3, mult: 25.0, feedback: 'MEGA' as FeedbackType },
];

export const GamblingMechanic: React.FC<GambleProps> = ({ type, skillId, skillLevel, luck, onResult, isProcessing }) => {
  const [localState, setLocalState] = useState<any>(null);
  const [offset, setOffset] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>('NONE');
  const [resultMult, setResultMult] = useState<number | null>(null);
  const [slotOffsets, setSlotOffsets] = useState([0, 0, 0]);
  const [leverState, setLeverState] = useState<'UP' | 'DOWN'>('UP');
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showFeedback = (mult: number, specialLabel?: FeedbackType) => {
    setTimeout(() => {
      let f: FeedbackType = specialLabel || 'SUCCESS';
      if (!specialLabel) {
        if (mult >= 10.0) f = 'MEGA';
        else if (mult >= 4.0) f = 'CRIT';
        else if (mult === 0 || mult < 0.2) f = 'FUMBLE';
        else if (mult < 1.0) f = 'WEAK';
      }
      
      setFeedback(f);
      setResultMult(parseFloat(mult.toFixed(2)));
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => {
        setFeedback('NONE');
        setResultMult(null);
      }, 2000); 
    }, 1000); 
  };

  const playGamble = () => {
    if (isProcessing || isRolling) return;
    setIsRolling(true);
    setFeedback('NONE');
    setResultMult(null);
    
    const luckBonus = luck / 500; 
    const isChaos = skillId === 'chaos-dice';
    
    if (type === 'DICE') {
      const diceCount = isChaos ? 3 : 2;
      let rolls = 0;
      const rollInterval = setInterval(() => {
        const tempVals = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        setLocalState({ vals: tempVals });
        rolls++;
        if (rolls > 12) {
          clearInterval(rollInterval);
          finishDice();
        }
      }, 70);

      const finishDice = () => {
        let diceVals = [];
        let total = 0;
        for(let i=0; i < diceCount; i++) {
          let v = Math.floor(Math.random() * 6) + 1;
          if (Math.random() < luckBonus && v < 6) v++;
          total += v;
          diceVals.push(v);
        }
        setLocalState({ vals: diceVals });
        let mult = 1.0;
        let specialFeedback: FeedbackType | undefined;
        if (isChaos) {
          const allSame = diceVals.every(v => v === diceVals[0]);
          if (allSame) {
            if (diceVals[0] === 6) { 
              // Mastery scales triples: 15x + level-based boost
              mult = 15.0 + (skillLevel * 3.0); 
              specialFeedback = 'MEGA'; 
            }
            else if (diceVals[0] === 1) { mult = 0.1; specialFeedback = 'FUMBLE'; }
            else { 
              mult = 8.0 + (skillLevel * 1.5); 
              specialFeedback = 'CHAOS'; 
            }
          } else if (total >= 15) { mult = 5.0 + (skillLevel * 0.5); specialFeedback = 'CRIT'; }
          else if (total >= 11) { mult = 2.0; specialFeedback = 'SUCCESS'; }
          else if (total <= 6) { mult = 0.4; specialFeedback = 'WEAK'; }
          else { mult = 1.0; }
        } else {
          // THUNDERBOLT (DICE): Mastery increases CRIT multiplier
          if (total === 12) mult = 5.0 + (skillLevel * 0.5);
          else if (total >= 10) mult = 3.0 + (skillLevel * 0.2);
          else if (total >= 7) mult = 1.5;
          else if (total === 2) mult = 0;
          else if (total < 5) mult = 0.5;
        }
        setIsRolling(false);
        showFeedback(mult, specialFeedback);
        onResult(mult);
      };
    } else if (type === 'COIN') {
      setLocalState('SPINNING');
      setTimeout(() => {
        const isHeads = Math.random() > (0.5 - luckBonus);
        // ARCANE FLIP: Mastery buffs HEADS and reduces TAILS penalty
        const headsMult = 3.0 + (skillLevel * 0.5);
        const tailsMult = Math.min(1.0, 0.5 + (skillLevel * 0.05));
        const mult = isHeads ? headsMult : tailsMult;
        setLocalState(isHeads ? 'HEADS' : 'TAILS');
        setIsRolling(false);
        showFeedback(mult);
        onResult(mult);
      }, 600);
    } else if (type === 'CARDS') {
      setLocalState('DRAWING');
      setTimeout(() => {
        const card = Math.min(13, Math.floor(Math.random() * 13) + 1 + Math.floor(luck / 15));
        setLocalState(card);
        // SOUL TAROT: Mastery massively buffs High Cards
        const highMult = 4.0 + (skillLevel * 1.2);
        const lowMult = Math.min(1.0, 0.2 + (skillLevel * 0.1));
        const mult = card >= 10 ? highMult : card <= 3 ? lowMult : 1.5;
        setIsRolling(false);
        showFeedback(mult);
        onResult(mult);
      }, 500);
    } else if (type === 'WHEEL') {
      let chosenIdx = Math.floor(Math.random() * LOOT_ITEMS.length);
      const isJackpotAttempt = Math.random() < (0.05 + luckBonus);
      if (isJackpotAttempt) chosenIdx = 0;
      
      // WHEEL OF FATE: Mastery scales Jackpot and base success
      let mult = LOOT_ITEMS[chosenIdx].mult;
      if (chosenIdx === 0) mult = 10.0 + (skillLevel * 2.5);
      else if (mult >= 1.0) mult += (skillLevel * 0.1);

      const containerWidth = containerRef.current?.offsetWidth || 300;
      const itemIdxInStrip = (5 * LOOT_ITEMS.length) + chosenIdx;
      const drift = (Math.random() * 0.8 - 0.4) * ITEM_WIDTH;
      const targetPos = (itemIdxInStrip * ITEM_WIDTH) + (ITEM_WIDTH / 2) - (containerWidth / 2) + drift;
      setOffset(-targetPos);
      setLocalState('SPINNING');
      setTimeout(() => {
        setLocalState(mult);
        setIsRolling(false);
        showFeedback(mult);
        onResult(mult);
      }, 2500); 
    } else if (type === 'SLOTS') {
      setLeverState('DOWN');
      setTimeout(() => setLeverState('UP'), 300);

      const totalWeight = SLOT_ICONS.reduce((acc, icon) => acc + icon.weight + (icon.id === 'star' ? luckBonus * 80 : 0), 0);
      let random = Math.random() * totalWeight;
      let winnerIdx = 0;
      for (let i = 0; i < SLOT_ICONS.length; i++) {
        const weight = SLOT_ICONS[i].weight + (SLOT_ICONS[i].id === 'star' ? luckBonus * 80 : 0);
        if (random < weight) {
          winnerIdx = i;
          break;
        }
        random -= weight;
      }

      const finalIcons = [winnerIdx, winnerIdx, winnerIdx];
      const winningSymbol = SLOT_ICONS[winnerIdx];

      const itemHeight = 80; 
      const reelContainerHeight = 144; 
      const centerPadding = (reelContainerHeight - itemHeight) / 2;

      const reelRepetitions = 10; 
      const newOffsets = finalIcons.map((idx, i) => {
        const baseOffset = idx * itemHeight - centerPadding;
        const totalTravelIcons = (reelRepetitions + i * 5) * SLOT_ICONS.length;
        return (totalTravelIcons * itemHeight) + baseOffset;
      });

      setSlotOffsets(newOffsets);
      setLocalState({ finalIcons });

      setTimeout(() => {
        // ELDRITCH SLOTS: Mastery adds damage scaling to the multiplier
        const mult = winningSymbol.mult + (skillLevel * 1.5);
        const specialFeedback = winningSymbol.feedback;

        setIsRolling(false);
        showFeedback(mult, specialFeedback);
        onResult(mult);
      }, 2000); 
    }
  };

  const getFeedbackStyles = () => {
    switch(feedback) {
      case 'CHAOS': return 'shadow-[inset_0_0_50px_rgba(236,72,153,0.6)] border-pink-500 bg-pink-950/30 animate-pulse';
      case 'MEGA': return 'shadow-[inset_0_0_60px_rgba(234,179,8,0.5)] border-yellow-400 bg-yellow-950/30';
      case 'CRIT': return 'shadow-[inset_0_0_40px_rgba(168,85,247,0.4)] border-purple-400 bg-purple-950/30';
      case 'SUCCESS': return 'shadow-[inset_0_0_30px_rgba(59,130,246,0.3)] border-blue-400 bg-blue-950/30';
      case 'SLOT_MATCH': return 'shadow-[inset_0_0_40px_rgba(59,130,246,0.5)] border-blue-500 bg-blue-950/30';
      case 'SLOT_WIN': return 'shadow-[inset_0_0_40px_rgba(16,185,129,0.5)] border-emerald-500 bg-emerald-950/30';
      case 'WEAK': return 'border-slate-700 bg-slate-900/40 grayscale opacity-60';
      case 'FUMBLE': return 'shadow-[inset_0_0_50px_rgba(239,68,68,0.5)] border-red-600 bg-red-950/30';
      default: return 'border-indigo-500/20 bg-slate-900/40';
    }
  };

  const getFeedbackLabel = () => {
    switch(feedback) {
      case 'CHAOS': return { text: 'REALITY CRACKED!', color: 'text-pink-400', icon: <Zap className="animate-ping" size={14}/> };
      case 'MEGA': return { text: 'ETERNAL FORTUNE!', color: 'text-yellow-400', icon: <Star className="animate-spin" size={14}/> };
      case 'CRIT': return { text: 'ARCANE OVERLOAD!', color: 'text-purple-400', icon: <Zap className="animate-bounce" size={14}/> };
      case 'SUCCESS': return { text: 'MAGIC ALIGNED', color: 'text-blue-400', icon: <Sparkles className="animate-pulse" size={14}/> };
      case 'SLOT_MATCH': return { text: 'ARCANE RESONANCE!', color: 'text-blue-400', icon: <Sparkles size={14}/> };
      case 'SLOT_WIN': return { text: 'TRI-MANIFEST!', color: 'text-emerald-400', icon: <Trophy size={14}/> };
      case 'WEAK': return { text: 'VOID WHISPER...', color: 'text-slate-500', icon: null };
      case 'FUMBLE': return { text: 'ARCANE FIZZLE!!', color: 'text-red-500', icon: <AlertTriangle className="animate-ping" size={14}/> };
      default: return null;
    }
  };

  const label = getFeedbackLabel();
  const isChaosSkill = skillId === 'chaos-dice';

  return (
    <div className={`relative p-2 md:p-3 rounded-xl border-2 flex flex-col items-center justify-between h-full gap-2 transition-all duration-500 ${getFeedbackStyles()}`}>
      
      {label && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] animate-in zoom-in fade-in duration-300">
           <div className={`flex flex-col items-center gap-2 bg-slate-950/95 px-10 py-6 rounded-[3rem] border-4 border-current shadow-[0_0_60px_rgba(0,0,0,1)] ${label.color}`}>
              <div className="flex items-center gap-5">
                {label.icon}
                <span className="text-[16px] md:text-xl font-black tracking-[0.2em] uppercase drop-shadow-[0_0_10px_currentColor]">{label.text}</span>
                {label.icon}
              </div>
              {resultMult !== null && (
                <div className="flex items-center gap-3 mt-3 scale-110">
                   <span className="text-[10px] uppercase font-black opacity-50 tracking-tighter">Multiplier:</span>
                   <span className="text-[28px] md:text-3xl font-black drop-shadow-[0_4px_15px_currentColor]">{resultMult}x</span>
                </div>
              )}
           </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center w-full min-h-0 overflow-hidden" ref={containerRef}>
        {type === 'DICE' && (
          <div className="flex gap-2 md:gap-5 flex-wrap justify-center">
            {(localState?.vals || (isChaosSkill ? [1,1,1] : [1, 1])).map((v: number, i: number) => (
              <div key={i} className={`w-12 h-12 md:w-24 md:h-24 rounded-2xl flex items-center justify-center font-black text-2xl md:text-5xl shadow-2xl relative transition-all duration-300 ${!isRolling && feedback !== 'NONE' ? 'scale-110 rotate-3 border-indigo-400 drop-shadow-[0_0_20px_#818cf8]' : ''} ${isChaosSkill ? 'bg-indigo-950 border-pink-500/50 text-pink-100 border-2' : 'bg-white border-slate-300 text-slate-900 border-4'} ${isRolling ? (isChaosSkill ? 'animate-chaos-vibrate' : 'animate-dice-shake') : ''}`}>
                 {v}
                 {!isChaosSkill && (
                   <><div className="absolute top-3 left-3 w-2 h-2 bg-slate-200 rounded-full" /><div className="absolute bottom-3 right-3 w-2 h-2 bg-slate-200 rounded-full" /></>
                 )}
                 {isChaosSkill && (<div className="absolute inset-0 bg-pink-500/10 animate-pulse rounded-2xl" />)}
              </div>
            ))}
          </div>
        )}
        
        {type === 'COIN' && (
          <div className={`relative w-28 h-28 md:w-40 md:h-40 flex items-center justify-center`}>
            <div className={`w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 border-4 border-yellow-950 flex flex-col items-center justify-center font-black text-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-500 ${isRolling || localState === 'SPINNING' ? 'animate-coin-flip' : 'scale-110 drop-shadow-[0_0_30px_#facc15]'}`}>
              <div className="text-[12px] md:text-[14px] uppercase tracking-tighter mb-1 font-black">{localState === 'SPINNING' ? '???' : 'FATE'}</div>
              <div className="text-[20px] md:text-[24px] font-black">{localState === 'SPINNING' ? '' : localState || 'READY'}</div>
              <div className="mt-2 opacity-60"><CircleDot size={24}/></div>
            </div>
          </div>
        )}

        {type === 'CARDS' && (
          <div className="relative w-20 h-30 md:w-24 md:h-36 flex items-center justify-center">
            <div className={`w-full h-full bg-white border-4 border-slate-300 rounded-2xl flex flex-col items-center justify-center text-rose-600 font-black shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 ${isRolling || localState === 'DRAWING' ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100 scale-110 drop-shadow-[0_0_25px_#f43f5e]'}`}>
               <div className="text-4xl md:text-5xl">{localState === 13 ? 'K' : localState === 12 ? 'Q' : localState === 11 ? 'J' : localState === 1 ? 'A' : localState || '?'}</div>
               <div className="text-5xl absolute opacity-5 scale-[2]">♥</div>
            </div>
          </div>
        )}

        {type === 'WHEEL' && (
          <div className="relative w-full h-36 md:h-44 flex flex-col items-center justify-center px-4">
             <div className={`relative w-full h-28 md:h-32 bg-slate-950 border-y-4 border-indigo-900/50 overflow-hidden rounded-xl shadow-inner transition-all ${!isRolling && feedback !== 'NONE' ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : ''}`}>
                <div className="flex h-full transition-transform duration-[2500ms] ease-[cubic-bezier(0.1,0,0.1,1)]" style={{ transform: `translateX(${offset}px)`, width: `${LOOT_ITEMS.length * ITEM_WIDTH * 10}px` }}>
                   {[...Array(10)].map((_, rep) => (
                      <React.Fragment key={`rep-${rep}`}>
                        {LOOT_ITEMS.map((item, i) => (
                          <div key={`${rep}-${i}`} className="flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-900 relative group overflow-hidden" style={{ width: `${ITEM_WIDTH}px`, backgroundColor: `${item.color}15` }}>
                             <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }} />
                             <div className="text-white/20 mb-2">{item.icon}</div>
                             <div className="text-[11px] md:text-[13px] font-black text-white/80 uppercase tracking-tighter">{item.label}</div>
                             <div className="text-[9px] md:text-[11px] font-bold text-white/40 mt-1" style={{ color: item.color }}>{item.mult}x</div>
                          </div>
                        ))}
                      </React.Fragment>
                   ))}
                </div>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 z-40 flex flex-col justify-between pointer-events-none">
                   <div className="w-full h-5 bg-yellow-500 rounded-b-full shadow-[0_0_15px_#eab308]" /><div className="flex-1 w-[3px] bg-yellow-500 mx-auto opacity-80" /><div className="w-full h-5 bg-yellow-500 rounded-t-full shadow-[0_0_15px_#eab308]" />
                </div>
             </div>
          </div>
        )}

        {type === 'SLOTS' && (
          <div className="flex items-center gap-6 relative px-4">
            <div className="flex gap-2 h-32 md:h-40 px-4 py-4 bg-gradient-to-b from-yellow-700 via-yellow-400 to-yellow-800 rounded-[2.5rem] border-4 border-yellow-950 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative">
               <div className="flex gap-1.5 bg-slate-950/90 rounded-2xl p-2 shadow-inner border-2 border-yellow-900/50">
                  {[0, 1, 2].map((reelIdx) => {
                    const itemHeight = 80;
                    const currentY = slotOffsets[reelIdx];
                    const centerIndex = !isRolling && localState?.finalIcons ? Math.floor((currentY + 72) / itemHeight) : -1;
                    
                    return (
                      <div key={reelIdx} className="w-14 md:w-24 bg-slate-900 border-x border-slate-800/50 relative overflow-hidden flex flex-col items-center h-full">
                         <div 
                           className={`absolute top-0 w-full transition-transform duration-[2000ms] ease-[cubic-bezier(0.1,0,0.1,1)] ${isRolling ? 'scale-y-110' : ''}`}
                           style={{ 
                             transform: `translateY(-${currentY}px)`,
                             height: 'auto'
                           }}
                         >
                           {[...Array(1000)].map((_, i) => {
                             const icon = SLOT_ICONS[i % SLOT_ICONS.length];
                             const isHighlighted = !isRolling && i === centerIndex;
                             return (
                               <div key={i} className={`h-20 flex items-center justify-center border-b border-slate-950/20 transition-all duration-300 ${isHighlighted ? 'scale-150 z-50' : 'scale-90 opacity-70'}`} style={{ color: icon.color }}>
                                 <div className={`transition-all duration-700 ${isHighlighted ? 'drop-shadow-[0_0_20px_currentColor] animate-bounce-short opacity-100' : ''}`}>
                                   {icon.icon}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none z-10" />
                         <div className="absolute inset-x-0 top-[calc(50%-40px)] h-20 bg-white/5 pointer-events-none z-20 border-y-2 border-white/10" />
                      </div>
                    );
                  })}
               </div>

               <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-yellow-300/50 shadow-[0_0_30px_#facc15] pointer-events-none z-30 animate-pulse" />
               <div className="absolute top-1/2 -translate-y-1/2 left-1.5 w-3.5 h-3.5 bg-yellow-500 rounded-full z-40 shadow-[0_0_15px_#facc15] border border-yellow-200" />
               <div className="absolute top-1/2 -translate-y-1/2 right-1.5 w-3.5 h-3.5 bg-yellow-500 rounded-full z-40 shadow-[0_0_15px_#facc15] border border-yellow-200" />
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center h-56 w-14 relative -ml-2">
               <div className="w-5 h-36 bg-slate-800 border-2 border-slate-900 rounded-full shadow-2xl relative flex items-start justify-center">
                  <div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-900 border-4 border-red-950 shadow-2xl transition-all duration-400 ${leverState === 'DOWN' ? 'translate-y-24 scale-90' : 'translate-y-0'}`}
                  >
                     <div className="w-full h-full bg-white/20 rounded-full blur-[2px]" />
                  </div>
               </div>
               <div className="absolute -bottom-3 w-16 h-12 bg-slate-900 border-4 border-slate-950 rounded-2xl shadow-2xl" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 w-full shrink-0 z-10 px-4 mb-2">
        <button 
          onClick={playGamble}
          disabled={isProcessing || isRolling}
          className={`w-full py-4 md:py-5 rounded-2xl font-black text-[11px] md:text-sm tracking-[0.25em] transition-all active:scale-95 flex items-center justify-center gap-4 border-b-6 border-indigo-950 shadow-2xl ${
            (isProcessing || isRolling) ? 'bg-slate-800 text-slate-500 cursor-not-allowed translate-y-1 border-b-0' : 
            isChaosSkill ? 'bg-pink-600 border-pink-900 text-white hover:bg-pink-500' : 
            type === 'SLOTS' ? 'bg-yellow-600 border-yellow-900 text-white hover:bg-yellow-500 shadow-[0_8px_30px_rgba(234,179,8,0.5)]' :
            'bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-1'
          }`}
        >
          {type === 'WHEEL' ? <RotateCw size={22} className={(isProcessing || isRolling) ? 'animate-spin' : ''} /> : 
           type === 'DICE' ? <Dice6 size={22} className={isRolling ? 'animate-bounce' : ''}/> : 
           type === 'SLOTS' ? <RotateCw size={22} className={isRolling ? 'animate-spin' : ''}/> :
           type === 'COIN' ? <CircleDot size={22} /> : <Layers size={22} />}
          {(isProcessing || isRolling) ? (type === 'SLOTS' ? 'TRIPLE LUCK...' : 'CASTING...') : isChaosSkill ? 'UNLEASH CHAOS' : type === 'SLOTS' ? 'PULL THE LEVER' : 'ACTIVATE SPELL'}
        </button>
        {luck > 0 && <div className="text-[8px] md:text-[10px] text-amber-400 animate-pulse font-black uppercase tracking-[0.2em]">Leyline Luck Enabled +{luck}%</div>}
      </div>

      <style>{`
        @keyframes dice-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(3px, -3px) rotate(4deg); }
          50% { transform: translate(-3px, 3px) rotate(-4deg); }
        }
        @keyframes chaos-vibrate {
           0% { transform: translate(0,0) scale(1) rotate(0deg); filter: hue-rotate(0deg); }
           20% { transform: translate(-3px, 3px) scale(1.05) rotate(6deg); filter: hue-rotate(90deg); }
           40% { transform: translate(3px, -3px) scale(0.95) rotate(-6deg); filter: hue-rotate(180deg); }
           60% { transform: translate(-3px, -3px) scale(1.1) rotate(12deg); filter: hue-rotate(270deg); }
           80% { transform: translate(3px, 3px) scale(1) rotate(-12deg); filter: hue-rotate(360deg); }
           100% { transform: translate(0,0) scale(1) rotate(0deg); filter: hue-rotate(0deg); }
        }
        @keyframes bounce-short {
          0%, 100% { transform: scale(1.5) translateY(0); }
          50% { transform: scale(1.5) translateY(-5px); }
        }
        .animate-chaos-vibrate { animation: chaos-vibrate 0.15s infinite; }
        .animate-dice-shake { animation: dice-shake 0.1s infinite; }
        .animate-coin-flip { animation: coin-flip 0.15s infinite linear; }
        .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

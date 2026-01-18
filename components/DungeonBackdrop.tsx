
import React, { useMemo } from 'react';
import { GameMode } from '../types';

interface DungeonBackdropProps {
  floor?: number;
  mode?: GameMode;
  bastionLevel?: number;
}

export const DungeonBackdrop: React.FC<DungeonBackdropProps> = ({ floor = 1, mode = 'TOWER', bastionLevel = 0 }) => {
  const theme = useMemo(() => {
    if (mode === 'TOWER') {
      return { 
        wall: 'bg-[#0f172a]', 
        border: 'border-indigo-800', 
        light: 'text-indigo-400',
        style: 'TOWER'
      };
    }
    // Biome Logic
    if (floor <= 10) return { wall: 'bg-emerald-950', border: 'border-emerald-900', light: 'text-emerald-400', style: 'DUNGEON', biome: 'OVERGROWN' };
    if (floor <= 25) return { wall: 'bg-sky-950', border: 'border-sky-900', light: 'text-sky-300', style: 'DUNGEON', biome: 'FROZEN' };
    if (floor <= 45) return { wall: 'bg-orange-950', border: 'border-orange-900', light: 'text-orange-500', style: 'DUNGEON', biome: 'INFERNAL' };
    return { wall: 'bg-slate-950', border: 'border-purple-900', light: 'text-purple-400', style: 'DUNGEON', biome: 'VOID' };
  }, [floor, mode]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none transition-all duration-1000">
      {/* Dynamic Background Tint */}
      <div className={`absolute inset-0 transition-colors duration-1000 opacity-40 ${theme.wall}`} />
      
      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px', color: theme.light }} />

      {/* Tower Visual Evolution */}
      {theme.style === 'TOWER' && (
        <div className="absolute inset-0 flex flex-col justify-around px-10">
           {/* Level 0-5 Base Library */}
           <div className="flex justify-between items-start opacity-30">
              <div className="flex flex-col gap-1 translate-y-20 animate-float-book-1">
                 <div className="w-12 h-4 bg-indigo-900 border-2 border-indigo-700 rounded-sm" />
                 <div className="w-14 h-4 bg-indigo-950 border-2 border-indigo-800 rounded-sm" />
                 {bastionLevel > 5 && <div className="w-10 h-4 bg-purple-900 border-2 border-purple-700 rounded-sm" />}
              </div>
              <div className="flex flex-col gap-1 translate-y-10 animate-float-book-2">
                 <div className="w-14 h-4 bg-slate-800 border-2 border-slate-700 rounded-sm" />
                 <div className="w-12 h-4 bg-indigo-900 border-2 border-indigo-700 rounded-sm" />
                 {bastionLevel > 10 && <div className="w-16 h-4 bg-amber-900/40 border-2 border-amber-600/30 rounded-sm" />}
              </div>
           </div>

           {/* Level 15+ Arcane Circles */}
           {bastionLevel > 15 && (
             <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-[500px] h-[500px] animate-spin-slow">
                   <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" className="text-indigo-400" />
                   <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-purple-500" />
                   <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-300" />
                </svg>
             </div>
           )}

           {/* Level 30+ Floating Gemstones */}
           {bastionLevel > 30 && (
              <div className="absolute inset-0">
                 <div className="absolute top-[20%] left-[20%] w-6 h-10 bg-indigo-500/40 border-2 border-indigo-300 rotate-45 blur-[1px] animate-float-slow opacity-60" />
                 <div className="absolute bottom-[25%] right-[22%] w-8 h-12 bg-purple-500/40 border-2 border-purple-300 -rotate-12 blur-[1px] animate-float-slow opacity-60" style={{ animationDelay: '2s' }} />
              </div>
           )}

           {/* Level 50+ Astral Beams */}
           {bastionLevel > 50 && (
             <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-[30%] w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent animate-pulse" />
                <div className="absolute right-[30%] w-[1px] h-full bg-gradient-to-b from-transparent via-purple-400/50 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
             </div>
           )}

           <div className="flex justify-center opacity-10 scale-[1.5]">
              <svg viewBox="0 0 100 100" className="w-64 h-64 animate-spin-slow">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                 <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
           </div>
        </div>
      )}

      {/* Dungeon Biome Elements */}
      {theme.style === 'DUNGEON' && (
        <div className="absolute inset-0">
          {/* Hanging Vines for Overgrown Biome */}
          {theme.biome === 'OVERGROWN' && (
            <div className="absolute top-0 inset-x-0 flex justify-around opacity-40">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="w-1 bg-emerald-800 rounded-b-full animate-sway" style={{ height: `${20 + Math.random() * 40}px`, animationDelay: `${i * 0.5}s` }}>
                    <div className="absolute bottom-0 -left-1 w-3 h-3 bg-emerald-600 rounded-full blur-[1px]" />
                 </div>
               ))}
            </div>
          )}

          {/* Frost Cracks for Frozen Biome */}
          {theme.biome === 'FROZEN' && (
            <div className="absolute inset-0 opacity-20 flex justify-center items-center">
               <svg viewBox="0 0 100 100" className="w-full h-full text-sky-300">
                  <path d="M0 20 L20 40 L5 60 M100 80 L80 60 L95 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <path d="M40 0 L50 20 L60 0 M50 100 L50 80" stroke="currentColor" strokeWidth="0.5" fill="none" />
               </svg>
            </div>
          )}

          {/* Lava Pools for Infernal Biome */}
          {theme.biome === 'INFERNAL' && (
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-orange-600/20 to-transparent opacity-60">
               <div className="absolute bottom-4 left-1/4 w-24 h-4 bg-orange-500/30 rounded-full blur-xl animate-pulse" />
               <div className="absolute bottom-8 right-1/4 w-32 h-6 bg-red-500/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          )}

          {/* Void Shards for Void Biome */}
          {theme.biome === 'VOID' && (
            <div className="absolute inset-0">
               {[...Array(20)].map((_, i) => (
                 <div 
                   key={i} 
                   className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float-slow opacity-40" 
                   style={{ 
                     left: `${Math.random() * 100}%`, 
                     top: `${Math.random() * 100}%`,
                     animationDuration: `${5 + Math.random() * 5}s`
                   }} 
                 />
               ))}
            </div>
          )}

          {/* Standard Brick Overlay */}
          <div className="absolute top-10 left-10 grid grid-cols-6 gap-2 opacity-10">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-12 h-6 border-b-2 border-r-2 ${theme.border}`} />
            ))}
          </div>
        </div>
      )}

      {/* Mode Specific Lights */}
      <div className="absolute top-1/4 left-1/4">
        <div className={`w-3 h-3 rounded-full blur-md animate-pulse opacity-60 bg-current ${theme.light}`} />
        <div className={`absolute top-0 w-1 h-1 rounded-full bg-white animate-ping`} />
      </div>
      
      <div className="absolute top-1/3 right-1/4">
        <div className={`w-4 h-4 rounded-full blur-lg animate-pulse opacity-40 bg-current ${theme.light} delay-500`} />
        <div className={`absolute top-0 w-2 h-2 rounded-full bg-white/50 animate-bounce delay-500`} />
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -30px) rotate(15deg); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); transform-origin: top; }
          50% { transform: rotate(5deg); transform-origin: top; }
        }
        @keyframes float-book-1 {
          0%, 100% { transform: translateY(80px); }
          50% { transform: translateY(65px); }
        }
        @keyframes float-book-2 {
          0%, 100% { transform: translateY(40px); }
          50% { transform: translateY(55px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-sway { animation: sway 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow linear infinite; }
        .animate-float-book-1 { animation: float-book-1 4s ease-in-out infinite; }
        .animate-float-book-2 { animation: float-book-2 5s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
      `}</style>
    </div>
  );
};

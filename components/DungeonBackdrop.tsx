
import React, { useMemo } from 'react';
import { GameMode } from '../types';

interface DungeonBackdropProps {
  floor?: number;
  mode?: GameMode;
}

export const DungeonBackdrop: React.FC<DungeonBackdropProps> = ({ floor = 1, mode = 'TOWER' }) => {
  // Theme changes based on mode and floor
  const theme = useMemo(() => {
    if (mode === 'TOWER') {
      return { 
        wall: 'bg-[#0f172a]', 
        border: 'border-indigo-800', 
        light: 'text-indigo-400',
        style: 'TOWER'
      };
    }
    if (floor < 15) return { wall: 'bg-slate-800', border: 'border-slate-900', light: 'text-orange-500', style: 'DUNGEON' };
    if (floor < 30) return { wall: 'bg-indigo-950', border: 'border-indigo-900', light: 'text-blue-400', style: 'DUNGEON' };
    if (floor < 50) return { wall: 'bg-red-950', border: 'border-red-900', light: 'text-red-500', style: 'DUNGEON' };
    return { wall: 'bg-slate-950', border: 'border-purple-900', light: 'text-purple-400', style: 'DUNGEON' };
  }, [floor, mode]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Dynamic Background Tint */}
      <div className={`absolute inset-0 transition-colors duration-1000 opacity-30 ${theme.wall}`} />
      
      {/* Background Patterns */}
      {theme.style === 'DUNGEON' ? (
        <div className="absolute top-10 left-10 grid grid-cols-6 gap-2 opacity-30">
          {[...Array(24)].map((_, i) => (
            <div key={i} className={`w-8 h-4 ${theme.wall} border-b-2 border-r-2 ${theme.border} ${i % 7 === 0 ? 'opacity-100' : 'opacity-20'}`} />
          ))}
        </div>
      ) : (
        /* Scholarly Tower Elements */
        <div className="absolute inset-0 flex flex-col justify-around px-10 opacity-30">
           <div className="flex justify-between items-start">
              {/* Floating Bookshelf A */}
              <div className="flex flex-col gap-1 translate-y-20 animate-float-book-1">
                 <div className="w-12 h-4 bg-indigo-900 border-2 border-indigo-700 rounded-sm" />
                 <div className="w-10 h-4 bg-purple-900 border-2 border-purple-700 rounded-sm" />
                 <div className="w-14 h-4 bg-indigo-900 border-2 border-indigo-700 rounded-sm" />
              </div>
              {/* Floating Bookshelf B */}
              <div className="flex flex-col gap-1 translate-y-10 animate-float-book-2">
                 <div className="w-14 h-4 bg-slate-800 border-2 border-slate-700 rounded-sm" />
                 <div className="w-12 h-4 bg-indigo-900 border-2 border-indigo-700 rounded-sm" />
              </div>
           </div>
           
           {/* Center Mystic Seal */}
           <div className="flex justify-center opacity-10 scale-[1.5]">
              <svg viewBox="0 0 100 100" className="w-64 h-64 animate-spin-slow">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                 <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                 <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
           </div>

           <div className="flex justify-center gap-20">
              <div className="w-32 h-20 bg-indigo-900/20 border-t-4 border-indigo-700 rounded-t-3xl" />
           </div>
        </div>
      )}
      
      <div className="absolute bottom-20 right-10 grid grid-cols-4 gap-2 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-10 h-5 ${theme.wall} border-b-2 border-r-2 ${theme.border}`} />
        ))}
      </div>

      {/* Pillars */}
      <div className={`absolute left-[10%] md:left-[15%] h-full w-12 ${theme.wall} border-x-4 ${theme.border} opacity-10`} />
      <div className={`absolute right-[10%] md:right-[15%] h-full w-12 ${theme.wall} border-x-4 ${theme.border} opacity-10`} />

      {/* Mode Specific Ornaments */}
      {theme.style === 'TOWER' ? (
        <div className="absolute top-0 inset-x-0 h-48 opacity-10 flex justify-center items-start pt-8">
           <svg viewBox="0 0 200 100" className="w-96 h-48" fill="none" stroke="white" strokeWidth="0.5">
              <circle cx="100" cy="0" r="90" />
              <circle cx="100" cy="0" r="70" />
              <path d="M100 0 L100 120 M40 40 L160 40 M60 70 L140 70" />
           </svg>
        </div>
      ) : (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="0.5">
            <path d="M0 0 L100 100 M0 20 L80 100 M20 0 L100 80" />
            <circle cx="0" cy="0" r="20" />
            <circle cx="0" cy="0" r="40" />
            <circle cx="0" cy="0" r="60" />
          </svg>
        </div>
      )}

      {/* Lights / Crystals */}
      <div className="absolute top-1/4 left-1/4">
        {theme.style === 'TOWER' ? (
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rotate-45 bg-indigo-400 border-2 border-white/20 animate-pulse shadow-[0_0_20px_#818cf8]" />
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full blur-xl opacity-40 bg-indigo-400 animate-pulse`} />
          </div>
        ) : (
          <div className="w-2 h-8 bg-amber-950 border-x-2 border-black">
             <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full blur-md opacity-50 bg-current ${theme.light} animate-pulse`} />
             <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-current ${theme.light} animate-bounce`} />
          </div>
        )}
      </div>
      
      <div className="absolute top-1/3 right-1/4">
        {theme.style === 'TOWER' ? (
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rotate-45 bg-purple-400 border-2 border-white/20 animate-pulse shadow-[0_0_20px_#a855f7] delay-500" />
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full blur-xl opacity-40 bg-purple-400 animate-pulse delay-500`} />
          </div>
        ) : (
          <div className="w-2 h-8 bg-amber-950 border-x-2 border-black">
             <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full blur-md opacity-50 bg-current ${theme.light} animate-pulse`} />
             <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-current ${theme.light} animate-bounce`} />
          </div>
        )}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className={`absolute rounded-full animate-float-slow ${theme.style === 'TOWER' ? 'w-1.5 h-1.5 bg-indigo-300 opacity-40' : 'w-1 h-1 bg-white opacity-20'}`}
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${7 + Math.random() * 8}s`
            }} 
          />
        ))}
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -50px); }
        }
        @keyframes float-book-1 {
          0%, 100% { transform: translateY(80px); }
          50% { transform: translateY(60px); }
        }
        @keyframes float-book-2 {
          0%, 100% { transform: translateY(40px); }
          50% { transform: translateY(60px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float-slow { animation: float-slow linear infinite; }
        .animate-float-book-1 { animation: float-book-1 4s ease-in-out infinite; }
        .animate-float-book-2 { animation: float-book-2 5s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
};

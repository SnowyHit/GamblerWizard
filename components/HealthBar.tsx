
import React, { useEffect, useState } from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
  colorClass?: string;
  width?: string;
}

const formatNumber = (n: number): string => {
  if (n < 1000) return Math.floor(n).toString();
  const tiers = [
    { val: 1e3, s: 'K' },
    { val: 1e6, s: 'M' },
    { val: 1e9, s: 'B' },
    { val: 1e12, s: 'T' },
    { val: 1e15, s: 'Qa' },
    { val: 1e18, s: 'Qi' },
    { val: 1e21, s: 'Sx' },
  ];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (n >= tiers[i].val) {
      return (n / tiers[i].val).toFixed(1).replace(/\.0$/, '') + tiers[i].s;
    }
  }
  return Math.floor(n).toLocaleString();
};

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, label, colorClass = "from-emerald-500 to-teal-400", width = "w-full" }) => {
  const [ghostHp, setGhostHp] = useState(current);
  const percentage = Math.max(0, (current / max) * 100);
  const ghostPercentage = Math.max(0, (ghostHp / max) * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ghostHp > current) {
        setGhostHp(Math.max(current, ghostHp - (max * 0.05)));
      } else if (ghostHp < current) {
        setGhostHp(current); 
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [current, ghostHp, max]);

  return (
    <div className={`flex flex-col gap-1.5 ${width} max-w-xs`}>
      <div className="flex justify-between items-end px-0.5">
        <span className="text-[8px] text-slate-200 uppercase font-bold tracking-widest truncate max-w-[60%]">{label}</span>
        <span className="text-[7px] text-slate-400 font-mono tracking-tighter">{formatNumber(current)} / {formatNumber(max)}</span>
      </div>
      <div className="relative h-5 bg-slate-900/80 border-2 border-slate-800 rounded-md p-[2px] shadow-lg">
        {/* Background Track */}
        <div className="absolute inset-[2px] bg-slate-950 rounded-[2px]" />
        
        {/* Ghost HP Damage Trailing */}
        <div 
          className="absolute h-full top-0 left-0 bg-red-500/40 rounded-[2px] transition-all duration-100 ease-out"
          style={{ width: `calc(${ghostPercentage}% - 4px)`, marginLeft: '2px', height: 'calc(100% - 4px)', marginTop: '2px' }}
        />
        
        {/* Actual Progress */}
        <div 
          className={`absolute h-full top-0 left-0 bg-gradient-to-r ${colorClass} rounded-[2px] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]`}
          style={{ width: `calc(${percentage}% - 4px)`, marginLeft: '2px', height: 'calc(100% - 4px)', marginTop: '2px' }}
        >
          {/* Glass Shine */}
          <div className="w-full h-1/2 bg-white/10 rounded-t-[1px]" />
        </div>
      </div>
    </div>
  );
};


import React from 'react';

interface PixelChestProps {
  onOpen: () => void;
  isOpen: boolean;
}

export const PixelChest: React.FC<PixelChestProps> = ({ onOpen, isOpen }) => {
  return (
    <div className={`relative w-32 h-32 flex flex-col items-center justify-center cursor-pointer group transition-all ${isOpen ? 'scale-110' : 'hover:scale-105'}`} onClick={!isOpen ? onOpen : undefined}>
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
        {/* Chest Base */}
        <rect x="2" y="7" width="12" height="7" fill="#78350f" />
        <rect x="2" y="14" width="12" height="1" fill="#451a03" />
        
        {/* Lid */}
        {isOpen ? (
          <g transform="translate(0, -3)">
            <rect x="2" y="4" width="12" height="4" fill="#92400e" />
            <rect x="7" y="5" width="2" height="2" fill="#facc15" className="animate-pulse" />
          </g>
        ) : (
          <rect x="2" y="4" width="12" height="4" fill="#92400e" />
        )}
        
        {/* Iron Bands */}
        <rect x="4" y="4" width="1" height="10" fill="#475569" />
        <rect x="11" y="4" width="1" height="10" fill="#475569" />
        
        {/* Lock */}
        {!isOpen && <rect x="7" y="7" width="2" height="2" fill="#facc15" />}
      </svg>
      
      {!isOpen && (
        <div className="absolute -bottom-4 bg-slate-900 px-3 py-1 rounded-full border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span className="text-[8px] text-yellow-400">OPEN CHEST</span>
        </div>
      )}
      
      {/* Light glow if closed */}
      {!isOpen && (
        <div className="absolute inset-0 bg-yellow-400/10 blur-xl rounded-full animate-pulse" />
      )}
    </div>
  );
};

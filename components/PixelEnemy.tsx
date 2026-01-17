
import React from 'react';

interface PixelEnemyProps {
  color: string;
  isHit: boolean;
  name: string;
  visualType?: string;
}

export const PixelEnemy: React.FC<PixelEnemyProps> = ({ color, isHit, name, visualType = 'SLIME' }) => {
  const isBoss = name.includes('BOSS');

  const renderVisual = () => {
    switch (visualType) {
      case 'SKULL':
        return (
          <g>
            {/* Skull Base */}
            <rect x="4" y="2" width="8" height="8" fill="#f8fafc" />
            <rect x="5" y="10" width="6" height="3" fill="#f8fafc" />
            <rect x="6" y="13" width="4" height="1" fill="#f8fafc" />
            {/* Eyes */}
            <rect x="5" y="5" width="2" height="2" fill="#000" />
            <rect x="9" y="5" width="2" height="2" fill="#000" />
            <rect x="5.5" y="5.5" width="1" height="1" fill={color} />
            <rect x="9.5" y="5.5" width="1" height="1" fill={color} />
            {/* Teeth */}
            <rect x="6" y="11" width="1" height="2" fill="#000" opacity="0.2" />
            <rect x="8" y="11" width="1" height="2" fill="#000" opacity="0.2" />
          </g>
        );
      case 'BAT':
        return (
          <g>
            {/* Wings */}
            <rect x="1" y="4" width="3" height="4" fill={color} opacity="0.6" />
            <rect x="12" y="4" width="3" height="4" fill={color} opacity="0.6" />
            <rect x="0" y="3" width="3" height="1" fill={color} />
            <rect x="13" y="3" width="3" height="1" fill={color} />
            {/* Body */}
            <rect x="6" y="5" width="4" height="6" fill={color} />
            <rect x="5" y="4" width="6" height="4" fill={color} />
            {/* Ears */}
            <rect x="5" y="2" width="1" height="2" fill={color} />
            <rect x="10" y="2" width="1" height="2" fill={color} />
            {/* Eyes */}
            <rect x="6" y="6" width="1" height="1" fill="#ef4444" />
            <rect x="9" y="6" width="1" height="1" fill="#ef4444" />
          </g>
        );
      case 'EYE':
        return (
          <g>
            {/* Outer Circle */}
            <rect x="3" y="3" width="10" height="10" fill="#f8fafc" />
            <rect x="4" y="2" width="8" height="1" fill="#f8fafc" />
            <rect x="4" y="13" width="8" height="1" fill="#f8fafc" />
            <rect x="2" y="4" width="1" height="8" fill="#f8fafc" />
            <rect x="13" y="4" width="1" height="8" fill="#f8fafc" />
            {/* Iris */}
            <rect x="5" y="5" width="6" height="6" fill={color} />
            {/* Pupil */}
            <rect x="7" y="7" width="2" height="2" fill="#000" />
            {/* Veins */}
            <rect x="3" y="4" width="1" height="1" fill="#fee2e2" />
            <rect x="12" y="11" width="1" height="1" fill="#fee2e2" />
          </g>
        );
      case 'GHOST':
        return (
          <g className="animate-float-ghost">
            {/* Ghost Body */}
            <rect x="4" y="2" width="8" height="10" fill="#fff" opacity="0.4" />
            <rect x="3" y="4" width="10" height="8" fill="#fff" opacity="0.4" />
            <rect x="5" y="12" width="1" height="2" fill="#fff" opacity="0.4" />
            <rect x="7" y="12" width="2" height="3" fill="#fff" opacity="0.4" />
            <rect x="10" y="12" width="1" height="2" fill="#fff" opacity="0.4" />
            {/* Eyes */}
            <rect x="6" y="5" width="1" height="2" fill={color} />
            <rect x="9" y="5" width="1" height="2" fill={color} />
          </g>
        );
      case 'ARMOR':
        return (
          <g>
            {/* Helmet */}
            <rect x="5" y="1" width="6" height="5" fill={color} />
            <rect x="7" y="2" width="2" height="3" fill="#000" opacity="0.4" />
            {/* Body */}
            <rect x="3" y="6" width="10" height="8" fill={color} />
            <rect x="2" y="7" width="12" height="4" fill={color} />
            {/* Shoulder pads */}
            <rect x="2" y="6" width="3" height="2" fill="#cbd5e1" opacity="0.5" />
            <rect x="11" y="6" width="3" height="2" fill="#cbd5e1" opacity="0.5" />
            {/* Detail */}
            <rect x="7" y="8" width="2" height="4" fill="#000" opacity="0.1" />
          </g>
        );
      case 'MIMIC':
        return (
          <g>
            {/* Box */}
            <rect x="3" y="6" width="10" height="8" fill="#78350f" />
            <rect x="2" y="4" width="12" height="4" fill="#92400e" />
            {/* Teeth */}
            <rect x="4" y="7" width="1" height="1" fill="#fff" />
            <rect x="6" y="7" width="1" height="1" fill="#fff" />
            <rect x="8" y="7" width="1" height="1" fill="#fff" />
            <rect x="11" y="7" width="1" height="1" fill="#fff" />
            {/* Eye */}
            <rect x="7" y="5" width="2" height="1" fill="#ef4444" />
            {/* Tongue */}
            <rect x="6" y="8" width="4" height="6" fill="#f43f5e" />
          </g>
        );
      default: // SLIME
        return (
          <g>
            {/* Slime Base */}
            <rect x="2" y="7" width="12" height="7" fill={color} />
            <rect x="3" y="5" width="10" height="2" fill={color} />
            <rect x="5" y="3" width="6" height="2" fill={color} />
            {/* Shine */}
            <rect x="5" y="5" width="2" height="1" fill="#fff" opacity="0.3" />
            {/* Eyes */}
            <rect x="6" y="8" width="1" height="1" fill="#000" />
            <rect x="9" y="8" width="1" height="1" fill="#000" />
          </g>
        );
    }
  };

  return (
    <div className={`relative transition-all duration-300 ${isBoss ? 'w-48 h-48 scale-110' : 'w-32 h-32'} ${isHit ? 'animate-shake-horizontal brightness-125' : 'hover:-translate-y-2'}`}>
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_16px_16px_rgba(0,0,0,0.8)]">
        {renderVisual()}
        
        {/* Hit White Flash */}
        {isHit && <rect x="0" y="0" width="16" height="16" fill="#fff" opacity="0.6" />}
      </svg>
      
      {/* Ground Shadow */}
      <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/60 rounded-[100%] blur-lg transition-all ${isBoss ? 'w-40 h-4' : 'w-24 h-3'}`} />
      
      <style>{`
        @keyframes float-ghost {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-ghost { animation: float-ghost 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

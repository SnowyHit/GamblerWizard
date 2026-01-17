
import React from 'react';

interface PixelWizardProps {
  isHit?: boolean;
  isAttacking?: boolean;
}

export const PixelWizard: React.FC<PixelWizardProps> = ({ isHit, isAttacking }) => {
  return (
    <div className={`relative w-32 h-32 transition-all duration-300 ${isHit ? 'animate-shake' : ''} ${isAttacking ? 'translate-x-4 scale-110' : ''}`}>
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_12px_12px_rgba(0,0,0,0.8)]">
        {/* Hat */}
        <rect x="7" y="0" width="2" height="1" fill="#1e1b4b" />
        <rect x="6" y="1" width="4" height="1" fill="#312e81" />
        <rect x="5" y="2" width="6" height="1" fill="#3730a3" />
        <rect x="4" y="3" width="8" height="1" fill="#4338ca" />
        <rect x="3" y="4" width="10" height="1" fill="#4f46e5" />
        <rect x="2" y="5" width="12" height="1" fill="#6366f1" /> {/* Rim */}
        
        {/* Face */}
        <rect x="6" y="6" width="4" height="3" fill="#ffedd5" />
        <rect x="6" y="7" width="1" height="1" fill="#000" /> {/* Eye L */}
        <rect x="9" y="7" width="1" height="1" fill="#000" /> {/* Eye R */}
        
        {/* Beard */}
        <rect x="6" y="9" width="4" height="2" fill="#f8fafc" />
        <rect x="7" y="11" width="2" height="1" fill="#f8fafc" />
        <rect x="7" y="12" width="2" height="1" fill="#e2e8f0" />
        
        {/* Robe */}
        <rect x="4" y="10" width="8" height="4" fill="#312e81" />
        <rect x="3" y="11" width="10" height="2" fill="#312e81" />
        <rect x="5" y="14" width="6" height="1" fill="#1e1b4b" />
        
        {/* Staff */}
        <rect x="13" y="4" width="1" height="11" fill="#451a03" />
        <rect x="12" y="4" width="1" height="1" fill="#451a03" />
        <rect x="14" y="4" width="1" height="1" fill="#451a03" />
        
        {/* Magic Orb */}
        <circle 
          cx="13.5" 
          cy="3" 
          r="1.8" 
          fill={isAttacking ? "#fde047" : "#818cf8"} 
          className={`transition-colors duration-300 ${isAttacking ? 'shadow-[0_0_15px_#fde047]' : 'shadow-[0_0_8px_#818cf8]'}`} 
        />
        
        {/* Hit Overlay */}
        {isHit && <rect x="0" y="0" width="16" height="16" fill="#ef4444" opacity="0.4" className="rounded" />}
      </svg>
      
      {/* Ground Shadow */}
      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 h-2.5 bg-black/50 rounded-[100%] blur-[6px] transition-all duration-300 ${isAttacking ? 'w-16' : 'w-24'}`} />
    </div>
  );
};

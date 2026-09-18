import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="w-[150px] text-center">
        <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <ellipse cx="60" cy="85" rx="40" ry="4" fill="#eeeeee" />

          <g className="tractor-body">
            <path d="M20,60 L25,40 L70,40 L75,45 L85,45 L85,65 L20,65 Z" fill="#e53935" />
            <rect x="75" y="48" width="12" height="15" fill="#333" />
            <rect x="35" y="25" width="4" height="15" fill="#555" />
            <path d="M35,25 Q32,20 35,15" stroke="#555" fill="none" strokeWidth="2" />
            <rect x="25" y="30" width="2" height="10" fill="#333" />
            <path d="M20,30 L60,30 L55,25 L20,25 Z" fill="#e53935" />
          </g>

          <g className="tractor-wheel" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle cx="35" cy="70" r="15" fill="#333" />
            <circle cx="35" cy="70" r="10" fill="#999" />
            <rect x="34" y="55" width="2" height="30" fill="#333" />
            <rect x="20" y="69" width="30" height="2" fill="#333" />
          </g>

          <g className="tractor-wheel" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle cx="85" cy="75" r="10" fill="#333" />
            <circle cx="85" cy="75" r="6" fill="#999" />
            <rect x="84" y="65" width="2" height="20" fill="#333" />
            <rect x="75" y="74" width="20" height="2" fill="#333" />
          </g>
        </svg>
        <div className="mt-4 text-sm font-black text-rose-600 uppercase tracking-widest loading-text-glow">
          CHALU HO RAHA HAI...
        </div>
      </div>
    </div>
  );
};

export default Loader;

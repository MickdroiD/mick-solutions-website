import React from 'react';

interface TechHUDWrapperProps {
  children: React.ReactNode;
  active?: boolean;
  variant?: string;
}

const TechHUDWrapper: React.FC<TechHUDWrapperProps> = ({ children, active = true }) => {
  if (!active) return <>{children}</>;

  // Fonction pour créer une "Griffe" (Circuit)
  // geometry: C'est la forme SVG du circuit (L-shape courbé)
  const renderCircuit = (angle: number, delay: number) => {
    return (
      <g transform={`rotate(${angle} 100 100)`}>
        {/* 1. Le Point de départ (Interne et FIXE) */}
        <circle cx="100" cy="60" r="2" fill="#06b6d4" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

        {/* 2. Le Chemin (Invisible ou sombre, pour donner du corps) */}
        {/* M 100 60 (Départ) -> L 100 40 (Monte) -> A ... (Arc de cercle vers la droite) */}
        <path
          d="M 100 60 L 100 35 A 65 65 0 0 1 125 45"
          fill="none"
          stroke="#1e293b" // Gris très sombre (Slate 800)
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 3. L'Animation de Lumière (Le flux d'énergie) */}
        <path
          d="M 100 60 L 100 35 A 65 65 0 0 1 125 45"
          fill="none"
          stroke="url(#circuit-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          className="circuit-light" // Classe CSS pour l'animation
          style={{ animationDelay: `${delay}s` }}
        />

        {/* 4. Le Tick final (Petit trait au bout) */}
        <line x1="125" y1="45" x2="128" y2="48" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
      </g>
    );
  };

  return (
    <div className="relative inline-flex items-center justify-center w-full h-full group">
      
      {/* --- Styles CSS in-line pour une animation précise --- */}
      <style jsx>{`
        .circuit-light {
          stroke-dasharray: 20 100; /* Le trait lumineux fait 20px */
          stroke-dashoffset: 20;    /* Il est caché au début */
          animation: circuit-flow 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes circuit-flow {
          0% { stroke-dashoffset: 20; opacity: 0; }
          10% { opacity: 1; }
          60% { stroke-dashoffset: -70; opacity: 1; } /* Il voyage jusqu'au bout */
          100% { stroke-dashoffset: -80; opacity: 0; }
        }
      `}</style>

      {/* --- COUCHE 1 : L'Anneau Pointillé (SEUL ÉLÉMENT QUI TOURNE) --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <div className="w-[85%] h-[85%] rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_30s_linear_infinite]" />
      </div>

      {/* --- COUCHE 2 : Les Circuits (FIXES) --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <svg viewBox="0 0 200 200" className="absolute w-[140%] h-[140%]">
            <defs>
               <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                 <stop offset="100%" stopColor="#a855f7" /> {/* Violet */}
               </linearGradient>
               <filter id="glow">
                 <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                 <feMerge>
                   <feMergeNode in="coloredBlur" />
                   <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
            </defs>

            {/* On dessine les 6 griffes fixes réparties à 60° */}
            <g filter="url(#glow)">
              {renderCircuit(0, 0)}
              {renderCircuit(60, 0.5)}
              {renderCircuit(120, 1.0)}
              {renderCircuit(180, 1.5)}
              {renderCircuit(240, 2.0)}
              {renderCircuit(300, 2.5)}
            </g>
        </svg>
      </div>

      {/* --- COUCHE 3 : LE LOGO --- */}
      <div className="relative z-10 flex items-center justify-center pointer-events-auto">
        {children}
      </div>
      
    </div>
  );
};

export default TechHUDWrapper;
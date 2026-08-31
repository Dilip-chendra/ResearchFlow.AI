import React from 'react';

export interface BrandSymbolProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'dark' | 'light' | 'monochrome' | 'white';
  animated?: boolean;
  className?: string;
}

export const BrandSymbol: React.FC<BrandSymbolProps> = ({
  size = 'md',
  variant = 'dark',
  animated = false,
  className = '',
}) => {
  const sizeMap: Record<string, number> = {
    xs: 18,
    sm: 24,
    md: 32,
    lg: 42,
    xl: 60,
  };

  const px = typeof size === 'number' ? size : sizeMap[size] || 32;

  const isLight = variant === 'light';
  const isMono = variant === 'monochrome';
  const isWhite = variant === 'white';

  const fillStyle = isWhite
    ? '#FFFFFF'
    : isMono
    ? 'currentColor'
    : isLight
    ? 'url(#rf-symbol-light-grad)'
    : 'url(#rf-symbol-dark-grad)';

  const thrustFill = isWhite
    ? '#FFFFFF'
    : isMono
    ? 'currentColor'
    : isLight
    ? 'url(#rf-thrust-light-grad)'
    : 'url(#rf-thrust-dark-grad)';

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="ResearchFlow Symbol"
    >
      <defs>
        <linearGradient id="rf-symbol-dark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#60A5FA" />
          <stop offset="80%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="rf-thrust-dark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="60%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id="rf-symbol-light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="80%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="rf-thrust-light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="60%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      <g className={animated ? 'animate-pulse' : ''}>
        {/* Signal 1: Upper Flow Ribbon (Crown of R & Top Bar of F) */}
        <path
          d="M8 14.5 C8 11.5 10.5 9 13.5 9 H36 C44.837 9 52 16.163 52 25 C52 33.837 44.837 41 36 41 H28 V 33 H36 C40.418 33 44 29.418 44 25 C44 20.582 40.418 17 36 17 H13.5 C10.5 17 8 14.5 8 14.5 Z"
          fill={fillStyle}
        />

        {/* Signal 2: Middle Flow Ribbon (Inflow & Center Alignment / F Crossbar) */}
        <rect x="8" y="22" width="16" height="7" rx="3.5" fill={fillStyle} />

        {/* Signal 3: Lower Inflow Ribbon */}
        <rect x="8" y="35" width="14" height="7" rx="3.5" fill={fillStyle} />

        {/* The Convergence Vector: Dynamic 45° Forward Execution Thrust (Leg of R & Directional Arrow) */}
        <path
          d="M26 31.5 L46.8 52.3 C48.4 53.9 51 53.9 52.6 52.3 C54.2 50.7 54.2 48.1 52.6 46.5 L34.5 28.4 C32 25.9 27.5 27.7 26 31.5 Z"
          fill={thrustFill}
        />
      </g>
    </svg>
  );
};

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'monochrome';
  showBadge?: boolean;
  showTagline?: boolean;
  animated?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showBadge = true,
  showTagline = false,
  animated = false,
  className = '',
}) => {
  const isLight = variant === 'light';

  const fontSizes: Record<string, string> = {
    xs: 'text-[15px]',
    sm: 'text-[17px]',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const badgeSizes: Record<string, string> = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-xs px-3 py-1',
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      <BrandSymbol size={size} variant={variant} animated={animated} />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          {/* Main Brand Typography */}
          <span className={`font-black tracking-[-0.035em] ${fontSizes[size] || 'text-xl'}`}>
            <span
              className={
                isLight
                  ? 'text-slate-900 drop-shadow-2xs transition-colors'
                  : 'text-white drop-shadow-2xs transition-colors'
              }
            >
              Research
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-black ml-px">
              Flow
            </span>
          </span>

          {/* Glowing Modern AI Pill Badge */}
          {showBadge && (
            <span
              className={`inline-flex items-center gap-1 font-mono font-black rounded-full uppercase tracking-wider shadow-2xs transition-all ${
                badgeSizes[size]
              } ${
                isLight
                  ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/90 shadow-indigo-500/10'
                  : 'bg-gradient-to-r from-indigo-950/90 via-blue-950/90 to-purple-950/90 text-indigo-300 border border-indigo-500/40 shadow-indigo-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse shrink-0" />
              <span>AI</span>
            </span>
          )}
        </div>

        {showTagline && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}
          >
            Market Intelligence OS
          </span>
        )}
      </div>
    </div>
  );
};

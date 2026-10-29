import React from 'react';

interface TrueTierLogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
}

export const TrueTierLogo: React.FC<TrueTierLogoProps> = ({
  className = 'h-8',
  iconOnly = false,
  variant = 'light',
  showTagline = false,
}) => {
  const isDark = variant === 'dark';
  const strokeColor = isDark ? '#ffffff' : '#0d172a';
  const amberColor = '#f09e26';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision SVG Brand Mark */}
      <svg
        viewBox="0 0 100 100"
        className="h-full w-auto aspect-square shrink-0 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Three curved branch lines converging into the bottom source node */}
        {/* Left branch */}
        <path
          d="M 23 33 C 23 54, 46 62, 50 66"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right branch */}
        <path
          d="M 77 33 C 77 54, 54 62, 50 66"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center vertical stem */}
        <path
          d="M 50 33 L 50 66"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Top 3 supplier nodes */}
        <circle cx="23" cy="24" r="8.5" fill={strokeColor} />
        <circle cx="50" cy="24" r="8.5" fill={strokeColor} />
        <circle cx="77" cy="24" r="8.5" fill={strokeColor} />

        {/* Bottom shared source node (amber with outline) */}
        <circle
          cx="50"
          cy="77"
          r="13"
          fill={amberColor}
          stroke={strokeColor}
          strokeWidth="5"
        />
      </svg>

      {/* Brand Logotype */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`text-[20px] sm:text-[22px] font-normal ${
                isDark ? 'text-white' : 'text-[#0d172a]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.03em' }}
            >
              True
            </span>
            <span
              className={`text-[20px] sm:text-[22px] font-bold ${
                isDark ? 'text-white' : 'text-[#0d172a]'
              }`}
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.03em' }}
            >
              Tier
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] text-neutral-400 font-normal tracking-normal mt-0.5">
              See the source behind your suppliers.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TrueTierLogo;

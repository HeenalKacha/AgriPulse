import React from 'react';

interface AgriCropLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'icon' | 'lockup';
  theme?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export const AgriCropLogoMark: React.FC<{ sizePx?: number; className?: string; iconColor?: string }> = ({
  sizePx = 28,
  className = '',
  iconColor
}) => {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle radial and linear gradients for refined agriculture-tech finish */}
        <linearGradient id="cropLeafGradLeft" x1="6" y1="18" x2="16" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="cropLeafGradRight" x1="26" y1="18" x2="16" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6EE7B7" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="marketStemGrad" x1="16" y1="28" x2="16" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="0.6" stopColor="#34D399" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* 1. Left Sprouting Crop Leaf - Geometric yet organic pulse curve */}
      <path
        d="M15 19.5 C11 20 6.5 17 6.5 12.5 C6.5 8.5 11.5 8 15 11 Z"
        fill="url(#cropLeafGradLeft)"
        fillOpacity="0.95"
      />
      {/* Left Leaf Internal Data Pulse Line */}
      <path
        d="M9 13.5 C11.5 13.8 13.5 14.8 15 16.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* 2. Right Sprouting Crop Leaf - Complementary harvest leaf */}
      <path
        d="M17 17 C21 17.5 25.5 14.5 25.5 10 C25.5 6 20.5 5.5 17 8.5 Z"
        fill="url(#cropLeafGradRight)"
        fillOpacity="0.95"
      />
      {/* Right Leaf Internal Data Pulse Line */}
      <path
        d="M23 11 C20.5 11.3 18.5 12.5 17 14.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* 3. Central Market Intelligence Shoot & Rising Trend Arrow */}
      {/* Root node */}
      <circle cx="16" cy="27" r="2" fill="#34D399" />
      
      {/* Upward Growth Stem */}
      <path
        d="M16 25 L16 8"
        stroke="url(#marketStemGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Upward Market Signal Arrow Tip */}
      <path
        d="M12.5 8.5 L16 4.5 L19.5 8.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* AI Pulse Data Nodes on Stem (Connecting Crop + AI) */}
      <circle cx="16" cy="18" r="1.5" fill="#FFFFFF" />
      <circle cx="16" cy="12" r="1.5" fill="#FFFFFF" />
      {/* Subtle lateral telemetry ticks */}
      <line x1="13.5" y1="18" x2="18.5" y2="18" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
};

export const AgriCropLogo: React.FC<AgriCropLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
  theme = 'dark',
  showSubtitle = true
}) => {
  const sizeMap = {
    xs: { badge: 'w-7 h-7 rounded-lg', icon: 18, text: 'text-sm', sub: 'text-[9px]' },
    sm: { badge: 'w-8 h-8 rounded-lg', icon: 20, text: 'text-base', sub: 'text-[10px]' },
    md: { badge: 'w-10 h-10 rounded-xl', icon: 24, text: 'text-lg', sub: 'text-[11px]' },
    lg: { badge: 'w-12 h-12 rounded-2xl', icon: 28, text: 'text-xl', sub: 'text-xs' },
    xl: { badge: 'w-14 h-14 rounded-2xl', icon: 34, text: 'text-2xl', sub: 'text-xs' }
  };

  const currentSize = sizeMap[size];

  if (variant === 'icon') {
    return (
      <AgriCropLogoMark
        sizePx={currentSize.icon}
        className={className}
      />
    );
  }

  const badgeBox = (
    <div
      className={`${currentSize.badge} bg-gradient-to-br from-[#1E5234] via-[#153E26] to-[#0D2617] border border-[#2B6D45]/70 flex items-center justify-center shadow-md relative overflow-hidden shrink-0 ${
        variant === 'badge' ? className : ''
      }`}
    >
      {/* Subtle ambient light glow */}
      <div className="absolute inset-0 bg-radial from-emerald-400/20 to-transparent pointer-events-none" />
      <AgriCropLogoMark sizePx={currentSize.icon} />
    </div>
  );

  if (variant === 'badge') {
    return badgeBox;
  }

  // Full lockup (Badge + Brand Name + Tagline)
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {badgeBox}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold tracking-tight font-['Plus_Jakarta_Sans',sans-serif] ${currentSize.text} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            AgriPulse AI
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`font-medium tracking-tight truncate ${currentSize.sub} ${
              isDark ? 'text-emerald-300/80' : 'text-emerald-800'
            }`}
          >
            Agricultural Market Intelligence
          </p>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, AvatarType } from '../../types';
import { User as UserIcon } from 'lucide-react';

export interface UserAvatarProps {
  user?: Partial<User> | null;
  name?: string;
  email?: string;
  avatarType?: AvatarType;
  avatarValue?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showRing?: boolean;
  showStatusIndicator?: boolean;
  status?: 'online' | 'busy' | 'offline';
  title?: string;
}

const SIZE_CLASSES = {
  xs: {
    container: 'w-6 h-6 text-[10px]',
    icon: 'w-3 h-3',
    status: 'w-1.5 h-1.5 bottom-0 right-0',
    ring: 'ring-1',
  },
  sm: {
    container: 'w-8 h-8 text-xs',
    icon: 'w-4 h-4',
    status: 'w-2 h-2 bottom-0 right-0',
    ring: 'ring-1.5',
  },
  md: {
    container: 'w-10 h-10 text-sm',
    icon: 'w-5 h-5',
    status: 'w-2.5 h-2.5 bottom-0 right-0',
    ring: 'ring-2',
  },
  lg: {
    container: 'w-14 h-14 text-lg',
    icon: 'w-7 h-7',
    status: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
    ring: 'ring-2',
  },
  xl: {
    container: 'w-20 h-20 text-2xl',
    icon: 'w-9 h-9',
    status: 'w-4 h-4 bottom-1 right-1',
    ring: 'ring-3',
  },
  '2xl': {
    container: 'w-24 h-24 text-3xl',
    icon: 'w-11 h-11',
    status: 'w-5 h-5 bottom-1 right-1',
    ring: 'ring-4',
  },
};

const GRADIENT_PALETTES = [
  'from-indigo-500 to-purple-600 text-white',
  'from-cyan-500 to-blue-600 text-white',
  'from-emerald-500 to-teal-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-violet-600 to-indigo-800 text-white',
  'from-sky-400 to-indigo-600 text-white',
  'from-teal-400 to-emerald-600 text-white',
  'from-fuchsia-500 to-rose-600 text-white',
  'from-blue-600 to-slate-800 text-white',
];

export function getDeterministicGradient(seed: string): string {
  if (!seed) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export function computeUserInitials(name?: string, email?: string): string {
  const target = (name || '').trim() || (email || '').split('@')[0] || 'User';
  const parts = target.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RF';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  name: explicitName,
  email: explicitEmail,
  avatarType: explicitAvatarType,
  avatarValue: explicitAvatarValue,
  avatarUrl: explicitAvatarUrl,
  profileImageUrl: explicitProfileImageUrl,
  size = 'md',
  className = '',
  showRing = false,
  showStatusIndicator = false,
  status = 'online',
  title,
}) => {
  const [imageError, setImageError] = useState(false);

  const displayName = explicitName || user?.displayName || user?.name || user?.email || 'User';
  const displayEmail = explicitEmail || user?.email || '';
  const avatarType = explicitAvatarType || user?.avatarType;
  const avatarValue = explicitAvatarValue || user?.avatarValue;
  const rawImageUrl = explicitProfileImageUrl || explicitAvatarUrl || user?.profileImageUrl || user?.avatarUrl;

  // Filter out legacy identical unsplash placeholder
  const isLegacyUnsplash = rawImageUrl?.includes('images.unsplash.com/photo-1534528741775-53994a69daeb');
  const validImageUrl = !isLegacyUnsplash && !imageError && rawImageUrl && rawImageUrl.trim().length > 5 ? rawImageUrl : null;

  const sizeCfg = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const seed = (user?.id || displayEmail || displayName).toLowerCase();
  const gradient = getDeterministicGradient(seed);
  const initials = computeUserInitials(displayName, displayEmail);

  const ringClasses = showRing ? `${sizeCfg.ring} ring-white/80 shadow-xs` : '';
  const tooltip = title || displayName;

  // Determine avatar mode
  const isImageMode = (avatarType === 'IMAGE' || (!avatarType && validImageUrl)) && Boolean(validImageUrl);
  const isEmojiMode = avatarType === 'EMOJI' && Boolean(avatarValue);
  const isNeutralMode = avatarType === 'DEFAULT';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none ${sizeCfg.container} ${ringClasses} ${className}`}
      title={tooltip}
      aria-label={`Profile avatar for ${displayName}`}
    >
      {isImageMode ? (
        <img
          src={validImageUrl!}
          alt={displayName}
          onError={() => setImageError(true)}
          className="w-full h-full rounded-full object-cover border border-zinc-200/80 shadow-2xs"
        />
      ) : isEmojiMode ? (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xs border border-white/20`}
        >
          <span className="leading-none select-none filter drop-shadow-xs">{avatarValue}</span>
        </div>
      ) : isNeutralMode ? (
        <div className="w-full h-full rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center border border-zinc-300 shadow-2xs">
          <UserIcon className={sizeCfg.icon} />
        </div>
      ) : (
        /* Smart Initials Fallback */
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold tracking-tight shadow-2xs border border-white/20`}
        >
          <span className="leading-none">{avatarValue && avatarValue.length <= 3 ? avatarValue : initials}</span>
        </div>
      )}

      {showStatusIndicator && (
        <span
          className={`absolute rounded-full border-2 border-white ${sizeCfg.status} ${
            status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-zinc-400'
          }`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};

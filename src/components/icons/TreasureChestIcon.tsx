import React from 'react';

interface TreasureChestIconProps {
  className?: string;
  size?: number;
}

export const TreasureChestIcon: React.FC<TreasureChestIconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 -2 24 26"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Chest body */}
    <rect x="2" y="11" width="20" height="10" rx="2" />
    {/* Lid */}
    <path d="M2 13V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
    {/* Lid curve (domed top) */}
    <path d="M5 7V6a7 7 0 0 1 14 0v1" />
    {/* Lock clasp */}
    <rect x="10" y="11" width="4" height="4" rx="1" />
    {/* Keyhole */}
    <circle cx="12" cy="13.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

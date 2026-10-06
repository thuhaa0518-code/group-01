import React from 'react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { TONE_CLASSES } from '../../utils/styles';
import type { Tone } from '../../utils/styles';

interface TagProps {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tag({ tone = 'neutral', icon, children, size = 'md', className }: TagProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 whitespace-nowrap rounded border font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-0.5 text-xs',
        TONE_CLASSES[tone],
        className
      )}>
      
      {icon}
      {children}
    </span>);

}
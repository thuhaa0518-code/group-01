import React from 'react';

export function Logo({ size = 'md' }: {size?: 'md' | 'lg';}) {
  return (
    <div>
      <p className={`${size === 'lg' ? 'text-xl' : 'text-sm'} font-semibold leading-tight text-ink-900`}>Procure</p>
      <p className="text-2xs uppercase tracking-wider text-ink-500">Request &amp; approval</p>
    </div>);

}
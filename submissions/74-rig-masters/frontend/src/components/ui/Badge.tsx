import React from 'react';


interface BadgeProps {
  intent?: BadgeIntent;
  children: React.ReactNode;
  className?: string;
}

type BadgeIntent = 'urgent' | 'warning' | 'danger' | 'neutral';

export function Badge({ intent = 'neutral', children, className = '' }: BadgeProps) {
  let colorClasses = '';
  
  if (intent === 'urgent') {
    colorClasses = 'bg-[#93000a] text-[#ffdad6] bg-opacity-30';
  } else if (intent === 'warning') {
    colorClasses = 'bg-[#d97721] text-[#ffdcc5] bg-opacity-30';
  } else if (intent === 'danger') {
    colorClasses = 'bg-red-700 text-red-100 bg-opacity-30';
  } else {
    colorClasses = 'bg-[#171f33] text-[#c7c4d7]';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-medium tracking-wide uppercase ${colorClasses} ${className}`}>
      {children}
    </span>
  );
}
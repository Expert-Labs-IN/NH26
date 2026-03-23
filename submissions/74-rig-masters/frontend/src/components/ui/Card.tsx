import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3 | 4 | 'glass';
  ambientShadow?: boolean;
}

export function Card({ 
  level = 1, 
  ambientShadow = false, 
  className = '', 
  children,
  ...props 
}: CardProps) {
  
  let bgClass = '';
  switch (level) {
    case 1: bgClass = 'bg-[#131b2e]'; break; // surface-container-low
    case 2: bgClass = 'bg-[#171f33]'; break; // surface-container
    case 3: bgClass = 'bg-[#222a3d]'; break; // surface-container-high
    case 4: bgClass = 'bg-[#2d3449]'; break; // surface-container-highest
    case 'glass': bgClass = 'glass'; break;
  }
  
  const shadowClass = ambientShadow ? 'ambient-shadow' : '';
  
  return (
    <div 
      className={`rounded-[var(--radius-card)] ${bgClass} ${shadowClass} ${className} ease-out-expo`}
      {...props}
    >
      {children}
    </div>
  );
}

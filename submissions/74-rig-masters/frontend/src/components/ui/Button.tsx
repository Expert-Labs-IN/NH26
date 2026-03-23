import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  
  const baseClasses = 'inline-flex items-center justify-center font-medium ease-out-expo px-6 py-2.5';
  const widthClass = fullWidth ? 'w-full' : '';
  
  let variantClasses = '';
  if (variant === 'primary') {
    // Pill-shaped, Electric Indigo gradient
    variantClasses = 'glass-glow rounded-full text-[#1000a9] shadow-[0_4px_14px_rgba(192,193,255,0.3)] hover:shadow-[0_6px_20px_rgba(192,193,255,0.4)] hover:brightness-110 active:scale-95';
  } else if (variant === 'secondary') {
    // surface-container-highest background with on-surface text. No border.
    variantClasses = 'bg-[#2d3449] text-[#dae2fd] rounded-[var(--radius-card)] hover:bg-[#31394d] active:scale-95';
  } else if (variant === 'ghost') {
    // Just text, subtle hover
    variantClasses = 'text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[rgba(255,255,255,0.05)] rounded-[var(--radius-card)] active:scale-95 px-3 py-2';
  }

  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', fullWidth = false, ...props }, ref) => {
    
    // Uses the "Focus" State defined in DESIGN.md:
    // Avoid standard blue box. 
    // Default background: surface-container-low
    // Hover/Focus ghost border increases
    // Focus background: surface-container-high
    // Glow: subtle primary outer glow
    
    const baseClasses = `
      bg-[#131b2e] text-[#dae2fd] 
      ghost-border rounded-[var(--radius-card)] 
      px-4 py-2 outline-none ease-out-expo
      placeholder-[#c7c4d7] placeholder-opacity-50
      hover:border-[rgba(70,69,84,0.3)]
      focus:bg-[#222a3d] focus:border-[rgba(70,69,84,0.4)]
      focus:shadow-[0_0_0_2px_rgba(192,193,255,0.2)]
    `;
    
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${widthClass} ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

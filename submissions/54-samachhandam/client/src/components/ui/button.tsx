import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {

    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

    const variants: Record<string, string> = {
      default: "bg-primary text-white border border-primary",
      destructive: "bg-red-500 text-white",
      outline: "border border-gray-300",
      secondary: "bg-gray-200 text-gray-900",
      ghost: "bg-transparent",
      link: "text-blue-600 underline",
    };

    const sizes: Record<string, string> = {
      default: "min-h-9 px-4 py-2",
      sm: "min-h-8 px-3 text-xs",
      lg: "min-h-10 px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

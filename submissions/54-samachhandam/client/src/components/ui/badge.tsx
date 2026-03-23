import type { ReactNode } from "react";
import type { Difficulty } from "@/data/courses";

interface BadgeProps {
    children: ReactNode;
    variant?: "difficulty" | "success" | "warning" | "danger" | "default";
    difficulty?: Difficulty;
    className?: string;
}

const difficultyStyles: Record<Difficulty, string> = {
    beginner: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    advanced: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
};

const variantStyles: Record<string, string> = {
    success: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
    default: "bg-secondary text-secondary-foreground border border-border",
};

export function Badge({ children, variant = "default", difficulty, className = "" }: BadgeProps) {
    let style = variantStyles[variant];
    if (difficulty) {
        style = difficultyStyles[difficulty];
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style} ${className}`}>
            {children}
        </span>
    );
}

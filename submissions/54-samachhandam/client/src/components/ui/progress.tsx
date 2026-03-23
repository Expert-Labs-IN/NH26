interface ProgressBarProps {
    value: number; // 0-100
    className?: string;
    color?: string;
    height?: string;
    showLabel?: boolean;
}

export function ProgressBar({
    value,
    className = "",
    color = "bg-primary",
    height = "h-2",
    showLabel = false,
}: ProgressBarProps) {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold text-foreground">{clamped}%</span>
                </div>
            )}
            <div className={`w-full ${height} rounded-full bg-secondary overflow-hidden`}>
                <div
                    className={`${height} rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}

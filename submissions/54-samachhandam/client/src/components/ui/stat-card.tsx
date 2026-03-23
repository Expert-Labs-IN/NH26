import type { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    iconBg?: string;
    trend?: { value: string; positive: boolean };
}

export function StatCard({ title, value, subtitle, icon, iconBg = "bg-primary/10", trend }: StatCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className={`${iconBg} p-2.5 rounded-lg`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {trend && (
                    <p className={`text-xs mt-0.5 font-medium ${trend.positive ? "text-green-600" : "text-red-500"}`}>
                        {trend.positive ? "↑" : "↓"} {trend.value}
                    </p>
                )}
                {subtitle && !trend && (
                    <p className="text-xs mt-0.5 text-muted-foreground">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

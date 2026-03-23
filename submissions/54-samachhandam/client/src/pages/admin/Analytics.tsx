import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Map, Calendar } from "lucide-react";
import HeatMapComponent from "@/components/admin/HeatMap";

const peakTimeData = [
  { time: "6am", count: 12 },
  { time: "9am", count: 45 },
  { time: "12pm", count: 32 },
  { time: "3pm", count: 58 },
  { time: "6pm", count: 64 },
  { time: "9pm", count: 28 },
  { time: "12am", count: 5 },
];

const efficiencyData = [
  { day: "Mon", efficiency: 82 },
  { day: "Tue", efficiency: 85 },
  { day: "Wed", efficiency: 88 },
  { day: "Thu", efficiency: 84 },
  { day: "Fri", efficiency: 90 },
  { day: "Sat", efficiency: 92 },
  { day: "Sun", efficiency: 80 },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Analytics & Insights
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            AI-powered analysis of waste patterns and operational efficiency.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1  gap-6">
        
        {/* LEFT SECTION */}
        <div className="space-y-6">
          
          {/* Heatmap Card */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-600" />
                Waste Concentration Heatmap
              </h3>
            </div>

            {/* 🔥 Heatmap inside container */}
            <div className="aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
              <HeatMapComponent />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Peak Complaint Times */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider opacity-60">
                Peak Complaint Times
              </h3>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakTimeData}>
                    <Bar
                      dataKey="count"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f4f4f5" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Efficiency Chart */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider opacity-60">
                Collection Efficiency %
              </h3>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={efficiencyData}>
                    <defs>
                      <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorEff)"
                    />

                    <XAxis
  dataKey="day"
  padding={{ left: 10, right: 10 }}
  axisLine={false}
  tickLine={false}
  tick={{ fontSize: 10 }}
  interval={0}
/>

                    <Tooltip
                      contentStyle={{
                        borderRadius: "4px",
                        border: "none",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        

      </div>
    </div>
  );
}

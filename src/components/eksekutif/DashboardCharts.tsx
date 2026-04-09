// src/components/eksekutif/DashboardCharts.tsx
"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface Props {
  data: { name: string; value: number }[];
}

const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#06b6d4",
];

export function DashboardCharts({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        Belum ada data pengeluaran bulan ini
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={40}
        />
        <YAxis
          tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [formatRupiah(value), "Pengeluaran"]}
          contentStyle={{
            fontSize: 12,
            borderRadius: "0.5rem",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

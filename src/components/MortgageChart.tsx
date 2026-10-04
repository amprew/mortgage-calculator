import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getChartData } from "../lib/chartData";
import { formatCurrency } from "../lib/mortgage";
import type { SimulationResult } from "../lib/mortgage";

interface MortgageChartProps {
  baseline: SimulationResult;
  overpay: SimulationResult;
  metric: "balance" | "cumInterest";
  principal?: number;
  lumpMonth?: number;
  lumpValue?: number;
}

function formatElapsed(month: number) {
  const years = Math.floor(month / 12);
  const months = month % 12;
  return months === 0 ? `Year ${years}` : `Year ${years}, month ${months}`;
}

export default function MortgageChart({ baseline, overpay, metric, principal, lumpMonth = 0, lumpValue = 0 }: MortgageChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const data = getChartData(baseline, overpay, metric);
  const maxMonth = Math.max(1, baseline.months);
  const yearStep = maxMonth > 360 ? 10 : maxMonth > 180 ? 5 : maxMonth > 96 ? 2 : 1;
  const ticks = Array.from({ length: Math.floor(maxMonth / (yearStep * 12)) + 1 }, (_, index) => index * yearStep * 12);
  if (ticks[ticks.length - 1] !== maxMonth) ticks.push(maxMonth);
  const maxValue = metric === "balance" ? principal ?? data[0].original : Math.max(baseline.totalInterest, overpay.totalInterest);
  const showLump = metric === "balance" && lumpValue > 0 && lumpMonth > 0 && lumpMonth <= overpay.months;

  return (
    <div className="chart" aria-label={`Mortgage ${metric === "balance" ? "balance" : "cumulative interest"} comparison`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 28, right: 12, bottom: 4, left: 0 }} accessibilityLayer>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--mint)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" type="number" domain={[0, maxMonth]} ticks={ticks} tickFormatter={(month: number) => `${Number((month / 12).toFixed(1))}y`} tick={{ fill: "var(--text-3)", fontSize: 11 }} minTickGap={32} axisLine={false} tickLine={false} />
          <YAxis domain={[0, Math.max(1, maxValue)]} tickFormatter={(value: number) => value >= 1000 ? `£${Number((value / 1000).toFixed(1))}k` : formatCurrency(value)} tick={{ fill: "var(--text-3)", fontSize: 11 }} width={62} axisLine={false} tickLine={false} />
          <Tooltip
            position={{ x: 70, y: 12 }}
            wrapperStyle={{ maxWidth: "calc(100% - 82px)" }}
            cursor={{ stroke: "var(--chart-hover)", strokeDasharray: "3 3" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const original = Number(payload.find((entry) => entry.dataKey === "original")?.value ?? 0);
              const overpayment = Number(payload.find((entry) => entry.dataKey === "overpayment")?.value ?? 0);
              return (
                <div className="chart-tooltip">
                  <strong>{formatElapsed(Number(label))}</strong>
                  <div>Original schedule <b>{formatCurrency(original)}</b></div>
                  <div className="chart-tooltip-overpay">With overpayments <b>{formatCurrency(overpayment)}</b></div>
                  <div className="chart-tooltip-difference">{metric === "balance" ? "Balance reduced by" : "Interest saved"} <b>{formatCurrency(original - overpayment)}</b></div>
                </div>
              );
            }}
          />
          <Area dataKey="original" name="Original schedule" type="linear" stroke="var(--text-3)" strokeWidth={2} strokeDasharray="5 4" fill="transparent" isAnimationActive={false} />
          <Area dataKey="overpayment" name="With overpayments" type="linear" stroke="var(--mint)" strokeWidth={2.5} fill={`url(#${gradientId})`} isAnimationActive={false} />
          {showLump && <ReferenceLine x={lumpMonth} stroke="var(--coral)" strokeDasharray="3 3" label={{ value: "Lump sum", fill: "var(--coral)", fontSize: 11, position: "top" }} />}
          {overpay.months < baseline.months && <ReferenceLine x={overpay.months} stroke="var(--mint)" strokeDasharray="3 3" label={{ value: "Paid off", fill: "var(--mint)", fontSize: 11, position: "top" }} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
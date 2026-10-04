import MortgageChart from "./MortgageChart";
import type { SimulationResult } from "../lib/mortgage";

interface BalanceChartProps {
  baseline: SimulationResult;
  overpay: SimulationResult;
  principal: number;
  lumpMonth: number;
  lumpValue: number;
}

export default function BalanceChart(props: BalanceChartProps) {
  return <MortgageChart {...props} metric="balance" />;
}

import MortgageChart from "./MortgageChart";
import type { SimulationResult } from "../lib/mortgage";

interface InterestChartProps {
  baseline: SimulationResult;
  overpay: SimulationResult;
}

export default function InterestChart(props: InterestChartProps) {
  return <MortgageChart {...props} metric="cumInterest" />;
}
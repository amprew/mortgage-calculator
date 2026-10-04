import type { SimulationResult } from "./mortgage";

export function getChartData(baseline: SimulationResult, overpay: SimulationResult, metric: "balance" | "cumInterest") {
  let overpayIndex = 0;
  return baseline.history.map((point) => {
    while (overpayIndex + 1 < overpay.history.length && overpay.history[overpayIndex + 1].month <= point.month) {
      overpayIndex += 1;
    }
    return { month: point.month, original: point[metric], overpayment: overpay.history[overpayIndex][metric] };
  });
}
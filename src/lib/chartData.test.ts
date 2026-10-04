import { describe, expect, it } from "vitest";
import { getChartData } from "./chartData";
import { simulate } from "./mortgage";
import type { SimulationResult } from "./mortgage";

describe("getChartData", () => {
  it("maps the original and overpayment balances to the same monthly timeline", () => {
    const baseline = simulate(1200, 0, 1, 0, 0, 0);
    const overpay = simulate(1200, 0, 1, 100, 0, 0);
    const result = getChartData(baseline, overpay, "balance");
    expect(result).toHaveLength(13);
    expect(result[0]).toEqual({ month: 0, original: 1200, overpayment: 1200 });
    expect(result[1]).toEqual({ month: 1, original: 1100, overpayment: 1000 });
    expect(result[6]).toEqual({ month: 6, original: 600, overpayment: 0 });
    expect(result.slice(6).every((point) => point.overpayment === 0)).toBe(true);
    expect(result.at(-1)).toEqual({ month: 12, original: 0, overpayment: 0 });
  });

  it("keeps cumulative interest flat after early payoff", () => {
    const baseline = simulate(1200, 12, 1, 0, 0, 0);
    const overpay = simulate(1200, 12, 1, 10000, 0, 0);
    const result = getChartData(baseline, overpay, "cumInterest");
    expect(result[0]).toEqual({ month: 0, original: 0, overpayment: 0 });
    expect(result[1]).toEqual({ month: 1, original: 12, overpayment: 12 });
    expect(result.slice(1).every((point) => point.overpayment === 12)).toBe(true);
    expect(result.at(-1)?.original).toBeCloseTo(79.4225569, 6);
  });

  it.each(["balance", "cumInterest"] as const)("shows identical series without overpayments (%s)", (metric) => {
    const baseline = simulate(280000, 4.5, 25, 0, 0, 0);
    const result = getChartData(baseline, baseline, metric);
    expect(result.every((point) => point.original === point.overpayment)).toBe(true);
  });

  it("carries the most recent point forward when history has gaps", () => {
    const baseline = simulate(1200, 0, 1, 0, 0, 0);
    const overpay: SimulationResult = {
      ...baseline,
      history: [
        { month: 0, balance: 1200, cumInterest: 0 },
        { month: 3, balance: 800, cumInterest: 30 },
        { month: 6, balance: 0, cumInterest: 50 }
      ]
    };
    const balances = getChartData(baseline, overpay, "balance");
    const interest = getChartData(baseline, overpay, "cumInterest");
    expect(balances[2].overpayment).toBe(1200);
    expect(balances[3].overpayment).toBe(800);
    expect(balances[5].overpayment).toBe(800);
    expect(balances[6].overpayment).toBe(0);
    expect(interest[5].overpayment).toBe(30);
    expect(interest[12].overpayment).toBe(50);
  });

  it("preserves the exact balance drop in the lump-sum month", () => {
    const baseline = simulate(1200, 0, 1, 0, 0, 0);
    const overpay = simulate(1200, 0, 1, 0, 300, 3);
    const result = getChartData(baseline, overpay, "balance");
    expect(result[2]).toEqual({ month: 2, original: 1000, overpayment: 1000 });
    expect(result[3]).toEqual({ month: 3, original: 900, overpayment: 600 });
  });

  it("does not mutate either simulation history", () => {
    const baseline = simulate(1200, 12, 1, 0, 0, 0);
    const overpay = simulate(1200, 12, 1, 100, 200, 2);
    const originalBaseline = structuredClone(baseline);
    const originalOverpay = structuredClone(overpay);
    getChartData(baseline, overpay, "balance");
    getChartData(baseline, overpay, "cumInterest");
    expect(baseline).toEqual(originalBaseline);
    expect(overpay).toEqual(originalOverpay);
  });
});
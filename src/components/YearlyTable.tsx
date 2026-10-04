import React from "react";
import { formatCurrency } from "../lib/mortgage";
import type { SimulationResult } from "../lib/mortgage";

interface YearlyTableProps {
  baseline: SimulationResult;
  overpay: SimulationResult;
  isOpen: boolean;
  onToggle: () => void;
}

export default function YearlyTable({ baseline, overpay, isOpen, onToggle }: YearlyTableProps) {
  const maxYears = Math.ceil(baseline.months / 12);
  const rows = [];

  for (let year = 1; year <= maxYears; year += 1) {
    const month = year * 12;
    const baselinePoint = baseline.history.filter((p) => p.month <= month).slice(-1)[0] || baseline.history[baseline.history.length - 1];
    const overpayPoint = overpay.history.filter((p) => p.month <= month).slice(-1)[0] || overpay.history[overpay.history.length - 1];

    rows.push({
      year,
      baselineBalance: baselinePoint.balance,
      overpayBalance: overpayPoint.balance,
      cumulativeInterest: overpayPoint.cumInterest
    });
  }

  return (
    <div className="card table-card">
      <button className={`table-toggle ${isOpen ? "open" : ""}`} type="button" onClick={onToggle}>
        Year-by-year breakdown
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`table-wrap ${isOpen ? "open" : ""}`}>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Balance (original)</th>
              <th>Balance (overpaying)</th>
              <th>Interest paid so far</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>Year {row.year}</td>
                <td>{formatCurrency(row.baselineBalance)}</td>
                <td className={row.overpayBalance < row.baselineBalance ? "diff-pos" : ""}>{formatCurrency(row.overpayBalance)}</td>
                <td>{formatCurrency(row.cumulativeInterest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

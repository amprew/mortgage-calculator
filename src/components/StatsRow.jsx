import React from "react";
import { addMonths, formatCurrency, monthNames } from "../lib/mortgage";

export default function StatsRow({ baseline, overpay, interestSaved, monthsSaved }) {
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonths = monthsSaved % 12;

  const today = new Date();
  const overpayDate = addMonths(today, overpay.months);
  const baselineDate = addMonths(today, baseline.months);

  const payoffText = monthsSaved > 0
    ? `Paid off ${monthNames[overpayDate.getMonth()]} ${overpayDate.getFullYear()} instead of ${monthNames[baselineDate.getMonth()]} ${baselineDate.getFullYear()}`
    : `Paid off ${monthNames[overpayDate.getMonth()]} ${overpayDate.getFullYear()}`;

  return (
    <div className="stat-row">
      <div className="stat">
        <div className="stat-label">Monthly payment</div>
        <div className="stat-num">{formatCurrency(baseline.payment)}</div>
        <div className="stat-sub">before overpayments</div>
      </div>

      <div className="stat">
        <div className="stat-label">Interest you&apos;ll save</div>
        <div className="stat-num mint">{formatCurrency(interestSaved)}</div>
        <div className="stat-sub">{formatCurrency(baseline.totalInterest)} to {formatCurrency(overpay.totalInterest)} total interest</div>
      </div>

      <div className="stat">
        <div className="stat-label">Time you&apos;ll save</div>
        <div className="stat-num mint">{monthsSaved > 0 ? `${yearsSaved > 0 ? `${yearsSaved}y ` : ""}${remainingMonths}mo` : "0 mo"}</div>
        <div className="stat-sub">{payoffText}</div>
      </div>
    </div>
  );
}

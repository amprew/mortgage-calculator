import React, { useMemo, useState } from "react";

function getPoint(x, y) {
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(Math.max(0, value));
}

function getPointAtMonth(history, targetMonth) {
  let point = history[0];

  for (let index = 1; index < history.length; index += 1) {
    if (history[index].month > targetMonth) {
      break;
    }
    point = history[index];
  }

  return point;
}

export default function BalanceChart({ baseline, overpay, principal, lumpMonth, lumpValue }) {
  const [hoveredYear, setHoveredYear] = useState(null);

  const width = 680;
  const height = 300;
  const padL = 54;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxMonth = Math.max(1, baseline.months);

  const x = (month) => padL + (month / maxMonth) * plotW;
  const y = (balance) => padT + (1 - balance / principal) * plotH;

  const baselinePts = baseline.history.map((p) => getPoint(x(p.month), y(p.balance))).join(" ");
  const overpayPts = overpay.history.map((p) => getPoint(x(p.month), y(p.balance))).join(" ");

  const finalOverpayMonth = overpay.history[overpay.history.length - 1].month;
  const areaPts = [
    getPoint(x(0), y(0)),
    overpay.history.map((p) => getPoint(x(p.month), y(p.balance))).join(" "),
    getPoint(x(finalOverpayMonth), y(0))
  ].join(" ");

  const totalYears = Math.round(maxMonth / 12);
  const yearStep = totalYears > 30 ? 10 : totalYears > 15 ? 5 : totalYears > 8 ? 2 : 1;
  const years = [];

  for (let year = 0; year <= totalYears; year += yearStep) {
    years.push(year);
  }

  const showLumpMarker = lumpValue > 0 && lumpMonth > 0 && lumpMonth <= maxMonth;
  const payoffMarkerVisible = finalOverpayMonth < maxMonth;

  const hoverData = useMemo(() => {
    if (hoveredYear === null) {
      return null;
    }

    const hoverMonth = Math.min(maxMonth, hoveredYear * 12);
    const baselinePoint = getPointAtMonth(baseline.history, hoverMonth);
    const overpayPoint = getPointAtMonth(overpay.history, hoverMonth);
    const baselineBalance = baselinePoint.balance;
    const overpayBalance = overpayPoint.balance;

    return {
      year: hoveredYear,
      month: hoverMonth,
      x: x(hoverMonth),
      baselineBalance,
      overpayBalance,
      baselineY: y(baselineBalance),
      overpayY: y(overpayBalance),
      difference: baselineBalance - overpayBalance
    };
  }, [hoveredYear, maxMonth, baseline.history, overpay.history]);

  const onMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    if (!rect.width) {
      return;
    }

    const pointerX = ((event.clientX - rect.left) / rect.width) * width;
    const clampedX = Math.min(width - padR, Math.max(padL, pointerX));
    const month = ((clampedX - padL) / plotW) * maxMonth;
    const nextYear = Math.min(totalYears, Math.max(0, Math.round(month / 12)));

    setHoveredYear(nextYear);
  };

  return (
    <svg
      className="chart"
      viewBox="0 0 680 300"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Mortgage balance chart"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHoveredYear(null)}
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--mint)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--mint)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {years.map((year) => {
        const gridX = x(year * 12);
        return (
          <g key={year}>
            <line x1={gridX} y1={padT} x2={gridX} y2={height - padB} stroke="var(--chart-grid)" strokeWidth="1" />
            <text className="axis-label" x={gridX} y={height - padB + 16} textAnchor="middle">
              Yr {year}
            </text>
          </g>
        );
      })}

      <text className="axis-label" x={padL - 8} y={padT + 4} textAnchor="end">{formatCurrency(principal)}</text>
      <text className="axis-label" x={padL - 8} y={height - padB} textAnchor="end">£0</text>

      {showLumpMarker ? (
        <line
          x1={x(lumpMonth)}
          y1={padT}
          x2={x(lumpMonth)}
          y2={height - padB}
          stroke="var(--coral)"
          strokeWidth="1.2"
          strokeDasharray="3,3"
          opacity="0.6"
        />
      ) : null}

      <polygon points={areaPts} fill="url(#areaFill)" />
      <polyline points={baselinePts} fill="none" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="5,4" />
      <polyline points={overpayPts} fill="none" stroke="var(--mint)" strokeWidth="2.5" />

      {payoffMarkerVisible ? <circle cx={x(finalOverpayMonth)} cy={y(0)} r="4.5" fill="var(--mint)" /> : null}

      {hoverData ? (
        <g>
          <line x1={hoverData.x} y1={padT} x2={hoverData.x} y2={height - padB} stroke="var(--chart-hover)" strokeWidth="1" />
          <circle cx={hoverData.x} cy={hoverData.baselineY} r="3.8" fill="var(--text-3)" />
          <circle cx={hoverData.x} cy={hoverData.overpayY} r="4.2" fill="var(--mint)" />

          <g transform={`translate(${Math.min(width - 208, hoverData.x + 10)}, ${padT + 8})`}>
            <rect width="198" height="66" rx="8" fill="var(--tooltip-bg)" stroke="var(--border-strong)" />
            <text x="10" y="16" className="axis-label" style={{ fill: "var(--text-1)" }}>Year {hoverData.year}</text>
            <text x="10" y="34" className="axis-label" style={{ fill: "var(--text-2)" }}>Original: {formatCurrency(hoverData.baselineBalance)}</text>
            <text x="10" y="50" className="axis-label" style={{ fill: "var(--mint)" }}>Overpay: {formatCurrency(hoverData.overpayBalance)}</text>
            <text x="10" y="64" className="axis-label" style={{ fill: "var(--text-1)" }}>Gap: {formatCurrency(hoverData.difference)}</text>
          </g>
        </g>
      ) : null}
    </svg>
  );
}

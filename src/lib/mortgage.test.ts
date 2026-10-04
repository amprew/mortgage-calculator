import { describe, expect, it } from "vitest";
import { addMonths, formatCurrency, getStateFromInputs, monthNames, simulate } from "./mortgage";
import type { MortgageInputs } from "./mortgage";

const inputs: MortgageInputs = {
  price: 350000,
  deposit: 70000,
  rate: 4.5,
  term: 25,
  regular: 0,
  lump: 0,
  lumpMonth: 12
};

describe("formatCurrency", () => {
  it("formats pounds with grouping and rounds to whole pounds by default", () => {
    expect(formatCurrency(12345.67)).toBe("£12,346");
  });

  it("supports decimal places", () => {
    expect(formatCurrency(12345.678, 2)).toBe("£12,345.68");
  });

  it("clamps negative values to zero", () => {
    expect(formatCurrency(-100)).toBe("£0");
  });
});

describe("addMonths", () => {
  it("crosses year boundaries without changing the original date", () => {
    const original = new Date(2026, 10, 15, 10, 30);
    const timestamp = original.getTime();
    const result = addMonths(original, 3);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(10);
    expect(original.getTime()).toBe(timestamp);
    expect(result).not.toBe(original);
  });

  it("supports subtracting months", () => {
    const result = addMonths(new Date(2026, 0, 15), -1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
  });

  it("uses native Date rollover for months without the original day", () => {
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(3);
  });

  it("exports month names in calendar order", () => {
    expect(monthNames).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
  });
});

describe("simulate", () => {
  it("repays a zero-interest loan in equal monthly installments", () => {
    const result = simulate(1200, 0, 1, 0, 0, 0);
    expect(result.payment).toBe(100);
    expect(result.months).toBe(12);
    expect(result.n).toBe(12);
    expect(result.totalInterest).toBe(0);
    expect(result.history).toHaveLength(13);
    expect(result.history[0]).toEqual({ month: 0, balance: 1200, cumInterest: 0 });
    expect(result.history[1]).toEqual({ month: 1, balance: 1100, cumInterest: 0 });
    expect(result.history.at(-1)).toEqual({ month: 12, balance: 0, cumInterest: 0 });
  });

  it("matches an independently calculated interest-bearing loan", () => {
    const result = simulate(1200, 12, 1, 0, 0, 0);
    expect(result.payment).toBeCloseTo(106.6185464, 6);
    expect(result.totalInterest).toBeCloseTo(79.4225569, 6);
    expect(result.history[1].balance).toBeCloseTo(1105.3814536, 6);
    expect(result.history[1].cumInterest).toBe(12);
    expect(result.months).toBe(12);
    expect(result.history.at(-1)?.balance).toBe(0);
  });

  it("applies regular overpayments every month", () => {
    const result = simulate(1200, 0, 1, 100, 0, 0);
    expect(result.history[1].balance).toBe(1000);
    expect(result.months).toBe(6);
  });

  it("applies a lump sum only in its scheduled month", () => {
    const result = simulate(1200, 0, 1, 0, 300, 3);
    expect(result.history[2].balance).toBe(1000);
    expect(result.history[3].balance).toBe(600);
    expect(result.history[4].balance).toBe(500);
    expect(result.months).toBe(9);
  });

  it("combines regular and lump-sum overpayments", () => {
    const result = simulate(1200, 0, 1, 100, 200, 2);
    expect(result.history[2].balance).toBe(600);
    expect(result.months).toBe(5);
  });

  it.each([0, 13])("ignores a lump sum scheduled outside the repayment period (month %s)", (month) => {
    expect(simulate(1200, 0, 1, 0, 500, month)).toEqual(simulate(1200, 0, 1, 0, 0, 0));
  });

  it("caps an oversized final payment at the remaining balance", () => {
    const result = simulate(1200, 12, 1, 10000, 0, 0);
    expect(result.months).toBe(1);
    expect(result.totalInterest).toBe(12);
    expect(result.history.at(-1)?.balance).toBe(0);
  });

  it("produces sequential months, decreasing balances and increasing interest", () => {
    const result = simulate(280000, 4.5, 25, 200, 10000, 12);
    for (let index = 1; index < result.history.length; index += 1) {
      const previous = result.history[index - 1];
      const current = result.history[index];
      expect(current.month).toBe(previous.month + 1);
      expect(current.balance).toBeGreaterThanOrEqual(0);
      expect(current.balance).toBeLessThan(previous.balance);
      expect(current.cumInterest - previous.cumInterest).toBeCloseTo(previous.balance * 0.045 / 12, 7);
    }
    expect(result.history.at(-1)?.cumInterest).toBe(result.totalInterest);
    expect(result.history.at(-1)?.month).toBe(result.months);
  });
});

describe("getStateFromInputs", () => {
  it("calculates principal and deposit percentage without mutating inputs", () => {
    const original = { ...inputs };
    const result = getStateFromInputs(original);
    expect(result.principal).toBe(280000);
    expect(result.depositPct).toBe(20);
    expect(result.baseline).toEqual(result.overpay);
    expect(result.interestSaved).toBe(0);
    expect(result.monthsSaved).toBe(0);
    expect(original).toEqual(inputs);
  });

  it("accepts numeric strings from form inputs", () => {
    expect(getStateFromInputs({ price: "350000", deposit: "70000", rate: "4.5", term: "25", regular: "0", lump: "0", lumpMonth: "12" })).toEqual(getStateFromInputs(inputs));
  });

  it.each(["", "not a number", -5])("normalizes invalid or negative values (%s)", (value) => {
    const result = getStateFromInputs({ price: value, deposit: value, rate: value, term: value, regular: value, lump: value, lumpMonth: value });
    expect(result).toMatchObject({ price: 0, deposit: 0, principal: 1000, rate: 0, years: 1, regular: 0, lump: 0, lumpMonth: 1, depositPct: 0 });
  });

  it("caps the deposit at the property price and preserves the current £1,000 minimum loan", () => {
    const result = getStateFromInputs({ ...inputs, deposit: 500000 });
    expect(result.deposit).toBe(350000);
    expect(result.depositPct).toBe(100);
    expect(result.principal).toBe(1000);
  });

  it("rounds the lump-sum month to the nearest integer", () => {
    expect(getStateFromInputs({ ...inputs, lumpMonth: "12.6" }).lumpMonth).toBe(13);
  });

  it("reports reduced interest and repayment time with overpayments", () => {
    const result = getStateFromInputs({ ...inputs, regular: 200 });
    expect(result.baseline.payment).toBeCloseTo(1556.33094, 4);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.interestSaved).toBe(result.baseline.totalInterest - result.overpay.totalInterest);
    expect(result.monthsSaved).toBe(result.baseline.months - result.overpay.months);
  });

  it.each([[12, 12400], [13, 2400]])("counts the lump sum in first-year overpayments only through month 12 (month %s)", (lumpMonth, expected) => {
    expect(getStateFromInputs({ ...inputs, regular: 200, lump: 10000, lumpMonth }).annualOverpay).toBe(expected);
  });
});
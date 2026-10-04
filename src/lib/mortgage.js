export const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCurrency(value, decimals = 0) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: decimals
  }).format(Math.max(0, value));
}

export function addMonths(date, months) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

export function simulate(principal, annualRatePct, years, regularOverpay, lumpSum, lumpMonth) {
  const r = annualRatePct / 100 / 12;
  const n = Math.max(1, Math.round(years * 12));
  const payment = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));

  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  const history = [{ month: 0, balance, cumInterest: 0 }];
  const cap = n + 60;

  while (balance > 0.5 && month < cap) {
    month += 1;
    const interest = balance * r;
    const principalPaid = payment - interest;
    const extra = regularOverpay + (month === lumpMonth ? lumpSum : 0);
    let reduction = principalPaid + extra;

    if (reduction > balance) {
      reduction = balance;
    }

    totalInterest += interest;
    balance -= reduction;

    if (balance < 0.5) {
      balance = 0;
    }

    history.push({ month, balance, cumInterest: totalInterest });
  }

  return { payment, totalInterest, months: month, history, n };
}

export function getStateFromInputs(inputs) {
  const price = Math.max(0, Number(inputs.price) || 0);
  const normalizedDeposit = Math.min(Math.max(0, Number(inputs.deposit) || 0), price);
  const principal = Math.max(1000, price - normalizedDeposit);
  const rate = Math.max(0, Number(inputs.rate) || 0);
  const years = Math.max(1, Number(inputs.term) || 1);
  const regular = Math.max(0, Number(inputs.regular) || 0);
  const lump = Math.max(0, Number(inputs.lump) || 0);
  const lumpMonth = Math.max(1, Math.round(Number(inputs.lumpMonth) || 1));

  const baseline = simulate(principal, rate, years, 0, 0, 0);
  const overpay = simulate(principal, rate, years, regular, lump, lumpMonth);

  const interestSaved = baseline.totalInterest - overpay.totalInterest;
  const monthsSaved = baseline.months - overpay.months;
  const annualOverpay = regular * 12 + (lumpMonth <= 12 ? lump : 0);
  const depositPct = price > 0 ? Math.round((normalizedDeposit / price) * 100) : 0;

  return {
    price,
    deposit: normalizedDeposit,
    principal,
    rate,
    years,
    regular,
    lump,
    lumpMonth,
    baseline,
    overpay,
    interestSaved,
    monthsSaved,
    annualOverpay,
    depositPct
  };
}

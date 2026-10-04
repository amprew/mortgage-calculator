import React, { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import InputPanel from "./components/InputPanel";
import StatsRow from "./components/StatsRow";
import BalanceChart from "./components/BalanceChart";
import InterestChart from "./components/InterestChart";
import YearlyTable from "./components/YearlyTable";
import PrivacySection from "./components/PrivacySection";
import { getStateFromInputs } from "./lib/mortgage";
import type { MortgageInputs, SetMortgageInput } from "./lib/mortgage";

const defaultInputs: MortgageInputs = {
  price: 350000,
  deposit: 70000,
  rate: 4.5,
  term: 25,
  regular: 0,
  lump: 0,
  lumpMonth: 12
};

export default function App() {
  const [inputs, setInputs] = useState<MortgageInputs>(defaultInputs);
  const [tableOpen, setTableOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem("overpay-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("overpay-theme", theme);
    } catch {}
  }, [theme]);

  const setInput: SetMortgageInput = (field, value) => {
    setInputs((current) => ({
      ...current,
      [field]: value
    }));
  };

  const computed = useMemo(() => getStateFromInputs(inputs), [inputs]);

  return (
    <div className="wrap">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">🔒</span> OS Repayments</div>
        <div className="header-actions">
        <div className="pulse-wrap">
          <div className="pulse-badge"><span className="pulse-dot" />Privacy-first: <b>calculated locally</b></div>
          <div className="pulse-tooltip">Your mortgage figures are processed in your browser tab and are not stored by this app.</div>
        </div>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">Mortgage overpayment calculator</div>
        <h1>See exactly what overpaying does to <span>your</span> mortgage.</h1>
        <p>Model regular monthly overpayments and one-off lump sums side by side with your baseline schedule.</p>
      </section>

      <main className="layout">
        <InputPanel inputs={inputs} setInput={setInput} computed={computed} />

        <div className="results-panel">
          <StatsRow
            baseline={computed.baseline}
            overpay={computed.overpay}
            interestSaved={computed.interestSaved}
            monthsSaved={computed.monthsSaved}
          />

          <div className="card chart-card balance-panel">
            <div className="chart-head">
              <h2>Balance over time</h2>
              <div className="legend">
                <div className="legend-item"><span className="legend-swatch muted" />Original schedule</div>
                <div className="legend-item"><span className="legend-swatch mint" />With overpayments</div>
              </div>
            </div>
            <BalanceChart
              baseline={computed.baseline}
              overpay={computed.overpay}
              principal={computed.principal}
              lumpMonth={computed.lumpMonth}
              lumpValue={computed.lump}
            />
          </div>

          <div className="card chart-card interest-panel">
            <div className="chart-head">
              <h2>Interest over time</h2>
              <div className="legend">
                <div className="legend-item"><span className="legend-swatch muted" />Original schedule</div>
                <div className="legend-item"><span className="legend-swatch mint" />With overpayments</div>
              </div>
            </div>
            <InterestChart
              baseline={computed.baseline}
              overpay={computed.overpay}
            />
          </div>

        </div>

        <YearlyTable
          baseline={computed.baseline}
          overpay={computed.overpay}
          isOpen={tableOpen}
          onToggle={() => setTableOpen((open) => !open)}
        />
      </main>

      <PrivacySection />

      <footer>
        <p>Estimates are for comparison only and are not financial advice.</p>
        <p><a href="https://github.com/amprew/mortgage-calculator">View open-source project on GitHub.</a></p>
      </footer>
    </div>
  );
}

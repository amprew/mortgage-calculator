import React from "react";
import { formatCurrency } from "../lib/mortgage";
import type { MortgageInputs, MortgageState, SetMortgageInput } from "../lib/mortgage";

interface NumberFieldProps {
  label: string;
  hint?: string;
  valueText: string;
  prefix?: boolean;
  input: {
    value: number | string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  };
}

interface InputPanelProps {
  inputs: MortgageInputs;
  setInput: SetMortgageInput;
  computed: MortgageState;
}

function NumberField({ label, hint, valueText, input, prefix }: NumberFieldProps) {
  return (
    <div className="field">
      <label>
        {label}
        <span className="val">{valueText}</span>
      </label>
      <div className={prefix ? "input-money" : ""}>
        <input type="number" value={input.value} min={input.min} max={input.max} step={input.step} onChange={input.onChange} disabled={input.disabled} />
      </div>
      {hint ? <div className="sub-hint">{hint}</div> : null}
    </div>
  );
}

export default function InputPanel({ inputs, setInput, computed }: InputPanelProps) {
  const depositPct = computed.depositPct;
  const update = (field: keyof MortgageInputs): React.ChangeEventHandler<HTMLInputElement> => (event) => setInput(field, event.target.value);

  return (
    <div className="input-panel">
        <div className="card">
            <h2>Your mortgage</h2>

            <NumberField
                label="Property price"
                valueText={formatCurrency(computed.price)}
                prefix
                input={{ value: inputs.price, min: 0, step: 1000, onChange: update("price") }}
            />

            <div className="field">
                <label>
                Deposit
                <span className="val">{formatCurrency(computed.deposit)} - {depositPct}%</span>
                </label>
                <div className="input-money">
                <input type="number" value={inputs.deposit} min={0} step={1000} onChange={update("deposit")} />
                </div>
                <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={depositPct}
                onChange={(event) => {
                    const nextDeposit = Math.round(computed.price * (Number(event.target.value) / 100));
                    setInput("deposit", nextDeposit);
                }}
                />
            </div>

            <div className="computed-strip">
                <span className="label">Mortgage amount</span>
                <span className="amt">{formatCurrency(computed.principal)}</span>
            </div>

            <div className="divider" />

            <div className="row-2">
                <NumberField
                label="Interest rate"
                valueText={`${computed.rate}%`}
                input={{ value: inputs.rate, min: 0, max: 15, step: 0.05, onChange: update("rate") }}
                />
                <NumberField
                label="Term"
                valueText={`${computed.years} yrs`}
                input={{ value: inputs.term, min: 1, max: 40, step: 1, onChange: update("term") }}
                />
            </div>

            <div className="sub-hint">Assumes the rate stays fixed for the whole term for comparison purposes.</div>

            <div className="divider" />

        </div>

        <div className="card table-card">
            <NumberField
                label="Regular monthly overpayment (optional)"
                valueText={formatCurrency(computed.regular)}
                hint="Leave this at 0 if you do not want a recurring overpayment."
                prefix
                input={{ value: inputs.regular, min: 0, step: 10, onChange: update("regular") }}
            />

            <NumberField
                label="One-off lump sum (optional)"
                valueText={formatCurrency(computed.lump)}
                hint="Leave this at 0 to skip a one-time extra payment."
                prefix
                input={{ value: inputs.lump, min: 0, step: 500, onChange: update("lump") }}
            />

            <NumberField
                label="Applied in month"
                valueText={`Month ${computed.lumpMonth}`}
                hint={computed.lump > 0 ? "For example month 12 is one year from now." : "Used only when one-off lump sum is greater than 0."}
                input={{ value: inputs.lumpMonth, min: 1, step: 1, onChange: update("lumpMonth"), disabled: computed.lump <= 0 }}
            />

            {computed.annualOverpay > computed.principal * 0.1 ? (
                <div className="warning">
                <span>⚠️</span>
                <div>Your first-year overpayments may exceed a common 10% allowance. Check your lender terms for early repayment charges.</div>
                </div>
            ) : null}
        </div>
    </div>
  );
}

import React from "react";

export default function PrivacySection() {
  return (
    <div className="privacy-section">
      <div className="privacy-grid">
        <div>
          <h3>Why &quot;nothing shared&quot; actually matters here</h3>
          <p>
            A mortgage calculator asks for your property value, your deposit, your income situation, some of your most sensitive numbers.
            Most calculators quietly send that to a server, log it, and hand it to whoever bought a marketing partnership.
            This one does not have a server to send it to.
          </p>
          <p>
            Every number above is calculated inside your browser tab.
            Refresh the tab and your values are gone, because they were never stored anywhere to begin with.
          </p>
        </div>

        <ul className="checklist">
          <li><span className="tick">✓</span>No account, no email, no cookies</li>
          <li><span className="tick">✓</span>No analytics or tracking scripts</li>
          <li><span className="tick">✓</span>No data leaves your browser</li>
          <li><span className="tick">✓</span>Works offline once loaded</li>
          <li><span className="tick">✓</span>Nothing is saved on close</li>
        </ul>
      </div>
    </div>
  );
}
